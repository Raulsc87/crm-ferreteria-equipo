export function readConfig(env = process.env) {
  for (const key of ['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET', 'SPA_ORIGIN']) {
    if (!env[key]) throw new Error(`Configure ${key}; no se muestran sus valores.`);
  }
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET requiere al menos 32 caracteres.');
  const origin = new URL(env.SPA_ORIGIN);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== env.SPA_ORIGIN) {
    throw new Error('SPA_ORIGIN debe ser un origen exacto HTTP/HTTPS, sin ruta ni comodines.');
  }
  const duration = env.JWT_EXPIRES_IN || '1h';
  if (!/^[1-9][0-9]*[smhd]?$/.test(duration)) throw new Error('JWT_EXPIRES_IN debe ser segundos o una duración como 1h.');
  return {
    host: env.HOST || '127.0.0.1', port: port(env.PORT || '3000'),
    db: { host: env.DB_HOST, port: port(env.DB_PORT || '3306'), database: env.DB_DATABASE, user: env.DB_USERNAME, password: env.DB_PASSWORD },
    jwtSecret: env.JWT_SECRET, jwtExpiresIn: /^[0-9]+$/.test(duration) ? Number(duration) : duration,
    spaOrigin: env.SPA_ORIGIN,
  };
}

function port(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 65535) throw new Error('Configure un puerto válido.');
  return number;
}
