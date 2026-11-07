import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../js/api.js';
import { SESSION_KEY, saveSession, loadSession, clearSession } from '../js/session.js';
import { createFrontendServer } from '../serve.mjs';

afterEach(() => { delete globalThis.localStorage; });
const session = { token: 'token-de-prueba', usuario: { id: 1, nombre: 'Vendedor', correo: 'vendedor@example.test' } };
function storage() {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  return values;
}

test('almacena únicamente sesión pública y conserva otras claves al cerrar', () => {
  const values = storage(); values.set('otra-aplicacion', 'conservar');
  saveSession({ ...session, clave: 'no-persistir', productos: [], usuario: { ...session.usuario, password: 'no-persistir', rol: 'vendedor' } });
  assert.deepEqual(loadSession(), session);
  assert.equal(values.size, 2); assert.equal(values.get(SESSION_KEY).includes('no-persistir'), false);
  clearSession(); assert.equal(loadSession(), null); assert.equal(values.get('otra-aplicacion'), 'conservar');
});
test('sesión corrupta o esquema inválido se retira sin errores', () => {
  const values = storage();
  for (const value of ['{', '{}', 'null', '[]', '{"token":"x","usuario":{"id":0}}']) {
    values.set(SESSION_KEY, value); assert.equal(loadSession(), null); assert.equal(values.has(SESSION_KEY), false);
  }
});
test('almacenamiento bloqueado permite sesión en memoria y cierre seguro', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Bloqueado'); } });
  assert.equal(loadSession(), null); assert.deepEqual(saveSession(session), { session, persisted: false }); assert.doesNotThrow(clearSession);
});
test('cabeceras y JSON; login público nunca adjunta el token', async () => {
  const calls = [];
  const api = createApi({ baseUrl: 'http://127.0.0.1:3001/api', getSession: () => session, onUnauthorized() {},
    fetchRequest: async (url, options) => { calls.push({ url, options }); return Response.json({ ok: true }); } });
  await api('/productos'); await api('/auth/login', { authenticated: false, method: 'POST', body: { correo: 'a@b', clave: ' con espacios ' } });
  assert.equal(calls[0].url, 'http://127.0.0.1:3001/api/productos'); assert.equal(calls[0].options.headers.Authorization, 'Bearer ' + session.token);
  assert.equal(calls[1].options.headers.Authorization, undefined); assert.equal(JSON.parse(calls[1].options.body).clave, ' con espacios ');
});
test('204 se resuelve sin intentar leer un JSON vacío', async () => {
  const api = createApi({ baseUrl: 'http://127.0.0.1:3001/api', getSession: () => session, onUnauthorized() {}, fetchRequest: async () => new Response(null, { status: 204 }) });
  assert.equal(await api('/ruta-de-prueba', { method: 'DELETE' }), null);
});
test('422 conserva errores por campo y 401 protegido avisa con el token enviado', async () => {
  const expired = [];
  let status = 422;
  const api = createApi({ baseUrl: 'http://127.0.0.1:3001/api', getSession: () => session, onUnauthorized: token => expired.push(token),
    fetchRequest: async () => Response.json(status === 422 ? { errores: { correo: 'Revise su correo.' } } : { error: 'Inicie sesión.' }, { status }) });
  await assert.rejects(api('/auth/login', { authenticated: false }), error => error.status === 422 && error.fields.correo === 'Revise su correo.');
  status = 401; await assert.rejects(api('/productos'), error => error.status === 401); assert.deepEqual(expired, [session.token]);
  await assert.rejects(api('/auth/login', { authenticated: false })); assert.equal(expired.length, 1);
});
test('fallo de conexión, respuesta no JSON y 500 no muestran contenido crudo', async () => {
  for (const fetchRequest of [async () => { throw new TypeError('Detalle interno'); }, async () => new Response('<html>Detalle interno</html>', { status: 500 })]) {
    const api = createApi({ baseUrl: 'http://127.0.0.1:3001/api', getSession: () => session, onUnauthorized() {}, fetchRequest });
    await assert.rejects(api('/productos'), error => !error.message.includes('Detalle interno') && error.message.length > 10);
  }
});
test('el servidor estático entrega módulos y protege archivos fuera de frontend', async () => {
  const server = createFrontendServer().listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    const response = await fetch(origin + '/js/app.js'); assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /javascript/);
    for (const route of ['/api/.env', '/.env', '/tests/client.test.mjs', '/serve.mjs', '/js/%2e%2e%2f%2e%2e%2fapi/.env']) assert.equal((await fetch(origin + route)).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
