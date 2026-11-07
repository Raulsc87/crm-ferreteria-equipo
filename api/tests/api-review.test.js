import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { readConfig } from '../src/config.js';
import { createDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';

// Revisión HTTP de solo lectura: no necesita crear ni limpiar fixtures.
let database, server, origin, token;
before(async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  const config = readConfig(parseEnv(readFileSync('.env.a6-testing', 'utf8')));
  assert.equal(config.db.database, 'crm_ferreteria_a6_test'); assert.equal(config.db.user, 'crm_api_a6_test');
  database = createDatabase(config);
  const [[identity]] = await database.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_a6_test', account: 'crm_api_a6_test@127.0.0.1' });
  server = createApp(database, config).listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  const password = JSON.parse(readFileSync('../docs/api.postman_collection.json', 'utf8')).variable.find(v => v.key === 'clave_publica').value;
  const response = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: 'valeria@crm.test', clave: password }) });
  assert.equal(response.status, 200); token = (await response.json()).token;
});
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); if (database) await database.end(); });

for (const [method, path] of [['GET', '/api/clientes/%ZZ'], ['GET', '/api/oportunidades/%FF'], ['PATCH', '/api/actividades/%ZZ']]) {
  test('ruta ilegible responde 400 JSON: ' + path, async () => {
    const response = await fetch(origin + path, { method, headers: { Authorization: 'Bearer ' + token } });
    assert.equal(response.status, 400); assert.match(response.headers.get('content-type'), /application\/json/);
    const body = await response.json(); assert.deepEqual(Object.keys(body), ['error']); assert.equal(typeof body.error, 'string');
  });
}
for (const encoding of ['gzip', 'deflate']) {
  test('cuerpo ' + encoding + ' corrupto responde 400 JSON sin detalles del descompresor', async () => {
    const response = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Encoding': encoding }, body: 'no comprimido' });
    assert.equal(response.status, 400); const body = await response.json(); assert.deepEqual(Object.keys(body), ['error']);
    assert.doesNotMatch(body.error, /Z_DATA_ERROR|stack|incorrect header/i);
  });
}
for (const email of ['revision-a7-' + randomBytes(8).toString('hex') + '@localhost', '"revision a7"@example.test']) {
  test('correo válido para Laravel llega a la comprobación de credenciales: ' + email, async () => {
    const code = "require '../laravel/vendor/autoload.php'; $v = new Egulias\\EmailValidator\\EmailValidator(); echo json_encode($v->isValid(stream_get_contents(STDIN), new Egulias\\EmailValidator\\Validation\\RFCValidation()));";
    const validation = spawnSync(process.env.PHP_BINARY || 'php', ['-r', code], { input: email, encoding: 'utf8', windowsHide: true });
    assert.equal(validation.status, 0); assert.equal(JSON.parse(validation.stdout), true);
    const response = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: email, clave: 'Credencial aleatoria inexistente' }) });
    assert.equal(response.status, 401); assert.deepEqual(Object.keys(await response.json()), ['error']);
  });
}
