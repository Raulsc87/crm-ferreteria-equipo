import assert from 'node:assert/strict';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import path from 'node:path';
import mysql from '../../api/node_modules/mysql2/promise.js';

export async function checkActivitiesInBrowser({ repository, evaluate, condition, login, protocol, profile, calls, searchDelays }) {
  const env = parseEnv(readFileSync(path.join(repository, 'laravel/.env.testing'), 'utf8'));
  const apiEnv = parseEnv(readFileSync(path.join(repository, 'api/.env.testing'), 'utf8'));
  const control = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_DATABASE, user: env.DB_USERNAME, password: env.DB_PASSWORD, timezone: 'Z', dateStrings: true });
  const run = randomBytes(12).toString('hex'), prefix = 'spa-f4-' + run + '-', password = randomBytes(16).toString('hex');
  const clients = [];
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
      const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]); result[table] = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    }
    return result;
  }
  function accounts(action) {
    const childEnv = { ...process.env, APP_ENV: 'testing' };
    for (const key of Object.keys(childEnv)) if (key.startsWith('DB_')) delete childEnv[key];
    const result = spawnSync(apiEnv.PHP_BINARY || 'php', ['tests/client-users.php'], { cwd: path.join(repository, 'api'), env: childEnv, input: JSON.stringify({ action, run, password }), encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, 'Auxiliar Laravel de cuentas F4.'); return JSON.parse(result.stdout);
  }
  async function client(owner) {
    await isolated(); let phone;
    for (;;) { phone = String(randomInt(20000000, 99999999)); const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [phone]); if (!rows.length) break; }
    const [row] = await control.execute('INSERT INTO clientes (nombre, telefono, vendedor_id) VALUES (?, ?, ?)', [prefix + 'Cliente' + clients.length, phone, owner]);
    clients.push(row.insertId); return row.insertId;
  }
  const click = action => evaluate(`document.querySelector('[data-activity-action="${action}"]').click()`);
  const idle = () => condition("Boolean(document.querySelector('#activity-create-form, #activity-filter-form')) && !document.querySelector('#activity-create-form')?.getAttribute('aria-busy')?.includes('true') && !document.querySelector('[data-activity-status]')?.textContent.includes('Guardando') && !document.querySelector('[data-activity-status]')?.textContent.includes('Cargando')");
  const fill = values => evaluate(`(() => {const form=document.getElementById('activity-create-form');for(const [key,value] of Object.entries(${JSON.stringify(values)})){form.elements[key].value=value;form.elements[key].dispatchEvent(new Event('input',{bubbles:true}));}form.requestSubmit();})()`);
  const filter = async value => { await evaluate(`(()=>{const form=document.querySelector('#activity-filter-form');form.elements.estado.value=${JSON.stringify(value)};form.requestSubmit();})()`); await idle(); };
  const request = (url, method = 'GET', body) => evaluate(`(async()=>{const response=await fetch('http://127.0.0.1:3001/api'+${JSON.stringify(url)},{method:${JSON.stringify(method)},headers:{Authorization:'Bearer '+JSON.parse(localStorage.getItem('crm-ferreteria.sesion')).token,...(${body === undefined ? 'false' : 'true'}?{'Content-Type':'application/json'}:{})},...(${body === undefined ? 'false' : 'true'}?{body:JSON.stringify(${JSON.stringify(body) || 'null'})}:{})});return {status:response.status,body:await response.json()};})()`);
  async function detail(id) {
    await evaluate("document.querySelector('[data-section=clientes]').click()");
    await evaluate("document.querySelector('[data-client-action=list]').click()");
    await evaluate("document.querySelector('[data-client-action=refresh]').click()");
    await condition(`Boolean(document.querySelector('[data-client-action=detail][data-id="${id}"]'))`);
    await evaluate(`document.querySelector('[data-client-action=detail][data-id="${id}"]').click()`);
    await condition("Boolean(document.querySelector('[data-activity-action=new]'))"); await click('new');
  }
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
    const own = await client(users.seller0.id), stale = await client(users.seller0.id), foreign = await client(users.seller1.id);
    await protocol.send('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Tokyo' });
    assert.equal(await evaluate("new Date('2031-04-09T14:30:00Z').getTimezoneOffset()"), -540);
    await evaluate("document.querySelector('[data-action=logout]').click()"); await login(users.seller0.email, password);
    await condition("Boolean(document.querySelector('[data-name]'))");
    await evaluate("document.querySelector('[data-section=actividades]').click()"); await idle();
    assert.equal(await evaluate("document.querySelector('[data-activity-status]').textContent.includes('No hay actividades')"), true);
    await detail(own);
    await fill({ descripcion: '   ', vence_en: '2031-04-09T08:30' }); await idle();
    assert.equal(await evaluate("!document.querySelector('#activity-descripcion-error').hidden && document.querySelector('[name=vence_en]').value==='2031-04-09T08:30'"), true);
    await capture('activity-validation');
    // Manipular solo el selector para comprobar validación definitiva de tipo en API.
    await evaluate("document.querySelector('[name=tipo]').append(new Option('Inválido','otro'))");
    await fill({ tipo: 'otro', descripcion: prefix + 'Inválido' }); await idle();
    assert.equal(await evaluate("!document.querySelector('#activity-tipo-error').hidden"), true);
    await fill({ tipo: 'llamada', descripcion: prefix + 'Sin vencimiento', vence_en: '' }); await idle();
    let result = await request('/actividades'); assert.equal(result.body.length, 1); assert.equal(result.body[0].vence_en, null); assert.equal(result.body[0].vencida, false);
    await fill({ tipo: 'reunion', descripcion: prefix + 'Futura', vence_en: '2031-04-09T08:30' }); await idle();
    const unsafe = prefix + '<img src=x onerror="window.activityXss=true">';
    await fill({ tipo: 'tarea', descripcion: unsafe, vence_en: '2020-01-15T10:45' }); await idle();
    result = await request('/actividades'); assert.equal(result.body.length, 3);
    const future = result.body.find(row => row.tipo === 'reunion'), past = result.body.find(row => row.tipo === 'tarea');
    assert.equal(future.vence_en, '2031-04-09T14:30:00.000Z'); assert.equal(future.vencida, false);
    assert.equal(past.vence_en, '2020-01-15T16:45:00.000Z'); assert.equal(past.vencida, true);
    await evaluate("document.querySelector('[data-section=actividades]').click()"); await idle();
    const expected = new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', dateStyle: 'short', timeStyle: 'short' }).format(new Date(future.vence_en));
    assert.equal(await evaluate(`document.querySelector('[data-activity-id="${future.id}"]').textContent.includes(${JSON.stringify(expected)})`), true);
    assert.equal(await evaluate(`document.querySelector('[data-activity-id="${past.id}"] [data-activity-state]').textContent.includes('Vencida') && !document.querySelector('img[src=x]') && !window.activityXss`), true);
    await capture('activities-pending');
    await filter('pendiente'); assert.equal(await evaluate("document.querySelectorAll('[data-activity-id]').length"), 3);
    // Retraso del PATCH para verificar doble clic sin simular su respuesta.
    const changePath = '/api/actividades/' + past.id; searchDelays.set(changePath, 350);
    const attempts = calls.filter(row => row.path === changePath && row.method === 'PATCH').length;
    await evaluate(`document.querySelector('[data-activity-action=toggle][data-id="${past.id}"]').click();document.querySelector('[data-activity-action=toggle][data-id="${past.id}"]').click()`);
    assert.equal(await evaluate("[...document.querySelectorAll('[data-activity-action=toggle]')].every(button=>button.disabled)"), true);
    await idle(); searchDelays.clear(); assert.equal(calls.filter(row => row.path === changePath && row.method === 'PATCH').length, attempts + 1);
    await filter('completada'); assert.equal(await evaluate("document.querySelectorAll('[data-activity-id]').length"), 1);
    assert.equal(await evaluate("document.querySelector('[data-activity-state]').textContent"), 'Completada'); await capture('activities-completed');
    await click('toggle'); await idle(); assert.equal(await evaluate("document.querySelectorAll('[data-activity-id]').length"), 0);
    assert.equal((await request('/actividades')).body.find(row => row.id === past.id).vencida, true);
    // Dos filtros reales solapados: el antiguo termina después del nuevo.
    const oldPath = '/api/actividades?estado=pendiente', previous = calls.length; searchDelays.set(oldPath, 700);
    await evaluate("(()=>{const form=document.querySelector('#activity-filter-form');form.elements.estado.value='pendiente';form.requestSubmit()})()");
    for (let attempt = 0; attempt < 100 && !calls.slice(previous).some(row => row.path === oldPath && row.method === 'GET'); attempt++) await new Promise(resolve => setTimeout(resolve, 10));
    const old = calls.slice(previous).find(row => row.path === oldPath && row.method === 'GET'); assert.ok(old);
    await filter('completada'); assert.equal(old.status, undefined);
    await new Promise(resolve => setTimeout(resolve, 850)); assert.equal(old.status, 200); searchDelays.clear();
    assert.equal(await evaluate("document.querySelector('#activity-filter').value==='completada' && document.querySelectorAll('[data-activity-id]').length===0"), true);
    const foreignCreate = await request('/clientes/' + foreign + '/actividades', 'POST', { tipo: 'tarea', descripcion: prefix + 'Ajena' }); assert.equal(foreignCreate.status, 404);
    await isolated();
    const [other] = await control.execute('INSERT INTO actividades (cliente_id,vendedor_id,tipo,descripcion,completada) VALUES (?,?,?, ?, false)', [foreign, users.seller1.id, 'tarea', prefix + 'Ajena SQL']);
    assert.equal((await request('/actividades/' + other.insertId, 'PATCH', { completada: true })).status, 404);
    // La lista aún muestra una actividad propia, pero el cliente cambia de cartera.
    await filter('pendiente'); await isolated(); await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?', [users.seller1.id, own]);
    await evaluate(`document.querySelector('[data-activity-action=toggle][data-id="${past.id}"]').click()`); await idle();
    assert.equal(await evaluate("document.querySelector('[data-activity-error]').textContent.includes('ya no está disponible') && document.querySelectorAll('[data-activity-id]').length===0"), true);
    await capture('activities-lost-access');
    // Alta desde ficha obsoleta: 404 retira la ficha actual y refresca cartera.
    await detail(stale); await isolated(); await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?', [users.seller1.id, stale]);
    await fill({ descripcion: prefix + 'Ficha obsoleta' });
    await condition("document.querySelector('[data-client-error]')?.textContent.includes('no está disponible') && !document.querySelector('[data-detail-name]')");
    // El nuevo propietario puede finalizar la actividad sin convertirse en su autor.
    await evaluate("document.querySelector('[data-action=logout]').click()"); await login(users.seller1.email, password); await condition("Boolean(document.querySelector('[data-name]'))");
    await evaluate("document.querySelector('[data-section=actividades]').click()"); await idle(); await filter('');
    assert.equal(await evaluate(`Boolean(document.querySelector('[data-activity-id="${past.id}"]'))`), true);
    await evaluate(`document.querySelector('[data-activity-action=toggle][data-id="${past.id}"]').click()`); await idle();
    const [[stored]] = await control.execute('SELECT vendedor_id,completada FROM actividades WHERE id = ?', [past.id]);
    assert.equal(stored.vendedor_id, users.seller0.id); assert.equal(stored.completada, 1);
    assert.equal(await evaluate("Object.keys(JSON.parse(localStorage.getItem('crm-ferreteria.sesion'))).sort().join(',')"), 'token,usuario');
    console.log(JSON.stringify({ activities: 'API real y MySQL de pruebas', types: 3, noDeadline: true, futureUTC: future.vence_en, pastUTC: past.vence_en, browserZone: 'Asia/Tokyo', filters: true, booleanPatch: true, duplicatePrevented: true, lateFilterIgnored: true, reassignment404: true, authorPreserved: true, widths: [1280, 375] }));
  } finally {
    searchDelays.clear();
    try {
      await isolated();
      for (const id of clients) await control.execute('DELETE FROM actividades WHERE cliente_id = ? AND descripcion LIKE ?', [id, prefix + '%']);
      for (const id of clients) await control.execute('DELETE FROM clientes WHERE id = ? AND nombre LIKE ?', [id, prefix + '%']);
      if (users) accounts('cleanup');
      if (before) assert.deepEqual(await snapshot(), before, 'Conservar todas las filas preexistentes tras F4.');
    } finally { await protocol.send('Emulation.setTimezoneOverride', { timezoneId: '' }); await control.end(); }
  }
}
