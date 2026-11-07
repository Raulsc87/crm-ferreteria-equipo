import { readConfig } from './config.js';
import { createDatabase } from './database.js';
import { createApp } from './app.js';

const config = readConfig();
const database = createDatabase(config);
try {
  const [[identity]] = await database.execute('SELECT DATABASE() AS db, CURRENT_USER() AS account');
  if (identity.db !== config.db.database || identity.account !== `${config.db.user}@127.0.0.1`) throw new Error('La identidad MySQL no coincide con la configurada.');
  const server = createApp(database, config).listen(config.port, config.host, () => {
    console.log(`API en http://${config.host}:${config.port}/api · base ${identity.db} · cuenta ${identity.account}`);
  });
  server.on('error', async error => {
    console.error('No se pudo iniciar la API:', error.code || error.name);
    await database.end();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await database.end(); }));
} catch (error) {
  console.error('No se pudo comprobar MySQL:', error.code || error.name);
  await database.end();
  process.exitCode = 1;
}
