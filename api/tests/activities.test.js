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
import { utcDeadline } from '../src/activity-validation.js';
import { publicActivity } from '../src/activities.js';

const config = readConfig(), run = randomBytes(12).toString('hex'), password = randomBytes(16).toString('hex');
const clients = new Set(), activities = new Set(), waiting = [];
let control, api, server, origin, users, baseline, tokens = [];

function accounts(action) {
  const env = { ...process.env, APP_ENV: 'testing' };
  for (const key of Object.keys(env)) if (key.startsWith('DB_')) delete env[key];
  const result = spawnSync(process.env.PHP_BINARY || 'php', ['tests/client-users.php'], {
    input: JSON.stringify({ action, run, password }), env, encoding: 'utf8', windowsHide: true,
  });
  assert.equal(result.status, 0); return JSON.parse(result.stdout);
}

async function isolated() {
  const [[identity]] = await control.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1' });
  const [rows] = await control.query('SHOW GRANTS');
  assert.ok(rows.every(row => { const grant = Object.values(row)[0]; return grant.startsWith('GRANT USAGE ON *.*') || grant.includes(' ON `crm\\_ferreteria\\_test`.* TO '); }));
}

async function snapshot() {
  await isolated(); const result = {};
  for (const table of ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades']) {
    const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]);
    result[table] = { count: rows.length, hash: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
  }
  return result;
}

async function cleanup() {
  if (!control) return; await isolated();
  for (const id of activities) await control.execute('DELETE FROM actividades WHERE id = ?', [id]);
  for (const id of clients) await control.execute('DELETE FROM clientes WHERE id = ?', [id]);
  activities.clear(); clients.clear();
}

before(async () => {
  assert.equal(process.env.NODE_ENV, 'test'); assert.equal(config.db.database, 'crm_ferreteria_test'); assert.equal(config.db.user, 'crm_api_test');
  const env = parseEnv(readFileSync('../laravel/.env.testing', 'utf8'));
  control = await mysql.createConnection({ host: env.DB_HOST, user: env.DB_USERNAME, password: env.DB_PASSWORD, database: env.DB_DATABASE, port: Number(env.DB_PORT) });
  baseline = await snapshot(); users = accounts('create');
  api = mysql.createPool({ ...config.db, connectionLimit: 5, timezone: 'Z', dateStrings: true });
  const [[identity]] = await api.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_api_test@127.0.0.1' });
  const acquire = api.getConnection.bind(api);
  api.getConnection = async () => {
    const connection = await acquire(), execute = connection.execute.bind(connection), release = connection.release.bind(connection);
    connection.execute = async (sql, params) => { if (sql.includes('FROM clientes') && sql.includes('FOR UPDATE')) waiting.push(connection.threadId); return execute(sql, params); };
    connection.release = () => { connection.execute = execute; connection.release = release; release(); }; return connection;
  };
  server = createApp(api, config).listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  for (let i = 0; i < 2; i++) {
    const result = await call('/api/auth/login', { method: 'POST', user: null, data: { correo: users['seller' + i].email, clave: password } });
    assert.equal(result.status, 200); tokens.push(result.body.token);
  }
});
afterEach(async () => {
  if (api && users) for (let i = 0; i < 2; i++) {
    const [[row]] = await api.execute('SELECT IS_FREE_LOCK(?) AS free', ['crm:cartera:crm_ferreteria_test:' + users['seller' + i].id]); assert.equal(row.free, 1);
  }
  await cleanup();
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve)); if (api) await api.end(); await cleanup();
  if (users) { await isolated(); accounts('cleanup'); }
  if (baseline) assert.deepEqual(await snapshot(), baseline, 'Conservar todas las filas manuales previas.');
  if (control) await control.end();
});

async function client(owner = 0) {
  let phone;
  for (;;) { phone = '9' + String(randomInt(10000000)).padStart(7, '0'); const [rows] = await control.execute('SELECT id FROM clientes WHERE telefono = ?', [phone]); if (!rows.length) break; }
  const [created] = await control.execute('INSERT INTO clientes (vendedor_id, nombre, telefono) VALUES (?, ?, ?)', [owner === null ? null : users['seller' + owner].id, 'A5 ' + run, phone]);
  clients.add(created.insertId); return created.insertId;
}

async function call(route, { method = 'GET', user = 0, data, raw, headers = {} } = {}) {
  if (user !== null) headers = { Authorization: 'Bearer ' + tokens[user], ...headers };
  if (data !== undefined) { raw = JSON.stringify(data); headers['Content-Type'] = 'application/json'; }
  const response = await fetch(origin + route, { method, body: raw, headers });
  assert.match(response.headers.get('content-type'), /application\/json/); const body = await response.json();
  if (response.status === 201 && route.endsWith('/actividades')) activities.add(body.id);
  return { status: response.status, body };
}
const creationPath = id => '/api/clientes/' + id + '/actividades';
const patchPath = id => '/api/actividades/' + id;
async function create(id, fields = {}, user = 0) { return call(creationPath(id), { method: 'POST', user, data: { tipo: 'tarea', descripcion: '  Dar   seguimiento  ', ...fields } }); }
function shape(row) {
  assert.deepEqual(Object.keys(row).sort(), ['cliente','completada','descripcion','id','tipo','vence_en','vencida']);
  assert.deepEqual(Object.keys(row.cliente).sort(), ['id','nombre']); assert.equal(typeof row.completada, 'boolean'); assert.equal(typeof row.vencida, 'boolean');
}

test('crear los tres tipos, vencimiento opcional, autor autenticado y respuesta exacta', async () => {
  const id = await client();
  for (const tipo of ['llamada','reunion','tarea']) {
    const result = await create(id,{tipo}); assert.equal(result.status,201); shape(result.body);
    assert.equal(result.body.descripcion,'Dar seguimiento'); assert.equal(result.body.completada,false); assert.equal(result.body.vencida,false); assert.equal(result.body.vence_en,null);
    const [[saved]] = await control.execute('SELECT vendedor_id, completada FROM actividades WHERE id = ?',[result.body.id]);
    assert.equal(saved.vendedor_id,users.seller0.id); assert.equal(saved.completada,0);
  }
});

test('listar cartera actual, filtros y PATCH completada booleano reversible', async () => {
  const own = await client(), foreign = await client(1);
  const expired = (await create(own,{vence_en:'2000-01-01T10:00:00-06:00'})).body;
  await create(foreign,{},1); const another = (await create(own)).body;
  let result=await call('/api/actividades'); assert.deepEqual(result.body.map(r=>r.id),[expired.id,another.id]);result.body.forEach(shape);
  assert.equal(result.body[0].vencida,true); assert.equal(result.body[0].vence_en,'2000-01-01T16:00:00.000Z');
  result=await call(patchPath(expired.id),{method:'PATCH',data:{completada:true}});assert.equal(result.status,200);assert.equal(result.body.vencida,false);
  assert.deepEqual((await call('/api/actividades?estado=completada')).body.map(r=>r.id),[expired.id]);
  assert.deepEqual((await call('/api/actividades?estado=pendiente')).body.map(r=>r.id),[another.id]);
  assert.equal((await call(patchPath(expired.id),{method:'PATCH',data:{completada:false}})).body.vencida,true);
});

test('reasignar conserva autor y transfiere acceso solo al dueño actual del cliente', async () => {
  const id=await client(), activity=(await create(id)).body;
  await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?',[users.seller1.id,id]);
  assert.deepEqual((await call('/api/actividades')).body,[]);
  assert.equal((await call(patchPath(activity.id),{method:'PATCH',data:{completada:true}})).status,404);
  const current=await call('/api/actividades',{user:1});assert.deepEqual(current.body.map(a=>a.id),[activity.id]);
  assert.equal((await call(patchPath(activity.id),{method:'PATCH',user:1,data:{completada:true}})).status,200);
  const [[saved]]=await control.execute('SELECT vendedor_id FROM actividades WHERE id = ?',[activity.id]);assert.equal(saved.vendedor_id,users.seller0.id);
  await control.execute('UPDATE clientes SET vendedor_id = NULL WHERE id = ?',[id]);
  assert.deepEqual((await call('/api/actividades',{user:1})).body,[]);
  assert.equal((await create(id,{},1)).status,404);
});

test('ajeno/inexistente 404 antes del JSON; autenticación en las tres rutas', async () => {
  const id=await client(1), activity=(await create(id,{},1)).body;
  assert.equal((await create(id)).status,404);assert.equal((await create(999999999)).status,404);
  for(const path of [creationPath(id),patchPath(activity.id)]) {
    const method=path.includes('/clientes/')?'POST':'PATCH';
    assert.equal((await call(path,{method,raw:'{',headers:{'Content-Type':'application/json'}})).status,404);
    assert.equal((await call(path,{method,user:null,data:{}})).status,401);
  }
  assert.equal((await call('/api/actividades',{user:null})).status,401);
  for(const id of ['0','-1','abc','01','9007199254740992','999999999'])assert.equal((await call(patchPath(id),{method:'PATCH',data:{completada:true}})).status,404);
});

for(const [input, field] of [
  [{tipo:'email'},'tipo'],[{tipo:null},'tipo'],[{descripcion:''},'descripcion'],[{descripcion:' \n\t '},'descripcion'],[{descripcion:[]},'descripcion'],
  [{descripcion:'á'.repeat(501)},'descripcion'],[{vendedor_id:1},'vendedor_id'],[{cliente_id:1},'cliente_id'],[{completada:true},'completada'],
  [{vence_en:null},'vence_en'],[{vence_en:''},'vence_en'],[{vence_en:42},'vence_en'],[{vence_en:[]},'vence_en'],
]) test('validación de creación: '+field+' '+JSON.stringify(input),async()=>{
  const id=await client(), result=await create(id,input);assert.equal(result.status,422);assert.equal(typeof result.body.errores[field],'string');
  const [[row]]=await control.execute('SELECT COUNT(*) AS n FROM actividades WHERE cliente_id = ?',[id]);assert.equal(row.n,0);
});

for(const value of ['2030-01-15T09:00:00','2030-02-30T10:00:00Z','2026-02-29T10:00:00Z','2030-13-01T00:00:00Z',
  '2030-01-01T24:00:00Z','2030-01-01T12:60:00Z','2030-01-01T12:00:60Z','2030-01-01T12:00:00+24:00','2030-01-01T12:00:00+06:60',
  'no es fecha','2030-01-01','0999-12-31T23:59:59Z','9999-12-31T23:59:59-01:00'])test('fecha inválida rechazada: '+value,async()=>{
  assert.equal(utcDeadline(value),null);const result=await create(await client(),{vence_en:value});assert.equal(result.status,422);assert.equal(typeof result.body.errores.vence_en,'string');
});

test('fechas equivalentes con zonas, fracciones, año bisiesto y almacenamiento UTC real', async()=>{
  const id=await client();
  for(const value of ['2030-01-15T09:00:00-06:00','2030-01-15T15:00:00Z','2030-01-15T20:30:00+05:30','2030-01-16T05:00:00+14:00']) {
    const result=await create(id,{vence_en:value});assert.equal(result.status,201);assert.equal(result.body.vence_en,'2030-01-15T15:00:00.000Z');assert.equal(result.body.vencida,false);
    const [[saved]]=await control.execute('SELECT CAST(vence_en AS CHAR) AS fecha FROM actividades WHERE id = ?',[result.body.id]);assert.equal(saved.fecha,'2030-01-15 15:00:00');
  }
  assert.equal((await create(id,{vence_en:'2028-02-29T23:59:59.987654Z'})).body.vence_en,'2028-02-29T23:59:59.000Z');
  assert.equal((await create(id,{vence_en:'2030-01-15T09:00-06:00'})).body.vence_en,'2030-01-15T15:00:00.000Z');
  assert.equal((await create(id,{descripcion:'á'.repeat(500)})).status,201);
});

test('vencida se calcula al responder y el límite es estrictamente anterior',()=>{
  const row={id:1,cliente_id:1,cliente_nombre:'Ejemplo',tipo:'tarea',descripcion:'Seguimiento',vence_en:'2030-01-01 00:00:00',completada:0};
  const time=Date.parse('2030-01-01T00:00:00Z');assert.equal(publicActivity(row,time).vencida,false);
  assert.equal(publicActivity(row,time+1).vencida,true);assert.equal(publicActivity({...row,completada:1},time+1).vencida,false);
  assert.equal(publicActivity({...row,vence_en:null},time+1).vencida,false);
});

test('PATCH rechaza tipos/campos extra y no acepta editar otros datos',async()=>{
  const id=(await create(await client())).body.id;
  for(const data of [{},{completada:'true'},{completada:1},{completada:0},{completada:null},{completada:[]},{completada:false,descripcion:'Cambio'}]) {
    const result=await call(patchPath(id),{method:'PATCH',data});assert.equal(result.status,422);
  }
  for(const raw of ['{','','[]','null'])assert.equal((await call(patchPath(id),{method:'PATCH',raw,headers:{'Content-Type':'application/json'}})).status,400);
  assert.equal((await call(patchPath(id),{method:'PATCH',data:{completada:false}})).status,200);
});

test('filtros inválidos/desconocidos, intento de inyección y rutas no autorizadas',async()=>{
  for(const q of ['estado=','estado=otra','estado=pendiente&estado=completada','estado=1%20OR%201=1','vendedor_id=1'])assert.equal((await call('/api/actividades?'+q)).status,400);
  const id=await client();assert.equal((await create(id,{descripcion:'\' OR 1=1; --'})).status,201);
  const activity=(await call('/api/actividades')).body[0];assert.equal(activity.descripcion,"' OR 1=1; --");
  assert.equal((await call(patchPath(activity.id)+'?estado=pendiente',{method:'PATCH',data:{completada:true}})).status,400);
  assert.equal((await call(patchPath(activity.id),{method:'DELETE'})).status,404);
});

for(const action of ['create','patch'])test(action+' revalida propietario tras esperar el bloqueo de cliente',async()=>{
  const id=await client(), existing=(await create(id)).body;waiting.length=0;
  await control.beginTransaction();await control.execute('SELECT id FROM clientes WHERE id = ? FOR UPDATE',[id]);
  const pending=action==='create'?create(id):call(patchPath(existing.id),{method:'PATCH',data:{completada:true}});
  try {
    const deadline=Date.now()+3000;while(waiting.length===0&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,10));assert.ok(waiting.length>0);
    await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?',[users.seller1.id,id]);await control.commit();
    assert.equal((await pending).status,404);
    const [[row]]=await control.execute('SELECT COUNT(*) AS n, SUM(completada) AS completed FROM actividades WHERE cliente_id = ?',[id]);assert.equal(row.n,1);assert.equal(Number(row.completed),0);
  } finally {await control.rollback();await Promise.allSettled([pending]);}
});

test('colección A5 ejecuta rutas/errores con fixtures propios y tokens solo en memoria',async()=>{
  const collection=JSON.parse(readFileSync('../docs/api.postman_collection.json','utf8'));
  const values=new Map(collection.variable.map(v=>[v.key,v.value]));
  values.set('base_url',origin+'/api');values.set('token',tokens[0]);values.set('cliente_id',await client());
  const requests=collection.item.filter(item=>item.name.startsWith('A5 '));let checks=0;
  const render=text=>text.replace(/\{\{([^}]+)\}\}/g,(_,key)=>values.get(key)??'');
  for(const item of requests){
    const pm={variables:{get:key=>values.get(key),set:(key,value)=>values.set(key,value)},test:(name,fn)=>{fn();checks++;}};
    for(const event of item.event.filter(e=>e.listen==='prerequest'))vm.runInNewContext(event.script.exec.join('\n'),{pm},{timeout:2000});
    const request=item.request,headers=Object.fromEntries(request.header.map(h=>[h.key,render(h.value)]));
    if(request.auth.type==='bearer')headers.Authorization='Bearer '+render(request.auth.bearer[0].value);
    const response=await fetch(render(request.url),{method:request.method,headers,...(request.body?{body:render(request.body.raw)}:{})});
    const body=await response.json();if(response.status===201)activities.add(body.id);
    pm.response={code:response.status,json:()=>body};
    for(const event of [...(collection.event??[]),...item.event].filter(e=>e.listen==='test'))vm.runInNewContext(event.script.exec.join('\n'),{pm},{timeout:2000});
  }
  console.log(JSON.stringify({collection:'A5',collectionRequests:requests.length,checks,tokensOnlyInMemory:true}));
});
