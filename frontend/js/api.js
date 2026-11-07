export function createApi({ baseUrl, getSession, onUnauthorized, fetchRequest = globalThis.fetch }) {
  const base = new URL(baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Configure una URL pública válida para la API.');
  return async function request(path, { method = 'GET', body, authenticated = true } = {}) {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) throw new Error('Use una ruta relativa de la API.');
    const token = authenticated ? getSession()?.token : null;
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetchRequest(base.href.replace(/\/$/, '') + path, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    } catch { throw Object.assign(new Error('No se pudo conectar con el servicio. Compruebe que esté iniciado e inténtelo de nuevo.'), { status: 0, fields: {} }); }
    if (authenticated && response.status === 401) onUnauthorized(token);
    if (response.status === 204) return null;
    let data;
    try { data = await response.json(); }
    catch { throw Object.assign(new Error('El servidor envió una respuesta que no se pudo interpretar. Inténtelo de nuevo.'), { status: response.status, fields: {} }); }
    if (!response.ok) {
      const fields = Object.create(null);
      if (data?.errores && typeof data.errores === 'object') {
        for (const [field, message] of Object.entries(data.errores)) if (typeof message === 'string') fields[field] = message;
      }
      throw Object.assign(new Error(typeof data?.error === 'string' ? data.error : 'Revise los datos enviados e inténtelo de nuevo.'), { status: response.status, fields });
    }
    return data;
  };
}
