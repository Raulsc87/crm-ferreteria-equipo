import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOpportunities, allowedStages } from '../js/opportunities.js';

const detail = { id: 7, cliente: { id: 4, nombre: 'Cliente' }, titulo: 'Cotización', etapa: 'prospecto', total: 15.5,
  productos: [{ id: 9, producto_id: 3, cantidad: 2, precio_unitario: 7.75, subtotal: 15.5 }], historial: [] };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const setup = api => createOpportunities({ api, changed() {} });

test('transiciones abiertas, pérdida y cerradas siguen la especificación', () => {
  assert.deepEqual(allowedStages('prospecto'), ['calificado', 'perdida']);
  assert.deepEqual(allowedStages('calificado'), ['propuesta', 'perdida']);
  assert.deepEqual(allowedStages('propuesta'), ['negociacion', 'perdida']);
  assert.deepEqual(allowedStages('negociacion'), ['ganada', 'perdida']);
  assert.deepEqual(allowedStages('ganada'), []); assert.deepEqual(allowedStages('perdida'), []);
});
test('filtros solapados y detalles atrasados no reemplazan selección vigente', async () => {
  const requests = [], opportunities = setup(path => { const pending = deferred(); requests.push({ path, ...pending }); return pending.promise; });
  const old = opportunities.list('prospecto'), recent = opportunities.list('ganada');
  requests[1].resolve([{ ...detail, etapa: 'ganada' }]); await recent;
  requests[0].resolve([]); await old; assert.equal(opportunities.state.items[0].etapa, 'ganada');
  const first = opportunities.detail(7), second = opportunities.detail(8);
  requests[3].resolve({ ...detail, id: 8, etapa: 'ganada' }); await second;
  requests[2].resolve(detail); await first; assert.equal(opportunities.state.selected.id, 8);
  const late = opportunities.detail(9); opportunities.reset(); requests[4].resolve(detail); await late;
  assert.equal(opportunities.state.selected, null);
});
test('crear solo envía cliente y título; el servidor decide etapa y propietario', async () => {
  const calls = [], opportunities = setup(async (path, options) => { calls.push({ path, options }); return options ? detail : []; });
  opportunities.state.create = { cliente_id: '4', titulo: 'Cotización', vendedor_id: 99, etapa: 'ganada' };
  await opportunities.saveCreate();
  assert.deepEqual(calls[0], { path: '/oportunidades', options: { method: 'POST', body: { cliente_id: 4, titulo: 'Cotización' } } });
});
test('agregar bloquea doble envío y no calcula ni envía dinero', async () => {
  const pending = deferred(), calls = [];
  const opportunities = setup((path, options) => { calls.push({ path, options }); return options ? pending.promise : Promise.resolve([]); });
  opportunities.state.selected = detail; opportunities.state.add = { producto_id: '3', cantidad: '2', precio: 1, total: 2 };
  const first = opportunities.add(); await opportunities.add(); assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].options.body, { producto_id: 3, cantidad: 2 });
  pending.resolve(detail); await first; assert.equal(opportunities.state.selected.total, 15.5);
});
test('errores de líneas conservan cantidades y producto con error junto al formulario correcto', async () => {
  const opportunities = setup(async () => { throw Object.assign(new Error('Revise la cantidad.'), { fields: { cantidad: 'Ingrese al menos 50.' }, status: 422 }); });
  opportunities.state.selected = detail; opportunities.state.add = { producto_id: '3', cantidad: '20' };
  await opportunities.add(); assert.equal(opportunities.state.add.cantidad, '20'); assert.equal(opportunities.state.errorForm, 'add');
  opportunities.state.quantities[9] = '10'; await opportunities.quantity(9);
  assert.equal(opportunities.state.quantities[9], '10'); assert.equal(opportunities.state.errorForm, 'quantity-9'); assert.ok(opportunities.state.fields.cantidad);
});
test('retirar línea maneja 204 consultando el total del servidor', async () => {
  const calls = [], updated = { ...detail, total: 0, productos: [] };
  const opportunities = setup(async (path, options) => { calls.push({ path, options }); return options ? null : path === '/oportunidades/7' ? updated : []; });
  opportunities.state.selected = detail; await opportunities.remove(9);
  assert.equal(calls[0].options.method, 'DELETE'); assert.equal(Object.hasOwn(calls[0].options, 'body'), false);
  assert.equal(calls[1].path, '/oportunidades/7'); assert.equal(opportunities.state.selected.total, 0);
});
test('cerrar exige confirmación y los rechazos no simulan una etapa exitosa', async () => {
  const calls = [], opportunities = setup(async (path, options) => { calls.push({ path, options }); throw Object.assign(new Error('Ingrese el motivo.'), { fields: { motivo_perdida: 'Obligatorio.' } }); });
  opportunities.state.selected = detail; opportunities.state.stage = { etapa: 'perdida', motivo_perdida: '' };
  await opportunities.stage(); assert.equal(calls.length, 0); assert.equal(opportunities.state.confirming, true);
  opportunities.cancelClosing(); assert.equal(opportunities.state.confirming, false);
  await opportunities.stage(); await opportunities.stage(true);
  assert.deepEqual(calls[0].options.body, { etapa: 'perdida', motivo_perdida: '' });
  assert.equal(opportunities.state.selected.etapa, 'prospecto'); assert.ok(opportunities.state.fields.motivo_perdida);
});
test('errores de lectura se muestran y no publican datos de una sesión cerrada', async () => {
  const pending = deferred(), opportunities = setup(() => pending.promise);
  const request = opportunities.detail(7); opportunities.reset(); pending.reject(new Error('Sesión anterior')); await request;
  assert.equal(opportunities.state.error, '');
  const failed = setup(async () => { throw new Error('No se pudo conectar.'); }); await failed.loadList();
  assert.match(failed.state.listError, /conectar/); assert.equal(failed.state.loading, false);
});
test('una creación que termina de refrescar tras cerrar sesión no carga catálogo de otra sesión', async () => {
  const pending = deferred(), calls = [];
  const opportunities = setup(async (path, options) => { calls.push(path); return options ? detail : pending.promise; });
  opportunities.state.create = { cliente_id: '4', titulo: 'Cotización' };
  const saving = opportunities.saveCreate();
  await new Promise(resolve => setImmediate(resolve));
  opportunities.reset(); pending.resolve([]); await saving;
  assert.equal(calls.includes('/productos'), false); assert.equal(opportunities.state.selected, null);
});
