import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentGuatemalaMonth, createSummary } from '../js/summary.js';
import { createClients } from '../js/clients.js';
import { createFrontendServer } from '../serve.mjs';

const data = { mes: '2026-10', ventas: 2, total: 9250, pronostico: 2512.88, cartera: { clientes: 3, maximo: 10 } };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const setup = (api, updateCapacity = () => {}) => createSummary({ api, updateCapacity, changed() {} });

test('mes inicial usa Guatemala en la frontera mensual UTC', () => {
  assert.equal(currentGuatemalaMonth(new Date('2026-11-01T02:30:00Z')), '2026-10');
  assert.equal(currentGuatemalaMonth(new Date('2026-11-01T06:00:00Z')), '2026-11');
});
test('resumen pide solo mes y conserva las cifras recibidas sin recalcular', async () => {
  const calls = [], capacities = [], summary = setup(async path => { calls.push(path); return data; }, value => capacities.push(value));
  await summary.load('2026-10'); assert.deepEqual(calls, ['/reportes/resumen?mes=2026-10']);
  assert.equal(summary.state.data, data); assert.deepEqual(capacities, [data.cartera]);
});
test('respuesta y error atrasados no sustituyen el mes reciente', async () => {
  const pending = [], summary = setup(() => { const request = deferred(); pending.push(request); return request.promise; });
  const first = summary.load('2026-10'), recent = summary.load('2026-11');
  pending[1].resolve({ ...data, mes: '2026-11', ventas: 1, total: 3600 }); await recent;
  pending[0].reject(new Error('Respuesta anterior')); await first;
  assert.equal(summary.state.data.mes, '2026-11'); assert.equal(summary.state.error, '');
});
test('consulta y error nuevos ocultan las cifras previas e identifican el mes solicitado', async () => {
  const pending = deferred(), summary = setup(() => pending.promise);
  summary.state.data = data; const loading = summary.load('2026-11');
  assert.equal(summary.state.data, null); assert.equal(summary.state.loading, true);
  pending.reject(new Error('No se pudo conectar.')); await loading;
  assert.equal(summary.state.data, null); assert.equal(summary.state.month, '2026-11'); assert.match(summary.state.error, /conectar/);
});
test('ceros son datos válidos y el mes de una respuesta debe coincidir', async () => {
  const zero = { mes: '2026-10', ventas: 0, total: 0, pronostico: 0, cartera: { clientes: 0, maximo: 10 } };
  const summary = setup(async () => zero); await summary.load('2026-10'); assert.deepEqual(summary.state.data, zero);
  await summary.load('2026-11'); assert.equal(summary.state.data, null); assert.match(summary.state.error, /no coincide/);
});
test('cerrar sesión descarta el resultado y no publica ocupación de la sesión anterior', async () => {
  const pending = deferred(), capacities = [], summary = setup(() => pending.promise, value => capacities.push(value));
  const loading = summary.load('2026-10'); summary.reset(); pending.resolve(data); await loading;
  assert.equal(summary.state.data, null); assert.deepEqual(capacities, []);
});
test('ocupación compartida del resumen invalida lecturas anteriores del módulo Clientes', async () => {
  const pending = deferred(), clients = createClients({ api: path => path === '/reportes/resumen' ? pending.promise : Promise.resolve([]), changed() {} });
  const loading = clients.refresh(); clients.updateCapacity({ clientes: 4, maximo: 10 });
  pending.resolve({ cartera: { clientes: 3, maximo: 10 } }); await loading;
  assert.deepEqual(clients.state.capacity, { clientes: 4, maximo: 10 }); assert.equal(clients.state.capacityLoading, false);
});
test('al salir de Resumen, su respuesta pendiente no sobrescribe la cartera actualizada en Clientes', async () => {
  const pending = deferred(), capacities = [], summary = setup(() => pending.promise, value => capacities.push(value));
  const loading = summary.load('2026-10'); summary.leave(); pending.resolve(data); await loading;
  assert.equal(summary.state.data, null); assert.equal(summary.state.loading, false); assert.deepEqual(capacities, []);
});
test('servidor permite configurar únicamente URL pública, sin modificar config.js ni exponer entorno', async () => {
  assert.throws(() => createFrontendServer('http://usuario:clave@127.0.0.1:3002/api'));
  const server = createFrontendServer('http://127.0.0.1:3002/api').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch('http://127.0.0.1:' + server.address().port + '/js/config.js');
    assert.equal(response.status, 200); assert.equal(await response.text(), "export const API_BASE_URL = \"http://127.0.0.1:3002/api\";");
  } finally { await new Promise(resolve => server.close(resolve)); }
});
