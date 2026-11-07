import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHmac, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { readConfig } from '../src/config.js';
import { createDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';

const config = readConfig();
const database = createDatabase(config);
const run = randomBytes(12).toString('hex');
const password = ` ${randomBytes(12).toString('hex')} Clave con espacios `;
let fixtures, server, origin, token, beforeSnapshot;

function fixture(action) {
  const env = { ...process.env, APP_ENV: 'testing' };
  // Laravel debe cargar su cuenta de pruebas, no heredar la cuenta SELECT de la API.
  for (const key of Object.keys(env)) if (key.startsWith('DB_')) delete env[key];
  const child = spawnSync(process.env.PHP_BINARY || 'php', ['tests/fixtures.php'], {
    cwd: process.cwd(), input: JSON.stringify({ action, run, password }), encoding: 'utf8', windowsHide: true, env,
  });
  assert.equal(child.status, 0, 'El auxiliar Laravel no pudo preparar los fixtures; revise su configuración local.');
  return JSON.parse(child.stdout);
}

async function snapshot() {
  const env = parseEnv(readFileSync('../laravel/.env.testing', 'utf8'));
  const db = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_DATABASE, user: env.DB_USERNAME, password: env.DB_PASSWORD });
  try {
    const [[identity]] = await db.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
    assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1' });
    const result = {};
    for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) {
      const [rows] = await db.query('SELECT * FROM ?? ORDER BY id', [table]);
      result[table] = { count: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
    }
    return result;
  } finally { await db.end(); }
}

async function request(path, { body, headers = {}, method = 'GET', raw } = {}) {
  if (body !== undefined) { headers = { 'Content-Type': 'application/json', ...headers }; raw = JSON.stringify(body); }
  const response = await fetch(origin + path, { method, headers, body: raw });
  assert.match(response.headers.get('content-type'), /application\/json/);
  return { status: response.status, headers: response.headers, body: await response.json() };
}

function credentials(name = 'seller', clave = password) { return { correo: fixtures.users[name].correo, clave }; }
function bearer(value = token) { return { Authorization: `Bearer ${value}` }; }
function signed(payload = {}, algorithm = 'HS256') {
  // Construir tokens hostiles que jsonwebtoken no permite firmar por su validación de tipos.
  const header = Buffer.from(JSON.stringify({ alg: algorithm, typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ sub: String(fixtures.users.seller.id), exp: Math.floor(Date.now() / 1000) + 60, ...payload })).toString('base64url');
  const data = `${header}.${body}`;
  return `${data}.${createHmac(algorithm === 'HS384' ? 'sha384' : 'sha256', config.jwtSecret).update(data).digest('base64url')}`;
}

before(async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(config.db.database, 'crm_ferreteria_test');
  assert.equal(config.db.user, 'crm_api_test');
  const [[identity]] = await database.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_api_test@127.0.0.1' });
  beforeSnapshot = await snapshot();
  fixtures = fixture('create');
  server = createApp(database, config).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  const login = await request('/api/auth/login', { method: 'POST', body: credentials() });
  assert.equal(login.status, 200); token = login.body.token;
});

after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await database.end();
  if (fixtures) fixture('cleanup');
  if (beforeSnapshot) assert.deepEqual(await snapshot(), beforeSnapshot, 'Los datos preexistentes de pruebas deben conservarse.');
});

test('login verifica bcrypt $2y$ generado por Laravel y expone solo el contrato', async () => {
  assert.equal(fixtures.users.seller.bcrypt_laravel, true);
  const result = await request('/api/auth/login', { method: 'POST', body: credentials() });
  assert.equal(result.status, 200);
  assert.deepEqual(Object.keys(result.body).sort(), ['token', 'usuario']);
  const { bcrypt_laravel, ...user } = fixtures.users.seller;
  assert.deepEqual(result.body.usuario, user);
  const decoded = jwt.decode(result.body.token, { complete: true });
  assert.equal(decoded.header.alg, 'HS256');
  assert.equal(decoded.payload.sub, String(user.id));
  assert.equal(decoded.payload.exp - decoded.payload.iat, 3600);
  assert.deepEqual(Object.keys(decoded.payload).sort(), ['exp', 'iat', 'sub']);
});

test('correo se normaliza y clave conserva exactamente espacios', async () => {
  const good = await request('/api/auth/login', { method: 'POST', body: { correo: `  ${credentials().correo.toUpperCase()}  `, clave: password } });
  assert.equal(good.status, 200);
  assert.equal((await request('/api/auth/login', { method: 'POST', body: credentials('seller', password.trim()) })).status, 401);
});

test('la expiración configurada se aplica al JWT emitido', async () => {
  const shortServer = createApp(database, { ...config, jwtExpiresIn: '2m' }).listen(0, '127.0.0.1');
  await new Promise(resolve => shortServer.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${shortServer.address().port}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials()),
    });
    assert.equal(response.status, 200);
    const decoded = jwt.decode((await response.json()).token);
    assert.equal(decoded.exp - decoded.iat, 120);
  } finally { await new Promise(resolve => shortServer.close(resolve)); }
});

test('un intento de inyección en correo no altera la consulta parametrizada', async () => {
  const result = await request('/api/auth/login', { method: 'POST', body: { correo: "x'OR'1'='1@crm.test", clave: password } });
  assert.equal(result.status, 401);
  assert.deepEqual(result.body, { error: 'El correo o la contraseña no son correctos.' });
});

test('correo inexistente y clave incorrecta tienen el mismo 401', async () => {
  const first = await request('/api/auth/login', { method: 'POST', body: { correo: 'ausente@api-test.invalid', clave: password } });
  const second = await request('/api/auth/login', { method: 'POST', body: credentials('seller', 'Incorrecta') });
  assert.equal(first.status, 401); assert.deepEqual(first.body, second.body); assert.equal(second.status, 401);
});

for (const name of ['admin', 'supervisor', 'inactive']) test(`${name}: clave correcta 403 sin token; incorrecta 401`, async () => {
  const result = await request('/api/auth/login', { method: 'POST', body: credentials(name) });
  assert.equal(result.status, 403); assert.deepEqual(Object.keys(result.body), ['error']);
  assert.equal((await request('/api/auth/login', { method: 'POST', body: credentials(name, 'Incorrecta') })).status, 401);
});

for (const [name, body, field] of [
  ['sin campos', {}, 'correo'], ['sin clave', { correo: 'x@crm.test' }, 'clave'],
  ['correo array', { correo: ['x'], clave: 'x' }, 'correo'], ['clave array', { correo: 'x@crm.test', clave: ['x'] }, 'clave'],
  ['correo inválido', { correo: 'no-es-correo', clave: 'x' }, 'correo'],
  ['clave vacía', { correo: 'x@crm.test', clave: '' }, 'clave'], ['clave demasiado larga', { correo: 'x@crm.test', clave: 'á'.repeat(37) }, 'clave'],
  ['campo extra', { correo: 'x@crm.test', clave: 'x', rol: 'vendedor' }, 'rol'],
]) test(`validación ${name}: 422 por campo`, async () => {
  const result = await request('/api/auth/login', { method: 'POST', body });
  assert.equal(result.status, 422); assert.deepEqual(Object.keys(result.body), ['errores']); assert.equal(typeof result.body.errores[field], 'string');
});

for (const raw of ['{', '', 'null', '[]', '"texto"']) test(`cuerpo ilegible ${JSON.stringify(raw)}: 400 JSON`, async () => {
  const result = await request('/api/auth/login', { method: 'POST', raw, headers: { 'Content-Type': 'application/json' } });
  assert.equal(result.status, 400); assert.deepEqual(Object.keys(result.body), ['error']);
});

test('contenido no JSON y parámetros no permitidos: 400', async () => {
  assert.equal((await request('/api/auth/login', { method: 'POST', raw: 'correo=x', headers: { 'Content-Type': 'text/plain' } })).status, 400);
  assert.equal((await request('/api/auth/login?rol=vendedor', { method: 'POST', body: credentials() })).status, 400);
  assert.equal((await request('/api/productos?q=x', { headers: bearer() })).status, 400);
});

test('productos: arreglo de activos con precio numérico y sin campos internos', async () => {
  const result = await request('/api/productos', { headers: bearer() });
  assert.equal(result.status, 200); assert.ok(Array.isArray(result.body));
  const [rows] = await database.execute('SELECT id, nombre, precio FROM productos WHERE activo = ? ORDER BY id', [1]);
  assert.deepEqual(result.body, rows.map(row => ({ ...row, precio: Number(row.precio) })));
  assert.ok(result.body.length > 0);
  for (const product of result.body) { assert.deepEqual(Object.keys(product).sort(), ['id', 'nombre', 'precio']); assert.equal(typeof product.precio, 'number'); }
});

for (const header of [undefined, 'Basic abc', 'Bearer', 'Bearer abc', 'Bearer uno dos']) test(`autorización ${header || 'ausente'}: 401`, async () => {
  assert.equal((await request('/api/productos', { headers: header ? { Authorization: header } : {} })).status, 401);
});

test('token alterado, vencido, algoritmo distinto y sin firma: 401', async () => {
  const values = [token.slice(0, -3) + 'xxx', signed({ exp: 1 }), signed({}, 'HS384'), jwt.sign({ sub: '1', exp: 9999999999 }, '', { algorithm: 'none' })];
  for (const value of values) assert.equal((await request('/api/productos', { headers: bearer(value) })).status, 401);
});

for (const sub of [undefined, '0', '-1', '1 OR 1=1', '01', 1, {}, '9007199254740992']) test(`sub inválido ${JSON.stringify(sub)}: 401`, async () => {
  assert.equal((await request('/api/productos', { headers: bearer(signed({ sub })) })).status, 401);
});

test('exp obligatorio y nbf futuro no permiten acceso', async () => {
  const noExp = jwt.sign({ sub: String(fixtures.users.seller.id) }, config.jwtSecret, { algorithm: 'HS256' });
  assert.equal((await request('/api/productos', { headers: bearer(noExp) })).status, 401);
  assert.equal((await request('/api/productos', { headers: bearer(signed({ nbf: Math.floor(Date.now() / 1000) + 300 })) })).status, 401);
});

test('CORS solo autoriza el origen exacto, nunca comodines', async () => {
  const result = await request('/api/productos', { headers: { ...bearer(), Origin: config.spaOrigin } });
  assert.equal(result.headers.get('access-control-allow-origin'), config.spaOrigin);
  const denied = await request('/api/productos', { headers: { ...bearer(), Origin: 'http://otro-origen.invalid' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const preflight = await fetch(origin + '/api/productos', { method: 'OPTIONS', headers: { Origin: config.spaOrigin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Authorization' } });
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('access-control-allow-origin'), config.spaOrigin);
});

test('cuenta inexistente en la base invalida un token todavía vigente', async () => {
  const result = await request('/api/auth/login', { method: 'POST', body: credentials('removable') });
  fixture('remove');
  assert.equal((await request('/api/productos', { headers: bearer(result.body.token) })).status, 401);
});

test('desactivar y después cambiar rol invalida la misma sesión JWT', async () => {
  fixture('inactive'); assert.equal((await request('/api/productos', { headers: bearer() })).status, 401);
  fixture('active'); assert.equal((await request('/api/productos', { headers: bearer() })).status, 200);
  fixture('role'); assert.equal((await request('/api/productos', { headers: bearer() })).status, 401);
});

test('privilegios mínimos por tabla autorizada y ruta desconocida JSON', async () => {
  const [rows] = await database.query('SHOW GRANTS FOR CURRENT_USER');
  const grants = rows.map(row => Object.values(row)[0]);
  assert.equal(grants.length, 8);
  assert.ok(grants.every(value => /^GRANT (USAGE ON \*\.\*|SELECT ON `crm_ferreteria_test`\.`(users|productos)`|SELECT, INSERT, UPDATE ON `crm_ferreteria_test`\.`(clientes|oportunidades|actividades)`|SELECT, INSERT, UPDATE, DELETE ON `crm_ferreteria_test`\.`oportunidad_productos`|SELECT, INSERT ON `crm_ferreteria_test`\.`historial_etapas`) TO /.test(value)));
  await assert.rejects(database.execute('SELECT id FROM migrations LIMIT 1'), error => error.code === 'ER_TABLEACCESS_DENIED_ERROR');
  assert.deepEqual((await request('/api/no-existe')).body, { error: 'El recurso solicitado no está disponible.' });
});

test('fallo MySQL produce 500 genérico sin SQL ni configuración', async () => {
  const db = createDatabase(config);
  await db.end();
  const failed = createApp(db, config).listen(0, '127.0.0.1');
  await new Promise(resolve => failed.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${failed.address().port}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials()) });
    assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'No se pudo completar la solicitud. Inténtelo de nuevo.' });
  } finally { await new Promise(resolve => failed.close(resolve)); }
});
