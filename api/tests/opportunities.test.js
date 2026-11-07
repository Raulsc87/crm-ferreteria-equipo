import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import vm from 'node:vm';
import mysql from 'mysql2/promise';
import { readConfig } from '../src/config.js';
import { createApp } from '../src/app.js';

const config = readConfig(), run = randomBytes(12).toString('hex');
const prefix = 'a4-' + run + '-', password = randomBytes(16).toString('hex');
const ids = { clientes: new Set(), productos: new Set(), oportunidades: new Set() }, events = [];
let api, control, users, server, origin, baseline, tokens = [];

function accounts(action) {
  const env = { ...process.env, APP_ENV: 'testing' };
  for (const key of Object.keys(env)) if (key.startsWith('DB_')) delete env[key];
  const result = spawnSync(process.env.PHP_BINARY || 'php', ['tests/client-users.php'], {
    input: JSON.stringify({ action, run, password }), env, encoding: 'utf8', windowsHide: true,
  });
  assert.equal(result.status, 0, 'Preparación de cuentas aisladas mediante Laravel.');
  return JSON.parse(result.stdout);
}

async function isolated() {
  const [[identity]] = await control.query('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1' });
  const [rows] = await control.query('SHOW GRANTS');
  assert.ok(rows.every(row => { const grant = Object.values(row)[0]; return grant.startsWith('GRANT USAGE ON *.*') || grant.includes(' ON `crm\\_ferreteria\\_test`.* TO '); }));
}

async function snapshot() {
  await isolated();
  const result = {};
  for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) {
    const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]);
    result[table] = { count: rows.length, hash: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
  }
  return result;
}

async function cleanup() {
  if (!control) return;
  await isolated();
  for (const table of ['oportunidades', 'clientes', 'productos']) {
    for (const id of ids[table]) await control.query('DELETE FROM ?? WHERE id = ?', [table, id]);
    ids[table].clear();
  }
}

before(async () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(config.db.database, 'crm_ferreteria_test'); assert.equal(config.db.user, 'crm_api_test');
  const env = parseEnv(readFileSync('../laravel/.env.testing', 'utf8'));
  control = await mysql.createConnection({ host: env.DB_HOST, user: env.DB_USERNAME, password: env.DB_PASSWORD, database: env.DB_DATABASE, port: Number(env.DB_PORT) });
  baseline = await snapshot(); users = accounts('create');
  api = mysql.createPool({ ...config.db, connectionLimit: 10, timezone: 'Z', dateStrings: true });
  const [[identity]] = await api.query('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_api_test@127.0.0.1' });
  const acquire = api.getConnection.bind(api);
  api.getConnection = async () => {
    const connection = await acquire(), execute = connection.execute.bind(connection);
    connection.execute = async (sql, params) => {
      if (sql.includes('FROM clientes') && sql.includes('FOR UPDATE')) events.push({ connection: connection.threadId, at: performance.now() });
      return execute(sql, params);
    };
    const release = connection.release.bind(connection);
    connection.release = () => { connection.execute = execute; connection.release = release; release(); };
    return connection;
  };
  server = createApp(api, config).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  for (let i = 0; i < 2; i++) {
    const response = await call('/api/auth/login', { method: 'POST', user: null, data: { correo: users['seller' + i].email, clave: password } });
    assert.equal(response.status, 200); tokens.push(response.body.token);
  }
});
afterEach(cleanup);
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (api) await api.end();
  await cleanup();
  if (users) { await isolated(); accounts('cleanup'); }
  if (baseline) assert.deepEqual(await snapshot(), baseline, 'Conservar datos manuales preexistentes de las siete tablas.');
  if (control) await control.end();
});

async function call(route, { method = 'GET', data, raw, user = 0, headers = {} } = {}) {
  const start = performance.now();
  if (user !== null) headers = { Authorization: 'Bearer ' + tokens[user], ...headers };
  if (data !== undefined) { raw = JSON.stringify(data); headers['Content-Type'] = 'application/json'; }
  const response = await fetch(origin + route, { method, headers, body: raw });
  const text = await response.text(), body = text ? JSON.parse(text) : null;
  if (response.status !== 204) assert.match(response.headers.get('content-type'), /application\/json/);
  if (response.status === 201 && route === '/api/oportunidades') ids.oportunidades.add(body.id);
  return { status: response.status, body, text, start, finish: performance.now() };
}
const route = op => '/api/oportunidades/' + op.id;
async function client(owner = 0) {
  let phone;
  for (;;) { phone = '9' + String(randomInt(10000000)).padStart(7, '0'); const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [phone]); if (!rows.length) break; }
  const [row] = await control.execute('INSERT INTO clientes (vendedor_id, nombre, telefono) VALUES (?, ?, ?)', [users['seller' + owner].id, prefix + 'cliente', phone]);
  ids.clientes.add(row.insertId); return row.insertId;
}
async function product({ price = '10.25', minimum = 1, active = true } = {}) {
  const [row] = await control.execute('INSERT INTO productos (nombre, precio, cantidad_minima, activo) VALUES (?, ?, ?, ?)', [prefix + randomBytes(3).toString('hex'), price, minimum, active]);
  ids.productos.add(row.insertId); return row.insertId;
}
async function opportunity(owner = 0) {
  const response = await call('/api/oportunidades', { method: 'POST', user: owner, data: { cliente_id: await client(owner), titulo: '  Cotización   inicial  ' } });
  assert.equal(response.status, 201); return response.body;
}
async function add(op, p, quantity = 1) { return call(route(op) + '/productos', { method: 'POST', data: { producto_id: p, cantidad: quantity } }); }
async function stage(op, next, extra = {}) { return call(route(op) + '/etapa', { method: 'PATCH', data: { etapa: next, ...extra } }); }
async function negotiation(op) { for (const next of ['calificado', 'propuesta', 'negociacion']) assert.equal((await stage(op, next)).status, 200); }
async function historyCount(op) { const [[r]] = await control.execute('SELECT COUNT(*) AS n FROM historial_etapas WHERE oportunidad_id = ?', [op.id]); return r.n; }
function shape(op, detail = true) {
  const fields = ['id', 'cliente', 'titulo', 'etapa', 'probabilidad', 'total', 'fecha_cierre', 'motivo_perdida'];
  if (detail) fields.push('productos', 'historial');
  assert.deepEqual(Object.keys(op).sort(), fields.sort()); assert.deepEqual(Object.keys(op.cliente).sort(), ['id', 'nombre']);
  assert.equal(typeof op.total, 'number'); assert.equal(typeof op.probabilidad, 'number');
}

test('crear prospecto e historial inicial; listado resumido, detalle completo y filtro seguro', async () => {
  const own = await opportunity(), other = await opportunity(1); shape(own);
  assert.equal(own.titulo, 'Cotización inicial'); assert.equal(own.etapa, 'prospecto'); assert.equal(own.probabilidad, 10);
  assert.equal(own.total, 0); assert.equal(own.fecha_cierre, null); assert.equal(own.motivo_perdida, null);
  assert.deepEqual(own.productos, []); assert.equal(own.historial.length, 1);
  assert.deepEqual(Object.keys(own.historial[0]).sort(), ['etapa_anterior', 'etapa_nueva', 'fecha', 'usuario']);
  assert.equal(own.historial[0].etapa_anterior, null); assert.equal(own.historial[0].usuario, users.seller0.name);
  assert.match(own.historial[0].fecha, /^\d{4}-\d\d-\d\dT.*\.000Z$/);
  const list = await call('/api/oportunidades'); assert.deepEqual(list.body.map(o => o.id), [own.id]); shape(list.body[0], false);
  assert.equal((await call('/api/oportunidades?etapa=ganada')).body.length, 0);
  for (const q of ['etapa=incorrecta', 'etapa=prospecto&etapa=ganada', 'etapa=1%20OR%201=1', 'vendedor_id=1']) assert.equal((await call('/api/oportunidades?' + q)).status, 400);
  assert.equal((await call(route(other))).status, 404);
});

test('propiedad en todas las rutas, recursos inexistentes y autorización antes de JSON', async () => {
  const other = await opportunity(1), own = await opportunity(), p = await product();
  const foreignLine = await call(route(other) + '/productos', { method: 'POST', user: 1, data: { producto_id: p, cantidad: 1 } });
  const line = foreignLine.body.productos[0].id;
  for (const [suffix, method, data] of [['','GET'], ['', 'PATCH', { titulo: 'x' }], ['/etapa','PATCH',{etapa:'perdida',motivo_perdida:'x'}], ['/productos','POST',{producto_id:p,cantidad:1}], ['/productos/'+line,'PATCH',{cantidad:2}], ['/productos/'+line,'DELETE']]) {
    assert.equal((await call(route(other)+suffix,{method,data})).status,404);
    assert.equal((await call(route(other)+suffix,{method,data,user:null})).status,401);
  }
  assert.equal((await call(route(other),{method:'PATCH',raw:'{',headers:{'Content-Type':'application/json'}})).status,404);
  assert.equal((await call(route(own)+'/productos/'+line,{method:'PATCH',data:{cantidad:2}})).status,404);
  for (const id of ['0', '-1', 'abc', '01', '9007199254740992', '999999999']) assert.equal((await call('/api/oportunidades/'+id)).status,404);
  assert.equal((await call('/api/oportunidades',{method:'POST',data:{cliente_id:other.cliente.id,titulo:'Ajeno'}})).status,404);
  assert.equal((await call('/api/oportunidades',{method:'POST',data:{cliente_id:999999999,titulo:'No existe'}})).status,404);
});

for (const [kind, input, field] of [
  ['create',{titulo:'x'},'cliente_id'], ['create',{cliente_id:1},'titulo'], ['create',{cliente_id:'1',titulo:'x'},'cliente_id'],
  ['title',{titulo:'   '},'titulo'], ['title',{titulo:'á'.repeat(151)},'titulo'], ['title',{titulo:[]},'titulo'],
  ['title',{titulo:'x',vendedor_id:1},'vendedor_id'], ['title',{titulo:'x',cliente_id:1},'cliente_id'],
  ['stage',{etapa:'invalida'},'etapa'], ['stage',{etapa:'perdida'},'motivo_perdida'], ['stage',{etapa:'perdida',motivo_perdida:' '.repeat(10)},'motivo_perdida'],
  ['stage',{etapa:'perdida',motivo_perdida:'á'.repeat(256)},'motivo_perdida'], ['stage',{etapa:'calificado',motivo_perdida:null},'motivo_perdida'],
  ['add',{producto_id:1,cantidad:1,precio_unitario:0.01},'precio_unitario'], ['add',{producto_id:1,cantidad:1,cantidad_minima:1},'cantidad_minima'],
  ['add',{producto_id:'1',cantidad:1},'producto_id'], ['add',{producto_id:1,cantidad:0},'cantidad'], ['add',{producto_id:1,cantidad:1000},'cantidad'],
  ['add',{producto_id:1,cantidad:1.2},'cantidad'], ['add',{producto_id:1,cantidad:'2'},'cantidad'], ['add',{producto_id:1,cantidad:true},'cantidad'],
]) test('validación ' + kind + ': ' + field + ' ' + JSON.stringify(input), async () => {
  const op = await opportunity();
  const paths = { create:['/api/oportunidades','POST'],title:[route(op),'PATCH'],stage:[route(op)+'/etapa','PATCH'],add:[route(op)+'/productos','POST'] };
  const [path,method]=paths[kind], before=await historyCount(op);
  const response=await call(path,{method,data:input});assert.equal(response.status,422);assert.equal(typeof response.body.errores[field],'string');
  assert.equal(await historyCount(op),before);
});

test('JSON ilegible/ausente, parámetros, título válido y campos extra al crear', async () => {
  const op=await opportunity();
  for(const raw of ['{','','[]','null','"texto"']) assert.equal((await call(route(op),{method:'PATCH',raw,headers:{'Content-Type':'application/json'}})).status,400);
  assert.equal((await call(route(op),{method:'PATCH',data:{titulo:'  á'.repeat(1).trim()}})).status,200);
  assert.equal((await call('/api/oportunidades',{method:'POST',data:{cliente_id:op.cliente.id,titulo:'x',etapa:'ganada'}})).status,422);
  assert.equal((await call(route(op)+'?q=x',{method:'PATCH',data:{titulo:'x'}})).status,400);
});

test('transiciones, cierre ganado UTC y todas las mutaciones cerradas rechazadas sin historial', async () => {
  const op=await opportunity(), p=await product(); const line=(await add(op,p)).body.productos[0].id;
  assert.equal((await stage(op,'propuesta')).status,422); assert.equal((await stage(op,'prospecto')).status,409);
  await negotiation(op); assert.equal((await stage(op,'calificado')).status,422);
  const won=await stage(op,'ganada'); assert.equal(won.status,200); assert.equal(won.body.probabilidad,100);
  assert.match(won.body.fecha_cierre,/\.000Z$/); assert.equal(won.body.fecha_cierre,won.body.historial.at(-1).fecha);
  assert.ok(Math.abs(Date.now()-Date.parse(won.body.fecha_cierre))<5000);
  const before=await historyCount(op); assert.equal(before,5);
  for(const [suffix,method,data] of [['','PATCH',{titulo:'x'}],['/etapa','PATCH',{etapa:'perdida',motivo_perdida:'x'}],['/productos','POST',{producto_id:p,cantidad:1}],['/productos/'+line,'PATCH',{cantidad:2}],['/productos/'+line,'DELETE']]) assert.equal((await call(route(op)+suffix,{method,data})).status,409);
  assert.equal(await historyCount(op),before);assert.deepEqual((await call(route(op))).body,won.body);
});

test('ganar requiere negociación y líneas; perder admite cualquier abierta y normaliza motivo', async () => {
  const op=await opportunity();assert.equal((await stage(op,'ganada')).status,422);await negotiation(op);
  assert.equal((await stage(op,'ganada')).status,422);assert.equal(await historyCount(op),4);
  for(const until of [0,1,2,3]){
    const another=await opportunity();for(const next of ['calificado','propuesta','negociacion'].slice(0,until))await stage(another,next);
    const lost=await stage(another,'perdida',{motivo_perdida:'  Precio   fuera\n del presupuesto  '});assert.equal(lost.status,200);
    assert.equal(lost.body.motivo_perdida,'Precio fuera del presupuesto');assert.equal(lost.body.probabilidad,0);assert.equal(lost.body.historial.length,until+2);
    assert.equal((await call(route(another),{method:'PATCH',data:{titulo:'x'}})).status,409);
  }
});

test('precio copiado, suma SQL decimal, líneas y mínimos vigentes sin alterar cotizaciones previas', async () => {
  const op=await opportunity(), p=await product({price:'0.10',minimum:50}), second=await product({price:'0.20'});
  assert.equal((await add(op,p,49)).status,422);assert.equal((await add(op,p,50)).status,201);
  let result=await add(op,second,3);assert.equal(result.body.total,5.6);
  const line=result.body.productos.find(l=>l.producto_id===p);assert.equal(line.subtotal,5);assert.equal(line.precio_unitario,0.1);
  assert.deepEqual(Object.keys(line).sort(),['id','producto_id','nombre','cantidad','precio_unitario','subtotal'].sort());
  assert.equal((await add(op,p,50)).status,409);
  await control.execute('UPDATE productos SET precio = ?, cantidad_minima = ?, activo = 0 WHERE id = ?',['99.99',60,p]);
  result=await call(route(op));assert.equal(result.body.total,5.6);assert.equal(result.body.productos.find(l=>l.id===line.id).precio_unitario,0.1);
  assert.equal((await call(route(op)+'/productos/'+line.id,{method:'PATCH',data:{cantidad:59}})).status,422);
  result=await call(route(op)+'/productos/'+line.id,{method:'PATCH',data:{cantidad:61}});assert.equal(result.status,200);assert.equal(result.body.total,6.7);
  assert.equal(result.body.productos.find(l=>l.id===line.id).precio_unitario,0.1);
  await control.execute('UPDATE productos SET cantidad_minima = 99 WHERE id = ?',[p]);
  await negotiation(op);const won=await stage(op,'ganada');assert.equal(won.status,200);assert.equal(won.body.total,6.7);
});

test('producto inactivo/inexistente, cantidades inválidas al editar y DELETE 204 sin cuerpo', async () => {
  const op=await opportunity(), inactive=await product({active:false}), p=await product();
  assert.equal((await add(op,inactive)).status,422);assert.equal((await add(op,999999999)).status,404);
  const line=(await add(op,p)).body.productos[0].id;
  for(const cantidad of [0,1000,1.1,'1',null])assert.equal((await call(route(op)+'/productos/'+line,{method:'PATCH',data:{cantidad}})).status,422);
  assert.equal((await call(route(op)+'/productos/'+line,{method:'PATCH',data:{cantidad:2,precio_unitario:1}})).status,422);
  const removed=await call(route(op)+'/productos/'+line,{method:'DELETE'});assert.equal(removed.status,204);assert.equal(removed.text,'');
  assert.equal((await call(route(op)+'/productos/'+line,{method:'DELETE'})).status,404);
  const empty=await call(route(op));assert.equal(empty.body.total,0);assert.equal(empty.body.productos.length,0);assert.equal(empty.body.historial.length,1);
});

test('archivo cerrado tras reasignación conserva dueño histórico sin ficha actual del cliente', async () => {
  const historical=await opportunity(), open=await opportunity();await stage(historical,'perdida',{motivo_perdida:'x'});
  await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id IN (?, ?)',[users.seller1.id,historical.cliente.id,open.cliente.id]);
  await control.execute('UPDATE oportunidades SET vendedor_id = ? WHERE id = ?',[users.seller1.id,open.id]);
  const archived=await call(route(historical));assert.equal(archived.status,200);shape(archived.body);
  assert.equal((await call('/api/clientes/'+historical.cliente.id)).status,404);
  assert.equal((await call(route(historical),{user:1})).status,404);
  assert.equal((await call(route(open))).status,404);assert.equal((await call(route(open),{user:1})).status,200);
  assert.deepEqual((await call('/api/oportunidades')).body.map(o=>o.id),[historical.id]);
  assert.deepEqual((await call('/api/oportunidades',{user:1})).body.map(o=>o.id),[open.id]);
});

async function race(op, tasks, name) {
  events.length=0;await control.beginTransaction();
  await control.execute('SELECT id FROM clientes WHERE id = ? FOR UPDATE',[op.cliente.id]);
  let done=0;const pending=tasks.map(task=>task().finally(()=>done++));
  let released, failure;
  try {
    const deadline=Date.now()+4000;
    while(events.length<tasks.length&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,10));
    assert.equal(events.length,tasks.length,'Todas las peticiones alcanzaron el bloqueo.');
    await new Promise(resolve=>setTimeout(resolve,80));assert.equal(done,0);
    assert.equal(new Set(events.map(e=>e.connection)).size,tasks.length);
  } catch(error) {failure=error;}
  finally {released=performance.now();await control.commit();}
  const results=await Promise.all(pending);
  if(failure)throw failure;
  for(const result of results)assert.ok(result.start<released&&result.finish>released);
  console.log(JSON.stringify({race:name,overlap:true,connections:events.length,statuses:results.map(r=>r.status)}));
  return results;
}

test('dos cambios basados en la misma etapa: un avance y un conflicto, nunca encadenar avances', async () => {
  const op=await opportunity();
  const results=await race(op,[()=>stage(op,'calificado'),()=>stage(op,'calificado')],'a4_mismo_estado');
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  assert.equal(await historyCount(op),2);assert.equal((await call(route(op))).body.etapa,'calificado');
});

test('ganar y perder simultáneos: una confirmación, un 409 y un solo cierre/historial', async () => {
  const op=await opportunity();await add(op,await product());await negotiation(op);
  const results=await race(op,[()=>stage(op,'ganada'),()=>stage(op,'perdida',{motivo_perdida:'No aceptó'})],'a4_dos_cierres');
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(await historyCount(op),5);
  const final=(await call(route(op))).body;assert.equal(final.historial.at(-1).fecha,final.fecha_cierre);
});

test('avanzar y perder desde prospecto compiten por el estado observado, sin segundo historial',async()=>{
  const op=await opportunity();
  const results=await race(op,[()=>stage(op,'calificado'),()=>stage(op,'perdida',{motivo_perdida:'Sin interés'})],'a4_avance_perdida');
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(await historyCount(op),2);
});

test('agregar dos veces en paralelo: una línea; cerrar contra editar deja estado coherente', async () => {
  const op=await opportunity(),p=await product();
  const duplicates=await race(op,[()=>add(op,p),()=>add(op,p)],'a4_producto_repetido');assert.deepEqual(duplicates.map(r=>r.status).sort(),[201,409]);
  const before=(await call(route(op))).body;assert.equal(before.productos.length,1);await negotiation(op);
  const mixed=await race(op,[()=>stage(op,'ganada'),()=>call(route(op)+'/productos/'+before.productos[0].id,{method:'PATCH',data:{cantidad:2}})],'a4_cierre_linea');
  assert.equal(mixed[0].status,200);assert.ok([200,409].includes(mixed[1].status));
  const final=(await call(route(op))).body;assert.equal(final.etapa,'ganada');assert.equal(final.total,mixed[1].status===200?20.5:10.25);assert.equal(final.historial.length,5);
});

test('fallo al insertar historial revierte título/etapa/cierre, sin estados parciales', async () => {
  const op=await opportunity();
  const acquire=api.getConnection;
  api.getConnection=async()=>{
    const connection=await acquire(),execute=connection.execute.bind(connection),release=connection.release.bind(connection);
    connection.execute=async(sql,params)=>{if(sql.startsWith('INSERT INTO historial_etapas'))throw Object.assign(new Error('Fallo de historial simulado'),{code:'TEST_HISTORY'});return execute(sql,params);};
    connection.release=()=>{connection.execute=execute;connection.release=release;release();};return connection;
  };
  try {
    const failed=await stage(op,'perdida',{motivo_perdida:'x'});assert.equal(failed.status,500);assert.deepEqual(failed.body,{error:'No se pudo completar la solicitud. Inténtelo de nuevo.'});
    const [[before]]=await control.execute('SELECT COUNT(*) AS n FROM oportunidades WHERE vendedor_id = ?',[users.seller0.id]);
    assert.equal((await call('/api/oportunidades',{method:'POST',data:{cliente_id:op.cliente.id,titulo:'No debe confirmarse'}})).status,500);
    const [[after]]=await control.execute('SELECT COUNT(*) AS n FROM oportunidades WHERE vendedor_id = ?',[users.seller0.id]);assert.equal(after.n,before.n);
  }
  finally {api.getConnection=acquire;}
  const final=(await call(route(op))).body;assert.equal(final.etapa,'prospecto');assert.equal(final.fecha_cierre,null);assert.equal(final.historial.length,1);
});

test('cantidades límite e importes grandes siguen calculados como DECIMAL en MySQL',async()=>{
  const op=await opportunity(),p=await product({price:'99999999.99'});
  const added=await add(op,p,999);assert.equal(added.status,201);assert.equal(added.body.total,Number('99899999990.01'));
  const [[sum]]=await control.execute('SELECT SUM(cantidad * precio_unitario) AS total FROM oportunidad_productos WHERE oportunidad_id = ?',[op.id]);
  assert.equal(sum.total,'99899999990.01');
});

test('lectura compartida del producto espera al catálogo y copia precio/mínimo coherentes',async()=>{
  const op=await opportunity(),p=await product({price:'5.00'});
  await control.beginTransaction();await control.execute('UPDATE productos SET precio = ?, cantidad_minima = ? WHERE id = ?',['9.90',5,p]);
  let done=false;const pending=add(op,p,4).then(r=>{done=true;return r;});
  try {await new Promise(resolve=>setTimeout(resolve,100));assert.equal(done,false);await control.commit();assert.equal((await pending).status,422);}
  finally {await control.rollback();await Promise.allSettled([pending]);}
  const result=await add(op,p,5);assert.equal(result.status,201);assert.equal(result.body.total,49.5);assert.equal(result.body.productos[0].precio_unitario,9.9);
});

test('crear vuelve a comprobar cartera después de esperar una reasignación, sin oportunidad ni historial',async()=>{
  const customer=await client();events.length=0;
  await control.beginTransaction();await control.execute('SELECT id FROM clientes WHERE id = ? FOR UPDATE',[customer]);
  const pending=call('/api/oportunidades',{method:'POST',data:{cliente_id:customer,titulo:'No debe crearse'}});
  try {
    const deadline=Date.now()+3000;while(events.length===0&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,10));assert.ok(events.length>0);
    await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?',[users.seller1.id,customer]);await control.commit();
    assert.equal((await pending).status,404);
    const [[row]]=await control.execute('SELECT COUNT(*) AS n FROM oportunidades WHERE cliente_id = ?',[customer]);assert.equal(row.n,0);
  } finally {await control.rollback();await Promise.allSettled([pending]);}
});

test('colección A4 ejecuta sus rutas, errores y mínimo sector sobre fixtures propios',async()=>{
  const collection=JSON.parse(readFileSync('../docs/api.postman_collection.json','utf8'));
  const values=new Map(collection.variable.map(v=>[v.key,v.value]));
  for(const [key,value] of Object.entries({base_url:origin+'/api',token:tokens[0],cliente_id:await client(),
    producto_prueba_id:await product(),producto_minimo_id:await product({minimum:50}),producto_inactivo_id:await product({active:false})}))values.set(key,value);
  const render=text=>text.replace(/\{\{([^}]+)\}\}/g,(_,key)=>values.get(key)??'');
  const requests=collection.item.filter(item=>item.name.startsWith('A4 '));let checks=0;
  for(const item of requests){
    const pm={variables:{get:key=>values.get(key),set:(key,value)=>values.set(key,value)},test:(name,fn)=>{fn();checks++;}};
    for(const event of item.event.filter(e=>e.listen==='prerequest'))vm.runInNewContext(event.script.exec.join('\n'),{pm},{timeout:2000});
    const request=item.request,headers=Object.fromEntries(request.header.map(h=>[h.key,render(h.value)]));
    if(request.auth.type==='bearer')headers.Authorization='Bearer '+render(request.auth.bearer[0].value);
    const response=await fetch(render(request.url),{method:request.method,headers,...(request.body?{body:render(request.body.raw)}:{})});
    const text=await response.text(),body=text?JSON.parse(text):null;
    if(response.status===201&&request.url==='{{base_url}}/oportunidades')ids.oportunidades.add(body.id);
    pm.response={code:response.status,json:()=>body,text:()=>text};
    for(const event of [...(collection.event??[]),...item.event].filter(e=>e.listen==='test'))vm.runInNewContext(event.script.exec.join('\n'),{pm},{timeout:2000});
  }
  console.log(JSON.stringify({collection:'A4',collectionRequests:requests.length,checks,tokensOnlyInMemory:true}));
});
