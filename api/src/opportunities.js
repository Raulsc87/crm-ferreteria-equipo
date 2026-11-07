import express from 'express';
import { fail } from './errors.js';
import { closed, stages, routeId, opportunityInput, noOpportunityQuery, noOpportunityBody } from './opportunity-validation.js';
import { listOpportunities, observedOpportunity, opportunityDetail } from './opportunity-queries.js';
import { opportunityTransaction, lockCustomer, lockOpportunity, findLine, checkedProduct, recordStage, changeStage } from './opportunity-store.js';

export function opportunityRoutes(database) {
  const router = express.Router();
  const json = express.json({ limit: '16kb', verify: (req, res, buffer) => { req.jsonBytes = buffer.length; } });
  router.get('/', async (request, response) => {
    noOpportunityBody(request); noOpportunityQuery(request, ['etapa']);
    const stage = request.query.etapa;
    if (stage !== undefined && stage !== '' && !stages.includes(stage)) fail(400, 'Seleccione una etapa válida.');
    response.json(await listOpportunities(database, request.usuario.id, stage));
  });
  router.post('/', json, async (request, response) => {
    noOpportunityQuery(request);
    const values = opportunityInput(request, 'create'), sellerId = request.usuario.id;
    const detail = await opportunityTransaction(database, async connection => {
      const client = await lockCustomer(connection, sellerId, values.cliente_id);
      if (client.vendedor_id !== sellerId) fail(404, 'El cliente solicitado no está disponible.');
      const [created] = await connection.execute("INSERT INTO oportunidades (cliente_id, vendedor_id, titulo, etapa, created_at, updated_at) VALUES (?, ?, ?, 'prospecto', UTC_TIMESTAMP(), UTC_TIMESTAMP())", [client.id, sellerId, values.titulo]);
      await recordStage(connection, created.insertId, sellerId, null, 'prospecto');
      return opportunityDetail(connection, created.insertId, sellerId);
    });
    response.status(201).json(detail);
  });
  router.use('/:id', async (request, response, next) => {
    request.observedOpportunity = await observedOpportunity(database, routeId(request.params.id), request.usuario.id);
    next();
  });
  router.get('/:id', async (request, response) => {
    noOpportunityBody(request); noOpportunityQuery(request);
    // Las tres consultas del detalle comparten la misma instantánea de lectura.
    const detail = await opportunityTransaction(database, connection => opportunityDetail(connection, request.observedOpportunity.id, request.usuario.id));
    response.json(detail);
  });
  router.patch('/:id', writable, json, edit(database, 'title'));
  router.patch('/:id/etapa', writable, json, edit(database, 'stage'));
  router.post('/:id/productos', writable, json, edit(database, 'add'));
  router.patch('/:id/productos/:lineaId', lineExists(database), writable, json, edit(database, 'quantity'));
  router.delete('/:id/productos/:lineaId', lineExists(database), writable, edit(database, 'delete'));
  return router;
}

function writable(request, response, next) {
  if (closed(request.observedOpportunity.etapa)) fail(409, 'La oportunidad está cerrada y no admite cambios.');
  next();
}

function lineExists(database) {
  return async (request, response, next) => {
    request.lineId = routeId(request.params.lineaId);
    await findLine(database, request.observedOpportunity.id, request.lineId);
    next();
  };
}

function edit(database, kind) {
  return async (request, response) => {
    noOpportunityQuery(request);
    if (kind === 'delete') noOpportunityBody(request);
    const values = kind === 'delete' ? null : opportunityInput(request, kind);
    const sellerId = request.usuario.id, observed = request.observedOpportunity;
    const detail = await opportunityTransaction(database, async connection => {
      const opportunity = await lockOpportunity(connection, sellerId, observed, request.lineId);
      await writeChange(connection, opportunity, observed, sellerId, values, kind, request.lineId);
      return kind === 'delete' ? null : opportunityDetail(connection, opportunity.id, sellerId);
    });
    if (kind === 'delete') return response.status(204).end();
    response.status(kind === 'add' ? 201 : 200).json(detail);
  };
}

async function writeChange(connection, opportunity, observed, sellerId, values, kind, lineId) {
  if (kind === 'stage') return changeStage(connection, opportunity, observed, sellerId, values);
  if (kind === 'title') return connection.execute('UPDATE oportunidades SET titulo = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?', [values.titulo, opportunity.id]);
  if (kind === 'delete') return connection.execute('DELETE FROM oportunidad_productos WHERE id = ? AND oportunidad_id = ?', [lineId, opportunity.id]);
  if (kind === 'add') {
    const [existing] = await connection.execute('SELECT id FROM oportunidad_productos WHERE oportunidad_id = ? AND producto_id = ?', [opportunity.id, values.producto_id]);
    if (existing.length) fail(409, 'Este producto ya está cotizado. Modifique su cantidad.');
    const product = await checkedProduct(connection, values.producto_id, values.cantidad, true);
    // El DECIMAL se copia como texto de mysql2: nunca pasa por aritmética binaria JS.
    return connection.execute('INSERT INTO oportunidad_productos (oportunidad_id, producto_id, cantidad, precio_unitario, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())', [opportunity.id, product.id, values.cantidad, product.precio]);
  }
  const line = await findLine(connection, opportunity.id, lineId);
  await checkedProduct(connection, line.producto_id, values.cantidad);
  return connection.execute('UPDATE oportunidad_productos SET cantidad = ?, updated_at = UTC_TIMESTAMP() WHERE id = ? AND oportunidad_id = ?', [values.cantidad, lineId, opportunity.id]);
}
