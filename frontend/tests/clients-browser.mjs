import assert from 'node:assert/strict';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import path from 'node:path';
import mysql from '../../api/node_modules/mysql2/promise.js';

export async function checkClientsInBrowser({ repository, evaluate, condition, login, protocol, profile, calls, searchDelays, setDelay }) {
  const env = parseEnv(readFileSync(path.join(repository, 'laravel/.env.testing'), 'utf8'));
  const apiEnv = parseEnv(readFileSync(path.join(repository, 'api/.env.testing'), 'utf8'));
  const control = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_DATABASE, user: env.DB_USERNAME, password: env.DB_PASSWORD, timezone: 'Z', dateStrings: true });
  const run = randomBytes(12).toString('hex'), prefix = 'spa-f2-' + run + '-', password = randomBytes(16).toString('hex');
  let users, before;
  async function isolated() {
    const [[identity]] = await control.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
    assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1' });
    const [grants] = await control.query('SHOW GRANTS FOR CURRENT_USER');
    for (const row of grants) assert.ok(Object.values(row)[0].startsWith('GRANT USAGE ON *.*') || Object.values(row)[0].includes(' ON `crm\\_ferreteria\\_test`.* TO '));
  }
  async function snapshot() {
    const result = {};
    for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) {
      const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]);
      result[table] = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    }
    return result;
  }
  function accounts(action) {
    const childEnv = { ...process.env, APP_ENV: 'testing' };
    for (const key of Object.keys(childEnv)) if (key.startsWith('DB_')) delete childEnv[key];
    const result = spawnSync(apiEnv.PHP_BINARY || 'php', ['tests/client-users.php'], { cwd: path.join(repository, 'api'), env: childEnv, input: JSON.stringify({ action, run, password }), encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, 'El auxiliar Laravel de cuentas temporales debe terminar correctamente.');
    return JSON.parse(result.stdout);
  }
  async function phone() {
    for (;;) {
      const value = String(randomInt(20000000, 99999999));
      const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [value]);
      if (!rows.length) return value;
    }
  }
  async function nit() {
    for (;;) {
      const body = String(randomInt(1000000, 9999999));
      const sum = [...body].reverse().reduce((total, digit, index) => total + Number(digit) * (index + 2), 0);
      const digit = (11 - sum % 11) % 11, value = body + (digit === 10 ? 'K' : digit);
      const [rows] = await control.execute('SELECT id FROM clientes WHERE nit = ?', [value]);
      if (!rows.length) return value;
    }
  }
  async function fixture(name, owner = null) {
    await isolated();
    const [row] = await control.execute('INSERT INTO clientes (nombre, nit, telefono, vendedor_id) VALUES (?, NULL, ?, ?)', [prefix + name, await phone(), owner]);
    return row.insertId;
  }
  const click = action => evaluate(`document.querySelector('[data-client-action="${action}"]').click()`);
  const fill = values => evaluate(`(() => { const form=document.querySelector('#client-form-fields');for(const [key,value] of Object.entries(${JSON.stringify(values)})){form.elements[key].value=value;form.elements[key].dispatchEvent(new Event('input',{bubbles:true}));}form.requestSubmit(); })()`);
  const search = q => evaluate(`(() => {const form=document.querySelector('#client-search');form.elements.q.value=${JSON.stringify(q)};form.requestSubmit();})()`);
  const idle = () => condition("document.querySelector('[data-capacity]')?.textContent.includes('clientes') && !document.querySelector('[data-list-status]')?.textContent.includes('Cargando')");
  async function capture(name) {
    for (const width of [1280, 375]) {
      await protocol.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width === 375 });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      const shot = await protocol.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      writeFileSync(path.join(profile, name + '-' + width + '.png'), Buffer.from(shot.data, 'base64'));
    }
  }
  try {
    await isolated(); before = await snapshot(); users = accounts('create');
    await evaluate("document.querySelector('[data-action=logout]').click()");
    await login(users.seller0.email, password);
    await condition("document.querySelector('[data-capacity]')?.textContent === '0 / 10 clientes'"); await idle();
    assert.equal(await evaluate("document.querySelector('[data-list-status]').textContent.includes('No se encontraron')"), true);
    await click('create');
    await fill({ nombre: '', nit: '123', telefono: '1', correo: 'invalido' });
    await condition("!document.querySelector('#client-telefono-error').hidden");
    for (const field of ['nombre', 'nit', 'telefono', 'correo']) assert.equal(await evaluate(`!document.querySelector('#client-${field}-error').hidden`), true);
    assert.equal(await evaluate("document.querySelector('[name=telefono]').value"), '1');
    await capture('client-errors');
    const firstPhone = await phone();
    await fill({ nombre: prefix + 'Primero', nit: 'c-f', telefono: '+502 (' + firstPhone.slice(0, 4) + ')-' + firstPhone.slice(4), correo: '' });
    await condition("Boolean(document.querySelector('[data-detail-name]'))");
    await condition("document.querySelector('[data-capacity]').textContent === '1 / 10 clientes'");
    assert.equal(await evaluate("document.querySelector('[data-detail-nit]').textContent"), 'CF');
    assert.equal(await evaluate("document.querySelector('[data-detail-telefono]').textContent"), firstPhone);
    await click('create'); await fill({ nombre: prefix + 'Duplicado', telefono: firstPhone });
    await condition("document.querySelector('[data-client-error]').textContent.includes('teléfono')");
    assert.equal(await evaluate("document.querySelector('[name=nombre]').value"), prefix + 'Duplicado');
    await click('list'); await idle(); await click('detail'); await condition("Boolean(document.querySelector('[data-detail-name]'))");
    await click('edit');
    const safeName = prefix + '<img src=x onerror="window.clientXss=true">';
    await fill({ nombre: safeName, correo: 'compras@example.test' });
    await condition(`document.querySelector('[data-detail-name]')?.textContent === ${JSON.stringify(safeName)}`);
    assert.equal(await evaluate("!document.querySelector('img[src=x]') && !window.clientXss"), true);
    await capture('client-detail');
    const normalizedNit = await nit();
    await click('edit'); await fill({ nit: '00' + normalizedNit.slice(0, -1) + '-' + normalizedNit.at(-1).toLowerCase(), correo: '' });
    await condition(`document.querySelector('[data-detail-nit]')?.textContent === '${normalizedNit}'`);
    assert.equal(await evaluate("document.querySelector('[data-detail-correo]').textContent"), 'Sin correo');
    await click('list'); await search(normalizedNit);
    await condition("document.querySelectorAll('[data-client-action=detail]').length === 1 && !document.querySelector('[data-list-status]').textContent.includes('Cargando')");
    await click('list'); await search('sin-resultados-' + run); await condition("document.querySelector('[data-list-status]').textContent.includes('No se encontraron')");
    // Peticiones HTTP solapadas: la búsqueda antigua llega primero y termina después.
    const oldPath = '/api/clientes?q=' + encodeURIComponent('antigua-' + run); searchDelays.set(oldPath, 700);
    await search('antigua-' + run); await condition("document.querySelector('[data-list-status]').textContent.includes('Cargando')");
    for (let attempt = 0; attempt < 100 && !calls.some(call => call.method === 'GET' && call.path === oldPath); attempt++) await new Promise(resolve => setTimeout(resolve, 10));
    const oldRequest = calls.find(call => call.method === 'GET' && call.path === oldPath); assert.ok(oldRequest);
    await search(prefix); await condition("document.querySelectorAll('[data-client-action=detail]').length === 1");
    assert.equal(oldRequest.status, undefined, 'Las búsquedas están solapadas, no son dos consultas secuenciales.');
    await new Promise(resolve => setTimeout(resolve, 850));
    assert.equal(oldRequest.status, 200);
    assert.equal(await evaluate("document.querySelectorAll('[data-client-action=detail]').length"), 1); searchDelays.clear();
    await capture('clients-list');
    const available = await fixture('Disponible'), occupied = await fixture('Ocupado');
    await click('refresh'); await idle(); await click('available');
    assert.equal(await evaluate(`document.querySelector('[data-client-action=take][data-id="${available}"]').parentElement.textContent.includes('NIT')`), false);
    await capture('clients-available');
    setDelay(350);
    const attempts = calls.filter(call => call.method === 'POST' && call.path === '/api/clientes/' + available + '/tomar').length;
    await evaluate(`document.querySelector('[data-client-action=take][data-id="${available}"]').click();document.querySelector('[data-client-action=take][data-id="${available}"]').click()`);
    assert.equal(await evaluate("[...document.querySelectorAll('[data-client-action=take]')].every(button=>button.disabled)"), true);
    await condition("document.querySelector('[data-capacity]').textContent === '2 / 10 clientes'"); setDelay(0);
    assert.equal(calls.filter(call => call.method === 'POST' && call.path === '/api/clientes/' + available + '/tomar').length, attempts + 1);
    await isolated(); await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?', [users.seller1.id, occupied]);
    await evaluate(`document.querySelector('[data-client-action=take][data-id="${occupied}"]').click()`);
    await condition("document.querySelector('[data-client-error]').textContent.includes('ya fue tomado')");
    for (let n = 0; n < 8; n++) await fixture('Cupo' + n, users.seller0.id);
    const extra = await fixture('SinCupo');
    await click('refresh'); await idle(); await condition("document.querySelector('[data-capacity]').textContent === '10 / 10 clientes'");
    await evaluate(`document.querySelector('[data-client-action=take][data-id="${extra}"]').click()`);
    await condition("document.querySelector('[data-client-error]').textContent.includes('máximo')");
    await capture('clients-capacity');
    await click('create'); await fill({ nombre: prefix + 'SinCupo', telefono: await phone() });
    await condition("document.querySelector('[data-client-error]').textContent.includes('máximo')");
    assert.equal(await evaluate("document.querySelector('[name=nombre]').value"), prefix + 'SinCupo');
    await click('list'); await search(prefix); await idle();
    const [[first]] = await control.execute('SELECT id FROM clientes WHERE nombre = ?', [safeName]);
    await isolated(); await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?', [users.seller1.id, first.id]);
    await evaluate(`document.querySelector('[data-client-action=detail][data-id="${first.id}"]').click()`);
    await condition("document.querySelector('[data-client-error]').textContent.includes('no está disponible')");
    assert.equal(await evaluate("document.querySelector('[data-detail-telefono]') === null"), true);
    assert.equal(await evaluate("Object.keys(JSON.parse(localStorage.getItem('crm-ferreteria.sesion'))).sort().join(',')"), 'token,usuario');
    console.log(JSON.stringify({ clients: 'API real y MySQL de pruebas', empty: true, create: true, edit: true, validation422: true, duplicate409: true, occupied409: true, capacity409: true, missing404: true, takeDoubleSubmit: true, lateSearchIgnored: true, widths: [1280, 375] }));
  } finally {
    setDelay(0); searchDelays.clear();
    try {
      await isolated();
      const [rows] = await control.execute('SELECT id FROM clientes WHERE nombre LIKE ?', [prefix + '%']);
      for (const row of rows) await control.execute('DELETE FROM clientes WHERE id = ? AND nombre LIKE ?', [row.id, prefix + '%']);
      if (users) accounts('cleanup');
      if (before) assert.deepEqual(await snapshot(), before, 'Conservar todas las filas preexistentes de pruebas.');
    } finally { await control.end(); }
  }
}
