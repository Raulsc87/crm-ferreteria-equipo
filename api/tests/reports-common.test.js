import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';
import mysql from 'mysql2/promise';
import { readConfig } from '../src/config.js';
import { createApp } from '../src/app.js';

let database, server, origin, config, password;
function inspect() {
  const env={...process.env,APP_ENV:'a6-testing'};
  for(const key of Object.keys(env))if(key.startsWith('DB_'))delete env[key];
  const result=spawnSync(process.env.PHP_BINARY||'php',['tests/report-database.php'],{env,encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,'Prepare antes el perfil aislado A6 con el procedimiento del README.');
  return JSON.parse(result.stdout);
}
before(async()=>{
  assert.equal(process.env.NODE_ENV,'test');
  const metadata=inspect();assert.equal(metadata.database,'crm_ferreteria_a6_test');
  config=readConfig(parseEnv(readFileSync('.env.a6-testing','utf8')));
  assert.equal(config.db.database,'crm_ferreteria_a6_test');assert.equal(config.db.user,'crm_api_a6_test');
  database=mysql.createPool({...config.db,timezone:'Z',dateStrings:true});
  const [[identity]]=await database.execute('SELECT DATABASE() AS db,CURRENT_USER() AS account');
  assert.deepEqual(identity,{db:'crm_ferreteria_a6_test',account:'crm_api_a6_test@127.0.0.1'});
  const [rows]=await database.query('SHOW GRANTS');assert.equal(rows.length,5);
  assert.ok(rows.every(row=>/^GRANT (USAGE ON \*\.\*|SELECT ON `crm_ferreteria_a6_test`\.`(users|clientes|oportunidades|oportunidad_productos)`) TO /.test(Object.values(row)[0])));
  password=JSON.parse(readFileSync('../docs/api.postman_collection.json','utf8')).variable.find(v=>v.key==='clave_publica').value;
  server=createApp(database,config).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));origin=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));if(database)await database.end();if(config)inspect();});

for(const [email,month,sales,total,forecast,portfolio] of [
  ['valeria@crm.test','2026-10',2,9250,2512.88,3],['valeria@crm.test','2026-11',1,3600,2512.88,3],
  ['diego@crm.test','2026-10',1,6000,112.5,2],['carlos@crm.test','2026-10',1,7200,4125.75,9],
])test('solo VerificacionSeeder: '+email+' '+month,async()=>{
  const login=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo:email,clave:password})});
  assert.equal(login.status,200);const token=(await login.json()).token;
  const response=await fetch(origin+'/api/reportes/resumen?mes='+month,{headers:{Authorization:'Bearer '+token}});
  assert.equal(response.status,200);const body=await response.json();
  assert.deepEqual(body,{mes:month,ventas:sales,total,pronostico:forecast,cartera:{clientes:portfolio,maximo:10}});
  console.log(JSON.stringify({isolatedDatabase:'crm_ferreteria_a6_test',email,...body}));
});
