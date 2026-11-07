# CRM Ferretería: instrucciones para el agente

## Forma de trabajar

- Responder en español, con explicaciones breves y sencillas para Raúl y Diego.
- Trabajar por etapas pequeñas. Realizar únicamente la fase solicitada; al terminar, explicar archivos modificados, resultado, comprobaciones y pendientes.
- Antes de modificar código, leer README.md, docs/especificacion.md y docs/plan.md. Consultar docs/enunciado.pdf cuando falte un detalle del contrato o la semilla.
- La fuente obligatoria es el enunciado; la especificación concreta sus decisiones abiertas. Si encuentra una contradicción, describirla y proponer una corrección antes de implementar sobre ella.
- En modo de análisis o Plan no modificar archivos ni ejecutar comandos que cambien el proyecto. Para editar, usar el modo de trabajo que permita cambios y tener autorizada esa fase.
- No crear commits, etiquetas ni hacer push sin una instrucción explícita. No inventar autores ni contribuciones de los integrantes.
- Instalar dependencias solo dentro de la fase de preparación o implementación autorizada, explicando para qué sirven. No añadir paquetes innecesarios.
- No ejecutar migrate:fresh, DROP, TRUNCATE ni operaciones que borren datos sin una solicitud explícita para reiniciar una base identificada como de pruebas. Nunca asumir que una base es desechable.

## Estado inicial

- Esta entrega contiene documentos iniciales; no hay aplicaciones implementadas, instalación validada, pruebas funcionales aprobadas ni etiquetas Git creadas.
- Antes del código de negocio deben revisarse la especificación y el plan y crearse spec-v1 en el repositorio real.
- Confirmar el entorno local y la fase actual mediante los archivos y Git, sin asumir que ya existen Laravel, MySQL o credenciales.

## Arquitectura obligatoria

- Panel: PHP 8.4, Laravel 13, Breeze Blade y Eloquent. Solo administrador y supervisor.
- API: Node.js 24 LTS, Express 5, mysql2, jsonwebtoken, bcryptjs y cors. SQL parametrizado con ?, sin ORM ni constructor de consultas. Solo vendedores.
- SPA: HTML, Bootstrap 5.3 y JavaScript con módulos, estado → render y delegación de eventos. Sin React, Vue, Angular ni otro framework.
- Base compartida: MySQL 8.4 LTS. Configurar explícitamente ambos servicios sobre la misma base, sin SQLite.
- Solo Laravel crea o cambia el esquema mediante migraciones. Extender users con una migración nueva; no editar migraciones ya aplicadas para introducir requisitos nuevos.
- Solo Laravel genera hashes y el administrador crea cuentas. No hay registro público. La API únicamente verifica los hashes con bcryptjs.

## Contrato, negocio y seguridad

- Conservar exactamente los 20 endpoints, cuerpos, códigos y formas de respuesta de la especificación y el enunciado; no añadir envoltorios a los arreglos ni renombrar campos por el sector.
- Comprobar usuario activo y rol actual en cada petición; validar HS256, expiración y sub del JWT. No confiar solo en los datos del token.
- Obtener el propietario desde la sesión o token. Lo ajeno responde 404. No exponer hashes, claves internas de propietario ni datos de otros vendedores.
- Cartera máxima de 10, toma atómica de clientes y control de concurrencia común en Laravel y API. Validar dentro de transacciones y usar bloqueos consistentes.
- Normalizar NIT y teléfono antes de validar y comprobar duplicados. CF se guarda NULL y se devuelve CF. Los índices únicos son la barrera final contra duplicados.
- Precios con DECIMAL; copiarlos del catálogo a cada línea en el servidor. Nunca aceptar precio enviado por el vendedor. Total y reportes calculados en el servidor/base.
- Oportunidades cerradas inmutables. Cambio de etapa, cierre e historial en una sola transacción; intentos rechazados no dejan historial.
- Fechas en UTC; API ISO 8601 con zona; interfaz y meses comerciales en America/Guatemala.
- Regla del sector: cantidad >= productos.cantidad_minima, con valor predeterminado 1, aplicada al agregar o cambiar cantidades. No alterar cotizaciones previas ni cifras comunes al cambiar el mínimo.
- VerificacionSeeder reproduce exactamente el enunciado. SectorSeeder corre después y no modifica los datos comunes ni reutiliza sus identidades.
- No guardar datos de negocio en LocalStorage: solo sesión. Usar textContent o escapar texto antes de innerHTML; Blade siempre escapa entradas.
- CORS con un único origen exacto configurado; nunca *. No concatenar datos del usuario en SQL.
- Excluir .env y secretos de Git; generar JWT_SECRET aleatorio con al menos 32 caracteres. Proveer .env.example sin valores reales.
- La contraseña pública de la semilla solo puede escribirse literalmente en seeders, README y colección de Postman. No copiarla a otros documentos, código de aplicación o pruebas externas a esa colección.

## Verificación y explicación

- Ejecutar las comprobaciones pertinentes a la fase y registrar resultados reales en docs/verificacion.md. Distinguir pruebas aprobadas, fallidas, bloqueadas y pendientes.
- Documentar las pruebas simultáneas de toma de clientes, cupo, duplicados y cambios de etapa; una secuencia de peticiones no acredita concurrencia.
- Mantener trazabilidad entre criterios y evidencias. No declarar que Postman o un servicio funcionó sin haberlo probado.
- Registrar errores reales de IA y su corrección; no inventar tres casos para completar la bitácora. Asociar el commit correctivo cuando exista.
- Explicar el flujo navegador → API → SQL y panel → Eloquent → misma base con ejemplos del cambio realizado, de forma que cualquiera de los dos pueda defenderlo.
- El cambio de requisito del catedrático se documenta antes de implementar: especificación, plan, spec-v2 y migraciones nuevas. No anticipar un requisito no publicado.
