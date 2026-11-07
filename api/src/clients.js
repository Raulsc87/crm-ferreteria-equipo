import express from 'express';
import { fail } from './errors.js';
import { normalizeNit, validateClient } from './client-validation.js';
import { withPortfolio, checkCapacity } from './client-store.js';
import { activityCreation } from './activities.js';

const columns = 'id, nombre, nit, telefono, correo';

export function clientRoutes(database) {
  const router = express.Router();
  const json = express.json({ limit: '16kb', verify: (req, res, buffer) => { req.jsonBytes = buffer.length; } });
  router.get('/', list(database));
  // Declarar la ruta literal antes de /:id.
  router.get('/disponibles', available(database));
  router.post('/', json, create(database));
  router.post('/:id/tomar', take(database));
  router.post('/:id/actividades', ...activityCreation(database));
  router.get('/:id', detail(database));
  router.patch('/:id', requireOwned(database), json, update(database));
  return router;
}

function list(database) {
  return async (request, response) => {
    noBody(request); noQuery(request, ['q']);
    const q = request.query.q ?? '';
    if (typeof q !== 'string' || [...q].length > 150) fail(400, 'Use una búsqueda de texto de hasta 150 caracteres.');
    const text = q.trim(), params = [request.usuario.id];
    let filter = '';
    if (text) {
      const nit = normalizeNit(text);
      filter = nit === null
        ? (text.toUpperCase() === 'CF' ? " AND (nombre LIKE ? ESCAPE '!' OR nit IS NULL)" : " AND nombre LIKE ? ESCAPE '!'")
        : " AND (nombre LIKE ? ESCAPE '!' OR nit LIKE ? ESCAPE '!')";
      params.push(pattern(text));
      if (nit !== null) params.push(pattern(nit));
    }
    const [rows] = await database.execute('SELECT ' + columns + ' FROM clientes WHERE vendedor_id = ?' + filter + ' ORDER BY nombre, id', params);
    response.json(rows.map(publicClient));
  };
}

function available(database) {
  return async (request, response) => {
    noBody(request); noQuery(request);
    const [rows] = await database.execute('SELECT id, nombre FROM clientes WHERE vendedor_id IS NULL ORDER BY nombre, id');
    response.json(rows);
  };
}

function detail(database) {
  return async (request, response) => {
    const [[client]] = await database.execute('SELECT ' + columns + ' FROM clientes WHERE id = ? AND vendedor_id = ?', [clientId(request), request.usuario.id]);
    if (!client) fail(404, 'El cliente solicitado no está disponible.');
    noBody(request); noQuery(request);
    response.json(publicClient(client));
  };
}

function create(database) {
  return async (request, response) => {
    noQuery(request);
    const values = clientData(request, response);
    if (!values) return;
    const result = await withPortfolio(database, request.usuario.id, async connection => {
      await checkCapacity(connection, request.usuario.id);
      const [insert] = await connection.execute('INSERT INTO clientes (vendedor_id, nombre, nit, telefono, correo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())',
        [request.usuario.id, values.nombre, values.nit, values.telefono, values.correo ?? null]);
      const [[client]] = await connection.execute('SELECT ' + columns + ' FROM clientes WHERE id = ?', [insert.insertId]);
      return publicClient(client);
    });
    response.status(201).json(result);
  };
}

function take(database) {
  return async (request, response) => {
    noBody(request); noQuery(request);
    const id = clientId(request);
    const result = await withPortfolio(database, request.usuario.id, async connection => {
      const [[client]] = await connection.execute('SELECT ' + columns + ', vendedor_id FROM clientes WHERE id = ? FOR UPDATE', [id]);
      if (!client) fail(404, 'El cliente solicitado no está disponible.');
      if (client.vendedor_id !== null) fail(409, 'El cliente ya fue tomado. Actualice la lista de disponibles.');
      await checkCapacity(connection, request.usuario.id);
      await connection.execute('UPDATE clientes SET vendedor_id = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?', [request.usuario.id, id]);
      return publicClient(client);
    });
    response.json(result);
  };
}

function requireOwned(database) {
  return async (request, response, next) => {
    // Una ficha ajena sigue siendo 404, incluso si el cuerpo es inválido.
    const [rows] = await database.execute('SELECT id FROM clientes WHERE id = ? AND vendedor_id = ?', [clientId(request), request.usuario.id]);
    if (!rows[0]) fail(404, 'El cliente solicitado no está disponible.');
    next();
  };
}

function update(database) {
  return async (request, response) => {
    noQuery(request);
    const values = clientData(request, response, true);
    if (!values) return;
    const result = await withPortfolio(database, request.usuario.id, async connection => {
      const [[client]] = await connection.execute('SELECT ' + columns + ' FROM clientes WHERE id = ? AND vendedor_id = ? FOR UPDATE', [clientId(request), request.usuario.id]);
      if (!client) fail(404, 'El cliente solicitado no está disponible.');
      const fields = Object.keys(values);
      if (fields.length) {
        // Columnas de la lista blanca de validateClient, nunca nombres aportados por el usuario.
        await connection.execute('UPDATE clientes SET ' + fields.map(field => field + ' = ?').join(', ') + ', updated_at = UTC_TIMESTAMP() WHERE id = ?',
          [...fields.map(field => values[field]), client.id]);
      }
      return publicClient({ ...client, ...values });
    });
    response.json(result);
  };
}

function clientData(request, response, partial = false) {
  if (!request.is('application/json') || request.jsonBytes === 0 || !request.body || Array.isArray(request.body) || typeof request.body !== 'object') fail(400, 'Envíe un objeto JSON con los datos del cliente.');
  const result = validateClient(request.body, partial);
  if (Object.keys(result.errors).length) { response.status(422).json({ errores: result.errors }); return null; }
  return result.data;
}

function clientId(request) {
  const value = request.params.id;
  if (!/^[1-9][0-9]*$/.test(value) || !Number.isSafeInteger(Number(value))) fail(404, 'El cliente solicitado no está disponible.');
  return value;
}

function noQuery(request, allowed = []) {
  if (Object.keys(request.query).some(key => !allowed.includes(key))) fail(400, 'No se admiten esos parámetros en esta ruta.');
}

function noBody(request) {
  if (request.get('Transfer-Encoding') || Number(request.get('Content-Length') || 0) > 0) fail(400, 'Esta ruta no admite cuerpo.');
}

function pattern(value) {
  return '%' + value.replace(/[!%_]/g, character => '!' + character) + '%';
}

export function publicClient(row) {
  return { id: row.id, nombre: row.nombre, nit: row.nit ?? 'CF', telefono: row.telefono, correo: row.correo };
}
