import assert from 'node:assert/strict';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import path from 'node:path';
import mysql from '../../api/node_modules/mysql2/promise.js';

export async function checkOpportunitiesInBrowser({ repository, evaluate, condition, login, protocol, profile, calls, searchDelays, setDelay }) {
  const env = parseEnv(readFileSync(path.join(repository, 'laravel/.env.testing'), 'utf8'));
  const apiEnv = parseEnv(readFileSync(path.join(repository, 'api/.env.testing'), 'utf8'));
  const control = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_DATABASE, user: env.DB_USERNAME, password: env.DB_PASSWORD, timezone: 'Z', dateStrings: true });
  const run = randomBytes(12).toString('hex'), prefix = 'spa-f3-' + run + '-', password = randomBytes(16).toString('hex');
  const products = [], clients = [];
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
    assert.equal(result.status, 0, 'Auxiliar Laravel de cuentas F3.'); return JSON.parse(result.stdout);
  }
  async function client(owner) {
    await isolated();
    let phone;
    for (;;) { phone = String(randomInt(20000000, 99999999)); const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [phone]); if (!rows.length) break; }
    const [row] = await control.execute('INSERT INTO clientes (nombre, telefono, vendedor_id) VALUES (?, ?, ?)', [prefix + 'Cliente' + clients.length, phone, owner]);
    clients.push(row.insertId); return row.insertId;
  }
  async function product(name, minimum = 1, active = true) {
    await isolated();
    const [row] = await control.execute('INSERT INTO productos (nombre, precio, cantidad_minima, activo) VALUES (?, ?, ?, ?)', [prefix + name, '12.34', minimum, active]);
    products.push(row.insertId); return row.insertId;
  }
  const click = action => evaluate(`document.querySelector('[data-op-action="${action}"]').click()`);
  const submit = (id, values = {}) => evaluate(`(() => {const form=document.getElementById(${JSON.stringify(id)});for(const [key,value] of Object.entries(${JSON.stringify(values)})){form.elements[key].value=value;form.elements[key].dispatchEvent(new Event('input',{bubbles:true}));if(key==='etapa')form.elements[key].dispatchEvent(new Event('change',{bubbles:true}));}document.getElementById(${JSON.stringify(id)}).requestSubmit();})()`);
  const idle = () => condition("document.querySelector('[data-op-status]')?.hidden === true");
  const stage = async value => { await submit('op-stage-form', { etapa: value }); await idle(); };
  const filter = async value => { await submit('op-filter-form', { etapa: value }); await idle(); };
  const request = (path, method = 'GET', body) => evaluate(`(async()=>{const response=await fetch('http://127.0.0.1:3001/api'+${JSON.stringify(path)}, {method:${JSON.stringify(method)},headers:{Authorization:'Bearer '+JSON.parse(localStorage.getItem('crm-ferreteria.sesion')).token,...(${body === undefined ? 'false' : 'true'}?{'Content-Type':'application/json'}:{})},...(${body === undefined ? 'false' : 'true'}?{body:JSON.stringify(${JSON.stringify(body) || 'null'})}:{})});return {status:response.status,body:response.status===204?null:await response.json()};})()`);
  async function historyCount(id) { const [[row]] = await control.execute('SELECT COUNT(*) AS n FROM historial_etapas WHERE oportunidad_id = ?', [id]); return row.n; }
  async function capture(name) {
    for (const width of [1280, 375]) {
      await protocol.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width === 375 });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      const shot = await protocol.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      writeFileSync(path.join(profile, name + '-' + width + '.png'), Buffer.from(shot.data, 'base64'));
    }
  }
  async function create(title, clientId) {
    await click('create'); await condition("!document.querySelector('[data-op-choices-message]')?.textContent.includes('Consultando')");
    await submit('op-create-form', { cliente_id: String(clientId), titulo: title }); await idle();
    await condition("Boolean(document.querySelector('[data-op-title]'))");
    const [[row]] = await control.execute('SELECT id FROM oportunidades WHERE titulo = ?', [title]); return row.id;
  }
  try {
    await isolated(); before = await snapshot(); users = accounts('create');
    const own = await client(users.seller0.id), foreign = await client(users.seller1.id);
    const p = await product('Mínimo', 5), removable = await product('Retirable'), inactive = await product('Inactivo', 1, false);
    await evaluate("document.querySelector('[data-action=logout]').click()"); await login(users.seller0.email, password);
    await condition("Boolean(document.querySelector('[data-name]'))");
    await evaluate("document.querySelector('[data-section=oportunidades]').click()"); await idle();
    assert.equal(await evaluate("document.querySelectorAll('[data-board-stage]').length"), 4);
    assert.equal(await evaluate("document.querySelector('[data-op-list-message]').textContent.includes('No hay')"), true);
    await click('create'); await condition("document.querySelector('#op-client')?.options.length > 1 && !document.querySelector('[data-op-choices-message]')?.textContent.includes('Consultando')");
    await submit('op-create-form'); await idle();
    assert.equal(await evaluate("!document.querySelector('[data-op-error=cliente_id]').hidden && !document.querySelector('[data-op-error=titulo]').hidden"), true);
    const unsafeTitle = prefix + '<img src=x onerror="window.opXss=true">';
    await submit('op-create-form', { cliente_id: String(own), titulo: unsafeTitle }); await idle();
    assert.equal(await evaluate(`document.querySelector('[data-op-title]').textContent === ${JSON.stringify(unsafeTitle)} && !document.querySelector('img[src=x]') && !window.opXss`), true);
    const [[created]] = await control.execute('SELECT id FROM oportunidades WHERE titulo = ?', [unsafeTitle]); const op = created.id;
    assert.equal(await historyCount(op), 1);
    await submit('op-title-form', { titulo: prefix + 'Cotización' }); await idle();
    assert.equal(await evaluate("document.querySelector('[data-op-title]').textContent"), prefix + 'Cotización');
    assert.equal(await evaluate(`Boolean(document.querySelector('#op-product option[value="${inactive}"]'))`), false);
    await submit('op-add-form', { producto_id: String(p), cantidad: '1' }); await idle();
    assert.equal(await evaluate("document.querySelector('#op-add-quantity-error').textContent.includes('5')"), true);
    assert.equal(await evaluate("document.querySelector('#op-add-quantity').value"), '1');
    await capture('op-minimum');
    setDelay(300); const attempts = calls.filter(row => row.method === 'POST' && row.path === '/api/oportunidades/' + op + '/productos').length;
    await submit('op-add-form', { cantidad: '5' }); await submit('op-add-form');
    assert.equal(await evaluate("document.querySelector('#op-add-form button').disabled"), true); await idle(); setDelay(0);
    assert.equal(calls.filter(row => row.method === 'POST' && row.path === '/api/oportunidades/' + op + '/productos').length, attempts + 1);
    let result = await request('/oportunidades/' + op); assert.equal(result.body.total, 61.7); const line = result.body.productos[0].id;
    await submit('op-add-form', { producto_id: String(p), cantidad: '5' }); await idle();
    assert.equal(await evaluate("document.querySelector('[data-op-error-summary]').textContent.includes('ya está cotizado')"), true);
    const quantity = async value => evaluate(`(()=>{const form=document.querySelector('[data-op-line-form][data-line-id="${line}"]');form.elements.cantidad.value=${JSON.stringify(value)};form.elements.cantidad.dispatchEvent(new Event('input',{bubbles:true}));form.requestSubmit();})()`);
    await quantity('3'); await idle(); assert.equal(await evaluate(`document.getElementById('op-quantity-${line}-error').textContent.includes('5') && document.getElementById('op-quantity-${line}').value==='3'`), true);
    await quantity('6'); await idle(); assert.equal((await request('/oportunidades/' + op)).body.total, 74.04);
    await submit('op-add-form', { producto_id: String(removable), cantidad: '2' }); await idle();
    result = await request('/oportunidades/' + op); assert.equal(result.body.total, 98.72); const secondLine = result.body.productos.find(row => row.producto_id === removable).id;
    await evaluate(`document.querySelector('[data-op-action=remove][data-id="${secondLine}"]').click()`); await idle();
    result = await request('/oportunidades/' + op); assert.equal(result.body.productos.length, 1); assert.equal(result.body.total, 74.04);
    assert.ok(calls.some(row => row.method === 'DELETE' && row.path.endsWith('/productos/' + secondLine) && row.status === 204));
    await isolated(); await control.execute('UPDATE productos SET activo = 0 WHERE id = ?', [removable]);
    await submit('op-add-form', { producto_id: String(removable), cantidad: '1' }); await idle();
    assert.equal(await evaluate("document.querySelector('#op-product-error').textContent.includes('activo')"), true);
    // Un formulario manipulado intenta saltarse la transición ofrecida por la SPA.
    await evaluate("document.querySelector('#op-next-stage').append(new Option('Salto no permitido','ganada'))");
    await stage('ganada'); assert.equal(await historyCount(op), 1);
    await click('confirm-stage'); await idle(); assert.equal(await historyCount(op), 1);
    assert.equal(await evaluate("document.querySelector('#op-stage-error').textContent.includes('etapa')"), true);
    // Reabrir detalle recupera las opciones válidas del estado confirmado por API.
    await click('list'); await idle(); await evaluate(`document.querySelector('[data-op-action=detail][data-id="${op}"]').click()`); await idle();
    for (const next of ['calificado', 'propuesta', 'negociacion']) await stage(next);
    assert.equal(await historyCount(op), 4);
    await isolated(); await control.execute('UPDATE productos SET precio = 99.99, cantidad_minima = 99, activo = 0 WHERE id = ?', [p]);
    await capture('op-detail');
    await stage('ganada'); assert.equal((await request('/oportunidades/' + op)).body.etapa, 'negociacion');
    await capture('op-confirmation'); await click('cancel-stage');
    assert.equal((await request('/oportunidades/' + op)).body.etapa, 'negociacion');
    await stage('ganada'); await click('confirm-stage'); await idle();
    result = await request('/oportunidades/' + op);
    assert.equal(result.body.total, 74.04); assert.equal(result.body.productos[0].precio_unitario, 12.34); assert.equal(result.body.historial.length, 5);
    assert.equal(await evaluate("!document.querySelector('[data-op-readonly]').hidden && document.querySelector('#op-add-form').hidden && document.querySelector('#op-title-form').hidden && document.querySelector('#op-stage-form').hidden && !document.querySelector('[data-op-line-form]')"), true);
    for (const [suffix, method, body] of [['', 'PATCH', { titulo: 'No permitido' }], ['/etapa', 'PATCH', { etapa: 'perdida', motivo_perdida: 'No' }], ['/productos', 'POST', { producto_id: removable, cantidad: 1 }]]) assert.equal((await request('/oportunidades/' + op + suffix, method, body)).status, 409);
    assert.equal(await historyCount(op), 5);
    await capture('op-closed');
    // Archivo histórico: el cliente sale de cartera, la venta sigue visible sin consultar su ficha.
    await isolated(); await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?', [users.seller1.id, own]);
    const requestsBeforeHistory = calls.length;
    await click('list'); await idle(); await evaluate(`document.querySelector('[data-op-action=detail][data-id="${op}"]').click()`); await idle();
    assert.equal(await evaluate("document.querySelector('[data-op-client]').textContent"), prefix + 'Cliente0');
    assert.equal(calls.slice(requestsBeforeHistory).some(row => row.path === '/api/clientes/' + own), false);
    assert.equal((await request('/clientes/' + own)).status, 404);
    // Nueva oportunidad propia sin líneas para rechazar ganar y perder sin motivo.
    const own2 = await client(users.seller0.id); const empty = await create(prefix + 'Sin líneas', own2);
    for (const next of ['calificado', 'propuesta', 'negociacion']) await stage(next);
    await stage('ganada'); await click('confirm-stage'); await idle();
    assert.equal(await evaluate("document.querySelector('#op-stage-error').textContent.includes('producto')"), true); assert.equal(await historyCount(empty), 4);
    await stage('perdida'); await click('confirm-stage'); await idle();
    assert.equal(await evaluate("!document.querySelector('#op-loss-error').hidden"), true); assert.equal(await historyCount(empty), 4);
    await submit('op-stage-form', { motivo_perdida: '  No   aceptó la oferta  ' }); await click('confirm-stage'); await idle();
    result = await request('/oportunidades/' + empty); assert.equal(result.body.motivo_perdida, 'No aceptó la oferta'); assert.equal(result.body.historial.length, 5);
    await click('list'); await idle(); await filter('ganada');
    assert.equal(await evaluate("document.querySelectorAll('[data-op-closed] article').length"), 1);
    await filter('prospecto'); assert.equal(await evaluate("document.querySelector('[data-op-list-message]').textContent.includes('No hay')"), true);
    // Solapar filtros reales con una respuesta antigua retrasada deliberadamente.
    searchDelays.set('/api/oportunidades?etapa=prospecto', 700);
    await submit('op-filter-form', { etapa: 'prospecto' });
    const oldFilterPath = '/api/oportunidades?etapa=prospecto';
    const oldFilter = () => calls.filter(row => row.method === 'GET' && row.path === oldFilterPath).at(-1);
    for (let attempt = 0; attempt < 100 && oldFilter()?.status !== undefined; attempt++) await new Promise(resolve => setTimeout(resolve, 10));
    const pendingFilter = oldFilter(); assert.ok(pendingFilter); assert.equal(pendingFilter.status, undefined);
    await submit('op-filter-form', { etapa: 'ganada' }); await idle();
    assert.equal(pendingFilter.status, undefined);
    await new Promise(resolve => setTimeout(resolve, 850));
    assert.equal(pendingFilter.status, 200);
    assert.equal(await evaluate("document.querySelector('#op-filter').value==='ganada' && document.querySelectorAll('[data-op-closed] article').length===1"), true); searchDelays.clear();
    const open = await create(prefix + 'Abierta', own2);
    await click('list'); await idle(); await filter(''); await capture('op-board');
    // El detalle antiguo tampoco debe reemplazar otro abierto desde el embudo.
    searchDelays.set('/api/oportunidades/' + op, 700);
    await evaluate(`document.querySelector('[data-op-action=detail][data-id="${op}"]').click()`);
    await condition("document.querySelector('[data-op-status]').textContent.includes('Cargando')");
    await click('list'); await idle(); await evaluate(`document.querySelector('[data-op-action=detail][data-id="${open}"]').click()`); await idle();
    await new Promise(resolve => setTimeout(resolve, 850)); searchDelays.clear();
    assert.equal(await evaluate("document.querySelector('[data-op-title]').textContent"), prefix + 'Abierta');
    // Un recurso ajeno se prueba desde el mismo cliente HTTP del navegador, sin publicarlo en la UI.
    await click('create'); await condition("document.querySelector('#op-client')?.options.length > 1");
    await evaluate(`document.querySelector('#op-client').append(new Option('Ajeno','${foreign}'))`);
    await submit('op-create-form', { cliente_id: String(foreign), titulo: prefix + 'Ajena' }); await idle();
    assert.equal(await evaluate("document.querySelector('[data-op-error-summary]').textContent.includes('no está disponible')"), true);
    await isolated();
    const [createdForeign] = await control.execute("INSERT INTO oportunidades (cliente_id,vendedor_id,titulo,etapa) VALUES (?,?,?,'prospecto')", [foreign, users.seller1.id, prefix + 'Ajena SQL']);
    assert.equal((await request('/oportunidades/' + createdForeign.insertId)).status, 404);
    assert.equal((await request('/oportunidades/' + createdForeign.insertId, 'PATCH', { titulo: 'No' })).status, 404);
    console.log(JSON.stringify({ opportunities: 'API real', createEdit: true, lines: true, minimum422: true, duplicate409: true, inactive422: true, invalidStage422: true, winWithoutProducts422: true, lossWithoutReason422: true, closed409: true, historicalPrice: 12.34, total: 74.04, history: 5, foreign404: true, widths: [1280, 375] }));
  } finally {
    setDelay(0); searchDelays.clear();
    try {
      await isolated();
      const [rows] = await control.execute('SELECT id FROM oportunidades WHERE titulo LIKE ?', [prefix + '%']);
      for (const row of rows) {
        await control.execute('DELETE FROM historial_etapas WHERE oportunidad_id = ?', [row.id]);
        await control.execute('DELETE FROM oportunidad_productos WHERE oportunidad_id = ?', [row.id]);
        await control.execute('DELETE FROM oportunidades WHERE id = ? AND titulo LIKE ?', [row.id, prefix + '%']);
      }
      for (const id of clients) await control.execute('DELETE FROM clientes WHERE id = ? AND nombre LIKE ?', [id, prefix + '%']);
      for (const id of products) await control.execute('DELETE FROM productos WHERE id = ? AND nombre LIKE ?', [id, prefix + '%']);
      if (users) accounts('cleanup');
      if (before) assert.deepEqual(await snapshot(), before, 'Conservar todas las filas preexistentes tras F3.');
    } finally { await control.end(); }
  }
}
