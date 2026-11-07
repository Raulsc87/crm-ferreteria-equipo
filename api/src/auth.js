import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validEmail } from './client-validation.js';

const invalidCredentials = { error: 'El correo o la contraseña no son correctos.' };
const invalidSession = { error: 'Su sesión no es válida. Inicie sesión de nuevo.' };

export function login(database, config) {
  return async (request, response) => {
    if (!request.is('application/json') || request.jsonBytes === 0 || !request.body || Array.isArray(request.body) || typeof request.body !== 'object') {
      return response.status(400).json({ error: 'Envíe un objeto JSON con correo y clave.' });
    }
    if (Object.keys(request.query).length) return response.status(400).json({ error: 'No se admiten parámetros en esta ruta.' });
    const errors = validateLogin(request.body);
    if (Object.keys(errors).length) return response.status(422).json({ errores: errors });
    const email = request.body.correo.trim().toLowerCase();
    const [rows] = await database.execute('SELECT id, name, email, password, rol, activo FROM users WHERE email = ? LIMIT 1', [email]);
    const user = rows[0];
    // La clave se compara tal como llega: no recortar espacios ni generar hashes en Node.
    if (!user || !await bcrypt.compare(request.body.clave, user.password)) return response.status(401).json(invalidCredentials);
    if (!user.activo || user.rol !== 'vendedor') {
      return response.status(403).json({ error: 'Esta cuenta no tiene acceso a la aplicación del vendedor.' });
    }
    const token = jwt.sign({}, config.jwtSecret, { algorithm: 'HS256', subject: String(user.id), expiresIn: config.jwtExpiresIn });
    return response.json({ token, usuario: publicUser(user) });
  };
}

export function authenticate(database, config) {
  return async (request, response, next) => {
    const bearer = /^Bearer ([^\s]+)$/i.exec(request.get('Authorization') || '');
    if (!bearer) return response.status(401).json(invalidSession);
    let payload;
    try {
      payload = jwt.verify(bearer[1], config.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      return response.status(401).json(invalidSession);
    }
    if (!validSubject(payload?.sub) || !Number.isSafeInteger(payload?.exp)) return response.status(401).json(invalidSession);
    // El token solo identifica: estado y rol vigentes siempre vienen de MySQL.
    const [rows] = await database.execute('SELECT id, name, email, rol, activo FROM users WHERE id = ? LIMIT 1', [payload.sub]);
    const user = rows[0];
    if (!user || !user.activo || user.rol !== 'vendedor') return response.status(401).json(invalidSession);
    request.usuario = publicUser(user);
    return next();
  };
}

function validSubject(value) {
  return typeof value === 'string' && /^[1-9][0-9]*$/.test(value) && Number.isSafeInteger(Number(value));
}

function publicUser(user) {
  return { id: user.id, nombre: user.name, correo: user.email };
}

function validateLogin(body) {
  const errors = Object.create(null);
  for (const field of Object.keys(body)) {
    if (!['correo', 'clave'].includes(field)) errors[field] = 'Este campo no está permitido.';
  }
  if (typeof body.correo !== 'string' || body.correo.trim().length > 255 || !validEmail(body.correo.trim())) {
    errors.correo = 'Ingrese un correo electrónico válido de hasta 255 caracteres.';
  }
  if (typeof body.clave !== 'string' || body.clave.length === 0) errors.clave = 'Ingrese su contraseña.';
  else if (Buffer.byteLength(body.clave, 'utf8') > 72) errors.clave = 'Use una contraseña de hasta 72 bytes, sin recortarla.';
  return errors;
}
