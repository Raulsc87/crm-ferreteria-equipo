import { fail, invalid } from './errors.js';

export function activityId(value) {
  if (!/^[1-9][0-9]*$/.test(value) || !Number.isSafeInteger(Number(value))) fail(404, 'El recurso solicitado no está disponible.');
  return Number(value);
}

export function activityInput(request, creating) {
  const body = request.body;
  if (!request.is('application/json') || request.jsonBytes === 0 || !body || Array.isArray(body) || typeof body !== 'object') fail(400, 'Envíe un objeto JSON con los datos de la actividad.');
  const fields = creating ? ['tipo', 'descripcion', 'vence_en'] : ['completada'];
  const errors = Object.create(null), data = Object.create(null);
  for (const field of Object.keys(body)) if (!fields.includes(field)) errors[field] = 'Este campo no está permitido.';
  if (creating) {
    data.tipo = body.tipo;
    if (!['llamada', 'reunion', 'tarea'].includes(body.tipo)) errors.tipo = 'Seleccione llamada, reunión o tarea.';
    data.descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim().replace(/\s+/gu, ' ') : body.descripcion;
    if (typeof data.descripcion !== 'string' || !data.descripcion || [...data.descripcion].length > 500) errors.descripcion = 'Ingrese una descripción de 1 a 500 caracteres.';
    data.vence_en = Object.hasOwn(body, 'vence_en') ? utcDeadline(body.vence_en) : null;
    if (Object.hasOwn(body, 'vence_en') && data.vence_en === null) errors.vence_en = 'Ingrese una fecha ISO 8601 válida con zona horaria, u omita el campo.';
  } else {
    data.completada = body.completada;
    if (typeof body.completada !== 'boolean') errors.completada = 'Indique completada como verdadero o falso.';
  }
  if (Object.keys(errors).length) invalid(errors);
  return data;
}

export function utcDeadline(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, minute, second = '0', , zone] = match;
  // Date.parse normaliza algunos días imposibles: comprobar primero el calendario.
  if (+y < 1000 || +m < 1 || +m > 12 || +d < 1 || +d > new Date(Date.UTC(+y, +m, 0)).getUTCDate() || +h > 23 || +minute > 59 || +second > 59) return null;
  if (zone !== 'Z' && (+zone.slice(1, 3) > 23 || +zone.slice(4) > 59)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1000 || date.getUTCFullYear() > 9999) return null;
  // El esquema usa DATETIME sin fracciones: conservar precisión de segundos en UTC.
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function activityQuery(request, listing = false) {
  if (Object.keys(request.query).some(key => !listing || key !== 'estado')) fail(400, 'No se admiten esos parámetros en esta ruta.');
  const state = request.query.estado;
  if (listing && state !== undefined && !['pendiente', 'completada'].includes(state)) fail(400, 'Seleccione estado pendiente o completada.');
  return state;
}
