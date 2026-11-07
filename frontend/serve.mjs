import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function createFrontendServer(apiBaseUrl = process.env.SPA_API_BASE_URL) {
  if (apiBaseUrl) {
    const url = new URL(apiBaseUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Configure una URL pública de API sin credenciales.');
  }
  const root = fileURLToPath(new URL('.', import.meta.url));
  return createServer(async (request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname); }
    catch { response.writeHead(400).end('Solicitud ilegible.'); return; }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    const target = path.resolve(root, file), extension = path.extname(file);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain' };
    const publicFile = file === 'index.html' || /^(js|css)\//.test(file);
    if (!publicFile || !target.startsWith(root) || !types[extension]) { response.writeHead(404).end('Archivo no disponible.'); return; }
    try {
      // Solo una URL pública configurable; nunca exponer el entorno del servidor.
      const content = apiBaseUrl && file === 'js/config.js' ? 'export const API_BASE_URL = ' + JSON.stringify(apiBaseUrl) + ';' : await readFile(target);
      response.writeHead(200, { 'Content-Type': types[extension] + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(404).end('Archivo no disponible.'); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createFrontendServer();
  server.listen(5500, '127.0.0.1', () => console.log('SPA en http://127.0.0.1:5500 · detener con Ctrl+C'));
  server.on('error', error => { console.error('No se pudo iniciar la SPA:', error.code || error.name); process.exitCode = 1; });
}
