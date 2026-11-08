export const SESSION_KEY = 'crm-ferreteria.sesion';

function cleanSession(value) {
  const user = value?.usuario;
  if (typeof value?.token !== 'string' || !value.token || !Number.isSafeInteger(user?.id) || user.id < 1
    || typeof user.nombre !== 'string' || typeof user.correo !== 'string') throw new Error('La respuesta de acceso no es válida.');
  // Lista explícita: nunca persistir contraseña, rol ni datos del negocio.
  return { token: value.token, usuario: { id: user.id, nombre: user.nombre, correo: user.correo } };
}

export function loadSession() {
  try {
    const value = globalThis.localStorage.getItem(SESSION_KEY);
    return value ? cleanSession(JSON.parse(value)) : null;
  } catch { clearSession(); return null; }
}

export function saveSession(value) {
  const session = cleanSession(value);
  let persisted = true;
  try { globalThis.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { persisted = false; }
  return { session, persisted };
}

export function clearSession() {
  try { globalThis.localStorage.removeItem(SESSION_KEY); } catch { /* Puede estar bloqueado por el navegador. */ }
}
