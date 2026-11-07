import express from 'express';
import { fail } from './errors.js';

export function reportMonth(value, now = new Date()) {
  if (value === undefined) {
    const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Guatemala', year: 'numeric', month: '2-digit' }).formatToParts(now);
    value = parts.find(part => part.type === 'year').value + '-' + parts.find(part => part.type === 'month').value;
  }
  // El mismo rango de L6 permite que ambos límites quepan en DATETIME.
  if (typeof value !== 'string' || !/^[1-9][0-9]{3}-(0[1-9]|1[0-2])$/.test(value) || value >= '9999-01') fail(400, 'Seleccione un mes válido entre 1000-01 y 9998-12.');
  const [year, month] = value.split('-').map(Number);
  const next = month === 12 ? (year + 1) + '-01' : year + '-' + String(month + 1).padStart(2, '0');
  return { month: value, start: guatemalaMonthStart(value), end: guatemalaMonthStart(next) };
}

function guatemalaMonthStart(month) {
  const midnight = Date.parse(month + '-01T00:00:00Z');
  let instant = midnight + 6 * 3600000, previous;
  const zone = new Intl.DateTimeFormat('en', { timeZone: 'America/Guatemala', timeZoneName: 'longOffset' });
  // Usar la misma zona IANA que Carbon/L6, también al consultar meses históricos.
  for (let attempt = 0; attempt < 3; attempt++) {
    const offset = zone.formatToParts(new Date(instant)).find(part => part.type === 'timeZoneName').value;
    const [, sign, hours, minutes, seconds = '0'] = /GMT([+-])(\d{2}):(\d{2})(?::(\d{2}))?/.exec(offset);
    const difference = (+hours * 3600 + +minutes * 60 + +seconds) * (sign === '-' ? -1 : 1);
    const next = midnight - difference * 1000;
    if (next === instant) break;
    // Si una medianoche local no existió por cambio horario, avanzar como Carbon.
    if (next === previous) { instant = Math.max(instant, next); break; }
    previous = instant; instant = next;
  }
  return new Date(instant).toISOString().slice(0, 19).replace('T', ' ');
}

export function reportRoutes(database) {
  const router = express.Router();
  router.get('/resumen', async (request, response) => {
    if (Object.keys(request.query).some(key => key !== 'mes') || request.get('Transfer-Encoding') || Number(request.get('Content-Length') || 0) > 0) fail(400, 'Esta ruta solo admite el parámetro mes y ningún cuerpo.');
    const month = reportMonth(request.query.mes);
    response.json(await sellerSummary(database, request.usuario.id, month));
  });
  return router;
}

export async function sellerSummary(database, sellerId, month) {
  const won = "o.etapa = 'ganada' AND o.fecha_cierre >= ? AND o.fecha_cierre < ?";
  // Agrupar primero las líneas: una fila por oportunidad, sin multiplicar ventas.
  const [[row]] = await database.execute(`SELECT
    COALESCE(SUM(CASE WHEN ${won} THEN 1 ELSE 0 END), 0) AS ventas,
    COALESCE(SUM(CASE WHEN ${won} THEN COALESCE(lineas.total, 0) ELSE 0 END), 0) AS total,
    ROUND(COALESCE(SUM(COALESCE(lineas.total, 0) * CASE o.etapa
      WHEN 'prospecto' THEN 0.10 WHEN 'calificado' THEN 0.25
      WHEN 'propuesta' THEN 0.50 WHEN 'negociacion' THEN 0.75 ELSE 0 END), 0), 2) AS pronostico,
    (SELECT COUNT(*) FROM clientes WHERE vendedor_id = ?) AS clientes
    FROM oportunidades o LEFT JOIN
      (SELECT oportunidad_id, SUM(cantidad * precio_unitario) AS total FROM oportunidad_productos GROUP BY oportunidad_id) lineas
      ON lineas.oportunidad_id = o.id
    WHERE o.vendedor_id = ?`, [month.start, month.end, month.start, month.end, sellerId, sellerId]);
  return { mes: month.month, ventas: Number(row.ventas), total: Number(row.total), pronostico: Number(row.pronostico),
    cartera: { clientes: Number(row.clientes), maximo: 10 } };
}
