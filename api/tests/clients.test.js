import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync, existsSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { parseEnv } from 'node:util';
import mysql from 'mysql2/promise';
import { readConfig } from '../src/config.js';
import { createApp } from '../src/app.js';

const config = readConfig();
const run = randomBytes(12).toString('hex'), prefix = 'a3-' + run + '-';
const password = randomBytes(16).toString('hex');
const ownedIds = new Set(), events = [];
let api, control, users, server, origin, tokens = [], originalSnapshot;

function childEnv() {
  const env = { ...process.env, APP_ENV: 'testing' };
  for (const key of Object.keys(env)) if (key.startsWith('DB_')) delete env[key];
  return env;
}

function accounts(action) {
  const result = spawnSync(process.env.PHP_BINARY || 'php', ['tests/client-users.php'], {
    input: JSON.stringify({ action, run, password }), env: childEnv(), encoding: 'utf8', windowsHide: true,
  });
  assert.equal(result.status, 0, 'No se pudieron preparar/retirar las cuentas temporales Laravel.');
  return JSON.parse(result.stdout);
}

async function isolated() {
  const [[identity]] = await control.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1' });
  const [rows] = await control.query('SHOW GRANTS FOR CURRENT_USER');
  for (const grant of rows.map(row => Object.values(row)[0])) {
    assert.ok(grant.startsWith('GRANT USAGE ON *.*') || grant.includes(' ON `crm\\_ferreteria\\_test`.* TO '), 'Cuenta de control limitada a pruebas.');
  }
}

async function snapshot() {
  await isolated();
  const result = {};
  for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) {
    const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]);
    result[table] = { count: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
  }
  return result;
}

async function cleanClients() {
  if (!control) return;
  await isolated();
  const [rows] = await control.execute('SELECT id FROM clientes WHERE nombre LIKE ?', [prefix + '%']);
  for (const row of rows) ownedIds.add(row.id);
  for (const id of ownedIds) await control.execute('DELETE FROM clientes WHERE id = ?', [id]);
  ownedIds.clear();
}

function observeConnections(pool) {
  const get = pool.getConnection.bind(pool);
  pool.getConnection = async () => {
    const connection = await get();
    if (!connection.a3Observed) {
      connection.a3Observed = true;
      const execute = connection.execute.bind(connection);
      const [[row]] = await execute('SELECT CONNECTION_ID() AS id');
      connection.execute = async (sql, params) => {
        if (sql.includes('GET_LOCK') || sql.includes('FOR SHARE')) events.push({ id: row.id, sql, time: performance.now() });
        return execute(sql, params);
      };
    }
    return connection;
  };
}

before(async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(config.db.database, 'crm_ferreteria_test');
  assert.equal(config.db.user, 'crm_api_test');
  const env = parseEnv(readFileSync('../laravel/.env.testing', 'utf8'));
  control = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_DATABASE, user: env.DB_USERNAME, password: env.DB_PASSWORD });
  originalSnapshot = await snapshot();
  users = accounts('create');
  api = mysql.createPool({ ...config.db, connectionLimit: 20, timezone: 'Z', dateStrings: true });
  const [[identity]] = await api.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_api_test@127.0.0.1' });
  observeConnections(api);
  server = createApp(api, config).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  for (let i = 0; i < 10; i++) {
    const response = await call('/api/auth/login', { method: 'POST', user: null, data: { correo: users['seller' + i].email, clave: password } });
    assert.equal(response.status, 200); tokens.push(response.body.token);
  }
});

afterEach(async () => {
  if (api && users) {
    for (let i = 0; i < 10; i++) {
      const [[lock]] = await api.execute('SELECT IS_FREE_LOCK(?) AS free', [`crm:cartera:crm_ferreteria_test:${users['seller' + i].id}`]);
      assert.equal(lock.free, 1, 'No devolver una conexión al pool con un bloqueo nombrado retenido.');
    }
  }
  await cleanClients();
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (api) await api.end();
  await cleanClients();
  if (users) { await isolated(); accounts('cleanup'); }
  if (originalSnapshot) assert.deepEqual(await snapshot(), originalSnapshot, 'Conservar todas las filas manuales previas.');
  if (control) await control.end();
});

async function phone() {
  for (;;) {
    const value = '9' + String(randomInt(10000000)).padStart(7, '0');
    const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [value]);
    if (!rows.length) return value;
  }
}

async function nit() {
  for (;;) {
    const body = String(randomInt(1000000, 9999999));
    const sum = [...body].reverse().reduce((total, digit, index) => total + Number(digit) * (index + 2), 0);
    const check = (11 - sum % 11) % 11, value = body + (check === 10 ? 'K' : check);
    const [rows] = await control.execute('SELECT id FROM clientes WHERE nit = ?', [value]);
    if (!rows.length) return value;
  }
}

async function data(change = {}) { return { nombre: prefix + randomBytes(3).toString('hex'), nit: 'CF', telefono: await phone(), ...change }; }
async function fixture(owner = null, change = {}) {
  const value = await data(change);
  const [row] = await control.execute('INSERT INTO clientes (vendedor_id, nombre, nit, telefono, correo) VALUES (?, ?, ?, ?, ?)',
    [owner === null ? null : users['seller' + owner].id, value.nombre, value.nit === 'CF' ? null : value.nit, value.telefono, value.correo ?? null]);
  ownedIds.add(row.insertId);
  return { ...value, id: row.insertId };
}
async function portfolio(count, owner = 0) { for (let i = 0; i < count; i++) await fixture(owner); }
async function count(owner = 0) { const [[row]] = await control.execute('SELECT COUNT(*) AS total FROM clientes WHERE vendedor_id = ?', [users['seller' + owner].id]); return row.total; }

async function call(route, { method = 'GET', user = 0, data, raw, headers = {} } = {}) {
  const start = performance.now();
  if (user !== null) headers = { Authorization: 'Bearer ' + tokens[user], ...headers };
  if (data !== undefined) { raw = JSON.stringify(data); headers['Content-Type'] = 'application/json'; }
  const response = await fetch(origin + route, { method, headers, body: raw });
  assert.match(response.headers.get('content-type'), /application\/json/);
  const body = await response.json();
  if (response.status === 201 && route === '/api/clientes' && data?.nombre?.startsWith(prefix)) ownedIds.add(body.id);
  return { status: response.status, body, start, finish: performance.now() };
}

function publicShape(client) { assert.deepEqual(Object.keys(client).sort(), ['correo', 'id', 'nit', 'nombre', 'telefono']); }

test('listar/detalle aíslan por vendedor, CF público y disponibles solo id/nombre', async () => {
  const own = await fixture(0), foreign = await fixture(1), available = await fixture();
  const result = await call('/api/clientes'); assert.equal(result.status, 200); assert.equal(result.body.length, 1);
  publicShape(result.body[0]); assert.equal(result.body[0].id, own.id); assert.equal(result.body[0].nit, 'CF');
  assert.equal((await call('/api/clientes/' + own.id)).status, 200);
  assert.equal((await call('/api/clientes/' + foreign.id)).status, 404);
  assert.equal((await call('/api/clientes/' + available.id)).status, 404);
  const list = await call('/api/clientes/disponibles'); assert.equal(list.status, 200);
  assert.ok(list.body.some(row => row.id === available.id));
  for (const row of list.body) assert.deepEqual(Object.keys(row).sort(), ['id', 'nombre']);
});

test('buscar nombre/NIT/CF conserva ámbito, escapa %/_ e intentos de inyección', async () => {
  // Evitar que el prefijo hexadecimal aleatorio contenga CF y coincida con esa búsqueda.
  const value = await nit(); await fixture(0, { nit: value, nombre: 'Búsqueda Quetzal 50%' }); await fixture(1, { nombre: prefix + 'Ajeno 50%' });
  await fixture(0);
  for (const q of ['Quetzal', '50%', '000' + value.slice(0, -1) + '-' + value.at(-1)]) {
    const result = await call('/api/clientes?q=' + encodeURIComponent(q)); assert.equal(result.status, 200); assert.equal(result.body.length, 1);
  }
  assert.equal((await call('/api/clientes?q=CF')).body.length, 1);
  assert.deepEqual((await call('/api/clientes?q=C%20-%20F')).body, []);
  for (const q of ['_', "' OR 1=1 --"]) assert.deepEqual((await call('/api/clientes?q=' + encodeURIComponent(q))).body, []);
  assert.equal((await call('/api/clientes?q[]=x')).status, 400);
  assert.equal((await call('/api/clientes?q=' + 'x'.repeat(151))).status, 400);
});

test('crear normaliza, asigna desde token, permite varios CF y proyecta el contrato', async () => {
  const p = await phone(), n = await nit();
  const result = await call('/api/clientes', { method: 'POST', data: await data({ nombre: prefix + '  Cliente   nuevo  ', nit: '000' + n.slice(0, -1) + '-' + n.at(-1).toLowerCase(), telefono: '+502 (' + p.slice(0, 4) + ')-' + p.slice(4) }) });
  assert.equal(result.status, 201); publicShape(result.body); assert.equal(result.body.nit, n); assert.equal(result.body.telefono, p);
  const [[row]] = await control.execute('SELECT vendedor_id FROM clientes WHERE id = ?', [result.body.id]); assert.equal(row.vendedor_id, users.seller0.id);
  for (const cf of ['CF', 'c-f', '', null]) {
    const item = await call('/api/clientes', { method: 'POST', data: await data({ nit: cf }) });
    assert.equal(item.status, 201); assert.equal(item.body.nit, 'CF');
    const [[stored]] = await control.execute('SELECT nit FROM clientes WHERE id = ?', [item.body.id]); assert.equal(stored.nit, null);
  }
});

test('editar parcialmente conserva campos omitidos y propietario; PATCH vacío no cambia datos', async () => {
  const own = await fixture(0, { nit: await nit(), correo: 'cliente@crm.test' });
  const result = await call('/api/clientes/' + own.id, { method: 'PATCH', data: { nombre: '  Nombre   corregido  ' } });
  assert.equal(result.status, 200); publicShape(result.body); assert.equal(result.body.nombre, 'Nombre corregido'); assert.equal(result.body.telefono, own.telefono); assert.equal(result.body.nit, own.nit);
  assert.deepEqual((await call('/api/clientes/' + own.id, { method: 'PATCH', data: {} })).body, result.body);
  assert.equal((await call('/api/clientes/' + own.id, { method: 'PATCH', data: { correo: null } })).body.correo, null);
  assert.equal((await call('/api/clientes/' + own.id, { method: 'PATCH', data: { nit: 'CF' } })).body.nit, 'CF');
});

for (const [field, value] of [['nombre', ' '], ['nombre', 'x'.repeat(151)], ['nombre', []], ['nit', '000'], ['nit', '45218170'], ['nit', []], ['telefono', '12345678'], ['telefono', '5900'], ['telefono', '+50359001234'], ['correo', 'incorrecto'], ['vendedor_id', 1]]) {
  test('validación directa de ' + field + ' en alta y edición', async () => {
    const own = await fixture(0);
    for (const [method, route, body] of [['POST', '/api/clientes', await data({ [field]: value })], ['PATCH', '/api/clientes/' + own.id, { [field]: value }]]) {
      const result = await call(route, { method, data: body }); assert.equal(result.status, 422); assert.equal(typeof result.body.errores[field], 'string');
    }
  });
}

test('duplicados globales normalizados dan 409 también al editar; conserva propio NIT/teléfono', async () => {
  const existing = await fixture(1, { nit: await nit() }), own = await fixture(0);
  for (const change of [{ nit: '000' + existing.nit }, { telefono: '+502 ' + existing.telefono }]) {
    assert.equal((await call('/api/clientes', { method: 'POST', data: await data(change) })).status, 409);
    assert.equal((await call('/api/clientes/' + own.id, { method: 'PATCH', data: change })).status, 409);
  }
  assert.equal((await call('/api/clientes/' + own.id, { method: 'PATCH', data: { telefono: own.telefono } })).status, 200);
});

test('tomar disponible es atómico, ya tomado 409 e inexistente 404; crear/tomar sin cupo 409', async () => {
  const candidate = await fixture();
  const result = await call('/api/clientes/' + candidate.id + '/tomar', { method: 'POST' }); assert.equal(result.status, 200); publicShape(result.body);
  assert.equal((await call('/api/clientes/' + candidate.id + '/tomar', { method: 'POST', user: 1 })).status, 409);
  assert.equal((await call('/api/clientes/9007199254740991/tomar', { method: 'POST' })).status, 404);
  await portfolio(9); assert.equal(await count(), 10);
  assert.equal((await call('/api/clientes', { method: 'POST', data: await data() })).status, 409);
  const another = await fixture(); assert.equal((await call('/api/clientes/' + another.id + '/tomar', { method: 'POST' })).status, 409);
});

test('autorización precede validación, ajenos 404 incluso JSON ilegible y sin endpoints de eliminación', async () => {
  const own = await fixture(0), foreign = await fixture(1);
  for (const route of ['/api/clientes', '/api/clientes/disponibles', '/api/clientes/' + own.id]) assert.equal((await call(route, { user: null })).status, 401);
  const forbidden = await call('/api/clientes/' + foreign.id, { method: 'PATCH', raw: '{', headers: { 'Content-Type': 'application/json' } }); assert.equal(forbidden.status, 404);
  assert.equal((await call('/api/clientes/' + own.id, { method: 'PATCH', raw: '{', headers: { 'Content-Type': 'application/json' } })).status, 400);
  assert.equal((await call('/api/clientes', { method: 'POST', raw: '', headers: { 'Content-Type': 'application/json' } })).status, 400);
  for (const route of ['/api/clientes/' + own.id, '/api/clientes/' + own.id + '/liberar']) assert.equal((await call(route, { method: 'DELETE' })).status, 404);
});

async function waitFor(predicate) {
  const end = Date.now() + 15000;
  while (!predicate()) { if (Date.now() > end) throw new Error('La barrera de concurrencia no se alcanzó.'); await new Promise(resolve => setTimeout(resolve, 10)); }
}

async function race(name, owners, tasks) {
  events.length = 0;
  await control.beginTransaction();
  await control.execute('SELECT id FROM users WHERE id IN (' + owners.map(() => '?').join(',') + ') ORDER BY id FOR UPDATE', owners.map(i => users['seller' + i].id));
  let completed = 0, released;
  const running = tasks.map(task => task().then(result => { completed++; return result; }));
  try {
    await waitFor(() => events.filter(event => event.sql.includes('GET_LOCK')).length >= tasks.length);
    await new Promise(resolve => setTimeout(resolve, 100)); assert.equal(completed, 0);
    released = performance.now(); await control.commit();
    const results = await Promise.all(running);
    assert.equal(new Set(events.filter(event => event.sql.includes('GET_LOCK')).map(event => event.id)).size, tasks.length);
    assert.ok(results.every(result => result.start < released && result.finish >= released));
    console.log(JSON.stringify({ race: name, overlap: true, connections: tasks.length, statuses: results.map(result => result.status) }));
    return results;
  } finally { await control.rollback(); await Promise.allSettled(running); }
}

test('dos altas simultáneas al cupo nueve dejan diez, no once', async () => {
  await portfolio(9);
  const a = await data(), b = await data();
  const results = await race('api_api_altas_cupo_9', [0], [() => call('/api/clientes', { method: 'POST', data: a }), () => call('/api/clientes', { method: 'POST', data: b })]);
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]); assert.equal(await count(), 10);
});

test('dos tomas distintas simultáneas con nueve clientes solo incorporan uno', async () => {
  await portfolio(9); const a = await fixture(), b = await fixture();
  const results = await race('api_api_dos_tomas_cupo_9', [0], [
    () => call('/api/clientes/' + a.id + '/tomar', { method: 'POST' }),
    () => call('/api/clientes/' + b.id + '/tomar', { method: 'POST' }),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]); assert.equal(await count(), 10);
});

test('estado se revalida después de esperar el bloqueo, sin insertar', async () => {
  events.length = 0;
  await control.beginTransaction();
  await control.execute('SELECT id FROM users WHERE id = ? FOR UPDATE', [users.seller0.id]);
  const pending = call('/api/clientes', { method: 'POST', data: await data() });
  try {
    await waitFor(() => events.some(event => event.sql.includes('FOR SHARE')));
    await control.execute('UPDATE users SET activo = ? WHERE id = ?', [0, users.seller0.id]);
    await control.commit();
    assert.equal((await pending).status, 401); assert.equal(await count(), 0);
  } finally {
    await control.rollback(); await Promise.allSettled([pending]);
    await control.execute('UPDATE users SET activo = ? WHERE id = ?', [1, users.seller0.id]);
  }
});

test('PATCH vuelve a comprobar propiedad después de una reasignación concurrente', async () => {
  const own = await fixture(0); events.length = 0;
  await control.beginTransaction();
  await control.execute('SELECT id FROM users WHERE id = ? FOR UPDATE', [users.seller0.id]);
  const pending = call('/api/clientes/' + own.id, { method: 'PATCH', data: { nombre: 'No debe guardarse' } });
  try {
    await waitFor(() => events.some(event => event.sql.includes('FOR SHARE')));
    await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?', [users.seller1.id, own.id]);
    await control.commit(); assert.equal((await pending).status, 404);
    const [[row]] = await control.execute('SELECT nombre FROM clientes WHERE id = ?', [own.id]); assert.equal(row.nombre, own.nombre);
  } finally { await control.rollback(); await Promise.allSettled([pending]); }
});

test('diez vendedores simultáneos: exactamente un ganador del disponible', async () => {
  const candidate = await fixture();
  const results = await race('api_api_diez_tomas', Array.from({ length: 10 }, (_, i) => i), Array.from({ length: 10 }, (_, i) => () => call('/api/clientes/' + candidate.id + '/tomar', { method: 'POST', user: i })));
  assert.equal(results.filter(r => r.status === 200).length, 1); assert.equal(results.filter(r => r.status === 409).length, 9);
});

for (const field of ['nit', 'telefono']) test('duplicado concurrente por ' + field + ' deja una fila', async () => {
  const value = field === 'nit' ? await nit() : await phone();
  const a = await data({ [field]: value }), b = await data({ [field]: field === 'nit' ? '000' + value : '+502 ' + value });
  const results = await race('api_api_duplicado_' + field, [0, 1], [() => call('/api/clientes', { method: 'POST', data: a }), () => call('/api/clientes', { method: 'POST', user: 1, data: b })]);
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
  const [[row]] = await control.execute('SELECT COUNT(*) AS total FROM clientes WHERE ' + field + ' = ?', [value]); assert.equal(row.total, 1);
});

function panelRequest(input, directory) {
  const child = spawn(process.env.PHP_BINARY || 'php', ['tests/Support/client-request-worker.php'], { cwd: path.resolve('../laravel'), env: childEnv(), windowsHide: true });
  let output = ''; child.stdout.on('data', value => output += value); child.stderr.resume();
  child.stdin.end(JSON.stringify({ ...input, actor: users.admin.id, barrier: directory, worker: 0 }));
  const result = new Promise((resolve, reject) => child.once('exit', code => {
    try { assert.equal(code, 0); const value = JSON.parse(output); assert.ok(!value.failed); resolve({ ...value, start: value.start * 1000, finish: value.finish * 1000 }); } catch { reject(new Error('Falló el ejecutor HTTP del panel.')); }
  }));
  return { child, result };
}

async function mixedRace(name, owners, apiTask, panel) {
  const directory = mkdtempSync(path.join(tmpdir(), 'crm-l4-a3-'));
  events.length = 0;
  await control.beginTransaction();
  await control.execute('SELECT id FROM users WHERE id IN (' + owners.map(() => '?').join(',') + ') ORDER BY id FOR UPDATE', owners.map(i => users['seller' + i].id));
  const worker = panelRequest(panel, directory);
  let apiDone = false, panelDone = false;
  const running = apiTask().then(result => { apiDone = true; return result; });
  const fromPanel = worker.result.then(result => { panelDone = true; return result; });
  try {
    await waitFor(() => existsSync(path.join(directory, '0-ready')));
    writeFileSync(path.join(directory, 'go'), 'go');
    await waitFor(() => events.some(event => event.sql.includes('FOR SHARE')) && existsSync(path.join(directory, '0-waiting')));
    await new Promise(resolve => setTimeout(resolve, 100)); assert.equal(apiDone, false); assert.equal(panelDone, false);
    const releaseApi = performance.now(), releasePanel = Date.now(); await control.commit();
    const result = await Promise.all([running, fromPanel]);
    assert.notEqual(result[1].connection, events.find(event => event.sql.includes('FOR SHARE')).id);
    assert.ok(result[0].start < releaseApi && result[0].finish >= releaseApi);
    assert.ok(result[1].start <= releasePanel && result[1].finish >= releasePanel);
    console.log(JSON.stringify({ race: name, overlap: true, connectionsDistinct: true, doors: ['API TCP', 'panel HTTP kernel'], statuses: result.map(r => r.status) }));
    return result;
  } finally {
    await control.rollback();
    if (worker.child.exitCode === null) worker.child.kill();
    await Promise.allSettled([running, fromPanel]);
    for (const file of readdirSync(directory)) unlinkSync(path.join(directory, file));
    rmdirSync(directory);
  }
}

test('API y panel simultáneos al cupo nueve respetan diez clientes', async () => {
  await portfolio(9);
  const a = await data(), b = await data();
  const results = await mixedRace('api_panel_cupo_9', [0], () => call('/api/clientes', { method: 'POST', data: a }), { method: 'POST', path: '/clientes', data: { ...b, vendedor_id: users.seller0.id } });
  assert.equal(results.filter(r => r.status === 409).length, 1); assert.equal(results.filter(r => [201, 302].includes(r.status)).length, 1); assert.equal(await count(), 10);
});

test('API toma y panel asigna el mismo disponible: solo uno confirma', async () => {
  const candidate = await fixture();
  const results = await mixedRace('api_panel_mismo_disponible', [0, 1], () => call('/api/clientes/' + candidate.id + '/tomar', { method: 'POST' }), {
    method: 'PATCH', path: '/clientes/' + candidate.id + '/asignacion', data: { confirmar: '1', expected_vendedor_id: null, vendedor_id: users.seller1.id },
  });
  assert.equal(results.filter(r => r.status === 409).length, 1); assert.equal(results.filter(r => [200, 302].includes(r.status)).length, 1);
});

for (const field of ['nit', 'telefono']) test('API/panel: índice único resuelve ' + field + ' normalizado', async () => {
  const value = field === 'nit' ? await nit() : await phone();
  const a = await data({ [field]: value }), b = await data({ [field]: field === 'nit' ? '000' + value : '+502 ' + value });
  const results = await mixedRace('api_panel_duplicado_' + field, [0, 1], () => call('/api/clientes', { method: 'POST', data: a }), { method: 'POST', path: '/clientes', data: { ...b, vendedor_id: users.seller1.id } });
  assert.equal(results.filter(r => r.status === 409).length, 1); assert.equal(results.filter(r => [201, 302].includes(r.status)).length, 1);
});

test('colección parcial: peticiones y scripts se ejecutan sobre fixtures propios', async () => {
  const available = await fixture(); await portfolio(10, 9);
  await control.execute('UPDATE users SET activo = ? WHERE id = ?', [0, users.seller8.id]);
  const collection = JSON.parse(readFileSync('../docs/api.postman_collection.json', 'utf8'));
  const values = new Map(collection.variable.map(value => [value.key, value.value]));
  for (const [key, value] of Object.entries({ base_url: origin + '/api', correo_vendedor: users.seller0.email,
    clave_publica: password, correo_admin: users.admin.email, correo_supervisor: users.supervisor.email,
    correo_inactivo: users.seller8.email, correo_cupo: users.seller9.email, disponible_id: available.id, telefono_prueba: await phone() })) values.set(key, value);
  const render = text => text.replace(/\{\{([^}]+)\}\}/g, (_, key) => values.get(key) ?? '');
  let checks = 0;
  try {
    const requests = collection.item.filter(item => !/^A[456] /.test(item.name));
    for (const item of requests) {
      const pm = { variables: { get: key => values.get(key), set: (key, value) => values.set(key, value) }, test: (name, fn) => { fn(); checks++; } };
      for (const event of item.event.filter(event => event.listen === 'prerequest')) vm.runInNewContext(event.script.exec.join('\n'), { pm }, { timeout: 2000 });
      const request = item.request, headers = Object.fromEntries(request.header.map(header => [header.key, render(header.value)]));
      if (request.auth.type === 'bearer') headers.Authorization = 'Bearer ' + render(request.auth.bearer[0].value);
      const response = await fetch(render(request.url), { method: request.method, headers, ...(request.body ? { body: render(request.body.raw) } : {}) });
      const body = await response.json();
      if (response.status === 201 && request.url === '{{base_url}}/clientes') ownedIds.add(body.id);
      pm.response = { code: response.status, json: () => body, headers: response.headers };
      for (const event of [...(collection.event ?? []), ...item.event].filter(event => event.listen === 'test')) vm.runInNewContext(event.script.exec.join('\n'), { pm }, { timeout: 2000 });
    }
    console.log(JSON.stringify({ collection: 'A1/A2/A3', collectionRequests: requests.length, checks, tokensOnlyInMemory: true }));
  } finally { await control.execute('UPDATE users SET activo = ? WHERE id = ?', [1, users.seller8.id]); }
});
