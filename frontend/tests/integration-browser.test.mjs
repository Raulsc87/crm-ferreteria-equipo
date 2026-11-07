import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';
import { createHash, randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';
import mysql from '../../api/node_modules/mysql2/promise.js';
import { readConfig } from '../../api/src/config.js';
import { createDatabase } from '../../api/src/database.js';
import { createApp } from '../../api/src/app.js';
import { createFrontendServer } from '../serve.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(check, message) { const end = Date.now() + 15000; while (Date.now() < end) { if (await check()) return; await sleep(30); } throw new Error(message); }
function protocol(url) {
  const socket = new WebSocket(url), pending = new Map(); let next = 0;
  socket.addEventListener('message', event => { const data = JSON.parse(event.data), item = pending.get(data.id); if (item) { pending.delete(data.id); data.error ? item.reject(new Error(data.error.message)) : item.resolve(data.result); } });
  socket.addEventListener('close', () => { for (const item of pending.values()) item.reject(new Error('Navegador cerrado')); pending.clear(); });
  const ready = new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  return { socket, async send(method, params = {}) {
    await ready; const id = ++next;
    return new Promise((resolve, reject) => { const timer = setTimeout(() => { pending.delete(id); reject(new Error('Tiempo agotado CDP')); }, 10000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } }); socket.send(JSON.stringify({ id, method, params })); });
  } };
}

test('integración HTTP real: panel → MySQL → API → SPA, permisos, históricos y cierre completo', { timeout: 180000 }, async () => {
  const config = readConfig(parseEnv(readFileSync(path.join(repository, 'api/.env.testing'), 'utf8')));
  const env = parseEnv(readFileSync(path.join(repository, 'laravel/.env.testing'), 'utf8'));
  const php = parseEnv(readFileSync(path.join(repository, 'api/.env.testing'), 'utf8')).PHP_BINARY || 'php';
  const password = randomBytes(16).toString('hex'), run = randomBytes(12).toString('hex'), prefix = 'integral-' + run + '-';
  const profile = mkdtempSync(path.join(tmpdir(), 'crm-integral-browser-'));
  const control = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), user: env.DB_USERNAME, password: env.DB_PASSWORD, database: env.DB_DATABASE, timezone: 'Z', dateStrings: true });
  const database = createDatabase(config), pages = [];
  let server, frontend, panel, browser, root, users, before;
  async function isolated() {
    const [[row]] = await control.execute('SELECT DATABASE() AS db,CURRENT_USER() AS account,@@port AS port');
    assert.deepEqual(row, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1', port: 3306 });
    const [grants] = await control.query('SHOW GRANTS');
    for (const row of grants) assert.ok(Object.values(row)[0].startsWith('GRANT USAGE ON *.*') || Object.values(row)[0].includes(' ON `crm\\_ferreteria\\_test`.* TO '));
  }
  async function snapshot() {
    const result = {};
    for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) { const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]); result[table] = createHash('sha256').update(JSON.stringify(rows)).digest('hex'); }
    return result;
  }
  function accounts(action) {
    const childEnv = { ...process.env, APP_ENV: 'testing' }; for (const key of Object.keys(childEnv)) if (key.startsWith('DB_')) delete childEnv[key];
    const result = spawnSync(php, ['tests/client-users.php'], { cwd: path.join(repository, 'api'), env: childEnv, input: JSON.stringify({ action, run, password }), encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, 'Auxiliar Laravel de cuentas iniciales'); return JSON.parse(result.stdout);
  }
  async function newPage(port) {
    const { browserContextId } = await root.send('Target.createBrowserContext');
    const { targetId } = await root.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const connection = protocol(targets.find(target => target.id === targetId).webSocketDebuggerUrl); pages.push(connection);
    await connection.send('Page.enable'); await connection.send('Network.enable'); await connection.send('Network.setCacheDisabled', { cacheDisabled: true });
    const evaluate = async expression => { const result = await connection.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error('Comprobación de navegador: ' + result.exceptionDetails.text); return result.result.value; };
    const condition = expression => wait(() => evaluate(expression), 'La vista no alcanzó: ' + expression);
    const goto = async (url, selector) => { await connection.send('Page.navigate', { url }); await condition(`location.href.startsWith(${JSON.stringify(url)}) && Boolean(document.querySelector(${JSON.stringify(selector)}))`); };
    return { connection, evaluate, condition, goto };
  }
  async function panelSubmit(page, values, destination) {
    await page.evaluate(`(()=>{const form=document.querySelector('main form')||document.querySelector('form[action$="/login"]');for(const [key,value] of Object.entries(${JSON.stringify(values)})){const input=form.elements[key];if(input.type==='checkbox')input.checked=Boolean(value);else input.value=value;}form.requestSubmit()})()`);
    await page.condition(`location.pathname === '${destination}'`);
  }
  async function panelLogin(page, email) {
    await page.goto('http://127.0.0.1:8001/login', 'form[action$="/login"]');
    await panelSubmit(page, { email, password }, '/dashboard');
  }
  async function spaLogin(page, email) {
    await page.goto('http://127.0.0.1:5500/', '#login-form');
    await page.evaluate(`(()=>{const form=document.querySelector('#login-form');form.elements.correo.value=${JSON.stringify(email)};form.elements.clave.value=${JSON.stringify(password)};form.requestSubmit()})()`);
    await page.condition("Boolean(document.querySelector('[data-name]'))");
  }
  const spaClick = (page, action) => page.evaluate(`document.querySelector('[data-op-action="${action}"]').click()`);
  const spaIdle = page => page.condition("document.querySelector('[data-op-status]')?.hidden === true");
  async function spaForm(page, id, values) {
    await page.evaluate(`(()=>{const form=document.getElementById(${JSON.stringify(id)});for(const [key,value] of Object.entries(${JSON.stringify(values)})){form.elements[key].value=value;form.elements[key].dispatchEvent(new Event('input',{bubbles:true}));if(key==='etapa')form.elements[key].dispatchEvent(new Event('change',{bubbles:true}));}document.getElementById(${JSON.stringify(id)}).requestSubmit()})()`);
  }
  async function capture(page, name) {
    assert.equal(await page.evaluate("[...document.querySelectorAll('input[type=password]')].every(input=>input.value==='') && !document.body.textContent.includes('$2y$')"), true);
    for (const width of [1280, 375]) { await page.connection.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width === 375 });
      await page.evaluate('document.fonts.ready.then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))');
      assert.equal(await page.evaluate('document.documentElement.scrollWidth <= ' + width), true, 'El contenido debe caber en el ancho solicitado, no en un viewport ampliado por desbordamiento.');
      const shot = await page.connection.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); writeFileSync(path.join(profile, name + '-' + width + '.png'), Buffer.from(shot.data, 'base64')); }
  }
  try {
    assert.equal(config.db.database, 'crm_ferreteria_test'); assert.equal(config.db.user, 'crm_api_test'); assert.equal(config.spaOrigin, 'http://127.0.0.1:5500'); await isolated(); before = await snapshot();
    const [[apiIdentity]] = await database.query('SELECT DATABASE() AS db,CURRENT_USER() AS account,@@port AS port');
    assert.deepEqual(apiIdentity, { db: 'crm_ferreteria_test', account: 'crm_api_test@127.0.0.1', port: 3306 });
    for (const port of [8001, 3001, 5500]) await new Promise((resolve, reject) => { const probe = net.createServer(); probe.once('error', reject); probe.listen(port, '127.0.0.1', () => probe.close(resolve)); });
    const panelEnv = { ...process.env, ...env, APP_ENV: 'local', APP_DEBUG: 'false', APP_URL: 'http://127.0.0.1:8001', SESSION_DRIVER: 'file', CACHE_STORE: 'file', DB_URL: '' };
    panelEnv.CRM_REVIEW_SESSIONS = path.join(profile, 'laravel-sessions'); mkdirSync(panelEnv.CRM_REVIEW_SESSIONS);
    panelEnv.SESSION_COOKIE = 'crm_review_' + run;
    panel = spawn(php, ['-S', '127.0.0.1:8001', '-t', 'public', 'tests/Support/review-router.php'], { cwd: path.join(repository, 'laravel'), env: panelEnv, windowsHide: true, stdio: 'ignore' });
    await wait(async () => { try { const response = await fetch('http://127.0.0.1:8001/login'); return response.headers.get('x-review-database') === 'crm_ferreteria_test;crm_laravel_test@127.0.0.1;3306'; } catch { return false; } }, 'El panel no confirmó su base/cuenta');
    server = createApp(database, config).listen(3001, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    frontend = createFrontendServer('http://127.0.0.1:3001/api').listen(5500, '127.0.0.1'); await new Promise(resolve => frontend.once('listening', resolve));
    users = accounts('create');
    const executable = process.env.SPA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'; assert.ok(existsSync(executable));
    browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    const portFile = path.join(profile, 'DevToolsActivePort'); await wait(() => existsSync(portFile), 'Sin puerto Edge');
    const [port, endpoint] = readFileSync(portFile, 'utf8').trim().split('\n'); root = protocol('ws://127.0.0.1:' + port + endpoint.trim());
    const admin = await newPage(port), supervisor = await newPage(port), sellerA = await newPage(port), sellerB = await newPage(port);
    await panelLogin(admin, users.admin.email); await panelLogin(supervisor, users.supervisor.email);
    // Dos vendedores creados desde formularios reales del administrador; PHP genera sus hashes.
    const sellers = [];
    for (const label of ['A', 'B']) { await admin.goto('http://127.0.0.1:8001/cuentas/create', 'main form');
      if (label === 'A') await capture(admin, 'panel-form-cuenta');
      await panelSubmit(admin, { name: prefix + 'Vendedor' + label, email: prefix + label + '@review.test', password, password_confirmation: password, rol: 'vendedor', supervisor_id: String(users.supervisor.id), activo: '1' }, '/cuentas');
      const [[row]] = await control.execute('SELECT id,email FROM users WHERE email = ?', [prefix + label + '@review.test']); assert.ok(row); sellers.push(row); }
    await spaLogin(sellerA, sellers[0].email); await spaLogin(sellerB, sellers[1].email);
    const direct = await supervisor.evaluate("(async()=>{const response=await fetch('/cuentas',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name=csrf-token]')?.content||''},body:'{}'});return response.status})()");
    assert.equal(direct, 403);
    await supervisor.goto('http://127.0.0.1:8001/cuentas', 'body'); assert.equal(await supervisor.evaluate("document.body.textContent.includes('403') || document.body.textContent.includes('permiso')"), true);
    // Catálogo y cliente disponibles creados en el panel con nombre/prefijo propios.
    await admin.goto('http://127.0.0.1:8001/productos/create', 'main form');
    await capture(admin, 'panel-form-producto');
    await panelSubmit(admin, { nombre: prefix + 'Producto', precio: '12.34', cantidad_minima: '5', activo: '1' }, '/productos');
    const [[product]] = await control.execute('SELECT id FROM productos WHERE nombre = ?', [prefix + 'Producto']);
    let phone; for (;;) { phone = '8' + String(Math.floor(Math.random() * 10000000)).padStart(7, '0'); const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [phone]); if (!rows.length) break; }
    await admin.goto('http://127.0.0.1:8001/clientes/create', 'main form');
    await capture(admin, 'panel-form-cliente');
    await panelSubmit(admin, { nombre: prefix + 'Cliente', nit: 'CF', telefono: phone, correo: '', vendedor_id: '' }, '/clientes');
    const [[client]] = await control.execute('SELECT id FROM clientes WHERE nombre = ?', [prefix + 'Cliente']);
    await supervisor.goto('http://127.0.0.1:8001/clientes/' + client.id + '/asignacion', 'main form');
    await capture(supervisor, 'panel-form-asignacion');
    await panelSubmit(supervisor, { vendedor_id: String(sellers[0].id), confirmar: true }, '/clientes');
    // Entrar de nuevo debe actualizar sin depender del botón manual.
    await sellerA.evaluate("document.querySelector('[data-section=oportunidades]').click()"); await spaIdle(sellerA);
    await sellerA.evaluate("document.querySelector('[data-section=clientes]').click()");
    await sellerA.condition(`Boolean(document.querySelector('[data-client-action=detail][data-id="${client.id}"]'))`);
    await capture(supervisor, 'panel-clientes');
    // Seguimiento completo desde el navegador del vendedor.
    await sellerA.evaluate(`document.querySelector('[data-client-action=detail][data-id="${client.id}"]').click()`);
    await sellerA.condition("Boolean(document.querySelector('[data-activity-action=new]'))"); await sellerA.evaluate("document.querySelector('[data-activity-action=new]').click()");
    await spaForm(sellerA, 'activity-create-form', { tipo: 'tarea', descripcion: prefix + 'Seguimiento', vence_en: '2031-04-09T08:30' });
    await sellerA.condition("document.querySelector('[data-activity-form-notice]').textContent.includes('registró')");
    const [[activity]] = await control.execute('SELECT id FROM actividades WHERE descripcion = ?', [prefix + 'Seguimiento']);
    await sellerA.evaluate("document.querySelector('[data-section=oportunidades]').click()"); await spaIdle(sellerA);
    const createOpportunity = async title => { await spaClick(sellerA, 'create'); await sellerA.condition("!document.querySelector('[data-op-choices-message]')?.textContent.includes('Consultando')");
      await spaForm(sellerA, 'op-create-form', { cliente_id: String(client.id), titulo: title }); await spaIdle(sellerA);
      const [[row]] = await control.execute('SELECT id FROM oportunidades WHERE titulo = ?', [title]); assert.ok(row); return row.id; };
    const won = await createOpportunity(prefix + 'Venta');
    await spaForm(sellerA, 'op-add-form', { producto_id: String(product.id), cantidad: '1' }); await spaIdle(sellerA);
    assert.equal(await sellerA.evaluate("document.querySelector('#op-add-quantity-error').textContent.includes('5')"), true);
    await spaForm(sellerA, 'op-add-form', { cantidad: '5' }); await spaIdle(sellerA);
    await admin.goto('http://127.0.0.1:8001/productos/' + product.id + '/edit', 'main form');
    await panelSubmit(admin, { precio: '20.00', cantidad_minima: '10', activo: '0' }, '/productos');
    const [[line]] = await control.execute('SELECT id,precio_unitario FROM oportunidad_productos WHERE oportunidad_id = ?', [won]); assert.equal(line.precio_unitario, '12.34');
    await sellerA.evaluate(`(()=>{const form=document.querySelector('[data-op-line-form]');form.elements.cantidad.value='6';form.elements.cantidad.dispatchEvent(new Event('input',{bubbles:true}));form.requestSubmit()})()`); await spaIdle(sellerA);
    assert.equal(await sellerA.evaluate(`document.getElementById('op-quantity-${line.id}-error').textContent.includes('10')`), true);
    for (const etapa of ['calificado', 'propuesta', 'negociacion', 'ganada']) { await spaForm(sellerA, 'op-stage-form', { etapa }); if (etapa === 'ganada') await spaClick(sellerA, 'confirm-stage'); await spaIdle(sellerA); }
    await sellerA.condition("!document.querySelector('[data-op-readonly]').hidden");
    const [[sale]] = await control.execute('SELECT etapa,fecha_cierre FROM oportunidades WHERE id = ?', [won]); assert.equal(sale.etapa, 'ganada');
    await sellerA.evaluate("document.querySelector('[data-section=resumen]').click()");
    await sellerA.condition("!document.querySelector('[data-summary-results]').hidden");
    assert.equal(await sellerA.evaluate("document.querySelector('[data-summary-sales]').textContent==='1' && document.querySelector('[data-summary-total]').textContent.replace(/\\s/g,'')==='Q61.70'"), true);
    await capture(sellerA, 'spa-resumen');
    await admin.goto('http://127.0.0.1:8001/reportes', 'main'); assert.equal(await admin.evaluate("document.body.textContent.includes('61.70')"), true);
    // Oportunidad abierta y cotización nueva: el catálogo actual se valida en servidor.
    await sellerA.evaluate("document.querySelector('[data-section=oportunidades]').click()"); await spaIdle(sellerA); const open = await createOpportunity(prefix + 'Abierta');
    assert.equal(await sellerA.evaluate(`Boolean(document.querySelector('#op-product option[value="${product.id}"]'))`), false);
    await admin.goto('http://127.0.0.1:8001/productos/' + product.id + '/edit', 'main form'); await panelSubmit(admin, { activo: '1' }, '/productos');
    await spaClick(sellerA, 'list'); await spaIdle(sellerA); await sellerA.evaluate(`document.querySelector('[data-op-action=detail][data-id="${open}"]').click()`); await spaIdle(sellerA);
    await sellerA.condition(`Boolean(document.querySelector('#op-product option[value="${product.id}"]'))`);
    await spaForm(sellerA, 'op-add-form', { producto_id: String(product.id), cantidad: '10' }); await spaIdle(sellerA);
    const [[newLine]] = await control.execute('SELECT precio_unitario FROM oportunidad_productos WHERE oportunidad_id = ?', [open]); assert.equal(newLine.precio_unitario, '20.00');
    // Reasignación por supervisor: abiertas se transfieren, venta cerrada no.
    await supervisor.goto('http://127.0.0.1:8001/clientes/' + client.id + '/asignacion', 'main form'); await panelSubmit(supervisor, { vendedor_id: String(sellers[1].id), confirmar: true }, '/clientes');
    for (const [page, visible] of [[sellerA, false], [sellerB, true]]) { await page.evaluate("document.querySelector('[data-section=clientes]').click()");
      await page.condition(`document.querySelector('[data-capacity]')?.textContent==='${visible ? 1 : 0} / 10 clientes'`);
      await page.evaluate("document.querySelector('[data-client-action=list]').click()");
      await page.condition("!document.querySelector('[data-list-status]')?.textContent.includes('Cargando')"); assert.equal(await page.evaluate(`Boolean(document.querySelector('[data-client-action=detail][data-id="${client.id}"]'))`), visible); }
    const [owners] = await control.execute('SELECT id,vendedor_id FROM oportunidades WHERE id IN (?,?) ORDER BY id', [won, open]);
    assert.equal(owners.find(row => row.id === won).vendedor_id, sellers[0].id); assert.equal(owners.find(row => row.id === open).vendedor_id, sellers[1].id);
    await sellerA.evaluate("document.querySelector('[data-section=oportunidades]').click()"); await spaIdle(sellerA);
    assert.equal(await sellerA.evaluate(`Boolean(document.querySelector('[data-op-action=detail][data-id="${won}"]')) && !document.querySelector('[data-op-action=detail][data-id="${open}"]')`), true);
    await sellerB.evaluate("document.querySelector('[data-section=actividades]').click()"); await sellerB.condition(`Boolean(document.querySelector('[data-activity-action=toggle][data-id="${activity.id}"]'))`);
    await sellerB.evaluate(`document.querySelector('[data-activity-action=toggle][data-id="${activity.id}"]').click()`);
    await sellerB.condition("document.querySelector('[data-activity-notice]').textContent.includes('actualizó')");
    const [[author]] = await control.execute('SELECT vendedor_id,completada FROM actividades WHERE id = ?', [activity.id]); assert.equal(author.vendedor_id, sellers[0].id); assert.equal(author.completada, 1);
    await sellerA.evaluate("document.querySelector('[data-section=actividades]').click()"); await sellerA.condition("document.querySelector('[data-activity-status]').textContent.includes('No hay')");
    await capture(sellerB, 'spa-actividades');
    // La misma sesión JWT pierde acceso tras desactivar o cambiar el rol desde el panel.
    await admin.goto('http://127.0.0.1:8001/cuentas/' + sellers[0].id + '/edit', 'main form'); await panelSubmit(admin, { activo: '0' }, '/cuentas');
    await sellerA.evaluate("document.querySelector('[data-section=resumen]').click()"); await sellerA.condition("Boolean(document.querySelector('#login-form'))");
    assert.equal(await sellerA.evaluate("localStorage.getItem('crm-ferreteria.sesion')===null && document.querySelector('[data-notice]').textContent.includes('sesión venció')"), true);
    await admin.goto('http://127.0.0.1:8001/cuentas/' + sellers[1].id + '/edit', 'main form'); await panelSubmit(admin, { rol: 'supervisor', supervisor_id: '' }, '/cuentas');
    await sellerB.evaluate("document.querySelector('[data-section=resumen]').click()"); await sellerB.condition("Boolean(document.querySelector('#login-form'))"); assert.equal(await sellerB.evaluate("localStorage.getItem('crm-ferreteria.sesion')===null"), true);
    for (const [route, name] of [['/cuentas', 'panel-cuentas'], ['/productos', 'panel-productos'], ['/oportunidades', 'panel-oportunidades'], ['/reportes', 'panel-reportes']]) { await admin.goto('http://127.0.0.1:8001' + route, 'main'); await capture(admin, name); }
    await supervisor.goto('http://127.0.0.1:8001/mi-equipo', 'main'); await capture(supervisor, 'panel-equipo');
    console.log(JSON.stringify({ integration: 'panel HTTP y SPA/API reales', database: 'crm_ferreteria_test', mysqlPort: 3306, vendorCreatedInPanel: true, assignedBySupervisor: true, reassigned: true, openTransferred: true, wonRetainsCredit: true, activityAuthorPreserved: true, catalogHistorical: '12.34', catalogCurrent: '20.00', saleTotal: '61.70', deactivate401: true, roleChanged401: true, csrfEnabled: true, widths: [1280, 375] }));
  } finally {
    if (root) { try { await root.send('Browser.close'); } catch {} root.socket.close(); }
    for (const page of pages) page.socket.close();
    if (browser && browser.exitCode === null) browser.kill();
    if (frontend) await new Promise(resolve => frontend.close(resolve));
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    if (panel && panel.exitCode === null) { panel.kill(); await new Promise(resolve => panel.once('exit', resolve)); }
    await database.end();
    try {
      await isolated();
      const [opportunities] = await control.execute('SELECT id FROM oportunidades WHERE titulo LIKE ?', [prefix + '%']);
      for (const row of opportunities) { await control.execute('DELETE FROM historial_etapas WHERE oportunidad_id=?', [row.id]); await control.execute('DELETE FROM oportunidad_productos WHERE oportunidad_id=?', [row.id]); await control.execute('DELETE FROM oportunidades WHERE id=? AND titulo LIKE ?', [row.id, prefix + '%']); }
      const [clients] = await control.execute('SELECT id FROM clientes WHERE nombre LIKE ?', [prefix + '%']);
      for (const row of clients) { await control.execute('DELETE FROM actividades WHERE cliente_id=?', [row.id]); await control.execute('DELETE FROM clientes WHERE id=? AND nombre LIKE ?', [row.id, prefix + '%']); }
      for (const table of ['productos', 'users']) await control.query('DELETE FROM ?? WHERE ' + (table === 'users' ? 'email' : 'nombre') + ' LIKE ?', [table, prefix + '%']);
      if (users) accounts('cleanup');
      if (before) assert.deepEqual(await snapshot(), before, 'Conservar todos los datos manuales previos.');
    } finally { await control.end(); }
    if (!path.resolve(profile).startsWith(path.join(path.resolve(tmpdir()), 'crm-integral-browser-'))) throw new Error('Perfil fuera de alcance');
    if (process.env.SPA_KEEP_SCREENSHOTS) console.log(JSON.stringify({ screenshotDirectory: profile })); else rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
