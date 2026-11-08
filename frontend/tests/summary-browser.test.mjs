import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import mysql from '../../api/node_modules/mysql2/promise.js';
import jwt from '../../api/node_modules/jsonwebtoken/index.js';
import { readConfig } from '../../api/src/config.js';
import { createDatabase } from '../../api/src/database.js';
import { createApp } from '../../api/src/app.js';
import { createFrontendServer } from '../serve.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(check, message) {
  const end = Date.now() + 12000;
  while (Date.now() < end) { if (await check()) return; await sleep(30); }
  throw new Error(message);
}
function connectProtocol(url) {
  const socket = new WebSocket(url), pending = new Map(); let next = 0;
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data), item = pending.get(data.id);
    if (item) { pending.delete(data.id); data.error ? item.reject(new Error(data.error.message)) : item.resolve(data.result); }
  });
  socket.addEventListener('close', () => { for (const item of pending.values()) item.reject(new Error('Navegador cerrado')); pending.clear(); });
  const ready = new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  return { socket, async send(method, params = {}) {
    await ready; const id = ++next;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Tiempo agotado en navegador')); }, 10000);
      pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject: error => { clearTimeout(timer); reject(error); } });
      socket.send(JSON.stringify({ id, method, params }));
    });
  } };
}

test('F5 en navegador: cifras comunes A6, meses, errores y sesión, exclusivamente lecturas', { timeout: 120000 }, async () => {
  const config = readConfig(parseEnv(readFileSync(path.join(repository, 'api/.env.a6-testing'), 'utf8')));
  assert.equal(config.db.database, 'crm_ferreteria_a6_test'); assert.equal(config.db.user, 'crm_api_a6_test');
  assert.equal(config.port, 3002); assert.equal(config.spaOrigin, 'http://127.0.0.1:5500');
  const database = createDatabase(config), calls = [], profile = mkdtempSync(path.join(tmpdir(), 'crm-spa-summary-'));
  let backend, frontend, browser, protocol, control, before, delayMonth = '';
  async function snapshot() {
    const result = {};
    for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) {
      const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]);
      result[table] = { count: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
    }
    return result;
  }
  try {
    const [[identity]] = await database.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
    assert.deepEqual(identity, { db: 'crm_ferreteria_a6_test', account: 'crm_api_a6_test@127.0.0.1' });
    const [grants] = await database.query('SHOW GRANTS'); assert.equal(grants.length, 5);
    assert.ok(grants.every(row => /^GRANT (USAGE ON \*\.\*|SELECT ON `crm_ferreteria_a6_test`\.`(users|clientes|oportunidades|oportunidad_productos)`) TO /.test(Object.values(row)[0])));
    const env = parseEnv(readFileSync(path.join(repository, 'laravel/.env.a6-testing'), 'utf8'));
    control = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), user: env.DB_USERNAME, password: env.DB_PASSWORD, database: env.DB_DATABASE, timezone: 'Z', dateStrings: true });
    const [[check]] = await control.query('SELECT DATABASE() AS db,CURRENT_USER() AS account');
    assert.deepEqual(check, { db: 'crm_ferreteria_a6_test', account: 'crm_laravel_a6_test@127.0.0.1' });
    before = await snapshot(); assert.deepEqual(Object.values(before).map(row => row.count), [7, 5, 21, 11, 13, 43, 4]);
    const app = createApp(database, config);
    backend = createServer((req, res) => {
      const record = { method: req.method, path: req.url }; calls.push(record); res.once('finish', () => { record.status = res.statusCode; });
      if (!['GET', 'OPTIONS'].includes(req.method) && !(req.method === 'POST' && req.url === '/api/auth/login')) { res.writeHead(405).end(); return; }
      if (req.method === 'GET' && req.url === delayMonth) {
        const timer = setTimeout(() => { if (!res.destroyed) app(req, res); }, 700); res.once('close', () => clearTimeout(timer));
      } else app(req, res);
    }).listen(3002, '127.0.0.1');
    await new Promise((resolve, reject) => { backend.once('listening', resolve); backend.once('error', reject); });
    frontend = createFrontendServer('http://127.0.0.1:3002/api').listen(5500, '127.0.0.1');
    await new Promise((resolve, reject) => { frontend.once('listening', resolve); frontend.once('error', reject); });
    const executable = process.env.SPA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'; assert.ok(existsSync(executable));
    browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--window-size=1280,900', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    const portFile = path.join(profile, 'DevToolsActivePort'); await waitFor(() => existsSync(portFile), 'Navegador sin puerto');
    const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
    const target = await (await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' })).json(); protocol = connectProtocol(target.webSocketDebuggerUrl);
    const evaluate = async expression => {
      const result = await protocol.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error('Comprobación de navegador inválida'); return result.result.value;
    };
    const condition = expression => waitFor(() => evaluate(expression), 'La vista no alcanzó el estado esperado: ' + expression);
    await protocol.send('Page.enable'); await protocol.send('Network.enable'); await protocol.send('Network.setCacheDisabled', { cacheDisabled: true });
    await protocol.send('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Tokyo' });
    // Solo el reloj de esta página: Tokio ya está en noviembre, Guatemala aún en octubre.
    await protocol.send('Page.addScriptToEvaluateOnNewDocument', { source: "{const NativeDate=Date;window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-11-01T02:30:00Z']))}static now(){return NativeDate.parse('2026-11-01T02:30:00Z')}}}" });
    await protocol.send('Page.navigate', { url: config.spaOrigin + '/#resumen' }); await condition("Boolean(document.querySelector('#login-form'))");
    const password = JSON.parse(readFileSync(path.join(repository, 'docs/api.postman_collection.json'), 'utf8')).variable.find(row => row.key === 'clave_publica').value;
    const login = async email => {
      await evaluate(`(()=>{const form=document.querySelector('#login-form');form.elements.correo.value=${JSON.stringify(email)};form.elements.clave.value=${JSON.stringify(password)};form.requestSubmit()})()`);
      await condition("Boolean(document.querySelector('#summary-form')) && !document.querySelector('[data-summary-results]').hidden");
    };
    const changeMonth = value => evaluate(`(()=>{const input=document.querySelector('[name=mes]');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('change',{bubbles:true}))})()`);
    const waitMonth = value => condition(`document.querySelector('[data-summary-month]')?.textContent.includes('${value}') && !document.querySelector('[data-summary-results]').hidden`);
    const values = () => evaluate("Object.fromEntries(['sales','total','forecast','capacity'].map(key=>[key,document.querySelector('[data-summary-'+key+']').textContent.replace(/\\s/g,'')]))");
    async function checkValues(month, sales, total, forecast, clients) {
      await waitMonth(month); assert.deepEqual(await values(), { sales: String(sales), total, forecast, capacity: clients + '/10' });
    }
    async function capture(name) {
      for (const width of [1280, 375]) {
        await protocol.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
        assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
        const shot = await protocol.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
        writeFileSync(path.join(profile, name + '-' + width + '.png'), Buffer.from(shot.data, 'base64'));
      }
    }
    await login('valeria@crm.test');
    assert.equal(await evaluate('new Date().getMonth()'), 10); assert.equal(await evaluate("document.querySelector('[name=mes]').value"), '2026-10');
    await checkValues('2026-10', 2, 'Q9,250.00', 'Q2,512.88', 3); await capture('summary-october');
    await changeMonth('2026-11'); await checkValues('2026-11', 1, 'Q3,600.00', 'Q2,512.88', 3);
    delayMonth = '/api/reportes/resumen?mes=2026-10'; const previous = calls.length;
    await changeMonth('2026-10');
    assert.equal(await evaluate("document.querySelector('[data-summary-results]').hidden && !document.querySelector('[data-summary-status]').hidden"), true);
    await waitFor(() => calls.slice(previous).some(row => row.method === 'GET' && row.path === delayMonth), 'No llegó la consulta antigua');
    const old = calls.slice(previous).find(row => row.method === 'GET' && row.path === delayMonth);
    await changeMonth('2026-11'); await checkValues('2026-11', 1, 'Q3,600.00', 'Q2,512.88', 3); assert.equal(old.status, undefined);
    await sleep(850); assert.equal(old.status, 200); delayMonth = ''; await checkValues('2026-11', 1, 'Q3,600.00', 'Q2,512.88', 3);
    await protocol.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await changeMonth('2026-12'); await condition("document.querySelector('[data-summary-error]').textContent.includes('conectar')");
    assert.equal(await evaluate("document.querySelector('[data-summary-results]').hidden && document.querySelector('[name=mes]').value==='2026-12'"), true); await capture('summary-offline');
    await protocol.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await changeMonth(''); await condition("document.querySelector('[data-summary-error]').textContent.includes('mes válido')");
    assert.equal(await evaluate("document.querySelector('[data-summary-results]').hidden"), true);
    const invalidStatus = await evaluate("(async()=>{const response=await fetch('http://127.0.0.1:3002/api/reportes/resumen?mes=2026-13',{headers:{Authorization:'Bearer '+JSON.parse(localStorage.getItem('crm-ferreteria.sesion')).token}});return response.status})()"); assert.equal(invalidStatus, 400);
    await changeMonth('2099-01'); await checkValues('2099-01', 0, 'Q0.00', 'Q2,512.88', 3); await capture('summary-zero');
    for (const section of ['clientes', 'oportunidades']) {
      await evaluate(`document.querySelector('[data-section=${section}]').click()`);
      await condition(`document.querySelector('[aria-current=page]')?.dataset.section==='${section}'`);
      if (section === 'clientes') await condition("document.querySelector('[data-capacity]')?.textContent==='3 / 10 clientes'");
      const count = calls.filter(row => row.method === 'GET' && row.path === '/api/reportes/resumen?mes=2099-01').length;
      await evaluate("document.querySelector('[data-section=resumen]').click()"); await checkValues('2099-01', 0, 'Q0.00', 'Q2,512.88', 3);
      assert.equal(calls.filter(row => row.method === 'GET' && row.path === '/api/reportes/resumen?mes=2099-01').length, count + 1);
    }
    // Restauración válida en A6: no requiere SELECT sobre productos.
    await protocol.send('Page.reload'); await checkValues('2026-10', 2, 'Q9,250.00', 'Q2,512.88', 3);
    assert.equal(calls.some(row => row.path === '/api/productos'), false);
    for (const [email, sales, total, forecast, clients] of [['diego@crm.test', 1, 'Q6,000.00', 'Q112.50', 2], ['carlos@crm.test', 1, 'Q7,200.00', 'Q4,125.75', 9]]) {
      await evaluate("document.querySelector('[data-action=logout]').click()"); await login(email); await checkValues('2026-10', sales, total, forecast, clients);
    }
    const [[seller]] = await database.execute('SELECT id FROM users WHERE email = ?', ['carlos@crm.test']);
    const expired = jwt.sign({}, config.jwtSecret, { subject: String(seller.id), algorithm: 'HS256', expiresIn: -1 });
    await evaluate(`(()=>{const key='crm-ferreteria.sesion',session=JSON.parse(localStorage.getItem(key));session.token=${JSON.stringify(expired)};localStorage.setItem(key,JSON.stringify(session))})()`);
    await protocol.send('Page.reload'); await condition("Boolean(document.querySelector('#login-form')) && document.querySelector('[data-notice]').textContent.includes('sesión venció')");
    assert.equal(await evaluate("localStorage.getItem('crm-ferreteria.sesion')===null"), true);
    assert.equal(calls.some(row => ['PATCH', 'DELETE', 'PUT'].includes(row.method) || row.method === 'POST' && row.path !== '/api/auth/login'), false);
    assert.deepEqual(await snapshot(), before);
    console.log(JSON.stringify({ database: config.db.database, onlyReadsAndLogin: true, controlFigures: 4, initialGuatemalaMonth: '2026-10', simulatedInstant: '2026-11-01T02:30:00Z', browserZone: 'Asia/Tokyo', lateResponseIgnored: true, offline: true, invalid400: true, expired401: true, capacityShared: true, reentryReloads: true, widths: [1280, 375] }));
  } finally {
    if (protocol) { try { await protocol.send('Browser.close'); } catch {} protocol.socket.close(); }
    if (browser && browser.exitCode === null) browser.kill();
    if (frontend) await new Promise(resolve => frontend.close(resolve));
    if (backend) { backend.closeAllConnections(); await new Promise(resolve => backend.close(resolve)); }
    await database.end();
    if (control) { try { if (before) assert.deepEqual(await snapshot(), before); } finally { await control.end(); } }
    if (!path.resolve(profile).startsWith(path.join(path.resolve(tmpdir()), 'crm-spa-summary-'))) throw new Error('Perfil temporal fuera de alcance');
    if (process.env.SPA_KEEP_SCREENSHOTS) console.log(JSON.stringify({ screenshotDirectory: profile }));
    else rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
