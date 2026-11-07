import express from 'express';
import { fail } from './errors.js';
import { withPortfolio } from './client-store.js';
import { activityId, activityInput, activityQuery } from './activity-validation.js';

const selectActivity = `SELECT a.id, a.cliente_id, c.nombre AS cliente_nombre, a.tipo, a.descripcion, a.vence_en, a.completada
  FROM actividades a JOIN clientes c ON c.id = a.cliente_id`;
const json = () => express.json({ limit: '16kb', verify: (req, res, buffer) => { req.jsonBytes = buffer.length; } });

export function activityCreation(database) {
  return [async (request, response, next) => {
    request.activityClientId = activityId(request.params.id);
    await ownClient(database, request.activityClientId, request.usuario.id);
    next();
  }, json(), async (request, response) => {
    activityQuery(request);
    const values = activityInput(request, true);
    const result = await withPortfolio(database, request.usuario.id, async connection => {
      await ownClient(connection, request.activityClientId, request.usuario.id, true);
      const [inserted] = await connection.execute('INSERT INTO actividades (cliente_id, vendedor_id, tipo, descripcion, vence_en, completada, created_at, updated_at) VALUES (?, ?, ?, ?, ?, false, UTC_TIMESTAMP(), UTC_TIMESTAMP())',
        [request.activityClientId, request.usuario.id, values.tipo, values.descripcion, values.vence_en]);
      return findActivity(connection, inserted.insertId, request.usuario.id);
    });
    response.status(201).json(publicActivity(result));
  }];
}

export function activityRoutes(database) {
  const router = express.Router();
  router.get('/', async (request, response) => {
    if (request.get('Transfer-Encoding') || Number(request.get('Content-Length') || 0) > 0) fail(400, 'Esta ruta no admite cuerpo.');
    const state = activityQuery(request, true), params = [request.usuario.id];
    if (state !== undefined) params.push(state === 'completada');
    const [rows] = await database.execute(selectActivity + ' WHERE c.vendedor_id = ?' + (state === undefined ? '' : ' AND a.completada = ?') + ' ORDER BY a.id', params);
    const now = Date.now();
    response.json(rows.map(row => publicActivity(row, now)));
  });
  router.patch('/:id', async (request, response, next) => {
    request.activity = await findActivity(database, activityId(request.params.id), request.usuario.id);
    next();
  }, json(), async (request, response) => {
    activityQuery(request);
    const values = activityInput(request, false);
    const result = await withPortfolio(database, request.usuario.id, async connection => {
      // Autor conservado; el acceso depende del dueño del cliente, también tras esperar.
      await ownClient(connection, request.activity.cliente_id, request.usuario.id, true);
      await findActivity(connection, request.activity.id, request.usuario.id, true);
      await connection.execute('UPDATE actividades SET completada = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?', [values.completada, request.activity.id]);
      return findActivity(connection, request.activity.id, request.usuario.id);
    });
    response.json(publicActivity(result));
  });
  return router;
}

async function ownClient(database, id, sellerId, lock = false) {
  const [[client]] = await database.execute('SELECT id, vendedor_id FROM clientes WHERE id = ?' + (lock ? ' FOR UPDATE' : ''), [id]);
  if (!client || client.vendedor_id !== sellerId) fail(404, 'El cliente solicitado no está disponible.');
  return client;
}

async function findActivity(database, id, sellerId, lock = false) {
  const [[activity]] = await database.execute(selectActivity + ' WHERE a.id = ? AND c.vendedor_id = ?' + (lock ? ' FOR UPDATE' : ''), [id, sellerId]);
  if (!activity) fail(404, 'La actividad solicitada no está disponible.');
  return activity;
}

export function publicActivity(row, now = Date.now()) {
  const deadline = row.vence_en === null ? null : new Date(row.vence_en.replace(' ', 'T') + 'Z');
  return { id: row.id, cliente: { id: row.cliente_id, nombre: row.cliente_nombre }, tipo: row.tipo, descripcion: row.descripcion,
    vence_en: deadline === null ? null : deadline.toISOString(), completada: Boolean(row.completada),
    vencida: !row.completada && deadline !== null && deadline.getTime() < now };
}
