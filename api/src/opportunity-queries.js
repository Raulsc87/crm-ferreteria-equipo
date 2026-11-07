import { fail } from './errors.js';

// Una suma por oportunidad evita multiplicar líneas al consultar el historial.
const summarySelect = `SELECT o.id, o.cliente_id, c.nombre AS cliente_nombre, o.titulo, o.etapa,
  o.fecha_cierre, o.motivo_perdida,
  COALESCE((SELECT SUM(l.cantidad * l.precio_unitario) FROM oportunidad_productos l WHERE l.oportunidad_id = o.id), 0) AS total
  FROM oportunidades o JOIN clientes c ON c.id = o.cliente_id`;
const visible = "o.vendedor_id = ? AND (o.etapa IN ('ganada', 'perdida') OR c.vendedor_id = ?)";
const probability = { prospecto: 10, calificado: 25, propuesta: 50, negociacion: 75, ganada: 100, perdida: 0 };

export async function listOpportunities(database, sellerId, stage) {
  const params = [sellerId, sellerId];
  if (stage) params.push(stage);
  const [rows] = await database.execute(summarySelect + ' WHERE ' + visible + (stage ? ' AND o.etapa = ?' : '') + ' ORDER BY o.id', params);
  return rows.map(publicSummary);
}

export async function observedOpportunity(database, id, sellerId) {
  const [[row]] = await database.execute('SELECT o.id, o.cliente_id, o.etapa FROM oportunidades o JOIN clientes c ON c.id = o.cliente_id WHERE o.id = ? AND ' + visible, [id, sellerId, sellerId]);
  if (!row) fail(404, 'La oportunidad solicitada no está disponible.');
  return row;
}

export async function opportunityDetail(database, id, sellerId) {
  const [[row]] = await database.execute(summarySelect + ' WHERE o.id = ? AND ' + visible, [id, sellerId, sellerId]);
  if (!row) fail(404, 'La oportunidad solicitada no está disponible.');
  const [lines] = await database.execute(`SELECT l.id, l.producto_id, p.nombre, l.cantidad, l.precio_unitario,
    l.cantidad * l.precio_unitario AS subtotal FROM oportunidad_productos l
    JOIN productos p ON p.id = l.producto_id WHERE l.oportunidad_id = ? ORDER BY l.id`, [id]);
  const [history] = await database.execute(`SELECT h.etapa_anterior, h.etapa_nueva, u.name AS usuario, h.created_at AS fecha
    FROM historial_etapas h JOIN users u ON u.id = h.usuario_id WHERE h.oportunidad_id = ? ORDER BY h.created_at, h.id`, [id]);
  return { ...publicSummary(row),
    productos: lines.map(line => ({ ...line, precio_unitario: Number(line.precio_unitario), subtotal: Number(line.subtotal) })),
    historial: history.map(entry => ({ ...entry, fecha: utc(entry.fecha) })),
  };
}

function publicSummary(row) {
  return { id: row.id, cliente: { id: row.cliente_id, nombre: row.cliente_nombre }, titulo: row.titulo,
    etapa: row.etapa, probabilidad: probability[row.etapa], total: Number(row.total),
    fecha_cierre: utc(row.fecha_cierre), motivo_perdida: row.motivo_perdida };
}

function utc(value) { return value === null ? null : new Date(value.replace(' ', 'T') + 'Z').toISOString(); }
