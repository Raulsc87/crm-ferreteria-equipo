import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClients } from '../js/clients.js';

const client = { id: 5, nombre: 'Cliente', nit: 'CF', telefono: '55551234', correo: null };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function setup(api) { return createClients({ api, changed() {} }); }

test('buscar ignora la respuesta atrasada y codifica q como parámetro', async () => {
  const pending = [], paths = [];
  const clients = setup(path => { paths.push(path); const request = deferred(); pending.push(request); return request.promise; });
  clients.state.query = 'nombre & NIT'; const old = clients.loadList();
  clients.state.query = 'nuevo'; const current = clients.loadList();
  pending[1].resolve([client]); await current; pending[0].resolve([]); await old;
  assert.deepEqual(clients.state.items, [client]); assert.equal(clients.state.query, 'nuevo');
  assert.equal(paths[0], '/clientes?q=nombre%20%26%20NIT');
});
test('cerrar sesión descarta respuestas de la cartera anterior', async () => {
  const request = deferred(), clients = setup(() => request.promise);
  const pending = clients.loadList(); clients.reset(); request.resolve([client]); await pending;
  assert.deepEqual(clients.state.items, []);
});
test('crear envía solo contrato, impide doble envío y actualiza cartera/listas', async () => {
  const request = deferred(), calls = [];
  const clients = setup(async (path, options) => {
    calls.push({ path, options });
    if (options?.method === 'POST') return request.promise;
    return path === '/reportes/resumen' ? { cartera: { clientes: 1, maximo: 10 } } : [client];
  });
  clients.open('create'); Object.assign(clients.state.form, client, { vendedor_id: 99 });
  const first = clients.save(); await clients.save();
  assert.equal(calls.length, 1); assert.equal(clients.state.saving, true);
  assert.deepEqual(Object.keys(calls[0].options.body).sort(), ['correo', 'nit', 'nombre', 'telefono']);
  request.resolve(client); await first;
  assert.equal(clients.state.capacity.clientes, 1); assert.equal(clients.state.selected.id, 5);
});
test('editar solo envía campos cambiados; 422 conserva borrador y errores', async () => {
  let sent;
  const clients = setup(async (path, options) => {
    if (!options) return client;
    sent = options; throw Object.assign(new Error('Revise los datos.'), { status: 422, fields: { nombre: 'Ingrese su nombre.' } });
  });
  await clients.detail(5); clients.open('edit'); clients.state.form.nombre = '';
  await clients.save();
  assert.deepEqual(sent, { method: 'PATCH', body: { nombre: '' } });
  assert.equal(clients.state.form.nombre, ''); assert.ok(clients.state.fields.nombre); assert.equal(clients.state.saving, false);
});
test('tomar no envía cuerpo, bloquea doble envío y conserva 409 al actualizar disponibles', async () => {
  const request = deferred(), calls = [];
  const clients = setup((path, options) => {
    calls.push({ path, options });
    if (options) return request.promise;
    return Promise.resolve(path === '/reportes/resumen' ? { cartera: { clientes: 10, maximo: 10 } } : []);
  });
  const first = clients.take(5); await clients.take(5);
  assert.deepEqual(calls[0], { path: '/clientes/5/tomar', options: { method: 'POST' } }); assert.equal(calls.length, 1);
  request.reject(Object.assign(new Error('Su cartera ya tiene 10 clientes.'), { status: 409 })); await first;
  assert.match(clients.state.error, /10 clientes/); assert.equal(clients.state.capacity.clientes, 10); assert.equal(clients.state.taking, null);
});
test('fallos de lista y resumen se muestran sin inventar un cupo cero', async () => {
  const clients = setup(async () => { throw new Error('No se pudo conectar.'); });
  await clients.refresh();
  assert.equal(clients.state.capacity, null); assert.match(clients.state.capacityError, /conectar/);
  assert.match(clients.state.listError, /conectar/); assert.match(clients.state.availableError, /conectar/);
});
test('volver a Clientes recarga cartera, disponibles y ocupación tras una asignación externa', async () => {
  const calls = [], clients = setup(async path => { calls.push(path); return path === '/reportes/resumen' ? { cartera: { clientes: 1, maximo: 10 } } : [client]; });
  await clients.enter(); assert.deepEqual(clients.state.items, [client]); assert.equal(clients.state.capacity.clientes, 1);
  assert.deepEqual(calls.sort(), ['/clientes/disponibles', '/clientes?q=', '/reportes/resumen'].sort());
});
test('volver revalida una ficha que salió de cartera y conserva el 404 sin datos privados', async () => {
  const clients = setup(async path => { if (path === '/clientes/5') throw Object.assign(new Error('El cliente no está disponible.'), { status: 404 }); return path === '/reportes/resumen' ? { cartera: { clientes: 0, maximo: 10 } } : []; });
  clients.state.mode = 'detail'; clients.state.selected = client; await clients.enter();
  assert.equal(clients.state.selected, null); assert.deepEqual(clients.state.items, []); assert.match(clients.state.error, /no está disponible/);
});
test('si la sesión termina durante la revalidación, no iniciar nuevas consultas de cartera', async () => {
  const pending = deferred(), calls = [], clients = setup(path => { calls.push(path); return pending.promise; });
  clients.state.mode = 'detail'; clients.state.selected = client; const loading = clients.enter();
  clients.reset(); pending.resolve(client); await loading; assert.deepEqual(calls, ['/clientes/5']); assert.equal(clients.state.selected, null);
});
