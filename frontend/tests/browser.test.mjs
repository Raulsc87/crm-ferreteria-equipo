import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { parseEnv } from 'node:util';
import jwt from '../../api/node_modules/jsonwebtoken/index.js';
import { readConfig } from '../../api/src/config.js';
import { createDatabase } from '../../api/src/database.js';
import { createApp } from '../../api/src/app.js';
import { createFrontendServer } from '../serve.mjs';
import { checkClientsInBrowser } from './clients-browser.mjs';
import { checkOpportunitiesInBrowser } from './opportunities-browser.mjs';
import { checkActivitiesInBrowser } from './activities-browser.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(check, message) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) { if (await check()) return; await sleep(50); }
  throw new Error(message);
}

function connectProtocol(url) {
  const socket = new WebSocket(url), pending = new Map(); let nextId = 0;
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data), promise = pending.get(data.id);
    if (promise) { pending.delete(data.id); if (data.error) promise.reject(new Error(data.error.message)); else promise.resolve(data.result); }
  });
  socket.addEventListener('close', () => { for (const promise of pending.values()) promise.reject(new Error('Navegador cerrado')); pending.clear(); });
  const ready = new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  return { socket, async send(method, params = {}) {
    await ready; const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Tiempo agotado en el navegador')); }, 10000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
      socket.send(JSON.stringify({ id, method, params }));
    });
  } };
}

test('Fase 6: acceso y navegación en navegador real contra API de pruebas', { timeout: 120000 }, async () => {
  const config = readConfig(parseEnv(readFileSync(path.join(repository, 'api/.env.testing'), 'utf8')));
  assert.equal(config.db.database, 'crm_ferreteria_test'); assert.equal(config.db.user, 'crm_api_test'); assert.equal(config.spaOrigin, 'http://127.0.0.1:5500');
  const database = createDatabase(config), calls = [];
  let browser, protocol, frontend, backend, delay = 0, productDelay = 0, controlledReply = null;
  const searchDelays = new Map();
  const profile = mkdtempSync(path.join(tmpdir(), 'crm-spa-browser-'));
  try {
    const [[identity]] = await database.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
    assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_api_test@127.0.0.1' });
    const application = createApp(database, config);
    backend = createServer((req, res) => {
      const record = { method: req.method, path: req.url, authorized: Boolean(req.headers.authorization), origin: req.headers.origin };
      calls.push(record); res.once('finish', () => { record.status = res.statusCode; });
      if (req.method === 'POST' && req.url === '/api/auth/login' && controlledReply) {
        req.resume(); res.writeHead(controlledReply.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': config.spaOrigin }); res.end(JSON.stringify(controlledReply.body)); return;
      }
      const wait = req.method === 'OPTIONS' ? 0 : searchDelays.get(req.url) ?? (req.url === '/api/productos' ? productDelay : req.method === 'POST' ? delay : 0);
      if (wait) {
        const timer = setTimeout(() => { if (!res.destroyed) application(req, res); }, wait);
        res.once('close', () => clearTimeout(timer));
      } else application(req, res);
    }).listen(3001, '127.0.0.1');
    await new Promise((resolve, reject) => { backend.once('listening', resolve); backend.once('error', reject); });
    frontend = createFrontendServer().listen(5500, '127.0.0.1');
    await new Promise((resolve, reject) => { frontend.once('listening', resolve); frontend.once('error', reject); });
    const executable = process.env.SPA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    assert.ok(existsSync(executable), 'Configure SPA_BROWSER con un Chromium existente; no se instala otro navegador.');
    browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--window-size=1280,900', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    const portFile = path.join(profile, 'DevToolsActivePort'); await waitFor(() => existsSync(portFile), 'El navegador no abrió su puerto de pruebas.');
    const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
    const target = await (await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' })).json();
    protocol = connectProtocol(target.webSocketDebuggerUrl);
    const evaluate = async expression => {
      const response = await protocol.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.exceptionDetails) throw new Error('Falló una comprobación del navegador.');
      return response.result.value;
    };
    const condition = expression => waitFor(() => evaluate(expression), 'La interfaz no alcanzó el estado esperado.');
    const login = async (correo, clave) => evaluate(`(() => { const form=document.querySelector('form'); form.elements.correo.value=${JSON.stringify(correo)}; form.elements.clave.value=${JSON.stringify(clave)}; form.requestSubmit(); })()`);
    const password = JSON.parse(readFileSync(path.join(repository, 'docs/api.postman_collection.json'), 'utf8')).variable.find(v => v.key === 'clave_publica').value;
    await protocol.send('Page.enable'); await protocol.send('Network.enable'); await protocol.send('Network.setCacheDisabled', { cacheDisabled: true });
    await protocol.send('Page.navigate', { url: config.spaOrigin }); await condition("Boolean(document.querySelector('#login-form'))");
    await login('', ''); assert.equal(await evaluate("!document.querySelector('#correo-error').hidden && !document.querySelector('#clave-error').hidden"), true);
    assert.equal(calls.filter(c => c.method === 'POST').length, 0);
    await login('valeria@crm.test', 'incorrecta'); await condition("!document.querySelector('[data-error]').hidden");
    assert.equal(await evaluate("document.querySelector('[data-error]').textContent.includes('incorrectos') || document.querySelector('[data-error]').textContent.includes('correctos')"), true);
    assert.equal(await evaluate("document.querySelector('[name=correo]').value === 'valeria@crm.test' && document.querySelector('[name=clave]').value === ''"), true);
    for (const correo of ['admin@crm.test', 'sergio@crm.test', 'ivan@crm.test']) {
      await login(correo, password); await condition("!document.querySelector('[data-error]').hidden && !document.querySelector('button[type=submit]').disabled");
      assert.equal(await evaluate("document.querySelector('[data-error]').textContent.includes('no tiene acceso') && localStorage.getItem('crm-ferreteria.sesion') === null"), true);
    }
    const malicious = '<img src=x onerror="window.spaXss=true">';
    for (const reply of [{ status: 422, body: { errores: { correo: malicious } } }, { status: 500, body: { error: malicious } }]) {
      controlledReply = reply; await login('valeria@crm.test', password);
      const selector = reply.status === 422 ? '#correo-error' : '[data-error]';
      await condition(`document.querySelector(${JSON.stringify(selector)}).textContent === ${JSON.stringify(malicious)}`);
      assert.equal(await evaluate("document.querySelectorAll('img[src=x]').length === 0 && window.spaXss !== true"), true);
    }
    controlledReply = null;
    await login('valeria@crm.test', 'x'.repeat(73)); await condition("!document.querySelector('#clave-error').hidden");
    assert.equal(await evaluate("document.querySelector('[name=clave]').value === ''"), true);
    delay = 350;
    const attempts = calls.filter(c => c.method === 'POST').length;
    await login('valeria@crm.test', password);
    await evaluate("document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
    assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled && document.querySelector('[name=clave]').value === '' && !document.querySelector('[data-spinner]').hidden"), true);
    await condition("Boolean(document.querySelector('[data-name]'))"); delay = 0;
    assert.equal(calls.filter(c => c.method === 'POST').length, attempts + 1);
    assert.equal(await evaluate("document.querySelector('[data-name]').textContent === 'Valeria López'"), true);
    assert.equal(await evaluate("(() => { const s=JSON.parse(localStorage.getItem('crm-ferreteria.sesion'));return Object.keys(s).sort().join(',')==='token,usuario' && Object.keys(s.usuario).sort().join(',')==='correo,id,nombre'; })()"), true);
    for (const section of ['oportunidades', 'actividades', 'resumen', 'clientes']) {
      await evaluate(`document.querySelector('[data-section=${section}]').click()`);
      await condition(`document.querySelector('[aria-current=page]')?.dataset.section === '${section}'`);
    }
    await protocol.send('Page.reload'); await condition("Boolean(document.querySelector('[data-name]'))");
    assert.ok(calls.some(c => c.method === 'GET' && c.path === '/api/productos' && c.authorized && c.origin === config.spaOrigin));
    for (const width of [1280, 375]) {
      await protocol.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      const shot = await protocol.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(path.join(profile, 'navigation-' + width + '.png'), Buffer.from(shot.data, 'base64'));
    }
    await evaluate(`(() => { const key='crm-ferreteria.sesion';const s=JSON.parse(localStorage.getItem(key));s.usuario.nombre=${JSON.stringify(malicious)};localStorage.setItem(key,JSON.stringify(s)); })()`);
    await protocol.send('Page.reload'); await condition(`document.querySelector('[data-name]')?.textContent === ${JSON.stringify(malicious)}`);
    assert.equal(await evaluate("document.querySelectorAll('img[src=x]').length === 0 && window.spaXss !== true"), true);
    await evaluate("document.querySelector('[data-action=logout]').click()"); await condition("Boolean(document.querySelector('#login-form'))");
    assert.equal(await evaluate("localStorage.getItem('crm-ferreteria.sesion') === null"), true);
    await protocol.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await login('valeria@crm.test', password); await condition("!document.querySelector('[data-error]').hidden");
    assert.equal(await evaluate("document.querySelector('[data-error]').textContent.includes('conectar')"), true);
    await protocol.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    const [[seller]] = await database.execute('SELECT id FROM users WHERE email = ?', ['valeria@crm.test']);
    const expired = jwt.sign({}, config.jwtSecret, { subject: String(seller.id), algorithm: 'HS256', expiresIn: -1 });
    await evaluate(`localStorage.setItem('crm-ferreteria.sesion', ${JSON.stringify(JSON.stringify({ token: expired, usuario: { id: seller.id, nombre: 'Valeria', correo: 'valeria@crm.test' } }))})`);
    await protocol.send('Page.reload'); await condition("Boolean(document.querySelector('#login-form')) && document.querySelector('[data-notice]').textContent.includes('sesión venció')");
    assert.equal(await evaluate("localStorage.getItem('crm-ferreteria.sesion') === null"), true);
    // Capturas para inspección, sin credenciales ni tokens en la página.
    for (const width of [1280, 375]) {
      await protocol.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      const shot = await protocol.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(path.join(profile, 'login-' + width + '.png'), Buffer.from(shot.data, 'base64'));
    }
    // Un 401 atrasado de la sesión anterior no debe borrar un login nuevo válido.
    productDelay = 1500;
    const previousProducts = calls.filter(call => call.method === 'GET' && call.path === '/api/productos').length;
    await evaluate(`localStorage.setItem('crm-ferreteria.sesion', ${JSON.stringify(JSON.stringify({ token: expired, usuario: { id: seller.id, nombre: 'Valeria', correo: 'valeria@crm.test' } }))})`);
    await protocol.send('Page.reload'); await condition("document.querySelector('#app').textContent.includes('Comprobando')");
    await waitFor(() => calls.filter(call => call.method === 'GET' && call.path === '/api/productos').length > previousProducts, 'La petición antigua no llegó a la API.');
    const oldRequest = calls.filter(call => call.method === 'GET' && call.path === '/api/productos').at(-1);
    await evaluate("localStorage.removeItem('crm-ferreteria.sesion');window.dispatchEvent(new StorageEvent('storage',{key:'crm-ferreteria.sesion',newValue:null}))");
    await condition("Boolean(document.querySelector('#login-form'))"); await login('valeria@crm.test', password);
    await condition("Boolean(document.querySelector('[data-name]'))");
    await waitFor(() => oldRequest.status === 401, 'La respuesta antigua no terminó con 401.'); await sleep(100); productDelay = 0;
    assert.equal(await evaluate("Boolean(document.querySelector('[data-name]')) && localStorage.getItem('crm-ferreteria.sesion') !== null"), true);
    await checkClientsInBrowser({ repository, evaluate, condition, login, protocol, profile, calls, searchDelays, setDelay: value => { delay = value; } });
    await checkOpportunitiesInBrowser({ repository, evaluate, condition, login, protocol, profile, calls, searchDelays, setDelay: value => { delay = value; } });
    await checkActivitiesInBrowser({ repository, evaluate, condition, login, protocol, profile, calls, searchDelays });
    console.log(JSON.stringify({ browser: 'Chromium existente, sin interfaz', realApi: config.db.database, corsOrigin: config.spaOrigin, loginRoles: true, duplicatePrevented: true, sessionRestored: true, expired401Cleared: true, late401Ignored: true, offlineHandled: true, safeText: true, widths: [1280, 375] }));
  } finally {
    if (protocol) { try { await protocol.send('Browser.close'); } catch {} protocol.socket.close(); }
    if (browser && browser.exitCode === null) browser.kill();
    if (frontend) await new Promise(resolve => frontend.close(resolve));
    if (backend) { backend.closeAllConnections(); await new Promise(resolve => backend.close(resolve)); }
    await database.end();
    const resolved = path.resolve(profile), prefix = path.join(path.resolve(tmpdir()), 'crm-spa-browser-');
    if (!resolved.startsWith(prefix)) throw new Error('Directorio temporal inesperado.');
    // SPA_KEEP_SCREENSHOTS conserva únicamente el perfil propio para inspeccionar y retirarlo después.
    if (process.env.SPA_KEEP_SCREENSHOTS) console.log(JSON.stringify({ screenshotDirectory: profile }));
    else rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
