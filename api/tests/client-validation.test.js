import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { validateClient, normalizeNit, normalizePhone } from '../src/client-validation.js';

const base = { nombre: ' Cliente  de prueba ', nit: 'CF', telefono: '+502 (5900)-1234', correo: null };
const changes = [
  {}, { nit: '000452 1817-k' }, { nit: 'c-f' }, { nit: '' }, { nit: null }, { nit: '0019' },
  { nit: '0000' }, { nit: '45218170' }, { nit: [] }, { nit: 'K' },
  { telefono: '50212345' }, { telefono: '50259001234' }, { telefono: '+50359001234' },
  { telefono: '15551234' }, { telefono: null }, { telefono: 59001234 },
  { nombre: ' ' }, { nombre: 'á'.repeat(150) }, { nombre: 'á'.repeat(151) }, { nombre: [] },
  { correo: '' }, { correo: 'incorrecto' }, { correo: 'x@localhost' }, { correo: 'a+b@crm.test' },
  { correo: '"a b"@crm.test' }, { correo: 'x@[127.0.0.1]' }, { correo: 'ñ@ejemplo.test' },
  { correo: 'a..b@crm.test' }, { correo: 'a@-crm.test' }, { correo: 'a@crm_.test' },
  { correo: 'a'.repeat(144) + '@x.test' }, { correo: 'a'.repeat(143) + '@x.test' },
];

test('R4: los mismos vectores son aceptados/rechazados y normalizados como en el panel', () => {
  const env = { ...process.env, APP_ENV: 'testing' };
  for (const key of Object.keys(env)) if (key.startsWith('DB_')) delete env[key];
  const input = changes.map(change => ({ ...base, ...change }));
  const child = spawnSync(process.env.PHP_BINARY || 'php', ['tests/client-parity.php'], { input: JSON.stringify(input), encoding: 'utf8', env, windowsHide: true });
  assert.equal(child.status, 0, 'No se pudo contrastar con Laravel.');
  const panel = JSON.parse(child.stdout);
  for (const [index, body] of input.entries()) {
    const api = validateClient(body);
    assert.equal(Object.keys(api.errors).length === 0, panel[index].valid, `Aceptación del vector ${index}`);
    assert.deepEqual(Object.keys(api.errors).sort(), panel[index].fields.sort(), `Campos del vector ${index}`);
    if (panel[index].valid) assert.deepEqual({ ...api.data }, panel[index].data, `Normalización del vector ${index}`);
  }
});

test('normalización conserva los ocho dígitos locales y CF como NULL', () => {
  assert.equal(normalizePhone('50212345'), '50212345');
  assert.equal(normalizePhone('+502 5900-1234'), '59001234');
  assert.equal(normalizeNit('c-f'), null);
  assert.equal(normalizeNit('000'), '0');
});
