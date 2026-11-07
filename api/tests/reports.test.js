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
import { reportMonth } from '../src/reports.js';

const config = readConfig(), run = randomBytes(12).toString('hex'), password = randomBytes(16).toString('hex');
const ids = { oportunidades: new Set(), clientes: new Set(), productos: new Set() };
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
  const [[identity]] = await control.query('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  assert.deepEqual(identity, { db: 'crm_ferreteria_test', account: 'crm_laravel_test@127.0.0.1' });
  const [rows] = await control.query('SHOW GRANTS');
  assert.ok(rows.every(row => { const grant = Object.values(row)[0]; return grant.startsWith('GRANT USAGE ON *.*') || grant.includes(' ON `crm\\_ferreteria\\_test`.* TO '); }));
}
async function snapshot() {
  await isolated(); const result = {};
  for (const table of ['users','productos','clientes','oportunidades','oportunidad_productos','historial_etapas','actividades']) {
    const [rows] = await control.query('SELECT * FROM ?? ORDER BY id', [table]);
    result[table] = { count: rows.length, hash: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
  }
  return result;
}
async function cleanup() {
  if (!control) return; await isolated();
  for (const table of ['oportunidades','clientes','productos']) { for (const id of ids[table]) await control.query('DELETE FROM ?? WHERE id = ?', [table,id]); ids[table].clear(); }
}
before(async () => {
  assert.equal(process.env.NODE_ENV,'test');assert.equal(config.db.database,'crm_ferreteria_test');assert.equal(config.db.user,'crm_api_test');
  const env=parseEnv(readFileSync('../laravel/.env.testing','utf8'));
  control=await mysql.createConnection({host:env.DB_HOST,user:env.DB_USERNAME,password:env.DB_PASSWORD,database:env.DB_DATABASE});
  baseline=await snapshot();users=accounts('create');
  api=mysql.createPool({...config.db,timezone:'Z',dateStrings:true});
  const [[identity]]=await api.execute('SELECT DATABASE() AS db,CURRENT_USER() AS account');assert.deepEqual(identity,{db:'crm_ferreteria_test',account:'crm_api_test@127.0.0.1'});
  server=createApp(api,config).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));origin=`http://127.0.0.1:${server.address().port}`;
  for(let i=0;i<2;i++){const result=await login(users['seller'+i].email,password);assert.equal(result.status,200);tokens.push(result.body.token);}
});
afterEach(cleanup);
after(async()=>{
  if(server)await new Promise(resolve=>server.close(resolve));if(api)await api.end();await cleanup();
  if(users){await isolated();accounts('cleanup');}if(baseline)assert.deepEqual(await snapshot(),baseline,'Conservar registros manuales de las siete tablas.');if(control)await control.end();
});
async function login(email, key) {
  const response=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo:email,clave:key})});
  return {status:response.status,body:await response.json()};
}
async function summary(query='mes=2026-10', token=tokens[0]) {
  const response=await fetch(origin+'/api/reportes/resumen'+(query?'?'+query:''),{headers:token?{Authorization:'Bearer '+token}:{}});
  assert.match(response.headers.get('content-type'),/application\/json/);return {status:response.status,body:await response.json()};
}
async function client(owner=0) {
  let phone;for(;;){phone='9'+String(randomInt(10000000)).padStart(7,'0');const [rows]=await control.execute('SELECT id FROM clientes WHERE telefono = ?',[phone]);if(!rows.length)break;}
  const [row]=await control.execute('INSERT INTO clientes (vendedor_id,nombre,telefono) VALUES (?,?,?)',[users['seller'+owner].id,'A6 '+run,phone]);ids.clientes.add(row.insertId);return row.insertId;
}
async function product() {
  const [row]=await control.execute('INSERT INTO productos (nombre,precio) VALUES (?,?)',['A6 '+run+' '+randomBytes(3).toString('hex'),'999.99']);ids.productos.add(row.insertId);return row.insertId;
}
async function opportunity(customer,p,stage='ganada',close='2026-10-05 16:00:00',lines=[['10.00',1]],owner=0) {
  const closing=['ganada','perdida'].includes(stage);
  const [row]=await control.execute('INSERT INTO oportunidades (cliente_id,vendedor_id,titulo,etapa,fecha_cierre,motivo_perdida) VALUES (?,?,?,?,?,?)',[customer,users['seller'+owner].id,'A6 '+run,stage,closing?close:null,stage==='perdida'?'No aceptó':null]);ids.oportunidades.add(row.insertId);
  for(const [price,quantity] of lines)await control.execute('INSERT INTO oportunidad_productos (oportunidad_id,producto_id,cantidad,precio_unitario) VALUES (?,?,?,?)',[row.insertId,p??await product(),quantity,price]);
  return row.insertId;
}
function shape(result) {
  assert.deepEqual(Object.keys(result).sort(),['cartera','mes','pronostico','total','ventas']);assert.deepEqual(Object.keys(result.cartera).sort(),['clientes','maximo']);
  for(const n of [result.ventas,result.total,result.pronostico,result.cartera.clientes,result.cartera.maximo])assert.equal(typeof n,'number');
}

test('mes predeterminado Guatemala, frontera de medianoche y rango igual a L6',()=>{
  assert.equal(reportMonth(undefined,new Date('2026-11-01T05:59:59Z')).month,'2026-10');
  assert.equal(reportMonth(undefined,new Date('2026-11-01T06:00:00Z')).month,'2026-11');
  assert.deepEqual(reportMonth('2026-12'),{month:'2026-12',start:'2026-12-01 06:00:00',end:'2027-01-01 06:00:00'});
  assert.equal(reportMonth('9998-12').end,'9999-01-01 06:00:00');
});
test('límites coinciden con Carbon/L6 en años extremos y cambios históricos de la zona',()=>{
  const months=['1000-01','1983-07','2006-05','2026-10','2026-12','9998-12'];
  const code="require '../laravel/vendor/autoload.php'; $result=[]; foreach(json_decode(stream_get_contents(STDIN),true) as $month){$start=Carbon\\CarbonImmutable::createFromFormat('!Y-m',$month,'America/Guatemala');$result[]=['month'=>$month,'start'=>$start->utc()->format('Y-m-d H:i:s'),'end'=>$start->addMonth()->utc()->format('Y-m-d H:i:s')];}echo json_encode($result);";
  const result=spawnSync(process.env.PHP_BINARY||'php',['-r',code],{input:JSON.stringify(months),encoding:'utf8',windowsHide:true});assert.equal(result.status,0);
  assert.deepEqual(months.map(month=>reportMonth(month)),JSON.parse(result.stdout));
});
test('sin resultados devuelve ceros numéricos y mes actual de Guatemala',async()=>{
  const result=await summary();assert.equal(result.status,200);shape(result.body);
  assert.deepEqual(result.body,{mes:'2026-10',ventas:0,total:0,pronostico:0,cartera:{clientes:0,maximo:10}});
  assert.equal((await summary('')).body.mes,reportMonth(undefined).month);
  await client();assert.equal((await summary()).body.cartera.clientes,1);
});
for(const value of ['','2026-1','2026-00','2026-13','2026-10-01',' 2026-10','0000-01','0999-12','9999-01','abcd','2026-10 OR 1=1'])test('mes inválido 400: '+JSON.stringify(value),async()=>{
  const result=await summary('mes='+encodeURIComponent(value));assert.equal(result.status,400);assert.deepEqual(Object.keys(result.body),['error']);
});
test('autorización, parámetros repetidos y propietario no admitido',async()=>{
  assert.equal((await summary('mes=2026-10',null)).status,401);
  for(const query of ['mes=2026-10&mes=2026-11','vendedor_id=1','mes=2026-10&usuario_id=1'])assert.equal((await summary(query)).status,400);
});
test('inicio inclusivo, fin exclusivo, múltiples líneas y crédito histórico tras reasignar',async()=>{
  const c=await client();
  await opportunity(c,null,'ganada','2026-10-01 05:59:59');
  await opportunity(c,null,'ganada','2026-10-01 06:00:00',[['10.00',2],['5.00',1]]);
  await opportunity(c,null,'ganada','2026-11-01 05:59:59',[['7.00',1]]);
  await opportunity(c,null,'ganada','2026-11-01 06:00:00',[['3.00',1]]);
  assert.deepEqual((await summary()).body,{mes:'2026-10',ventas:2,total:32,pronostico:0,cartera:{clientes:1,maximo:10}});
  assert.equal((await summary('mes=2026-11')).body.total,3);
  await control.execute('UPDATE clientes SET vendedor_id = ? WHERE id = ?',[users.seller1.id,c]);
  const old=(await summary()).body,newOwner=(await summary('mes=2026-10',tokens[1])).body;
  assert.equal(old.ventas,2);assert.equal(old.total,32);assert.equal(old.cartera.clientes,0);assert.equal(newOwner.ventas,0);assert.equal(newOwner.cartera.clientes,1);
});
test('todas las etapas abiertas y redondeo de suma final; sin filtro mensual ni catálogo actual',async()=>{
  const c=await client(),p=await product();
  for(const stage of ['prospecto','calificado','propuesta','negociacion'])await opportunity(c,p,stage,null,[['100.00',1]]);
  await opportunity(c,p,'perdida','2026-10-01 12:00:00',[['999.00',1]]);
  for(let i=0;i<3;i++)await opportunity(c,p,'propuesta',null,[['0.01',1]]);
  await opportunity(c,p,'ganada','2026-10-01 12:00:00',[['12.34',2]]);
  let result=(await summary()).body;assert.equal(result.total,24.68);assert.equal(result.pronostico,160.02);
  assert.equal((await summary('mes=2020-02')).body.pronostico,160.02);
  await control.execute('UPDATE productos SET precio = ?,activo = 0,cantidad_minima = 99 WHERE id = ?',['123456.78',p]);
  assert.deepEqual((await summary()).body,result);
  const other=await client(1);await opportunity(other,p,'ganada','2026-10-05 16:00:00',[['777.00',1]],1);
  assert.deepEqual((await summary()).body,result);
});

test('colección A6 ejecuta consulta y errores sobre HTTP real sin modificar datos',async()=>{
  const collection=JSON.parse(readFileSync('../docs/api.postman_collection.json','utf8'));
  const values=new Map(collection.variable.map(v=>[v.key,v.value]));values.set('base_url',origin+'/api');values.set('token',tokens[0]);
  const requests=collection.item.filter(item=>item.name.startsWith('A6 '));let checks=0;
  const render=text=>text.replace(/\{\{([^}]+)\}\}/g,(_,key)=>values.get(key)??'');
  for(const item of requests){
    const headers=item.request.auth.type==='bearer'?{Authorization:'Bearer '+tokens[0]}:{};
    const response=await fetch(render(item.request.url),{headers});const body=await response.json();
    const pm={response:{code:response.status,json:()=>body},test:(name,fn)=>{fn();checks++;}};
    for(const event of [...(collection.event??[]),...item.event].filter(e=>e.listen==='test'))vm.runInNewContext(event.script.exec.join('\n'),{pm},{timeout:2000});
  }
  console.log(JSON.stringify({collection:'A6',collectionRequests:requests.length,checks,tokensOnlyInMemory:true}));
});
