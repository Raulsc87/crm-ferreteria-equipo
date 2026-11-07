import { fail, invalid } from './errors.js';

export const stages = ['prospecto', 'calificado', 'propuesta', 'negociacion', 'ganada', 'perdida'];
export const closed = stage => ['ganada', 'perdida'].includes(stage);

export function routeId(value) {
  if (!/^[1-9][0-9]*$/.test(value) || !Number.isSafeInteger(Number(value))) fail(404, 'El recurso solicitado no está disponible.');
  return Number(value);
}

export function opportunityInput(request, kind) {
  const body = request.body;
  if (!request.is('application/json') || request.jsonBytes === 0 || !body || Array.isArray(body) || typeof body !== 'object') {
    fail(400, 'Envíe un objeto JSON con los datos solicitados.');
  }
  const fields = { create: ['cliente_id', 'titulo'], title: ['titulo'], stage: ['etapa', 'motivo_perdida'], add: ['producto_id', 'cantidad'], quantity: ['cantidad'] }[kind];
  const data = Object.create(null), errors = Object.create(null);
  for (const field of Object.keys(body)) if (!fields.includes(field)) errors[field] = 'Este campo no está permitido.';
  for (const field of fields) {
    if (field === 'motivo_perdida' && body.etapa !== 'perdida') {
      if (Object.hasOwn(body, field)) errors[field] = 'Envíe el motivo únicamente al perder la oportunidad.';
      continue;
    }
    let value = body[field];
    if (['titulo', 'motivo_perdida'].includes(field)) {
      if (typeof value === 'string') value = value.trim().replace(/\s+/gu, ' ');
      const max = field === 'titulo' ? 150 : 255;
      if (typeof value !== 'string' || !value || [...value].length > max) errors[field] = `Ingrese un texto de 1 a ${max} caracteres.`;
    } else if (field === 'etapa') {
      if (!stages.includes(value)) errors[field] = 'Seleccione una etapa válida.';
    } else if (!Number.isSafeInteger(value) || value < 1 || (field === 'cantidad' && value > 999)) {
      errors[field] = field === 'cantidad' ? 'Ingrese una cantidad entera entre 1 y 999.' : 'Ingrese un identificador entero positivo.';
    }
    data[field] = value;
  }
  if (Object.keys(errors).length) invalid(errors);
  return data;
}

export function noOpportunityQuery(request, allowed = []) {
  if (Object.keys(request.query).some(key => !allowed.includes(key))) fail(400, 'No se admiten esos parámetros en esta ruta.');
}

export function noOpportunityBody(request) {
  if (request.get('Transfer-Encoding') || Number(request.get('Content-Length') || 0) > 0) fail(400, 'Esta ruta no admite cuerpo.');
}
