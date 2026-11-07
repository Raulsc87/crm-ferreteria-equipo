import { fail, invalid } from './errors.js';
import { closed } from './opportunity-validation.js';

export async function opportunityTransaction(database, operation) {
  const connection = await database.getConnection();
  let reusable = true;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await connection.beginTransaction();
        const result = await operation(connection);
        await connection.commit();
        return result;
      } catch (error) {
        try { await connection.rollback(); } catch { reusable = false; throw error; }
        if (error.errno === 1062) fail(409, 'Este producto ya está cotizado. Modifique su cantidad.');
        if (![1205, 1213].includes(error.errno)) throw error;
        if (attempt === 2) fail(409, 'La oportunidad cambió mientras guardaba. Actualice e inténtelo de nuevo.');
      }
    }
  } finally { if (reusable) connection.release(); else connection.destroy(); }
}

export async function lockCustomer(connection, sellerId, clientId) {
  // Mismo orden que cartera/panel: usuario, cliente y después oportunidad/producto.
  const [[seller]] = await connection.execute('SELECT rol, activo FROM users WHERE id = ? FOR SHARE', [sellerId]);
  if (!seller || !seller.activo || seller.rol !== 'vendedor') fail(401, 'Su sesión no es válida. Inicie sesión de nuevo.');
  const [[client]] = await connection.execute('SELECT id, vendedor_id FROM clientes WHERE id = ? FOR UPDATE', [clientId]);
  if (!client) fail(404, 'El cliente solicitado no está disponible.');
  return client;
}

export async function lockOpportunity(connection, sellerId, observed, lineId) {
  const client = await lockCustomer(connection, sellerId, observed.cliente_id);
  const [[opportunity]] = await connection.execute('SELECT id, vendedor_id, etapa FROM oportunidades WHERE id = ? FOR UPDATE', [observed.id]);
  if (!opportunity || opportunity.vendedor_id !== sellerId || (!closed(opportunity.etapa) && client.vendedor_id !== sellerId)) {
    fail(404, 'La oportunidad solicitada no está disponible.');
  }
  if (lineId !== undefined) await findLine(connection, opportunity.id, lineId);
  if (closed(opportunity.etapa)) fail(409, 'La oportunidad está cerrada y no admite cambios.');
  return opportunity;
}

export async function findLine(connection, opportunityId, lineId) {
  const [[line]] = await connection.execute('SELECT id, producto_id FROM oportunidad_productos WHERE id = ? AND oportunidad_id = ?', [lineId, opportunityId]);
  if (!line) fail(404, 'La línea solicitada no está disponible.');
  return line;
}

export async function checkedProduct(connection, productId, quantity, adding = false) {
  // FOR SHARE mantiene coherente precio/mínimo y solo requiere SELECT en productos.
  const [[product]] = await connection.execute('SELECT id, precio, activo, cantidad_minima FROM productos WHERE id = ? FOR SHARE', [productId]);
  if (!product) fail(404, 'El producto solicitado no está disponible.');
  if (adding && !product.activo) invalid({ producto_id: 'Seleccione un producto activo.' });
  if (quantity < product.cantidad_minima) invalid({ cantidad: `Ingrese al menos ${product.cantidad_minima} unidades para este producto.` });
  return product;
}

export async function recordStage(connection, opportunityId, sellerId, previous, next) {
  // Usar el instante de la escritura evita separar cierre e historial al cambiar de segundo.
  await connection.execute('INSERT INTO historial_etapas (oportunidad_id, usuario_id, etapa_anterior, etapa_nueva, created_at) SELECT id, ?, ?, ?, updated_at FROM oportunidades WHERE id = ?', [sellerId, previous, next, opportunityId]);
}

export async function changeStage(connection, opportunity, observed, sellerId, values) {
  // La observación queda fuera de los reintentos: no convertir un intento obsoleto en otro avance.
  if (opportunity.etapa !== observed.etapa || opportunity.etapa === values.etapa) fail(409, 'La etapa cambió o ya es la indicada. Actualice la oportunidad.');
  const next = { prospecto: 'calificado', calificado: 'propuesta', propuesta: 'negociacion', negociacion: 'ganada' };
  if (values.etapa !== 'perdida' && next[opportunity.etapa] !== values.etapa) invalid({ etapa: 'Avance una etapa a la vez; solo puede ganar desde negociación.' });
  if (values.etapa === 'ganada') {
    const [lines] = await connection.execute('SELECT id FROM oportunidad_productos WHERE oportunidad_id = ? LIMIT 1', [opportunity.id]);
    if (!lines.length) invalid({ etapa: 'Agregue al menos un producto antes de ganar la oportunidad.' });
  }
  const closing = closed(values.etapa);
  await connection.execute('UPDATE oportunidades SET etapa = ?, motivo_perdida = ?, fecha_cierre = IF(?, UTC_TIMESTAMP(), NULL), updated_at = UTC_TIMESTAMP() WHERE id = ?',
    [values.etapa, values.motivo_perdida ?? null, closing, opportunity.id]);
  await recordStage(connection, opportunity.id, sellerId, opportunity.etapa, values.etapa);
}
