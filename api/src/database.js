import mysql from 'mysql2/promise';

export function createDatabase(config) {
  return mysql.createPool({
    ...config.db, connectionLimit: 5, timezone: 'Z', dateStrings: true,
    multipleStatements: false, supportBigNumbers: true,
  });
}
