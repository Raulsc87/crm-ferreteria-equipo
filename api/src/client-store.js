import { fail } from './errors.js';

export async function withPortfolio(database, sellerId, operation) {
  const connection = await database.getConnection();
  let lockName, acquired = false, reusable = true;
  try {
    const [[identity]] = await connection.execute('SELECT DATABASE() AS db');
    lockName = `crm:cartera:${identity.db}:${sellerId}`;
    // Si se pierde la respuesta, MySQL podría haber adquirido el bloqueo.
    reusable = false;
    const [[lock]] = await connection.execute('SELECT GET_LOCK(?, 10) AS acquired', [lockName]);
    reusable = true;
    if (lock.acquired !== 1) fail(409, 'La cartera está ocupada. Actualice e inténtelo de nuevo.');
    acquired = true;
    return await portfolioTransaction(connection, sellerId, operation, () => { reusable = false; });
  } finally {
    if (acquired) {
      try {
        const [[lock]] = await connection.execute('SELECT RELEASE_LOCK(?) AS released', [lockName]);
        if (lock.released !== 1) reusable = false;
      } catch { reusable = false; }
    }
    if (reusable) connection.release(); else connection.destroy();
  }
}

async function portfolioTransaction(connection, sellerId, operation, onRollbackFailure) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await connection.beginTransaction();
      // GET_LOCK serializa API/API; FOR SHARE se excluye con el FOR UPDATE del panel.
      const [[seller]] = await connection.execute('SELECT id, rol, activo FROM users WHERE id = ? FOR SHARE', [sellerId]);
      if (!seller || !seller.activo || seller.rol !== 'vendedor') fail(401, 'Su sesión no es válida. Inicie sesión de nuevo.');
      const result = await operation(connection);
      await connection.commit();
      return result;
    } catch (error) {
      try { await connection.rollback(); } catch { onRollbackFailure(); throw error; }
      if (error.errno === 1062) {
        const nit = error.sqlMessage?.includes('clientes_nit_unique');
        fail(409, nit ? 'Este NIT ya está registrado. Revise los datos.' : 'Este teléfono ya está registrado. Revise los datos.');
      }
      if (![1205, 1213].includes(error.errno)) throw error;
      if (attempt === 2) fail(409, 'La cartera cambió mientras guardaba. Actualice e inténtelo de nuevo.');
    }
  }
}

export async function checkCapacity(connection, sellerId) {
  // Lectura actual bajo bloqueos; no usar un COUNT previo ni una instantánea antigua.
  const [clients] = await connection.execute('SELECT id FROM clientes WHERE vendedor_id = ? ORDER BY id FOR UPDATE', [sellerId]);
  if (clients.length >= 10) fail(409, 'Su cartera ya tiene 10 clientes, el máximo permitido.');
}
