# CRM Ferretería

**Integrantes:** Raúl y Diego.

CRM para organizar clientes, cotizaciones, actividades de seguimiento y ventas. Administrador y supervisores usan el panel; los vendedores trabajan en el frontend conectado a la API. Ambos servicios comparten MySQL. No hay registro público ni inventario.

## Tecnologías y requisitos

PHP 8.4 con zip, fileinfo y pdo_mysql; Composer; MySQL 8.4 LTS; Node.js 24 LTS, npm y Git. Panel: Laravel 13, Breeze Blade y Eloquent. API: Express 5, mysql2, jsonwebtoken, bcryptjs y cors. Frontend: HTML, Bootstrap 5.3 y módulos JavaScript, sin framework.

## Instalación y configuración

Comandos para PowerShell, desde la raíz del repositorio. Use `npm.cmd` para evitar restricciones de npm.ps1.

### Dependencias

```powershell
cd laravel
composer install --no-scripts --no-interaction --prefer-dist
npm.cmd ci
npm.cmd run build
cd ../api
npm.cmd ci
cd ..
```

Se usan los lockfiles existentes. El frontend no necesita instalación ni compilación; no vuelva a generar Laravel o Breeze.

### Variables de entorno

Prepare los perfiles locales solo si faltan, desde la raíz:

```powershell
if (!(Test-Path laravel/.env.testing)) { Copy-Item laravel/.env.testing.example laravel/.env.testing }
if (!(Test-Path api/.env.testing)) { Copy-Item api/.env.testing.example api/.env.testing }
```

Complete los valores en esos archivos, nunca en Git:

| Perfil | Configuración |
| --- | --- |
| Ambos | DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE=crm_ferreteria_test; DB_USERNAME y DB_PASSWORD de cuentas técnicas distintas, limitadas a esa base |
| Laravel | DB_CONNECTION=mysql, APP_URL=http://127.0.0.1:8001, APP_DEBUG=false, SESSION_DRIVER=file, CACHE_STORE=file |
| API | HOST=127.0.0.1, PORT=3001, SPA_ORIGIN=http://127.0.0.1:5500, JWT_EXPIRES_IN=1h y JWT_SECRET aleatorio |

Si APP_KEY está vacía, desde laravel/ ejecute `php artisan key:generate --env=testing`. Conserve una clave existente. Después ejecute `php artisan package:discover --env=testing --no-ansi`.

Para generar JWT_SECRET sin mostrarlo ni reemplazar uno existente, desde api/:

```powershell
@'
const fs = require('node:fs'), { randomBytes } = require('node:crypto');
const file = '.env.testing', text = fs.readFileSync(file, 'utf8');
if (!/^JWT_SECRET=[ \t]*$/m.test(text)) throw Error('Revise el perfil: no se reemplaza una clave existente.');
fs.writeFileSync(file, text.replace(/^JWT_SECRET=[ \t]*$/m, 'JWT_SECRET=' + randomBytes(48).toString('hex')));
'@ | node
```

Los perfiles reales están excluidos de Git; sus ejemplos no llevan credenciales. No use root como cuenta de aplicación.

### Preparar una base nueva

En una instalación nueva, un administrador MySQL debe crear la base vacía crm_ferreteria_test, con utf8mb4/utf8mb4_unicode_ci, y las dos cuentas técnicas configuradas arriba. Laravel necesita SELECT/INSERT/UPDATE/DELETE y CREATE/ALTER/REFERENCES sobre esa base.

La API necesita SELECT en users/productos; SELECT/INSERT/UPDATE en clientes/oportunidades/actividades; SELECT/INSERT/UPDATE/DELETE en oportunidad_productos; SELECT/INSERT en historial_etapas. Conceda sus permisos por tabla después de aplicar las migraciones, sin permisos globales ni de esquema.

**Solo para esa base nueva**, confirme el destino configurado y ejecute desde la raíz:

```powershell
cd laravel
php artisan migrate --env=testing
php artisan db:seed --env=testing
cd ..
```

DatabaseSeeder carga primero VerificacionSeeder y después SectorSeeder. Para cargar únicamente los datos comunes, sustituya el comando de semillas por `php artisan db:seed --class=VerificacionSeeder --env=testing`; no ejecute ambas opciones.

**La base local actual ya contiene datos manuales: no repita esta preparación ni la reinicie.**

## Iniciar para revisión manual

Abra tres terminales, cada una desde la raíz de crm-ferreteria-equipo.

**Laravel**, carpeta laravel/:

```powershell
cd laravel
$env:SESSION_DRIVER='file'
$env:CACHE_STORE='file'
$env:APP_URL='http://127.0.0.1:8001'
php artisan serve --env=testing --host=127.0.0.1 --port=8001
```

**API**, carpeta api/:

```powershell
cd api
node --env-file=.env.testing src/server.js
```

**Frontend**, raíz del repositorio:

```powershell
$env:SPA_API_BASE_URL='http://127.0.0.1:3001/api'
node frontend/serve.mjs
```

URLs: panel **http://127.0.0.1:8001/login**, API **http://127.0.0.1:3001/api**, frontend **http://127.0.0.1:5500**. Use 127.0.0.1, no localhost, para coincidir con CORS. Detenga cada servidor con **Ctrl+C** en su terminal.

## Cuentas de demostración

Contraseña pública de las semillas: **Ventas2026**. Una cuenta editada manualmente conserva su contraseña y estado actuales.

| Rol y acceso | Correos |
| --- | --- |
| Administrador, panel | admin@crm.test |
| Supervisores, panel | sergio@crm.test, sandra@crm.test |
| Vendedores activos, frontend | valeria@crm.test, diego@crm.test, carlos@crm.test |
| Vendedor inactivo, acceso rechazado | ivan@crm.test |
| Supervisores del sector, panel | lucia@ferreteria.test, jorge@ferreteria.test |
| Vendedores del sector, frontend | elena@ferreteria.test, mateo@ferreteria.test |

## Pruebas

Comandos principales; libere los puertos antes de pruebas con servidores propios. No ejecute PHPUnit directamente sobre la base manual poblada.

| Comprobación | Carpeta | Comando |
| --- | --- | --- |
| Laravel, instancia temporal separada en 3307 | Raíz | `node laravel/tests/run-isolated.mjs` |
| API y colección automatizada | api/ | `npm.cmd test` |
| Frontend, unidades sin MySQL | Raíz | `node --test frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/summary.test.mjs` |
| Diseño con API simulada, requiere Edge | Raíz | `node --test frontend/tests/design-browser.test.mjs` |
| Integración real panel/API/frontend | Raíz | `node --test frontend/tests/integration-browser.test.mjs` |

Las pruebas API requieren también los perfiles aislados .env.a6-testing, las dependencias Laravel y PHP_BINARY local; el detalle de bases, evidencias y límites está en [verificación](docs/verificacion.md). El ejecutor Laravel usa el mysqld instalado; MYSQLD_BINARY y PHP_BINARY permiten indicar sus rutas.

Las pruebas automáticas y una API simulada no sustituyen la revisión manual. La integración del rediseño ya se comprobó automáticamente; consulte los resultados y límites en [verificación](docs/verificacion.md#verificación-combinada--7-de-noviembre-de-2026). Siguen pendientes la revisión en pareja y Postman gráfico. Las pruebas manuales sí guardan cambios: use registros propios.

## Documentación

- [Especificación: requisitos, reglas y contrato de los 20 endpoints](docs/especificacion.md).
- [Plan: responsables, estado y pendientes](docs/plan.md).
- [Verificación: resultados, evidencias y uso de IA](docs/verificacion.md).
- [Colección Postman](docs/api.postman_collection.json): importe el JSON, use base_url=http://127.0.0.1:3001/api y ejecute login primero. No exporte tokens vigentes.
