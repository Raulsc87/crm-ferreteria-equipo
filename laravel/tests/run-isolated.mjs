// Suite histórica que exige tablas vacías, en otro proceso MySQL y sin tocar 3306.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';
import mysql from '../../api/node_modules/mysql2/promise.js';

const project = fileURLToPath(new URL('../', import.meta.url));
const env = parseEnv(readFileSync(path.join(project, '.env.testing'), 'utf8'));
const apiEnv = parseEnv(readFileSync(path.join(project, '../api/.env.testing'), 'utf8'));
const php = process.env.PHP_BINARY || apiEnv.PHP_BINARY || 'php';
const binary = process.env.MYSQLD_BINARY || 'C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe';
const port = 3307, base = path.join(project, 'storage/framework/cache/data'), directory = path.join(base, 'crm-review-' + randomBytes(6).toString('hex'));
const data = path.join(directory, 'mysql');
let server, root;
function run(command, args, options = {}) {
  const child = spawn(command, args, { cwd: project, windowsHide: true, stdio: 'inherit', ...options });
  return new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(new Error('El proceso de pruebas terminó con código ' + code))); });
}
try {
  if (!existsSync(binary)) throw new Error('Configure MYSQLD_BINARY con el mysqld instalado.');
  await new Promise((resolve, reject) => { const probe = net.createServer(); probe.once('error', reject); probe.listen(port, '127.0.0.1', () => probe.close(resolve)); });
  mkdirSync(data, { recursive: true });
  const log = path.join(directory, 'mysql.log');
  await run(binary, ['--no-defaults', '--initialize-insecure', '--basedir=' + path.dirname(path.dirname(binary)), '--datadir=' + data, '--log-error=' + log]);
  server = spawn(binary, ['--no-defaults', '--datadir=' + data, '--port=' + port, '--bind-address=127.0.0.1', '--mysqlx=OFF', '--skip-log-bin', '--innodb-buffer-pool-size=64M', '--innodb-redo-log-capacity=32M', '--log-error=' + log], { windowsHide: true, stdio: 'ignore' });
  const until = Date.now() + 45000;
  while (!root && Date.now() < until) {
    try { root = await mysql.createConnection({ host: '127.0.0.1', port, user: 'root', connectTimeout: 1000 }); }
    catch { await new Promise(resolve => setTimeout(resolve, 150)); }
  }
  if (!root) throw new Error('No respondió la instancia MySQL temporal.');
  const [[identity]] = await root.query('SELECT @@port AS port,@@datadir AS directory');
  if (identity.port !== port || path.resolve(identity.directory).toLowerCase() !== path.resolve(data).toLowerCase()) throw new Error('Instancia temporal incorrecta; no continuar.');
  await root.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?", [randomBytes(32).toString('hex')]);
  await root.query('CREATE DATABASE crm_ferreteria_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await root.query("CREATE USER 'crm_laravel_test'@'127.0.0.1' IDENTIFIED BY ?", [env.DB_PASSWORD]);
  await root.query("GRANT ALL PRIVILEGES ON `crm\\_ferreteria\\_test`.* TO 'crm_laravel_test'@'127.0.0.1'");
  const childEnv = { ...process.env, APP_ENV: 'testing', DB_HOST: '127.0.0.1', DB_PORT: String(port), DB_DATABASE: 'crm_ferreteria_test', DB_USERNAME: 'crm_laravel_test', DB_PASSWORD: env.DB_PASSWORD, DB_URL: '' };
  const connection = await mysql.createConnection({ host: '127.0.0.1', port, database: childEnv.DB_DATABASE, user: childEnv.DB_USERNAME, password: childEnv.DB_PASSWORD });
  try {
    const [[row]] = await connection.query('SELECT DATABASE() AS db,CURRENT_USER() AS account,@@port AS port');
    if (row.db !== 'crm_ferreteria_test' || row.account !== 'crm_laravel_test@127.0.0.1' || row.port !== port) throw new Error('Destino de suite incorrecto.');
    console.log(JSON.stringify({ isolatedSuite: row, existingServer3306: 'sin cambios' }));
  } finally { await connection.end(); }
  await run(php, ['artisan', 'migrate', '--env=testing', '--force', '--no-interaction'], { env: childEnv });
  const absolute = value => path.join(project, value).replaceAll('\\', '/');
  let xml = readFileSync(path.join(project, 'phpunit.xml'), 'utf8').replace('value="3306"', 'value="3307"');
  xml = xml.replace('bootstrap="vendor/autoload.php"', 'bootstrap="' + absolute('vendor/autoload.php') + '"').replace('<directory>tests/Feature</directory>', '<directory>' + absolute('tests/Feature') + '</directory>').replace('<directory>app</directory>', '<directory>' + absolute('app') + '</directory>');
  const config = path.join(directory, 'phpunit.xml'); writeFileSync(config, xml);
  await run(php, ['vendor/bin/phpunit', '--configuration', config, ...process.argv.slice(2)], { env: childEnv });
} finally {
  if (root) { try { await root.query('SHUTDOWN'); } catch {} await root.end(); }
  if (server && server.exitCode === null) await new Promise(resolve => { server.once('exit', resolve); const timer = setTimeout(() => { server.kill(); }, 10000); server.once('exit', () => clearTimeout(timer)); });
  const resolved = path.resolve(directory);
  if (!resolved.startsWith(path.resolve(base) + path.sep) || !path.basename(resolved).startsWith('crm-review-')) throw new Error('Directorio temporal fuera de alcance.');
  rmSync(resolved, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
}
