import express from 'express';
import cors from 'cors';
import { authenticate, login } from './auth.js';
import { clientRoutes } from './clients.js';
import { opportunityRoutes } from './opportunities.js';
import { activityRoutes } from './activities.js';
import { reportRoutes } from './reports.js';

export function createApp(database, config) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({
    origin: (origin, callback) => callback(null, origin === config.spaOrigin),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.post('/api/auth/login', express.json({
    limit: '16kb', verify: (request, response, buffer) => { request.jsonBytes = buffer.length; },
  }), login(database, config));
  app.get('/api/productos', authenticate(database, config), async (request, response) => {
    if (Object.keys(request.query).length || request.get('Transfer-Encoding') || Number(request.get('Content-Length') || 0) > 0) {
      return response.status(400).json({ error: 'Esta ruta no admite parámetros ni cuerpo.' });
    }
    const [rows] = await database.execute('SELECT id, nombre, precio FROM productos WHERE activo = ? ORDER BY id', [1]);
    return response.json(rows.map(row => ({ id: row.id, nombre: row.nombre, precio: Number(row.precio) })));
  });
  app.use('/api/clientes', authenticate(database, config), clientRoutes(database));
  app.use('/api/oportunidades', authenticate(database, config), opportunityRoutes(database));
  app.use('/api/actividades', authenticate(database, config), activityRoutes(database));
  app.use('/api/reportes', authenticate(database, config), reportRoutes(database));
  app.use((request, response) => response.status(404).json({ error: 'El recurso solicitado no está disponible.' }));
  app.use(apiError);
  return app;
}

export function apiError(error, request, response, next) {
  if (response.headersSent) return next(error);
  if (error.publicError) return response.status(error.status).json(error.errors ? { errores: error.errors } : { error: error.message });
  const invalidPath = error instanceof URIError && error.status === 400;
  const invalidCompression = error.status === 400 && ['Z_DATA_ERROR', 'Z_BUF_ERROR'].includes(error.code);
  if (invalidPath || invalidCompression || ['entity.parse.failed', 'entity.too.large', 'encoding.unsupported', 'charset.unsupported', 'request.aborted', 'request.size.invalid'].includes(error.type)) {
    return response.status(400).json({ error: 'No se pudo leer la solicitud. Revise la dirección y el cuerpo JSON.' });
  }
  // Solo el código en consola: no registrar cuerpo, credenciales ni token de la solicitud.
  console.error('Error interno de API:', error.code || error.name || 'Error');
  return response.status(500).json({ error: 'No se pudo completar la solicitud. Inténtelo de nuevo.' });
}
