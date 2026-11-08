import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createFrontendServer } from '../serve.mjs';

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitFor(check, message) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(40);
  }
  throw new Error(message);
}

function connectProtocol(url) {
  const socket = new WebSocket(url), pending = new Map();
  let nextId = 0;
  socket.addEventListener('message', event => {
    const response = JSON.parse(event.data), item = pending.get(response.id);
    if (!item) return;
    pending.delete(response.id);
    response.error ? item.reject(new Error(response.error.message)) : item.resolve(response.result);
  });
  socket.addEventListener('close', () => {
    for (const item of pending.values()) item.reject(new Error('Navegador cerrado'));
    pending.clear();
  });
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  return {
    socket,
    async send(method, params = {}) {
      await ready;
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error('Tiempo agotado en el navegador')); }, 10000);
        pending.set(id, {
          resolve: value => { clearTimeout(timer); resolve(value); },
          reject: error => { clearTimeout(timer); reject(error); },
        });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

const clients = [
  { id: 1, nombre: 'Ferretería La Central', nit: '4521817K', telefono: '55551234', correo: 'compras@central.test' },
  { id: 2, nombre: 'Constructora Los Altos', nit: 'CF', telefono: '55557890', correo: null },
];

const opportunities = [
  { id: 11, cliente: { id: 1, nombre: clients[0].nombre }, titulo: 'Herramientas para nueva sucursal', etapa: 'prospecto', probabilidad: 10, total: 1250.5, fecha_cierre: null, motivo_perdida: null },
  { id: 12, cliente: { id: 2, nombre: clients[1].nombre }, titulo: 'Material eléctrico', etapa: 'calificado', probabilidad: 25, total: 3780, fecha_cierre: null, motivo_perdida: null },
  { id: 13, cliente: { id: 1, nombre: clients[0].nombre }, titulo: 'Cemento y block', etapa: 'propuesta', probabilidad: 50, total: 6200, fecha_cierre: null, motivo_perdida: null },
  { id: 14, cliente: { id: 2, nombre: clients[1].nombre }, titulo: 'Renovación de equipo', etapa: 'negociacion', probabilidad: 75, total: 8450, fecha_cierre: null, motivo_perdida: null },
  { id: 15, cliente: { id: 1, nombre: clients[0].nombre }, titulo: 'Compra mensual', etapa: 'ganada', probabilidad: 100, total: 3150, fecha_cierre: '2026-11-05T16:00:00.000Z', motivo_perdida: null },
  { id: 16, cliente: { id: 2, nombre: clients[1].nombre }, titulo: 'Ampliación de bodega', etapa: 'perdida', probabilidad: 0, total: 4900, fecha_cierre: '2026-11-02T15:30:00.000Z', motivo_perdida: 'El cliente eligió otra propuesta.' },
];

function opportunityDetail(id = 14) {
  const row = opportunities.find(item => item.id === Number(id)) || opportunities[3];
  return {
    ...row,
    productos: [
      { id: 101, producto_id: 1, nombre: 'Taladro percutor', cantidad: 2, precio_unitario: 1250, subtotal: 2500 },
      { id: 102, producto_id: 2, nombre: 'Juego de brocas', cantidad: 5, precio_unitario: 186, subtotal: 930 },
    ],
    total: 3430,
    historial: [
      { etapa_anterior: null, etapa_nueva: 'prospecto', usuario: 'Diego7', fecha: '2026-10-20T14:00:00.000Z' },
      { etapa_anterior: 'prospecto', etapa_nueva: 'calificado', usuario: 'Diego7', fecha: '2026-10-23T15:30:00.000Z' },
      { etapa_anterior: 'calificado', etapa_nueva: 'propuesta', usuario: 'Diego7', fecha: '2026-10-27T16:15:00.000Z' },
      { etapa_anterior: 'propuesta', etapa_nueva: 'negociacion', usuario: 'Diego7', fecha: '2026-11-01T17:00:00.000Z' },
    ],
  };
}

let activities = [
  { id: 21, cliente: { id: 1, nombre: clients[0].nombre }, tipo: 'llamada', descripcion: 'Confirmar cantidades y fecha de entrega.', vence_en: '2099-11-10T15:00:00.000Z', completada: false, vencida: false },
  { id: 22, cliente: { id: 2, nombre: clients[1].nombre }, tipo: 'tarea', descripcion: 'Enviar la cotización corregida.', vence_en: '2020-11-01T15:00:00.000Z', completada: false, vencida: true },
  { id: 23, cliente: { id: 1, nombre: clients[0].nombre }, tipo: 'reunion', descripcion: 'Revisión de productos en sala de ventas.', vence_en: '2026-10-30T16:00:00.000Z', completada: true, vencida: false },
];

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

async function body(request) {
  let text = '';
  for await (const chunk of request) text += chunk;
  return text ? JSON.parse(text) : {};
}

function createMockApi() {
  return createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1:3001');
    const route = url.pathname.replace(/^\/api/, '');
    if (request.method === 'OPTIONS') { json(response, 204); return; }
    if (request.method === 'POST' && route === '/auth/login') {
      json(response, 200, { token: 'design-review-token', usuario: { id: 7, nombre: 'Diego7', correo: 'diegoxicara07@gmail.com' } }); return;
    }
    if (request.method === 'GET' && route === '/productos') {
      json(response, 200, [{ id: 1, nombre: 'Taladro percutor', precio: 1250 }, { id: 2, nombre: 'Juego de brocas', precio: 186 }]); return;
    }
    if (request.method === 'GET' && route === '/clientes') {
      const query = (url.searchParams.get('q') || '').toLocaleLowerCase('es');
      json(response, 200, clients.filter(client => !query || client.nombre.toLocaleLowerCase('es').includes(query) || client.nit.toLocaleLowerCase('es').includes(query))); return;
    }
    if (request.method === 'GET' && route === '/clientes/disponibles') {
      json(response, 200, [{ id: 3, nombre: 'Distribuidora El Martillo' }]); return;
    }
    if (request.method === 'GET' && /^\/clientes\/\d+$/.test(route)) {
      json(response, 200, clients.find(client => client.id === Number(route.split('/').at(-1))) || clients[0]); return;
    }
    if (request.method === 'POST' && route.endsWith('/tomar')) { json(response, 200, clients[0]); return; }
    if (request.method === 'POST' && /^\/clientes\/\d+\/actividades$/.test(route)) {
      const input = await body(request);
      json(response, 201, { id: 24, cliente: { id: 1, nombre: clients[0].nombre }, tipo: input.tipo, descripcion: input.descripcion, vence_en: input.vence_en || null, completada: false, vencida: false }); return;
    }
    if (['POST', 'PATCH'].includes(request.method) && /^\/clientes(?:\/\d+)?$/.test(route)) {
      const input = await body(request);
      if (!input.nombre?.trim()) { json(response, 422, { errores: { nombre: 'Ingrese el nombre del cliente.' } }); return; }
      json(response, request.method === 'POST' ? 201 : 200, { id: 4, ...input }); return;
    }
    if (request.method === 'GET' && route === '/oportunidades') {
      const stage = url.searchParams.get('etapa');
      json(response, 200, opportunities.filter(item => !stage || item.etapa === stage)); return;
    }
    if (request.method === 'GET' && /^\/oportunidades\/\d+$/.test(route)) { json(response, 200, opportunityDetail(route.split('/').at(-1))); return; }
    if (request.method === 'DELETE' && route.includes('/productos/')) { json(response, 204); return; }
    if (['POST', 'PATCH'].includes(request.method) && route.startsWith('/oportunidades')) { json(response, request.method === 'POST' ? 201 : 200, opportunityDetail()); return; }
    if (request.method === 'GET' && route === '/actividades') {
      const state = url.searchParams.get('estado');
      json(response, 200, activities.filter(item => !state || (state === 'completada' ? item.completada : !item.completada))); return;
    }
    if (request.method === 'PATCH' && /^\/actividades\/\d+$/.test(route)) {
      const id = Number(route.split('/').at(-1)), input = await body(request);
      activities = activities.map(item => item.id === id ? { ...item, completada: input.completada, vencida: false } : item);
      json(response, 200, activities.find(item => item.id === id)); return;
    }
    if (request.method === 'GET' && route === '/reportes/resumen') {
      const month = url.searchParams.get('mes') || '2026-11';
      json(response, 200, { mes: month, ventas: 4, total: 18450.75, pronostico: 6250.5, cartera: { clientes: 2, maximo: 10 } }); return;
    }
    json(response, 404, { error: 'No encontrado.' });
  });
}

test('diseño SPA: pantallas y operaciones caben a 1280 y 375 px', { timeout: 120000 }, async () => {
  const executable = process.env.SPA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  assert.ok(existsSync(executable), 'Configure SPA_BROWSER con un Chromium existente.');
  const profile = mkdtempSync(path.join(tmpdir(), 'crm-design-review-'));
  let api, frontend, browser, protocol;
  try {
    api = createMockApi().listen(3001, '127.0.0.1');
    frontend = createFrontendServer().listen(5500, '127.0.0.1');
    await Promise.all([
      new Promise((resolve, reject) => { api.once('listening', resolve); api.once('error', reject); }),
      new Promise((resolve, reject) => { frontend.once('listening', resolve); frontend.once('error', reject); }),
    ]);
    browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--window-size=1280,1000', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    const portFile = path.join(profile, 'DevToolsActivePort');
    await waitFor(() => existsSync(portFile), 'Edge no abrió el puerto de revisión.');
    const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
    const target = await (await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' })).json();
    protocol = connectProtocol(target.webSocketDebuggerUrl);
    await protocol.send('Page.enable');
    await protocol.send('Network.enable');
    await protocol.send('Network.setCacheDisabled', { cacheDisabled: true });
    const evaluate = async expression => {
      const result = await protocol.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error('Falló una comprobación del navegador.');
      return result.result.value;
    };
    const condition = (expression, message = expression) => waitFor(() => evaluate(expression), 'La interfaz no alcanzó: ' + message);
    async function capture(name) {
      for (const width of [1280, 375]) {
        await protocol.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width === 375 });
        await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
        assert.equal(await evaluate(`document.documentElement.scrollWidth <= ${width}`), true, `${name} no debe desbordar a ${width}px`);
        const screenshot = await protocol.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
        writeFileSync(path.join(profile, `${name}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
      }
    }
    const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await protocol.send('Page.navigate', { url: 'http://127.0.0.1:5500' });
    await condition("Boolean(document.querySelector('#login-form'))", 'acceso');
    await evaluate("document.querySelector('#login-form').requestSubmit()");
    await condition("!document.querySelector('#correo-error').hidden", 'errores de acceso');
    assert.equal(await evaluate("[...document.styleSheets].some(sheet => sheet.href?.endsWith('/css/app.css'))"), true);
    await capture('01-login-errors');
    await evaluate(`(() => { const form = document.querySelector('#login-form'); form.elements.correo.value = 'diego@crm.test'; form.elements.clave.value = 'prueba'; form.requestSubmit(); })()`);
    await condition("document.querySelector('[data-name]')?.textContent === 'Diego7'", 'sesión del vendedor');
    await condition("document.querySelectorAll('[data-client-list] .client-list-item').length === 2", 'listado de clientes');
    await capture('02-clientes-lista');
    await click('[data-client-action="create"]');
    assert.equal(await evaluate("document.querySelector('#client-form-fields').getBoundingClientRect().width <= 736"), true);
    await capture('03-clientes-formulario');
    await click('[data-client-action="list"]');
    await condition("document.querySelectorAll('[data-client-list] .client-list-item').length === 2");
    await click('[data-client-action="detail"]');
    await condition("Boolean(document.querySelector('[data-detail-name]'))", 'ficha del cliente');
    await click('[data-activity-action="new"]');
    await condition("Boolean(document.querySelector('#activity-create-form'))", 'formulario de actividad');
    await capture('04-cliente-detalle-actividad');
    await click('[data-section="oportunidades"]');
    await condition("document.querySelectorAll('.opportunity-card').length === 6", 'embudo');
    await capture('05-oportunidades-embudo');
    await click('[data-op-action="detail"]');
    await condition("document.querySelectorAll('.quote-line').length === 2", 'detalle de cotización');
    await capture('06-cotizacion-detalle');
    await evaluate(`(() => { const select = document.querySelector('#op-stage-form').elements.etapa; select.value = 'perdida'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await evaluate(`(() => { const form = document.querySelector('#op-stage-form'); form.elements.motivo_perdida.value = 'Se eligió otra propuesta'; form.elements.motivo_perdida.dispatchEvent(new Event('input', { bubbles: true })); form.requestSubmit(); })()`);
    await condition("document.querySelector('[data-close-confirmation]').hidden === false", 'confirmación de cierre');
    await capture('07-cotizacion-cierre');
    await click('[data-section="actividades"]');
    await condition("document.querySelectorAll('.activity-card').length === 3", 'actividades');
    assert.equal(await evaluate("document.querySelectorAll('.activity-pending').length > 0 && document.querySelectorAll('.activity-completed').length > 0 && document.querySelectorAll('.activity-overdue').length > 0"), true);
    await capture('08-actividades-estados');
    await click('[data-activity-action="toggle"]');
    await condition(`document.querySelector('[data-activity-id="21"] [data-activity-state]')?.textContent === 'Completada'`, 'cambio de estado');
    await click('[data-section="resumen"]');
    await condition("document.querySelector('[data-summary-results]').hidden === false", 'resumen');
    await capture('09-resumen-tarjetas');
    await evaluate(`(() => { const input = document.querySelector('#summary-month'); input.value = '2026-10'; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await condition("document.querySelector('[data-summary-month]').textContent.includes('2026-10')", 'filtro mensual');
    console.log(JSON.stringify({ screenshots: profile, widths: [1280, 375], screens: 9, overflow: false, operations: ['login', 'clientes', 'actividad', 'oportunidades', 'cierre', 'filtros', 'resumen'] }));
  } finally {
    if (protocol) { try { await protocol.send('Browser.close'); } catch {} protocol.socket.close(); }
    if (browser && browser.exitCode === null) browser.kill();
    if (frontend) await new Promise(resolve => frontend.close(resolve));
    if (api) await new Promise(resolve => api.close(resolve));
    if (!process.env.DESIGN_KEEP_SCREENSHOTS) rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
