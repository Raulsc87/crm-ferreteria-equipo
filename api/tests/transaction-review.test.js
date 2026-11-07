import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withPortfolio } from '../src/client-store.js';
import { opportunityTransaction } from '../src/opportunity-store.js';

// Dobles de conexión: reproducir respuestas perdidas y rollback fallido sin tocar MySQL.
function connectionFailure(failure) {
  const events = [];
  let lock = false, transaction = false, destroyed = false;
  const connection = {
    execute: async sql => {
      if (destroyed) throw new Error('Conexión cerrada');
      if (sql.includes('DATABASE')) return [[{ db: 'crm_ferreteria_test' }]];
      if (sql.includes('GET_LOCK')) {
        lock = true; events.push('acquire-lock');
        if (failure === 'acquisition') throw new Error('Respuesta de adquisición perdida');
        return [[{ acquired: 1 }]];
      }
      if (sql.includes('RELEASE_LOCK')) {
        events.push('release-lock');
        if (failure === 'release') throw new Error('Liberación incierta');
        lock = false; return [[{ released: 1 }]];
      }
      return [[{ id: 1, rol: 'vendedor', activo: 1 }]];
    },
    beginTransaction: async () => { transaction = true; events.push('begin'); },
    commit: async () => { transaction = false; events.push('commit'); },
    rollback: async () => {
      events.push('rollback'); if (failure === 'rollback') throw new Error('Rollback no confirmado'); transaction = false;
    },
    release: () => { events.push('pool-release'); assert.equal(lock, false, 'No devolver bloqueos nombrados al pool.'); assert.equal(transaction, false, 'No devolver una transacción abierta al pool.'); },
    destroy: () => { destroyed = true; lock = false; transaction = false; events.push('destroy'); },
  };
  return { database: { getConnection: async () => connection }, events };
}

for (const rejects of [false, true]) test('cartera libera el bloqueo antes del pool en ' + (rejects ? 'error' : 'éxito'), async () => {
  const fixture = connectionFailure();
  const operation = async () => { if (rejects) throw new Error('Operación rechazada'); return 'ok'; };
  if (rejects) await assert.rejects(withPortfolio(fixture.database, 1, operation), /Operación rechazada/);
  else assert.equal(await withPortfolio(fixture.database, 1, operation), 'ok');
  assert.ok(fixture.events.indexOf('release-lock') < fixture.events.indexOf('pool-release'));
  assert.ok(fixture.events.includes(rejects ? 'rollback' : 'commit'));
});
for (const failure of ['acquisition', 'release', 'rollback']) test('cartera destruye conexión ante ' + failure + ' incierto', async () => {
  const fixture = connectionFailure(failure);
  const operation = async () => { if (failure === 'rollback') throw new Error('Operación rechazada'); return 'ok'; };
  if (failure === 'release') await withPortfolio(fixture.database, 1, operation);
  else await assert.rejects(withPortfolio(fixture.database, 1, operation));
  assert.ok(fixture.events.includes('destroy')); assert.equal(fixture.events.includes('pool-release'), false);
});
test('oportunidad destruye la conexión si no puede confirmar rollback', async () => {
  const fixture = connectionFailure('rollback');
  await assert.rejects(opportunityTransaction(fixture.database, async () => { throw new Error('Operación rechazada'); }));
  assert.ok(fixture.events.includes('destroy')); assert.equal(fixture.events.includes('pool-release'), false);
});
