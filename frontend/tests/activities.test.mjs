import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deadlineFromGuatemala, formatDeadline, createActivities } from '../js/activities.js';

const activity = { id: 5, cliente: { id: 3, nombre: 'Cliente' }, tipo: 'llamada', descripcion: 'Llamar', vence_en: null, completada: false, vencida: false };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const setup = (api, missingClient = async () => {}) => createActivities({ api, missingClient, changed() {} });

test('vencimiento vacío se omite; fechas de Guatemala pasan a UTC sin usar la zona del equipo', () => {
  assert.equal(deadlineFromGuatemala(''), undefined);
  assert.equal(deadlineFromGuatemala('2031-04-09T08:30'), '2031-04-09T14:30:00.000Z');
  assert.equal(deadlineFromGuatemala('2020-02-29T23:15'), '2020-03-01T05:15:00.000Z');
  assert.equal(formatDeadline(null), 'Sin vencimiento');
  assert.equal(formatDeadline('2031-04-09T14:30:00.000Z'), new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', dateStyle: 'short', timeStyle: 'short' }).format(new Date('2031-04-09T14:30:00.000Z')));
});
test('fechas imposibles, fuera de rango y sin hora muestran error del vencimiento', () => {
  for (const value of ['2031-02-29T08:30', '2031-04-31T08:30', '2031-13-01T08:30', '2031-01-01T24:00', '0999-01-01T00:00', '9999-12-31T23:59', '2031-01-01']) {
    assert.throws(() => deadlineFromGuatemala(value), error => Boolean(error.fields.vence_en));
  }
});
test('crear envía solo contrato, omite fecha vacía e impide doble envío', async () => {
  const pending = deferred(), calls = [];
  const activities = setup((path, options) => { calls.push({ path, options }); return options ? pending.promise : Promise.resolve([activity]); });
  activities.openClient(3); activities.state.form = { tipo: 'llamada', descripcion: 'Llamar', vence_en: '', vendedor_id: 99 };
  const first = activities.save(); await activities.save(); assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { path: '/clientes/3/actividades', options: { method: 'POST', body: { tipo: 'llamada', descripcion: 'Llamar' } } });
  pending.resolve(activity); await first; assert.equal(activities.state.items.length, 1); assert.equal(activities.state.form.descripcion, '');
});
test('crear convierte vencimiento y conserva borrador/errores si falla la validación', async () => {
  let body;
  const activities = setup(async (path, options) => { body = options.body; throw Object.assign(new Error('Revise sus datos.'), { status: 422, fields: { descripcion: 'Obligatoria.' } }); });
  activities.openClient(3); activities.state.form = { tipo: 'tarea', descripcion: ' ', vence_en: '2031-04-09T08:30' };
  await activities.save(); assert.equal(body.vence_en, '2031-04-09T14:30:00.000Z');
  assert.equal(activities.state.form.descripcion, ' '); assert.equal(activities.state.form.vence_en, '2031-04-09T08:30'); assert.ok(activities.state.fields.descripcion);
});
test('filtros atrasados y respuestas de otra sesión no reemplazan el listado actual', async () => {
  const pending = [], activities = setup(() => { const request = deferred(); pending.push(request); return request.promise; });
  const first = activities.loadList('pendiente'), second = activities.loadList('completada');
  pending[1].resolve([{ ...activity, completada: true }]); await second; pending[0].resolve([]); await first;
  assert.equal(activities.state.filter, 'completada'); assert.equal(activities.state.items.length, 1);
  const third = activities.loadList(); activities.reset(); pending[2].resolve([activity]); await third; assert.deepEqual(activities.state.items, []);
});
test('PATCH envía un booleano, impide doble envío y actualiza desde API', async () => {
  const pending = deferred(), calls = [];
  const activities = setup((path, options) => { calls.push({ path, options }); return options ? pending.promise : Promise.resolve([{ ...activity, completada: true, vencida: false }]); });
  activities.state.items = [activity]; const first = activities.toggle(5); await activities.toggle(5);
  assert.equal(calls.length, 1); assert.deepEqual(calls[0].options.body, { completada: true });
  pending.resolve({ ...activity, completada: true }); await first; assert.equal(activities.state.items[0].completada, true);
});
test('404 al cambiar estado refresca cartera y listado sin mantener la actividad ajena', async () => {
  const missing = [], activities = setup(async (path, options) => { if (options) throw Object.assign(new Error('No disponible.'), { status: 404 }); return []; }, async id => missing.push(id));
  activities.state.items = [activity]; await activities.toggle(5);
  assert.deepEqual(activities.state.items, []); assert.deepEqual(missing, [3]); assert.match(activities.state.error, /ya no está disponible/);
});
test('404 de alta revalida cliente y conserva borrador; fallo de lista no inventa datos', async () => {
  const missing = [], activities = setup(async (path, options) => { if (options) throw Object.assign(new Error('No disponible.'), { status: 404 }); return []; }, async id => missing.push(id));
  activities.openClient(3); activities.state.form.descripcion = 'Conservar'; await activities.save();
  assert.equal(activities.state.form.descripcion, 'Conservar'); assert.deepEqual(missing, [3]);
  const failed = setup(async () => { throw new Error('No se pudo conectar.'); }); await failed.loadList();
  assert.equal(failed.state.loading, false); assert.match(failed.state.listError, /conectar/);
});
