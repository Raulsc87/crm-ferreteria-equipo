# CRM Ferretería

Proyecto final de Programación Web para Raúl y Diego, Universidad Mesoamericana.

## Estado actual

Base del panel creada en laravel/: Laravel 13.39.0 y Breeze Blade 2.4.2. El formulario de login y sus estilos responden por HTTP; GET y POST /register devuelven 404. La conexión MySQL ya pasó SELECT 1 desde Laravel sobre crm_ferreteria, usando una cuenta técnica local. L2 implementado: login/logout, control actual de rol/estado y administración de cuentas exclusivamente para el administrador, verificados en MySQL de pruebas. L3 implementado: catálogo exclusivo del administrador con validaciones y conservación de cotizaciones. L4 implementado: clientes y asignación por ámbito, normalización y cupo concurrente. L5 implementado: Mi equipo exclusivo del supervisor, cartera actual y ventas mensuales de Guatemala con precios históricos. L6 implementado: consulta de oportunidades y reportes por ámbito, vendedor y producto, con cifras comunes verificadas. L7 revisado y completado: recuperación segura de formularios/filtros y errores internos sin detalles técnicos. API A1–A6 implementada, incluido resumen mensual del vendedor. Los veinte endpoints están implementados y la revisión automática A7/A8 de API está aprobada; SPA F1–F5 e integración completa comprobadas automáticamente, con capturas inspeccionadas; revisión en pareja, Postman gráfico e hitos de entrega pendientes. Datos principales conservados. Evidencias en docs/verificacion.md, secciones 12 a 34.

Entorno comprobado: PHP 8.4.24, Composer 2.11.1, Node.js 24.18.1, npm 11.16.0 y MySQL Community Server 8.4.13. Para Laravel se habilitaron las extensiones existentes zip, fileinfo y pdo_mysql. MySQL84 responde localmente. crm_ferreteria no existía y se creó con utf8mb4/utf8mb4_unicode_ci; tiene 15 tablas y ambas semillas verificadas. La base separada crm_ferreteria_test tiene el mismo esquema.

El repositorio local está en main. La etiqueta anotada spec-v1 apunta a bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166, verificado antes de crear Laravel. El avance Laravel/Breeze quedó guardado en ad95384d12d8f92fa258bd132fef87b742ae5d4f, con ambos lockfiles y sin .env, secretos, vendor ni node_modules. La conexión quedó guardada en 6ea8a8133dd120aab07b6aef7d72dc8890f4fcd5. El esquema y sus pruebas quedaron guardados en 2b89b0595d3e92eb616a104b6e57cf2a1704f565. Las semillas y su verificación quedaron guardadas en 4c170978354bc067293ce1a4aedbdb92b2b0c060. L2 quedó guardado en 624aa7ef95cdd0763277365abdd8d8f076d25008. L3 quedó guardado en 8d42a274acf3914cee88154fdbe9d88c95235c83. L4 y su documentación quedaron guardados en 879231885bdf4627c464893e1fb27616abbadd49. L5 quedó guardado en d3bdd6d96bb9d23242f756cdbed71a4ec4133d6a. L6 quedó guardado en a5276c709abff9143cb03e3709602fe32ebcc9a4. L7 quedó guardado en af7a4ab3fc451ebe82f04b20f7a2806936708a2f. A3 quedó guardada en 139e0936f7219b4bb918a7e0cc59219c946c1c5a. La etapa API A1/A2 quedó guardada en dbfaee217f7ecb721ae2882e6b96d463ff6dd68b con el mensaje autorizado «feat: implementar autenticación JWT de vendedores en API». No hay remoto configurado. Las tareas del aula y la revisión en pareja siguen pendientes de evidencia.

El sector ferretería fue confirmado como disponible por el equipo; el registro formal en el aula virtual corresponde a los integrantes.

## Revisión integral y arranque actual — 6 de noviembre de 2026

Laravel, API y SPA se comprobaron juntos con cuentas y datos temporales propios: administrador crea vendedor, supervisor asigna/reasigna cliente, vendedor cotiza y cierra una venta, registra seguimiento y consulta resumen. Las abiertas pasan al nuevo vendedor; las ventas cerradas conservan su crédito y las actividades su autor. Desactivar o cambiar el rol desde el panel invalida el siguiente uso del JWT en la SPA. Se confirmó la misma base/cuentas técnicas en ambos servidores antes de escribir.

Para revisar ustedes sobre **crm_ferreteria_test**, inicie tres terminales. Los perfiles .env.testing deben estar configurados con sus cuentas técnicas independientes; no contienen credenciales de root y no se versionan.

```powershell
# Terminal 1, desde la raíz
cd laravel
php artisan serve --env=testing --host=127.0.0.1 --port=8001
```

```powershell
# Terminal 2, desde la raíz
cd api
node --env-file=.env.testing src/server.js
```

```powershell
# Terminal 3, desde la raíz
$env:SPA_API_BASE_URL='http://127.0.0.1:3001/api'
node frontend/serve.mjs
```

Abra panel **http://127.0.0.1:8001/login**, API **http://127.0.0.1:3001/api** y SPA **http://127.0.0.1:5500**. CORS exige ese origen exacto, no localhost. Detenga cada servidor con Ctrl+C. Los servidores de las pruebas de esta revisión ya se cerraron. Estas URLs usan la base de revisión manual; el perfil A6 de lectura de la sección F5 sigue separado en 3002.

Correcciones comprobadas: la SPA conservaba cartera/ficha antiguas al volver a Clientes; ahora reconsulta lista, disponibles, ocupación y ficha actual, con descarte al cerrar sesión. El selector de vendedor del panel de oportunidades desbordaba con nombres largos a 375 px; se limitó su ancho y se comprobó contra el ancho solicitado, no contra un viewport móvil ampliado. No se añadieron funciones de negocio, dependencias ni cambios de contrato/esquema/permisos.

| Comprobación ejecutada | Resultado |
| --- | --- |
| Laravel completo, instancia temporal aislada | 270 pruebas, 2.633 aserciones |
| API, con colección y concurrencia | 185/185; 108 peticiones y 336 comprobaciones de colección |
| Frontend completo, incluida integración y A6 | 46/46: 43 unidades y tres recorridos de navegador |
| Repetición tras corregir Blade | 31 pruebas Laravel/232 aserciones y recorrido integral 1/1 |
| Compilación de estilos del panel | npm.cmd run build aprobado |

La suite Laravel histórica exige tablas de negocio vacías. **No ejecute phpunit completo sobre la base manual poblada.** Desde la raíz, `node laravel/tests/run-isolated.mjs` inicia temporalmente el mysqld ya instalado en 127.0.0.1:3307, crea exclusivamente su base/cuenta local de prueba, aplica migraciones ordinarias y ejecuta phpunit sin modificar los tests existentes. Comprueba puerto libre, directorio e identidad; al finalizar apaga esa instancia y retira únicamente su directorio ignorado. No cambia el servicio MySQL84/3306 ni las tres bases conservadas; no usa fresh, resets o truncados. Requiere los perfiles locales existentes y el binario MySQL instalado; MYSQLD_BINARY y PHP_BINARY permiten indicar sus rutas. Para repetir solo la vista afectada: `node laravel/tests/run-isolated.mjs --filter=OpportunityReportsTest`.

Desde api/, `npm.cmd test` ejecuta también la colección con fetch HTTP y scripts pm; no es Postman gráfico. Desde la raíz, la suite frontend completa es:

```powershell
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/summary.test.mjs frontend/tests/browser.test.mjs frontend/tests/summary-browser.test.mjs frontend/tests/integration-browser.test.mjs
```

Use puertos 8001/3001/3002/5500 libres y ejecute suites que escriben en la base manual de forma secuencial. Los ejecutores verifican destino, crean fixtures con prefijos aleatorios, retiran solo esos registros y comparan huellas completas. El nuevo recorrido integral usa panel HTTP con cookies/CSRF activos, sesiones de navegador separadas por rol, API real y MySQL; su router bajo laravel/tests/Support solo se sirve durante la prueba y verifica base/cuenta por petición. Sus sesiones PHP se guardan en su propio directorio temporal. Ninguna base existente se vacía ni se vuelve a sembrar.

Inspección ejecutada: capturas de formularios de cuentas/productos/clientes/asignación, listas, Mi equipo, oportunidades y reportes del panel, y resumen/actividades de SPA, en escritorio y 375 px; regresión previa de errores/XSS/cargas y fechas también aprobada. Las tablas del panel conservan desplazamiento horizontal interno, no de toda la página. Las capturas se inspeccionaron y los perfiles temporales se retiraron; no contienen contraseñas escritas ni hashes. Esto **no equivale a revisión manual en pareja ni a Postman gráfico**.

Entregables contrastados con páginas 20–21 del enunciado: documentos P1–P4, aplicaciones, ejemplos sin secretos, lockfiles y colección con los 20 endpoints presentes. P5 tiene errores reales y commits correctivos: IA-11/12/13 en 055398aead74b337d50b5ee5b6d81576ca320ac5, IA-14 en e7299702a56ed880c2238767d2dc183869d2c427; los dos hallazgos de esta revisión se guardan en su commit de cierre. spec-v1 es anterior a las aplicaciones y permanece intacta.

**Antes de entregar:** hagan juntos el recorrido y la explicación de cada pieza, revisen Postman gráfico y prueben edición/validaciones y columnas de tablas en su navegador. Git solo acredita autor Raul Soto; no se atribuye participación a Diego, que deberá aportar sus propios commits reales. No hay remoto configurado ni acceso del catedrático comprobado, registro del aula acreditado o etiqueta entrega-final; preparar esos hitos requiere otra instrucción. El cambio de requisito/spec-v2 solo procede cuando el catedrático lo publique. Para la defensa, acuerden aparte un entorno exclusivo con solo VerificacionSeeder, sin reiniciar principal/manual/A6. No se ejecutó aquí el comando destructivo que el enunciado describe para una base de defensa nueva.

Detalle de pruebas, límites e incidentes en docs/verificacion.md, sección 34. Los apartados fechados siguientes conservan la historia de cada etapa; este apartado expresa el estado actual y sustituye sus pendientes de implementación/integración ya resueltos.

## Qué construiremos

- Panel Laravel para administrador y supervisor.
- API Express para vendedores, con SQL parametrizado escrito a mano.
- SPA con HTML, Bootstrap y módulos de JavaScript.
- Una base MySQL compartida, cuyo esquema pertenece a las migraciones de Laravel.

La regla propia establece una cantidad mínima de venta por producto, configurada por el administrador. El mínimo común es 1; el catálogo del sector puede incluir productos con un mínimo mayor. La API comprueba el mínimo al agregar una línea o modificar su cantidad.

## Archivos actuales

| Archivo | Función |
| --- | --- |
| AGENTS.md | Reglas para Codex, OpenCode u otro agente que trabaje en este repositorio |
| .gitignore | Exclusiones iniciales para secretos, dependencias y archivos generados |
| docs/enunciado.pdf | Copia sin cambios del enunciado original |
| docs/especificacion.md | Requisitos, modelo, contrato, decisiones y criterios de aceptación |
| docs/plan.md | Fases, tareas, responsables propuestos y encargos a la IA |
| docs/verificacion.md | Matriz y bitácora inicial, sin resultados inventados |

laravel/ contiene el panel, dependencias y lockfiles. api/ contiene los veinte endpoints. frontend/ contiene F1 acceso, F2 Clientes/cartera, F3 Oportunidades/cotizaciones, F4 Actividades y F5 Resumen. docs/api.postman_collection.json conserva las 108 peticiones de la API; revisión gráfica pendiente. Integración e inspección de capturas aprobadas; siguen pendientes Postman gráfico, revisión en pareja y entrega.

## SPA: primera etapa de la fase 6

Primera etapa, guardada en e7299702a56ed880c2238767d2dc183869d2c427: F1 y base de F6, acceso, sesión y navegación. La etapa siguiente implementa F2 Clientes/cartera, descrita abajo. Oportunidades, Actividades y Resumen se implementaron posteriormente en F3/F4/F5. La asignación e integración de fases 6/9 se comprobaron después, en la sección de revisión integral; las validaciones humanas y entrega siguen pendientes.

Desde la raíz, inicie la API de pruebas en una terminal:

```powershell
cd api
node --env-file=.env.testing src/server.js
```

En otra terminal, desde la raíz:

```powershell
node frontend/serve.mjs
```

Abra **http://127.0.0.1:5500**. La API es http://127.0.0.1:3001/api y utiliza crm_ferreteria_test con su cuenta técnica independiente. Detenga cada servidor con Ctrl+C. Los servidores usados por las pruebas automatizadas se cerraron al terminar.

La URL pública predeterminada se configura en frontend/js/config.js; no contiene secretos. El servidor estático permite sobrescribir únicamente esa URL con SPA_API_BASE_URL, sin editar archivos (ejemplo A6 en F5). SPA_ORIGIN del perfil API debe coincidir exactamente con http://127.0.0.1:5500; localhost es otro origen. Para usar otro perfil, compruebe su base y CORS antes de operar. No copie credenciales MySQL ni JWT_SECRET al frontend.

Use una cuenta vendedora activa del procedimiento de semillas de este README. Administradores, supervisores y cuentas inactivas reciben 403. El acceso conserva únicamente token y usuario público (id, nombre y correo) en la clave crm-ferreteria.sesion de LocalStorage. La contraseña se borra del formulario al enviar y no se guarda en estado ni almacenamiento. Cerrar sesión elimina esa clave; no existe un endpoint de revocación de JWT. Al recargar se verifica el acceso con GET /productos, o con GET /reportes/resumen si está en #resumen, descartando esa respuesta de comprobación. Un 401 protegido limpia la sesión y vuelve al acceso; una respuesta antigua no cierra una sesión nueva.

| Archivo | Función |
| --- | --- |
| frontend/index.html | Plantillas de acceso, carga y navegación; Bootstrap local |
| frontend/js/config.js | URL pública de la API |
| frontend/js/app.js | Estado, eventos delegados y coordinación del acceso |
| frontend/js/api.js | JSON, Bearer, 204, errores por campo/conexión y 401 |
| frontend/js/session.js | Cargar, validar y quitar solo la sesión propia |
| frontend/js/view.js | Render desde estado; datos recibidos mediante textContent |
| frontend/serve.mjs | Servidor estático local limitado a HTML, js/ y css/ |
| frontend/tests/ | Pruebas Node y navegador existente, sin paquetes nuevos |

Bootstrap **5.3.8** se conserva localmente, con licencia MIT en css/LICENSE-bootstrap.txt. Se descargó el CSS de la [distribución oficial](https://getbootstrap.com/docs/5.3/getting-started/download/) y se comprobó su SHA-384 publicado. No se requiere compilación, npm ni CSS propio; tampoco plugins JavaScript de Bootstrap.

Pruebas desde la raíz, con los puertos 3001 y 5500 libres:

```powershell
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/browser.test.mjs
```

Resultado de la primera etapa: **9/9 pruebas**, cuando solo se hacían login y lecturas. El ejecutor de navegador se amplió después para F2 y ahora crea y retira fixtures propios; use el procedimiento actualizado de abajo. Requiere las dependencias existentes de api/, su perfil .env.testing y Edge instalado; SPA_BROWSER permite indicar otro ejecutable Chromium existente. Comprueba base/cuenta/origen antes de acceder. Las pruebas de 204 y ciertos fallos usan dobles; los textos maliciosos 422/500 del acceso se inyectan deliberadamente para comprobar render seguro. No se instala una herramienta de pruebas nueva.

Se inspeccionaron capturas del acceso y navegación a 1280 y 375 px y se comprobó ausencia de desbordamiento horizontal en esos estados. Quedan pendientes la revisión manual en pareja, el panel/Postman gráfico y la revisión integral de la SPA. Las bases principal, manual y A6 conservaron filas y permisos. Evidencia de acceso y fallo corregido de sesión en docs/verificacion.md, sección 29; F2 en sección 30.

Recorrido: formulario en index.html → evento delegado en app.js → POST /auth/login mediante api.js → sesión pública y estado → view.js reconstruye la vista con texto seguro. Las peticiones protegidas posteriores añaden Bearer; la API vuelve a consultar rol/estado en MySQL. El panel continúa usando Eloquent sobre la misma base configurada por perfil.

## SPA: Clientes y cartera (F2, fase 6)

En **Mi cartera**, usted puede buscar por nombre o NIT, abrir una ficha, crear y editar clientes. El formulario conserva lo escrito cuando la API devuelve un error y muestra sus errores 422 junto al campo. Use `CF` para consumidor final; un ejemplo de NIT válido es `4521817-K`. Un teléfono válido es `55551234`, también escrito como `+502 (5555)-1234`. Son ejemplos de formato: si ya existen, la API rechaza el duplicado. La API aplica normalización, módulo 11, unicidad y autorización definitivos.

En **Disponibles** se muestran solo nombres y el botón para tomar (el id identifica la acción). Durante el envío se deshabilitan los botones y se impiden peticiones repetidas. Si otro vendedor ya lo tomó o la cartera está llena, aparece el mensaje 409 de la API; se actualizan disponibles y ocupación. Tras crear, editar o tomar correctamente se recargan ambas listas y el indicador. **Actualizar listas** permite consultar otra vez después de una asignación externa.

La ocupación `clientes / máximo` procede únicamente de `cartera` en GET /reportes/resumen, sin guardar el resumen; su pantalla posterior se documenta en F5. Los datos de clientes y borradores viven en memoria, se descartan al cerrar sesión y nunca se guardan en LocalStorage. Al buscar, solo la última petición de la sesión actual puede mostrar resultados, aunque una anterior termine después. Un 401 protegido conserva el regreso al acceso de F1.

Archivos añadidos: `frontend/js/clients.js` coordina peticiones y estado; `clients-view.js` construye listas, ficha y formularios con texto seguro. `index.html` aporta plantillas y ejemplos; `app.js` delega submit/input/click y reutiliza `api.js`/`session.js`; `view.js` conecta el render del módulo. Crear envía solo nombre/nit/telefono/correo; editar envía solo los campos cambiados; tomar envía POST sin cuerpo. No hay eliminación, liberación ni reasignación desde esta SPA.

Use los mismos comandos de inicio y URL 5500 descritos arriba, con API testing en 3001 y CORS exacto. Para probar manualmente, entre con un vendedor activo: busque un nombre/NIT, abra y edite una ficha; cree un cliente con teléfono único; consulte Disponibles y tome uno si tiene cupo. Esas operaciones guardan cambios reales en la base de pruebas: conserve sus registros manuales. Oportunidades, Actividades y Resumen se describen en F3/F4/F5.

Pruebas automatizadas desde la raíz, con 3001 y 5500 libres:

```powershell
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/browser.test.mjs
```

Resultado al cierre de F2: **15/15 pruebas** (procedimiento completo actualizado en F3): ocho existentes, seis nuevas del estado de clientes y un caso de navegador ampliado con múltiples comprobaciones reales. `clients-browser.mjs` usa el auxiliar Laravel existente para cuentas/hash temporales y una cuenta de control limitada a crm_ferreteria_test; verifica DATABASE(), CURRENT_USER() y permisos antes de escribir/limpiar. Crea clientes con prefijo aleatorio, retira únicamente esos IDs/prefijo y cuentas propias, y compara la huella de todas las filas preexistentes. No carga semillas ni reinicia bases; los autoincrementales de pruebas pueden avanzar. No ejecute este procedimiento contra desarrollo ni cambie sus perfiles para apuntar allí.

Se verificaron búsqueda por nombre/NIT, CF y teléfono normalizados, edición parcial/correo vacío, errores 422/409/404, ocupación 0→1→2 y 10/10, doble clic al tomar y búsquedas HTTP realmente solapadas. Capturas de listado, ficha, formulario con errores, disponibles y cupo inspeccionadas a 1280/375 px, sin desbordamiento horizontal en esos estados. La prueba de nombre con HTML se muestra como texto. Los fallos de conexión/listado/resumen y descarte de respuestas al cerrar sesión se cubren con dobles; el acceso conserva sus pruebas reales de 401 y red desconectada.

Pendientes: revisión manual en pareja, asignación desde la interfaz del panel hacia esta cartera, Postman gráfico y revisión integral. No se modificaron API, Laravel, contratos, permisos ni dependencias. Evidencia detallada en docs/verificacion.md, sección 30.

## SPA: Oportunidades y cotizaciones (F3, fase 9)

Abra **Oportunidades** en la misma SPA de http://127.0.0.1:5500 (API de pruebas 3001; comandos de arranque arriba). El embudo muestra cuatro columnas abiertas y una lista de cerradas; el filtro consulta GET /oportunidades?etapa=. Cada tarjeta muestra cliente, título, etapa/probabilidad, total, cierre en Guatemala y motivo cuando existe. Las respuestas antiguas no reemplazan el filtro ni el detalle actual.

**Crear oportunidad** permite seleccionar un cliente de su cartera y escribir el título. La oportunidad comienza en prospecto. Desde el detalle puede editar el título, agregar un producto activo con cantidad, cambiar cantidades y retirar líneas. Se conservan los valores ante errores, con mensajes junto a los campos. El precio mostrado en el selector es el del catálogo; el precio cotizado, subtotal y total proceden de las líneas devueltas por la API. La SPA no envía precios ni hace aritmética de cotizaciones; tras DELETE 204 consulta otra vez el detalle.

Las opciones de etapa siguen la especificación: prospecto → calificado → propuesta → negociación → ganada; desde cualquier abierta se permite perdida. Perder exige motivo. Ganar/perder presentan **Confirmar cierre** y **Cancelar cierre** antes de enviar PATCH. Un rechazo conserva el estado confirmado por la API y el borrador. Durante la operación se deshabilitan los controles del módulo. Una cerrada muestra únicamente consulta, con precios históricos e historial en hora de Guatemala; nunca pide la ficha privada del cliente, incluso si salió de su cartera.

| Archivo | Función en F3 |
| --- | --- |
| frontend/js/opportunities.js | Estado, contadores contra respuestas atrasadas, consultas, cuerpos del contrato y confirmación |
| frontend/js/opportunities-view.js | Embudo, ficha, líneas, errores, confirmación e historial como texto seguro; quetzales y hora de Guatemala |
| frontend/index.html | Plantillas y formularios de F3 |
| frontend/js/app.js y view.js | Eventos delegados y render del módulo, reutilizando api.js y sesión |
| frontend/tests/opportunities.test.mjs | Nueve pruebas de estado/contrato con dobles |
| frontend/tests/opportunities-browser.mjs | Recorridos F3 contra API y MySQL reales; invocado por browser.test.mjs |

Agregar: submit delegado → opportunities.add → api.js envía producto_id/cantidad → API comprueba dueño, activo y mínimo, copia el DECIMAL del catálogo → MySQL → respuesta con líneas/total → estado → render. Cambiar etapa: formulario y confirmación si cierra → PATCH etapa/motivo → API confirma etapa/cierre UTC/historial en una transacción → detalle e historial actualizados y listado recargado. Los métodos SQL están en api/src/opportunities.js, opportunity-store.js y opportunity-queries.js; no se cambiaron en esta etapa.

Pruebas completas frontend desde la raíz (3001 y 5500 libres):

```powershell
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/browser.test.mjs
```

Resultado al cierre de F3 **24/24** (procedimiento completo actualizado en F4): catorce unidades anteriores, nueve nuevas y un caso de navegador ampliado con controles F1–F3. Se reutiliza Edge y el auxiliar Laravel de cuentas/hash temporales. Antes de escribir y limpiar se comprueba base/cuenta/permisos de pruebas. Fixtures propios por IDs/prefijo; las huellas de las tres bases y sus filas manuales permanecen iguales. No se usan semillas, reinicios ni nuevas dependencias. El ejecutor ahora cancela retrasos artificiales al cerrar conexiones y no retrasa OPTIONS; la ejecución final terminó sin el mensaje de error de apagado observado en una ejecución anterior.

Comprobados por API real: crear/editar, agregar/modificar/retirar líneas, mínimo 422, duplicado 409, producto inactivo 422, transición inválida 422, ganar sin productos 422, perder sin motivo 422 y mutaciones de cerradas 409. La cotización conservó **Q12.34 × 6 = Q74.04** y cinco entradas de historial después de cambiar precio/mínimo/activo del producto temporal. También se verificaron recursos ajenos 404, venta histórica tras reasignar un cliente temporal, filtros y detalles atrasados. Los cierres rechazados no aumentaron historial. Las carreras transaccionales SQL siguen acreditadas por las pruebas A4 existentes, no por estos recorridos secuenciales de F3.

Se inspeccionaron capturas en escritorio y pantalla estrecha (1280 y 375 px) del embudo, detalle, errores, confirmación y consulta de cerradas; sin desplazamiento horizontal en los estados capturados. No sustituye la revisión en pareja. Siguen pendientes integración panel → SPA todavía no comprobada, revisión manual del panel/Postman, revisión integral; F4/F5 se documentan en los apartados siguientes. La fase 9 no está completa. Evidencia, límites y preservación en docs/verificacion.md, sección 31.

## SPA: Actividades de seguimiento (F4, fase 9)

En **Mi cartera**, abra la ficha de un cliente y pulse **Registrar actividad**. Seleccione llamada, reunión o tarea, escriba la descripción y, si lo desea, el vencimiento. Se conservan los valores ante errores y se muestran los mensajes junto a tipo, descripción o vencimiento. La API valida definitivamente el contrato y la cartera actual.

El campo de vencimiento siempre representa **America/Guatemala**, aunque la computadora esté en otra zona. Puede dejarlo vacío o indicar una fecha pasada. La SPA omite vence_en cuando está vacío; con fecha, usa Intl con esa zona para convertir a ISO UTC con Z. No interpreta datetime-local mediante la zona del equipo. Por ejemplo, `2031-04-09 08:30` de Guatemala se envía como `2031-04-09T14:30:00.000Z`. El listado vuelve a mostrar las fechas en Guatemala.

En **Actividades**, consulte todas, pendientes o completadas. Se muestran cliente, tipo, descripción, vencimiento y estado; una pendiente vencida lleva texto y borde rojo según `vencida` recibido de la API. La SPA no calcula ese indicador con su reloj. Puede marcar como completada o pendiente; PATCH envía únicamente `{ completada: true }` o `{ completada: false }`. Los controles se deshabilitan durante el envío y se recarga el listado después del éxito. Una respuesta de filtro atrasada no sustituye resultados recientes.

Si una reasignación retira el acceso, el 404 se explica y se vuelve a consultar la lista y la cartera/ficha afectada. El nuevo propietario puede completar la actividad conservando al autor original en MySQL; no se envía vendedor_id ni se muestra en la SPA. Los datos y borradores viven en memoria, se limpian con la sesión y no se guardan en LocalStorage.

| Archivo | Función en F4 |
| --- | --- |
| frontend/js/activities.js | Estado, consultas, alta/PATCH, respuestas atrasadas y conversión/formato de fecha con zona explícita |
| frontend/js/activities-view.js | Formulario y lista como texto seguro, errores, estado vencida y botones |
| frontend/js/clients-view.js e index.html | Botón y formulario dentro de la ficha del cliente; plantillas del listado |
| frontend/js/app.js y view.js | Eventos delegados, render, limpieza de sesión y actualización por pérdida de acceso |
| frontend/tests/activities.test.mjs | Ocho pruebas de estado/contrato/fechas con dobles |
| frontend/tests/activities-browser.mjs | Recorridos F4 con API/MySQL reales y navegador configurado en Tokio |

Inicio sin cambios: API de pruebas 3001 y SPA http://127.0.0.1:5500 con CORS exacto, mediante los dos comandos de las primeras secciones; Ctrl+C detiene cada servidor. Para revisión manual, cree una actividad de cada tipo desde una ficha propia, deje un vencimiento vacío, use uno futuro y otro pasado; consulte filtros y cambie completada/pendiente. Estas operaciones guardan registros reales de revisión: consérvelos.

Pruebas completas frontend desde la raíz, con 3001/5500 libres:

```powershell
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/browser.test.mjs
```

Resultado al cierre de F4 **32/32** (recorrido de escritura, no incluido en la comprobación F5 de lectura): 31 unidades y un caso de navegador ampliado con múltiples controles F1–F4. Las ocho nuevas unidades cubren fechas inválidas/vacías, contrato, borradores, booleanos, doble envío, filtros atrasados y 404. Se comprobó API real para los tres tipos, vencimiento vacío/futuro/pasado, filtros, completar/reabrir, tipo/descripción inválidos y recursos ajenos. Con navegador en Asia/Tokyo se verificaron almacenamiento UTC y presentación de Guatemala. Una reasignación temporal produjo 404 y retirada de la vista; el nuevo dueño completó la actividad conservando el autor histórico. Dos clics generaron solo un PATCH; dos GET de filtro realmente solapados conservaron el resultado más reciente.

El procedimiento reutiliza Edge y el auxiliar Laravel de cuentas/hash temporales; verifica base/cuenta/permisos antes de fixtures propios y limpia solo sus IDs/prefijos. Las huellas de las tres bases y sus registros manuales quedaron iguales. Se inspeccionaron capturas de formulario con errores y listas pendientes/vencidas/completadas/pérdida de acceso a 1280/375 px, sin desbordamiento en esos estados. Dos fallos del propio recorrido de pruebas y sus correcciones están registrados en verificación, sección 32; la última ejecución completa pasó.

Registrar: ficha → formulario/evento en app.js → activities.save convierte fecha y envía solo tipo/descripcion/vence_en opcional mediante api.js → API comprueba cartera y asigna autor desde JWT → MySQL → estado/render. Cambiar estado: botón delegado → activities.toggle → PATCH booleano → API revalida cartera actual sin cambiar autor → listado recargado y render seguro.

No se cambiaron API, Laravel, contratos, permisos ni dependencias. Pendientes: revisión en pareja, integración panel → SPA aún no comprobada y revisión integral final (F5 se describe a continuación). Fase 9 completa pendiente. Evidencia en docs/verificacion.md, sección 32.

## SPA: Resumen del vendedor (F5, fase 9)

**Resumen** inicia con el mes actual de Guatemala y consulta GET /reportes/resumen?mes=AAAA-MM. Muestra ventas ganadas, total vendido y pronóstico en quetzales, y cartera actual clientes/máximo. Ventas y total pertenecen al mes seleccionado; el pronóstico incluye todas las oportunidades abiertas, sin filtro mensual. Los datos vienen de la API y no se recalculan en JavaScript ni se envía vendedor_id.

Cambiar el mes consulta automáticamente; **Actualizar resumen** permite repetir. Al regresar desde Clientes u Oportunidades se vuelve a consultar. Durante carga o error se ocultan cifras anteriores y, al recibir datos, se muestra su mes confirmado. Los ceros se presentan como 0 y Q0.00. Una respuesta atrasada no reemplaza el mes reciente; al salir de Resumen se invalida su consulta pendiente. Su cartera actualiza el indicador compartido de Clientes e invalida lecturas anteriores de ocupación. No se guardan reportes en LocalStorage.

La configuración predeterminada sigue siendo API de revisión manual 3001. Para contrastar **solo el resumen común** con la base aislada A6 ya existente, inicie en una terminal:

```powershell
cd api
node --env-file=.env.a6-testing src/server.js
```

En otra terminal, desde la raíz:

```powershell
$env:SPA_API_BASE_URL='http://127.0.0.1:3002/api'
node frontend/serve.mjs
```

Abra **http://127.0.0.1:5500/#resumen** y use las cuentas vendedoras comunes documentadas en semillas. La API A6 está limitada a SELECT en users/clientes/oportunidades/oportunidad_productos; no utilice ese perfil para módulos de escritura o catálogo. Recargar #resumen verifica la sesión con el propio endpoint del resumen, sin pedir productos ni ampliar permisos. CORS conserva exactamente http://127.0.0.1:5500. Detenga cada servidor con Ctrl+C. Para volver al perfil normal 3001, retire SPA_API_BASE_URL de esa terminal con `Remove-Item Env:SPA_API_BASE_URL -ErrorAction SilentlyContinue` antes de iniciar el servidor estático habitual.

| Archivo | Función en F5 |
| --- | --- |
| frontend/js/summary.js | Mes inicial con zona explícita, estado/carga, consultas, descarte de respuestas atrasadas y publicación de ocupación |
| frontend/js/summary-view.js | Presentación segura de mes confirmado, cifras, ceros y quetzales |
| frontend/index.html | Selector y cuatro indicadores, explicación mensual/pronóstico y estados de error/carga |
| frontend/js/app.js y view.js | Eventos delegados, recarga al entrar/cambiar mes, limpieza de sesión y render |
| frontend/js/clients.js | Actualización compartida de cartera y descarte de consultas anteriores de ocupación |
| frontend/serve.mjs | Selección pública de URL API por variable, sin exponer credenciales ni el resto del entorno |
| frontend/tests/summary.test.mjs y summary-browser.test.mjs | Estado/configuración y recorrido de navegador contra A6, solo lecturas/login |

Comprobación F5 desde la raíz, con 3002 y 5500 libres (sin el ejecutor anterior que crea fixtures en revisión manual):

```powershell
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/summary.test.mjs frontend/tests/summary-browser.test.mjs
```

Resultado **41/41**: las 31 unidades previas, nueve nuevas y un caso de navegador con múltiples comprobaciones de A6. No se repitieron los recorridos de escritura F1–F4, suites de backend/panel, semillas ni preparación de bases. El ejecutor A6 verifica base/cuenta/permisos y recuentos comunes; solo hace login, SELECT y peticiones GET. Las huellas y permisos de las tres bases quedaron idénticos antes/después.

| Vendedor / mes | Ventas | Total | Pronóstico | Cartera |
| --- | ---: | ---: | ---: | ---: |
| Valeria / 2026-10 | 2 | Q9,250.00 | Q2,512.88 | 3/10 |
| Valeria / 2026-11 | 1 | Q3,600.00 | Q2,512.88 | 3/10 |
| Diego / 2026-10 | 1 | Q6,000.00 | Q112.50 | 2/10 |
| Carlos / 2026-10 | 1 | Q7,200.00 | Q4,125.75 | 9/10 |

Cifras contrastadas desde la SPA contra la API real de A6. Enero de 2099 de Valeria muestra 0 ventas y Q0.00, manteniendo pronóstico y cartera actuales; ceros en todos los campos se cubren además con dobles, sin inventar otra cuenta común. Se verificaron mes inválido 400, red desconectada, JWT vencido 401, dos consultas solapadas, restauración de sesión en #resumen y recarga al volver desde Clientes/Oportunidades.

Para comprobar la frontera mensual, solo el reloj de la página de pruebas se fijó en 2026-11-01T02:30:00Z con navegador en Asia/Tokyo: allí ya era noviembre, Guatemala aún octubre y el selector inició 2026-10. No se cambió el reloj del equipo ni el de la API/MySQL. Se inspeccionaron capturas a 1280/375 px de cifras, ceros y error de conexión, sin desplazamiento horizontal en esos estados. Una primera aserción del ejecutor recibió 304 por caché; se desactivó únicamente la caché del navegador de pruebas para acreditar el solapamiento HTTP y la ejecución final pasó.

Recorrido: selector/change o submit delegado en app.js → summary.load → api.js añade Bearer y envía solo mes → API calcula en SQL para el vendedor autenticado → estado con mes confirmado → summary-view.js muestra cifras y quetzales. Un 401 conserva la limpieza de sesión existente. API, Laravel, contratos, datos y permisos no cambiaron.

F5 implementado; quedan pendientes revisión integral final, revisión en pareja e integración panel → SPA aún no comprobadas. La fase 9 no se declara cerrada por esta etapa. Evidencia en docs/verificacion.md, sección 33.

## Entorno exigido por el enunciado

PHP 8.4, Composer, Laravel 13 con Breeze Blade, MySQL 8.4 LTS, Node.js 24 LTS, Express 5, Bootstrap 5.3, Git y Postman.

Antes de instalar se comprueban las versiones y compatibilidad. Si una herramienta no permite cumplir la combinación exigida, se documenta el impedimento y se consulta al catedrático; no se cambia de tecnología en silencio.

## Primer paso en la computadora del equipo

1. Extraer la carpeta crm-ferreteria y abrirla en VS Code.
2. Leer AGENTS.md, docs/especificacion.md y docs/plan.md.
3. Revisar las decisiones de negocio; cualquier corrección se documenta antes de programar.
4. Crear o vincular el repositorio real, con la cuenta y autoría correctas de cada integrante, cuando se autorice.
5. Tras revisar la especificación, crear el commit correspondiente y la etiqueta spec-v1 antes de implementar el negocio.
6. Comenzar por la inspección del entorno, como indica la fase 1 del plan.

## Instalación, arranque y endpoints

Para abrir el panel ya preparado, desde la raíz del repositorio:

```powershell
cd laravel
php artisan serve --host=127.0.0.1 --port=8000
```

Abra http://127.0.0.1:8000/login. Si el servidor de desarrollo ya está ejecutándose y ocupa ese puerto, abra la dirección directamente. Un servidor iniciado en su terminal se detiene con Ctrl+C. Para guardar cambios manuales de catálogo únicamente en la base de pruebas, use el procedimiento L3 del puerto 8001 descrito más abajo.

Los recursos ya están compilados. Tras modificar estilos o JavaScript:

```powershell
npm.cmd install
npm.cmd run build
```

Para reproducir las dependencias en una copia futura del proyecto, use `composer install --no-scripts` y `npm.cmd ci` dentro de laravel/. Si falta .env, cópielo de .env.example y ejecute `php artisan key:generate`; después ejecute `php artisan package:discover --no-ansi` y `npm.cmd run build`. No sobrescriba una clave existente al volver a instalar dependencias. .env está excluido de Git; el ejemplo tiene APP_KEY, usuario y contraseña de MySQL vacíos.

Conexión local: MySQL en 127.0.0.1:3306/crm_ferreteria, usuario técnico crm_laravel@127.0.0.1. Su contraseña aleatoria se guarda únicamente en laravel/.env, excluido de Git; el ejemplo sigue sin secretos. La contraseña root se introdujo en una ventana local enmascarada y no se guardó. La cuenta técnica es independiente de las futuras cuentas del CRM y tiene SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER y REFERENCES únicamente sobre esa base, sin GRANT OPTION, privilegios globales efectivos ni DROP. No use root en Laravel.

Se mantienen SESSION_DRIVER=file, CACHE_STORE=file y QUEUE_CONNECTION=sync. Las migraciones autorizadas ya están aplicadas. No repita la carga sobre datos existentes ni ejecute pruebas con RefreshDatabase. phpunit.xml fija crm_ferreteria_test; las credenciales están en .env.testing local. No hay archivo SQLite; los scripts de creación y setup se ajustaron para quitar SQLite y migraciones automáticas. En otra computadora, copie el ejemplo y configure sus credenciales locales sin compartirlas; no dé por existente esta instalación MySQL.

La creación inicial se hizo con `composer create-project laravel/laravel laravel "^13.0" --no-scripts --no-interaction --prefer-dist`; tras habilitar fileinfo se completó con `composer install --no-scripts --no-interaction --prefer-dist`. Breeze se instaló con `composer require laravel/breeze --dev --no-scripts --no-interaction`, descubrimiento explícito y `php artisan breeze:install blade --no-interaction --no-ansi`. No vuelva a generar Breeze sobre estos archivos: restauraría registro y borrado de cuentas. Se retiró el plugin @tailwindcss/vite sobrante mediante npm.cmd uninstall --save-dev; el panel usa Tailwind 3 y Alpine del stack Blade. Bootstrap corresponde a la futura SPA.

El panel usa Breeze y vistas Blade, sesiones en archivos y MySQL mediante Eloquent. El flujo de acceso y sus permisos se describe en L2 más abajo. No hay rutas de registro público ni eliminación de cuentas. El tramo HTTP → API → SQL está comprobado para login/productos/clientes/oportunidades/actividades; la integración con SPA sigue pendiente.

Este apartado conserva la preparación histórica del panel. La guía actual de las tres piezas está en Revisión integral y arranque actual, y la tabla contractual consolidada en A7/A8. API, SPA y consultas L6 están implementadas.

## Esquema aplicado — 1 de noviembre de 2026

Se contrastó la sección 6 del enunciado (páginas 5–7). Se aplicaron diez migraciones en crm_ferreteria y crm_ferreteria_test: tres originales de Laravel y siete nuevas con prefijo 2026_11_01, para extender users y crear productos, clientes, oportunidades, oportunidad_productos, historial_etapas y actividades. La migración original de users y las auxiliares se conservan sin cambios.

Ambas bases tienen estructura idéntica: 15 tablas InnoDB, 10 claves foráneas y 7 CHECK activos. Al terminar aquella etapa, todas las tablas quedaron con cero filas salvo migrations, que registra diez entradas del lote 1. La etapa posterior de semillas descrita abajo añadió los datos de desarrollo. La base de pruebas y su cuenta crm_laravel_test@127.0.0.1 se crearon por separado; su contraseña aleatoria está solo en .env.testing, excluido de Git. El ejemplo tiene credenciales vacías. La conexión MySQL fija UTC (+00:00).

Comandos para comprobar el estado y repetir únicamente las pruebas de integridad, desde laravel/:

```powershell
php artisan migrate:status
php artisan migrate:status --env=testing
php vendor/bin/phpunit --filter=SchemaIntegrityTest
```

La aplicación de migraciones se realizó invocando migrate mediante el kernel de Artisan después de comprobar DATABASE() y CURRENT_USER() en cada conexión; equivale a php artisan migrate --no-interaction y php artisan migrate --env=testing --no-interaction. No se ejecutaron fresh, rollback de migraciones, seeders, DROP, TRUNCATE ni DELETE.

SchemaIntegrityTest pasó 40 casos y 61 aserciones: duplicados, varios NIT NULL, precios, cantidades, mínimos, teléfonos, relación rol/supervisor y cierre. También verificó referencias inexistentes, valores predeterminados y las reglas de cascada instaladas, estas últimas mediante metadatos sin borrar filas. TestCase comprueba DATABASE() antes de iniciar los traits y bloquea mecanismos de reinicio. Las filas temporales se revirtieron con DatabaseTransactions; los contadores autoincrementales pueden avanzar. En aquella etapa las pruebas heredadas de Breeze estaban bloqueadas; L2 las sustituyó por casos compatibles con las rutas vigentes. El resultado de integridad por sí solo no acredita autenticación ni módulos.

La base protege referencias, unicidad, precios positivos, cantidades 1–999, teléfono compacto y coherencia entre etapa, motivo y cierre. Las aplicaciones deberán validar rol/estado del supervisor y vendedor, normalización y dígito verificador del NIT, correo, textos, precisión decimal antes del almacenamiento, mínimo vigente del producto, propiedad, cupo, transiciones, inmutabilidad, precio del catálogo e historial transaccional. El panel escribirá mediante Eloquent y la API mediante SQL parametrizado sobre la misma base; esos flujos de negocio siguen pendientes.

Detalles y evidencias en docs/verificacion.md, sección 14. Referencias técnicas: [claves foráneas de MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html) y [ALTER TABLE](https://dev.mysql.com/doc/refman/8.4/en/alter-table.html).

## Semillas verificadas — 1 de noviembre de 2026

- VerificacionSeeder reproduce la sección 11 del PDF: cuentas/equipos/estados, cinco productos con mínimo 1, clientes, oportunidades, precios históricos, fechas UTC, 43 pasos de historial y cuatro actividades. Las relaciones usan los identificadores devueltos por las inserciones.
- SectorSeeder añade dos supervisores y dos vendedores propios, cinco productos, siete clientes, seis oportunidades (una por etapa), diecinueve pasos de historial y cuatro actividades. Usa correos @ferreteria.test, teléfonos y NIT distintos. Cada vendedor del sector tiene tres clientes; uno queda disponible.
- DatabaseSeeder ejecuta primero VerificacionSeeder y después SectorSeeder en una transacción. Se retiró Test User. SeedData comparte únicamente utilidades de carga y hashes generados por Laravel.

Las cuentas de demostración usan la contraseña pública `Ventas2026`, guardada como bcrypt, nunca en texto plano en MySQL. Las credenciales técnicas de MySQL siguen exclusivamente en .env y .env.testing. Los controles de rol/estado se implementaron y probaron posteriormente en L2; la carga de cuentas por sí sola no acredita autenticación.

| Tabla | Común | Sector añadido | Total en desarrollo |
| --- | ---: | ---: | ---: |
| users | 7 | 4 | 11 |
| productos | 5 | 5 | 10 |
| clientes | 21 | 7 | 28 |
| oportunidades | 11 | 6 | 17 |
| oportunidad_productos | 13 | 6 | 19 |
| historial_etapas | 43 | 19 | 62 |
| actividades | 4 | 4 | 8 |

Comprobación repetible desde laravel/, con las dependencias de desarrollo instaladas:

```powershell
php vendor/bin/phpunit --filter=SeederDataTest
php tests/inspect-seeds.php
php tests/inspect-seeds.php --testing
```

La suite pasó 3 pruebas y 404 aserciones. Comprueba DATABASE() y la cuenta técnica antes de escribir en crm_ferreteria_test, carga cada modalidad en transacciones y revierte sus propias filas. La base de pruebas queda vacía; los contadores de IDs pueden avanzar. El script inspect-seeds es de solo lectura y muestra recuentos, cifras comunes y el precio histórico, sin hashes ni contraseñas. No son reportes de panel/API.

Para una base MySQL de pruebas con esquema aplicado y tablas del negocio vacías, puede elegir UNA modalidad de carga persistente:

```powershell
# Solo datos del enunciado:
php artisan db:seed --class=VerificacionSeeder --env=testing

# Alternativa en una base vacía: comunes y sector:
php artisan db:seed --env=testing
```

No ejecute ambos comandos consecutivos: VerificacionSeeder exige todas las tablas del negocio vacías y rechaza repeticiones; SectorSeeder rechaza una segunda carga del sector. No hay upsert, borrado ni reinicio automático. En desarrollo se comprobó que las siete tablas seguían vacías y se ejecutó db:seed mediante el kernel de Artisan, dentro de una transacción que comprobó recuentos y cifras antes de confirmar. Equivale a php artisan db:seed --no-interaction; **ya está cargado y no debe repetirse**. No se ejecutaron migraciones en esta etapa ni se necesitaron permisos adicionales.

Cifras comunes obtenidas (montos en quetzales):

| Ámbito | Mes | Ventas | Total | Pronóstico |
| --- | --- | ---: | ---: | ---: |
| Valeria | 2026-10 | 2 | 9,250.00 | 2,512.88 |
| Valeria | 2026-11 | 1 | 3,600.00 | 2,512.88 |
| Diego | 2026-10 | 1 | 6,000.00 | 112.50 |
| Carlos | 2026-10 | 1 | 7,200.00 | 4,125.75 |
| Equipo Sergio | 2026-10 | 3 | 15,250.00 | 2,625.38 |
| Equipo Sandra | 2026-10 | 1 | 7,200.00 | 4,125.75 |
| Empresa común | 2026-10 | 4 | 22,450.00 | 6,751.13 |

Carteras de Valeria/Diego/Carlos: 3/2/9. La consulta calcula los límites mensuales en America/Guatemala y los convierte a UTC: octubre termina el 1 de noviembre a las 06:00 UTC. Por ello 03:30 UTC pertenece a octubre y 06:30 UTC a noviembre. Renovación de planes usa Q2,600.00 cotizados aunque el catálogo vale Q2,750.50. El pronóstico se suma en DECIMAL y se redondea una vez al final.

El sector no cambia ninguna fila común: se compararon todas sus columnas antes/después. En una carga combinada, la consulta de control filtra las siete cuentas comunes. El pronóstico global incluyendo el sector es Q7,190.13; las ventas de octubre siguen en Q22,450.00 porque la venta sectorial de Q120.00 se cierra en diciembre. Para la defensa se usa únicamente la modalidad común.

Catálogo del sector: precios de referencia consultados el 1 de noviembre de 2026, sin envíos ni garantía de vigencia. El mínimo es una decisión del proyecto, no del comercio:

| Producto / unidad | Precio Q | Mínimo |
| --- | ---: | ---: |
| Block para construcción 25 kg / unidad | 4.10 | 50 |
| Cemento UGC Progreso 42.5 kg / saco | 83.00 | 5 |
| Tubo drenaje 3 pulgadas / tubo | 65.00 | 1 |
| Ducto PVC 3/8 pulgadas × 3 m / tubo | 18.00 | 3 |
| Guantes de trabajo / par | 12.00 | 1 |

Fuentes: [block en Ferretería Guatemala](https://www.ferreteriaguatemala.com/category/materiales-de-contruccion) y [cemento, tubos y guantes en Mundo Ferretero, Santiago Atitlán](https://mundoferreterogt.com/). Solo se tomaron referencias de productos/precios; las identidades de clientes del sector son ficticias.

## L2: acceso y cuentas — 1 de noviembre de 2026

Abra http://127.0.0.1:8000/login. El administrador activo puede entrar y abrir **Cuentas** para listar, crear o editar. El supervisor activo accede al inicio y a Clientes; no puede administrar cuentas ni catálogo. Puede gestionar sus clientes y disponibles mediante L4 y consultar Mi equipo mediante L5. Un vendedor recibe el mensaje para usar la aplicación del vendedor (aún pendiente de implementar); una cuenta inactiva no puede entrar.

Flujo: navegador → POST /login → LoginRequest de Breeze → proveedor Eloquent comprueba la contraseña → attemptWhen comprueba estado y rol antes de iniciar la sesión. Tras el éxito se regenera el identificador de sesión. En cada ruta protegida, auth y EnsurePanelAccess vuelven a obtener la cuenta desde MySQL; si está inactiva o ya no es administrador/supervisor, se cierra la sesión, se invalida y se regenera el token CSRF. El cierre voluntario también invalida la sesión.

Todas las rutas /cuentas requieren además can:manage-accounts. AccountRequest vuelve a autorizar y valida los campos; AccountManager bloquea las cuentas implicadas, vuelve a comprobar al administrador y al supervisor actual y guarda mediante Eloquent dentro de una transacción. El cast hashed genera bcrypt. Una edición con contraseña vacía conserva la anterior; al crear se exige contraseña y confirmación (mínimo 8 caracteres, máximo 72 bytes). Las contraseñas nunca se rellenan ni se guardan como datos anteriores del formulario.

Vendedores requieren otro usuario con rol supervisor activo; los demás roles no llevan supervisor. Un supervisor con vendedores asociados, incluso inactivos, no cambia de rol hasta reasignarlos. Puede desactivarse conservando equipo y datos. Reasignar o desactivar vendedores no modifica clientes, oportunidades ni historial. El administrador no puede desactivarse ni retirarse su propio rol. No hay operación DELETE de cuentas.

Las rutas auxiliares generadas de perfil, cambio autónomo/recuperación de contraseña y verificación de correo se retiraron del enrutamiento: la gestión de cuentas de esta etapa es exclusiva del administrador. El formulario indica que debe consultarle para restablecer una contraseña. No hay registro público. Se conserva login/logout de Breeze, sin opción de sesión persistente «recordarme». Las plantillas activas usan español, errores por campo y escape de Blade.

Comprobaciones reproducibles desde laravel/:

```powershell
php vendor/bin/phpunit --filter=PanelAccountsTest
php vendor/bin/phpunit
php artisan route:list --except-vendor -v
npm.cmd run build
```

La suite completa pasó **91 pruebas y 856 aserciones** sobre crm_ferreteria_test: 47 casos específicos de acceso/cuentas, regresión del esquema/semillas y redirección de portada. Se eliminaron las pruebas de fábrica incompatibles con las rutas retiradas y el ejemplo unitario vacío de contenido; phpunit.xml conserva la suite Feature. Los controles que prohíben reiniciar pruebas siguen activos. Los casos se revierten con transacciones; la base de pruebas quedó sin filas. Las huellas de todas las columnas de las siete tablas de desarrollo coinciden antes/después.

Se comprobaron login/logout con cookies, rechazo por rol/estado, sesiones ya abiertas, acceso directo por GET/POST/PUT/PATCH, CSRF, validaciones, hashes y conservación de datos. Login público también respondió HTTP 200 en el servidor local. No se probaron interfaces en un navegador gráfico ni concurrencia simultánea de administración; los reportes, API y SPA no existen. Detalles e incidencia real de cookies del ejecutor en docs/verificacion.md, sección 16.

Referencias del framework: [autenticación](https://laravel.com/docs/13.x/authentication) y [autorización](https://laravel.com/docs/13.x/authorization). No se instalaron paquetes ni se modificaron migraciones, semillas, credenciales o permisos MySQL para L2.

## L3: catálogo de productos — 4 de noviembre de 2026

El administrador dispone del enlace **Productos** para listar, agregar y editar nombre, precio, cantidad mínima y estado. Activar/desactivar se realiza desde el formulario de edición; no hay eliminación. Las cinco rutas de productos heredan auth, EnsurePanelAccess y el permiso de administrador manage-accounts de L2. ProductRequest vuelve a comprobar ese permiso, y ProductController comprueba al administrador actual bajo bloqueo antes de guardar.

Flujo formulario → ruta → validación → controlador → modelo → MySQL:

| Paso | Archivo |
| --- | --- |
| Listado y formulario Blade | laravel/resources/views/products/index.blade.php y form.blade.php |
| Rutas GET/POST/PUT/PATCH | laravel/routes/web.php, nombres products.* y URLs /productos |
| Normalización, autorización y validación | laravel/app/Http/Requests/ProductRequest.php |
| Formato y rango exacto del dinero | laravel/app/Rules/ProductPrice.php |
| Listado, alta y actualización transaccional | laravel/app/Http/Controllers/ProductController.php |
| Eloquent y tabla productos | laravel/app/Models/Product.php |

El nombre se recorta y los espacios repetidos se reducen a uno antes de comprobar su unicidad y máximo de 120 caracteres. El precio acepta dígitos con cero, uno o dos decimales, de Q0.01 a Q99,999,999.99; use punto decimal, sin separadores de miles ni notación científica. Se valida como texto sin redondearlo; Eloquent conserva precio como decimal de dos posiciones y MySQL usa DECIMAL(10,2). Mínimo entero 1–999, inicial 1, y estado booleano obligatorio. Los errores aparecen junto al campo y se conserva lo escrito; Blade escapa nombres y mensajes.

Guardar escribe exclusivamente productos. Subir precio/mínimo o desactivar no modifica ninguna línea previa, su cantidad, su precio cotizado, oportunidad, historial ni actividad. Las consultas de control conservaron todas sus cifras tras cambiar el producto cotizado a Q99,999,999.99 y mínimo 999. La validación del mínimo al agregar o editar líneas corresponde a etapas futuras; no se anticiparon esos módulos.

Verificación desde laravel/:

```powershell
php vendor/bin/phpunit --filter=ProductCatalogTest
php vendor/bin/phpunit
php artisan route:list --path=productos -v
npm.cmd run build
```

Suite final completa: **143 pruebas y 1.221 aserciones aprobadas**, incluyendo 52 casos del catálogo. Se probaron creación, edición, límites, duplicados, campos inválidos, estados, acceso directo, cambio de rol, CSRF, texto escapado y conservación histórica. Las pruebas usan crm_ferreteria_test y transacciones revertidas. Quedó vacía; las huellas de las siete tablas de desarrollo coincidieron antes/después. Compilación correcta, sin dependencias nuevas ni cambios de esquema.

Para revisar el catálogo existente sin modificar la base principal, abra http://127.0.0.1:8000/login, entre con el administrador y abra Productos. Puede consultar listado y formulario sin guardar. Para probar altas y ediciones manualmente en la base separada, abra una terminal nueva dentro de laravel/:

```powershell
# Requiere crm_ferreteria_test con esquema aplicado y tablas de negocio vacías.
# La semilla comprueba el vacío y se detiene si ya hay datos.
$env:SESSION_DRIVER = 'file'
$env:CACHE_STORE = 'file'
php artisan db:seed --class=VerificacionSeeder --env=testing
php artisan serve --env=testing --host=127.0.0.1 --port=8001
```

Abra http://127.0.0.1:8001/login con admin@crm.test y la contraseña pública indicada en Semillas. Las sesiones en archivos permiten conservar el login entre peticiones del navegador; la configuración de PHPUnit mantiene sus sesiones array y no se cambia. Cierre esa terminal al terminar para descartar las variables de proceso.

1. Entre en Productos → Agregar producto: compruebe mínimo inicial 1; guarde un nombre nuevo, precio 12.50 y estado activo.
2. Intente repetir el nombre con espacios, usar precio 0 o 1.234, mínimo 0 o 1000: debe recibir errores por campo y conservar lo escrito.
3. Edite el producto, cambie precio/mínimo y seleccione Inactivo; debe seguir en la lista. Vuelva a activarlo.
4. Salga y entre como sergio@crm.test: no verá Productos y escribir /productos directamente devolverá 403.
5. No hay acción Eliminar. Las pruebas automatizadas verifican también la conservación de las líneas e importes históricos.

El procedimiento manual se documenta para el equipo; no se ejecutó durante esta etapa. Deja datos persistentes en la base de pruebas: no ejecute después las pruebas que requieren tablas vacías hasta preparar una base de pruebas vacía en una etapa autorizada. No se incluye ningún comando de borrado o reinicio. Los reportes de panel/API y la revisión visual con navegador gráfico siguen pendientes. Tras verificar L3, se autorizó su commit de cierre «feat: implementar catálogo de productos». No se hace push ni se cambia spec-v1.

## L4: clientes y asignación — 4 de noviembre de 2026

Abra **Clientes** en el menú del panel. Administrador: todos los clientes. Supervisor: clientes de su equipo actual, incluidos los asignados a vendedores inactivos, y disponibles. El listado permite buscar nombre/NIT y filtrar por vendedor o sin asignar; no muestra NIT, teléfono ni correo de los disponibles. La edición de datos de contacto se autoriza dentro del ámbito; una ficha de otro equipo devuelve 404 antes de validar campos o ejecutar una acción.

ClientIdentity normaliza NIT y teléfono. El NIT elimina espacios/guiones y ceros iniciales, pasa a mayúsculas y valida el dígito módulo 11 de la sección R4. CF (también el campo vacío) se guarda NULL y se muestra CF; varios CF son válidos. El teléfono acepta separadores y prefijo 502/+502, conserva ocho dígitos iniciales de 2 a 9 y se comprueba único. Nombre obligatorio de hasta 150 caracteres; correo opcional, válido y de hasta 150. Los índices únicos también se capturan si dos operaciones compiten.

Crear puede dejar disponible o asignar a vendedor activo permitido. Editar datos no puede cambiar propietario: **Asignar/Reasignar**, **Liberar** y **Eliminar** son acciones aparte con confirmación explícita y control de formulario obsoleto. Supervisor solo asigna dentro de su equipo. Cupo máximo diez bajo bloqueo, no solo una consulta previa. La eliminación es exclusiva del administrador y se rechaza ante cualquier oportunidad; las actividades se eliminan por la cascada existente.

Reasignar transfiere únicamente oportunidades abiertas; las cerradas conservan vendedor y crédito. Líneas, precios e historial no cambian. Las actividades conservan quién las registró; la consulta y finalización de esos registros en futuras pantallas/API seguirá la cartera actual. Liberar exige cero oportunidades abiertas y cero actividades pendientes; conserva cerradas/completadas.

| Responsabilidad | Archivos principales |
| --- | --- |
| Listado, filtros, formularios y acciones | laravel/app/Http/Controllers/ClientController.php; laravel/resources/views/clients/ |
| Validación y normalización | laravel/app/Http/Requests/ClientRequest.php, ClientActionRequest.php; laravel/app/Support/ClientIdentity.php; laravel/app/Rules/GuatemalanNit.php |
| Alcance y autorización 404 | laravel/app/Models/Client.php; laravel/app/Policies/ClientPolicy.php; laravel/routes/web.php |
| Asignación, cupo, liberación y eliminación atómicos | laravel/app/Services/ClientManager.php; laravel/app/Exceptions/ClientConflict.php |
| Relaciones necesarias para L4 | modelos Opportunity y Activity, sin pantallas de oportunidades/actividades |
| Pruebas | ClientManagementTest, ClientConcurrencyTest y tests/Support/client-request-worker.php |

Flujo: formulario Blade → rutas protegidas por auth/EnsurePanelAccess y política del cliente → FormRequest → ClientManager → modelos Eloquent → MySQL. El servicio vuelve a comprobar cuenta/alcance bajo bloqueo. Protocolo detallado y reglas para reutilizar en la futura API: [docs/protocolo-cartera.md](docs/protocolo-cartera.md).

Comprobaciones reproducibles, desde laravel/ y con tablas del negocio de pruebas vacías:

```powershell
php vendor/bin/phpunit --filter=ClientManagementTest
php vendor/bin/phpunit --filter=ClientConcurrencyTest
php vendor/bin/phpunit
php artisan route:list --path=clientes -v
npm.cmd run build
```

Suite completa aprobada: **191 pruebas y 2.011 aserciones**, incluidos 43 casos HTTP secuenciales de L4 y cinco carreras simultáneas. Las carreras usan el kernel HTTP en procesos PHP independientes, conexiones MySQL distintas y barrera SQL para acreditar solapamiento: cupo nueve con dos altas, mismo disponible, dos reasignaciones al cupo nueve, NIT duplicado y teléfono duplicado. Resultado en cada carrera: un éxito y un conflicto. Las pruebas usan exclusivamente crm_ferreteria_test; limpian sus propias filas y dejan la base vacía. Las huellas de las siete tablas principales no cambiaron.

Para probar manualmente las escrituras sin alterar crm_ferreteria, use el servidor de pruebas del procedimiento L3 (puerto 8001 y --env=testing), cargando la semilla común solo si las tablas están vacías. Es un procedimiento manual documentado, no ejecutado en esta etapa:

1. Entre como admin@crm.test → Clientes; compruebe búsqueda por nombre o NIT con guiones y filtro sin asignar.
2. Cree un cliente con CF y teléfono nuevo, por ejemplo +502 5900-9991. Cree otro CF con teléfono distinto. Intente repetir un teléfono/NIT ya existente o usar un NIT con dígito incorrecto.
3. Edite el nombre/correo; la asignación actual se conserva. Abra Asignar/Reasignar, elija un vendedor activo y confirme.
4. Con la semilla común Carlos tiene nueve clientes: asígnele un disponible y trate de asignarle otro; el segundo debe rechazarse por cupo.
5. Libere un cliente sin oportunidades ni actividades pendientes. Intente liberar Comercial El Quetzal: debe rechazarse por sus oportunidades abiertas.
6. Como administrador, elimine solo un cliente sin oportunidades y confirme. Los que tienen oportunidades no permiten eliminación.
7. Entre como sergio@crm.test: verá su equipo y disponibles. Escribir la URL de un cliente de Carlos/Sandra debe dar 404; no puede eliminar ni asignar fuera de su equipo.

Las pruebas manuales dejan cambios en la base test. No ejecute después la suite que exige tablas vacías sin preparar esa base en una etapa autorizada; no se incluye ningún reinicio automático. El procedimiento manual no acredita la concurrencia: esta se verifica con ClientConcurrencyTest. L5 y L6 se completaron en las etapas siguientes descritas abajo; API y SPA siguen pendientes. El cierre L4 quedó guardado en 879231885bdf4627c464893e1fb27616abbadd49; sin push ni cambios de spec-v1.

## L5: Mi equipo — 5 de noviembre de 2026

El supervisor activo dispone de **Mi equipo**, en /mi-equipo. Ve únicamente sus vendedores actuales, incluidos inactivos, con nombre, estado, clientes asignados de diez, ventas ganadas y total vendido del mes. El selector usa mes=AAAA-MM; por defecto se toma el mes actual de America/Guatemala. La cartera es actual y no cambia al consultar otro mes.

| Archivo | Función |
| --- | --- |
| laravel/app/Http/Controllers/TeamController.php | Valida el mes, obtiene el equipo de la cuenta autenticada y consulta sus cifras |
| laravel/app/Models/User.php | Relaciones sellers (vendedores propios) y clients (cartera del vendedor) |
| laravel/app/Providers/AppServiceProvider.php | Gate view-team, exclusivo del supervisor activo |
| laravel/routes/web.php | GET /mi-equipo, con auth, EnsurePanelAccess y can:view-team |
| laravel/resources/views/team/index.blade.php | Selector mensual, estado, cartera y ventas; texto escapado y errores por campo |
| laravel/resources/views/layouts/navigation.blade.php y dashboard.blade.php | Enlace Mi equipo solo para el supervisor |
| laravel/tests/Feature/TeamPageTest.php | 25 casos de permisos, aislamiento, cifras, límites mensuales y conservación |

Flujo: navegador → GET /mi-equipo?mes=2026-10 → controles actuales L2 → TeamController → relación sellers del supervisor autenticado → agregaciones SQL de MySQL → vista Blade. No se recibe un identificador de supervisor ni vendedor; parámetros distintos de mes y rutas con identificadores devuelven 404. Administrador recibe 403; vendedor e inactivo pierden el acceso por los controles existentes. No hay nuevas operaciones de asignación: se conservan las de L4 y su protocolo.

withCount('clients') cuenta clientes por vendedor de forma independiente. Para ventas se agrupan primero las líneas por oportunidad con SUM(cantidad × precio_unitario), después se filtran oportunidades ganadas por fecha_cierre y se agrupan por vendedor con COUNT(*) y SUM(total). Las uniones de esos resultados tienen una fila por vendedor: ni varias líneas ni varios clientes multiplican recuentos. Los importes se calculan con DECIMAL en MySQL; la vista solo les da formato. No se consulta el precio actual del catálogo ni el dueño actual del cliente para atribuir ventas cerradas.

Octubre Guatemala usa desde 2026-10-01 06:00:00 UTC inclusive hasta 2026-11-01 06:00:00 UTC exclusivo. El selector acepta meses válidos 1000-01 a 9998-12 para mantener ambos límites dentro del rango DATETIME de MySQL.

Comandos reproducibles desde laravel/, con tablas de negocio test vacías y las credenciales locales de .env.testing:

```powershell
php vendor/bin/phpunit --filter=TeamPageTest
php vendor/bin/phpunit
php artisan route:list --path=mi-equipo -v
npm.cmd run build
```

Suite completa aprobada: **216 pruebas y 2.161 aserciones**, incluidos 25 casos L5 y la regresión previa. Compilación y formato correctos. Base test vacía tras revertir transacciones y limpiar fixtures propios de concurrencia; huellas de las siete tablas principales idénticas. No hubo migraciones ni cambios de permisos o credenciales.

Para revisarlo en el navegador sin escribir datos, arranque el panel con el comando inicial del README y abra http://127.0.0.1:8000/login:

1. Entre como sergio@crm.test con la contraseña pública indicada en Semillas y abra **Mi equipo**.
2. Consulte 2026-10: Valeria, 3 de 10, dos ventas/Q9,250.00; Diego, 2 de 10, una venta/Q6,000.00. En 2026-11 Valeria tiene una venta/Q3,600.00 y Diego cero; las carteras permanecen iguales.
3. Salga y entre como sandra@crm.test. En octubre verá Carlos, 9 de 10, una venta/Q7,200.00, e Iván inactivo, 1 de 10, cero ventas/Q0.00.
4. Como Sergio, intente /mi-equipo?supervisor_id=999: devuelve 404. Como administrador, /mi-equipo devuelve 403 y no aparece el enlace.

Este recorrido es de lectura y está documentado para el equipo; no se realizó una revisión visual con navegador gráfico. Las cifras se comprobaron con peticiones HTTP del framework sobre la semilla común en crm_ferreteria_test. Las cuentas del sector ya presentes en desarrollo no alteran los equipos comunes. El cierre L5 se autoriza con «feat: implementar página del equipo del supervisor», conservando los resultados de 216 pruebas/2.161 aserciones y la revisión visual pendiente. spec-v1 se mantiene, sin push.

## L6: consulta de oportunidades y reportes — 5 de noviembre de 2026

El menú incluye **Oportunidades** (/oportunidades) y **Reportes** (/reportes). Ambas son consultas de solo lectura con auth y EnsurePanelAccess: el administrador ve toda la empresa y el supervisor solo las oportunidades de sus vendedores actuales, incluidos inactivos. El cambio de asignación de un cliente no modifica el crédito histórico de una venta cerrada. El administrador conserva también oportunidades de titulares que después cambien de rol.

Oportunidades permite filtros etapa y vendedor_id, con validación en español y 404 para un vendedor ajeno o inexistente. Los filtros se aplican después de restringir el ámbito. El listado muestra cliente, vendedor, título, etapa, total cotizado y cierre en Guatemala; abiertas muestran Sin cierre. Se pagina de veinte en veinte y se conservan filtros en la navegación. No hay rutas de creación, edición, detalle individual ni eliminación de oportunidades en el panel.

Reportes acepta mes=AAAA-MM; el valor por defecto es el mes actual de Guatemala. Muestra número de ventas ganadas y total vendido del mes, más pronóstico de todas las abiertas sin filtro mensual. Incluye vendedores sin ventas e inactivos, y productos cotizados dentro del ámbito con unidades e importe mensual y pronóstico por producto. Un producto sin ventas mensuales se muestra con cero si figura en otras cotizaciones del ámbito; si no hay cotizaciones, se muestra el estado vacío.

| Archivo | Responsabilidad |
| --- | --- |
| laravel/app/Http/Controllers/OpportunityController.php | Valida etapa/vendedor/página, comprueba vendedor permitido y obtiene listado paginado |
| laravel/app/Http/Controllers/ReportController.php | Prepara resumen, vendedores y productos para la vista |
| laravel/app/Queries/SalesQueries.php | Consultas comunes de ámbito, totales por oportunidad, resumen y agrupaciones por vendedor/producto |
| laravel/app/Support/ReportMonth.php | Validación mensual y primer instante del mes en Guatemala; compartido por L5 y L6 |
| laravel/app/Http/Controllers/TeamController.php | Reutiliza ReportMonth y SalesQueries para conservar los cálculos L5 |
| laravel/resources/views/opportunities/index.blade.php y reports/index.blade.php | Filtros y tablas de consulta con escape Blade, errores y estados vacíos |
| laravel/routes/web.php y resources/views/layouts/navigation.blade.php | Dos rutas GET/HEAD y enlaces para ambos roles del panel |
| laravel/tests/Feature/OpportunityReportsTest.php | 31 casos específicos con VerificacionSeeder exclusivamente |

Los totales se calculan en MySQL con SUM(cantidad × precio_unitario), agrupando líneas por oportunidad antes de contar ventas. SalesQueries convierte el inicio local y el mes siguiente a UTC y usa >= inicio y < siguiente. La condición mensual solo afecta las ventas; el pronóstico aplica 10%, 25%, 50% y 75% a todas las abiertas y usa ROUND(SUM(...), 2). El resumen se agrega directamente, sin sumar importes ya redondeados por vendedor o producto. Un fixture con dos contribuciones de Q0.005 comprobó esa diferencia. Los precios actuales del catálogo no intervienen.

En productos se suma cada línea histórica y se cuentan ventas distintas por producto. Una venta con varios productos aparece en varias filas: sumar esa columna no produce el número de ventas de la empresa. Las cantidades y los importes vendidos por producto sí representan sus líneas del mes. Solo expresiones constantes de la aplicación se utilizan en selectRaw; fechas y filtros van como parámetros.

Cifras de octubre de 2026 comprobadas con la semilla común:

| Ámbito | Ventas | Total vendido | Pronóstico |
| --- | ---: | ---: | ---: |
| Empresa | 4 | Q22,450.00 | Q6,751.13 |
| Sergio | 3 | Q15,250.00 | Q2,625.38 |
| Sandra | 1 | Q7,200.00 | Q4,125.75 |

También coinciden los vendedores de la sección Semillas y los productos de la sección 11: Plan básico 5 unidades/Q6,000.00, Plan avanzado 2/Q5,200.00, Instalación 1/Q450.00 y Soporte anual 3/Q10,800.00. La base de desarrollo contiene además SectorSeeder; por ello el total de empresa allí incluye sus datos. Las cifras comunes se verifican automatizadamente en crm_ferreteria_test, sin reiniciar ni cambiar desarrollo.

Comprobaciones reproducibles desde laravel/, con tablas de negocio test vacías:

```powershell
php vendor/bin/phpunit --filter=OpportunityReportsTest
php vendor/bin/phpunit
php artisan route:list --except-vendor -v
npm.cmd run build
```

Resultado final: **247 pruebas y 2.393 aserciones aprobadas**, incluidos los 31 casos L6, L5 y toda la regresión anterior. Las pruebas específicas L6 cargan solo VerificacionSeeder y revierten transacciones; las pruebas previas de semillas conservan sus modalidades originales. La base de pruebas quedó vacía y las huellas de todas las filas del núcleo principal coincidieron antes/después. Sin migraciones, cambios de credenciales, permisos ni dependencias nuevas. La revisión visual en navegador sigue pendiente.

Para revisarlo manualmente, arranque el panel como indica el inicio de este README y entre en http://127.0.0.1:8000/login:

1. Como administrador, abra Oportunidades. Pruebe etapa Ganada y vendedor Valeria: aparecen sus tres ventas de todos los meses. El cierre 31/10/2026 21:30 corresponde a la oportunidad con cierre UTC de noviembre.
2. Abra Reportes y elija 2026-10. Compruebe desgloses por vendedor y producto. En desarrollo el resumen de empresa puede diferir de la tabla común por las semillas del sector.
3. Como sergio@crm.test, octubre debe mostrar 3 ventas/Q15,250.00 y pronóstico Q2,625.38. En noviembre: 1/Q3,600.00 y el mismo pronóstico. Cambiar mes no cambia la cartera de Mi equipo.
4. Como sandra@crm.test, octubre debe mostrar 1/Q7,200.00 y pronóstico Q4,125.75; Iván sigue visible inactivo sin ventas. Ninguno de los supervisores ve los vendedores del otro en filtros o desgloses.
5. Un vendedor ajeno en /oportunidades?vendedor_id=... devuelve 404. No hay acciones de escritura para oportunidades ni reportes. Si el menú muestra una versión antigua tras actualizar archivos, ejecute php artisan view:clear para renovar únicamente vistas compiladas.

Este recorrido manual queda pendiente; las comprobaciones realizadas fueron HTTP del framework y MySQL real. El commit L6 está autorizado por el usuario después de aprobar verificaciones: «feat: implementar consulta de oportunidades y reportes». No se implementaron API ni SPA, no se hace push y spec-v1 permanece intacta.

## L7: validación del panel — 5 de noviembre de 2026

Se revisó el código aprobado de L2–L6 y se conservaron sus reglas. El panel valida en el servidor; required, maxlength y tipos HTML solo ayudan al navegador. Los controladores guardan campos validados, y autorización, estado actual, alcance y reglas transaccionales siguen siendo obligatorios ante peticiones directas.

| Entrada | Validación existente |
| --- | --- |
| Login | LoginRequest: correo/contraseña, estado y rol; sin registro público |
| Cuentas | AccountRequest y AccountManager: campos, contraseña, supervisor, unicidad, estado y protección del propio administrador |
| Productos | ProductRequest, ProductPrice y ProductController: nombre, precio DECIMAL, mínimo, estado y duplicados |
| Clientes | ClientRequest, ClientIdentity y GuatemalanNit: normalización previa, formato, módulo 11, CF NULL, correo y unicidad |
| Asignar, liberar y eliminar | ClientActionRequest y ClientManager: confirmación, propietario esperado, destino válido, cupo, pendientes y permisos bajo bloqueo |
| Clientes: búsqueda y filtros | ClientController::index con validate y comprobación de ámbito; vendedor_id debe ser positivo |
| Oportunidades: etapa, vendedor y página | OpportunityController::filters con validate; vendedor ajeno/inexistente 404 |
| Meses de Mi equipo y Reportes | ReportMonth::fromRequest con validate y mes por defecto de Guatemala |

Faltantes corregidos únicamente:

- Los filtros de clientes ahora recuperan búsqueda, vendedor y casilla sin asignar tras un error. Los selectores mensuales recuperan también el valor escalar recibido.
- bootstrap/app.php conserva los datos anteriores escalares y NULL después de errores de validación; descarta arrays malformados para que no rompan inputs/selects al volver. El panel actual tiene campos escalares. Las contraseñas y confirmaciones siguen excluidas por Laravel y nunca se rellenan. La recuperación de NIT y teléfono conserva el formato escrito; su normalización para validar y guardar ya estaba implementada y se conserva.
- El tratamiento de excepciones entrega una vista 500 sencilla en español o un mensaje JSON genérico. Tampoco deja trazas en errores HTTP JSON como 404/405 cuando hay depuración activa. Conserva códigos y cabeceras como Allow; mantiene los errores por campo de ValidationException/ClientConflict. Los detalles de diagnóstico permanecen en el registro interno, no en la respuesta.

La normalización y las transacciones de L4 no se reescribieron. NIT/teléfono se compactan antes de validar y consultar duplicados; CF queda NULL. Los errores MySQL 1062 de correo/producto ya se traducían a mensajes por campo: se verificaron ahora forzando un duplicado después de la validación. Eso prueba el tratamiento del error real de MySQL, no concurrencia para cuentas/productos. Las carreras simultáneas de clientes/cupo siguen cubiertas por ClientConcurrencyTest.

[docs/protocolo-cartera.md](docs/protocolo-cartera.md) reúne el orden de bloqueo R3 y los pasos/vectores R4 que deberá reproducir la futura API. El panel redirige formularios HTML con errores; JSON de validación usa 422 y conflictos de ClientConflict 409. La API deberá implementar sus códigos y formas contractuales. En L7 la API todavía no existía. A3 verifica ahora los vectores R4 y las carreras R3 de clientes entre ambas puertas; no acredita módulos futuros.

Comprobaciones desde laravel/, con tablas de negocio de pruebas vacías:

```powershell
php vendor/bin/phpunit --filter=PanelValidationTest
php vendor/bin/phpunit
npm.cmd run build
```

Resultado final: **270 pruebas y 2.633 aserciones aprobadas**, incluidos 23 casos L7 y toda la regresión de L2–L6, esquema, semillas y concurrencia. Se ejecutó la suite completa porque el tratamiento común de excepciones afecta todos los formularios. Compilación y formato correctos. La base principal conserva exactamente las huellas de sus siete tablas; crm_ferreteria_test quedó vacía tras revertir datos temporales. No se modificaron esquema, semillas, credenciales ni permisos.

Para revisar en navegador sin cambiar datos principales, abra los formularios y consulte mensajes en el servidor de pruebas del procedimiento L3, si prepara manualmente esa base con la semilla y sus precauciones. Ese recorrido deja datos de pruebas persistentes; no se ejecutó aquí. La revisión visual de todos los módulos, errores por campo, navegación y adaptación a escritorio/pantalla estrecha sigue pendiente, junto con la explicación y revisión en pareja. Las evidencias actuales son HTTP del framework y MySQL real.

La siguiente sección documenta A1/A2, implementados posteriormente; se conserva aquí la propuesta al cerrar L7: Preparar Express 5 y conexión explícita a la misma base, sin ORM; login POST /api/auth/login con correo/clave, comparación de hashes Laravel mediante bcryptjs y JWT HS256 con sub/exp. Solo vendedor activo obtiene token. El middleware comprobará firma/algoritmo/expiración/sub y consultará en cada petición rol/estado actuales; un token inválido o una cuenta que perdió acceso devuelve 401. Configurar JWT_SECRET aleatorio de al menos 32 caracteres fuera de Git y CORS con origen único exacto; probar el contrato en Postman cuando exista.

El usuario autoriza el commit «feat: completar validación del panel Laravel» tras las comprobaciones. Sin API, SPA, push ni cambios de spec-v1.

## API A1/A2 y productos — 5 de noviembre de 2026

Node 24.18.1, Express 5.3.0, mysql2 3.24.6, jsonwebtoken 9.0.3, bcryptjs 3.0.3 y cors 2.8.6. Solo estas cinco dependencias directas, sin ORM ni constructor SQL. npm.cmd install añadió 92 paquetes; auditoría de 93 paquetes sin vulnerabilidades en esta ejecución. package-lock.json se conserva. Node carga variables con --env-file, sin dotenv adicional.

| Método y ruta | Entrada | Éxito | Errores principales |
| --- | --- | --- | --- |
| POST /api/auth/login | JSON exacto con correo y clave | 200 { token, usuario: { id, nombre, correo } } | 400 cuerpo ilegible/ausente, 401 credenciales incorrectas, 403 cuenta sin acceso, 422 errores por campo |
| GET /api/productos | Authorization: Bearer token, sin cuerpo ni filtros | 200 arreglo de activos: id, nombre y precio numérico | 401 sesión no válida; 400 si recibe parámetros/cuerpo no admitidos |

El contrato completo y la tabla vigente consolidada están en la revisión A7/A8 más abajo. En A1/A2 solo existían los dos endpoints anteriores; los módulos actuales se describen en A3–A6. Errores generales: { error: mensaje }; validación: { errores: { campo: mensaje } }. Un error inesperado devuelve 500 genérico; nunca envía SQL, claves, hashes, cuerpos de solicitud o trazas. La consola registra solo un código/nombre de diagnóstico.

| Archivo | Función |
| --- | --- |
| api/src/config.js | Lee y valida variables obligatorias, clave JWT, expiración, origen exacto y puertos |
| api/src/database.js | Pool mysql2, sin sentencias múltiples, consultas escritas a mano |
| api/src/auth.js | Validación del login, bcrypt.compare, firma JWT, middleware y proyección pública del usuario |
| api/src/app.js | Rutas API, CORS, parser JSON y errores JSON |
| api/src/server.js | Comprueba DATABASE()/CURRENT_USER() antes de escuchar y permite detener con Ctrl+C |
| api/tests/auth.test.js y fixtures.php | HTTP real con node:test y cuentas temporales creadas mediante Laravel, nunca por la API |
| docs/api.postman_collection.json | Colección de veinte endpoints; cifras vigentes en A7/A8 y tokens exportados vacíos |

Flujo: petición POST → ruta /api/auth/login → validación de correo/clave y campos extra → SELECT users WHERE email = ? → bcryptjs compara el hash generado por Laravel → solo vendedor activo recibe JWT HS256, con sub igual al id como texto, iat y exp. El correo se recorta/convierte a minúsculas; la clave nunca se recorta ni se transforma. Se rechaza clave vacía o de más de 72 bytes, límite de las contraseñas bcrypt del panel, para no aceptar truncamiento silencioso.

Después: petición GET /api/productos → middleware extrae Bearer → jwt.verify con algorithms: ['HS256'] y comprobación de exp/sub válido → SELECT del usuario actual por id → exige vendedor activo → SELECT productos WHERE activo = ? → arreglo con precio convertido explícitamente a número. No se confía en rol/estado incluidos en un token. Usuario inexistente, inactivo o con rol cambiado pierde acceso aunque el JWT no haya vencido. Correo inexistente y clave incorrecta comparten exactamente el mismo 401; comprobar rol/estado ocurre después de verificar la clave.

### Conexiones y ejecución local

api/.env apunta a 127.0.0.1:3306/crm_ferreteria con crm_api@127.0.0.1 y puerto HTTP 3000. api/.env.testing apunta a crm_ferreteria_test con crm_api_test@127.0.0.1 y puerto 3001. Cada cuenta tiene SELECT sobre users y productos; SELECT, INSERT, UPDATE sobre clientes (A3) y oportunidades (A4); SELECT, INSERT, UPDATE, DELETE sobre oportunidad_productos; SELECT, INSERT sobre historial_etapas. Todo se limita a su propia base. Desde A5 tiene SELECT, INSERT, UPDATE sobre actividades de su base. No tiene CREATE USER, permisos de esquema ni GRANT OPTION. La entrada USAGE ON *.* de SHOW GRANTS no concede privilegios globales efectivos. Las cuentas Laravel existentes no se modificaron.

Las cuentas API se prepararon con root introducido directamente en una ventana local enmascarada. Root no se guardó ni se incluyó en argumentos. Contraseñas técnicas aleatorias y JWT_SECRET independientes de 96 caracteres están solo en los archivos locales ignorados; los ejemplos no contienen valores reales. Para abrir la API ya configurada, desde la raíz:

```powershell
cd api
npm.cmd start
```

Escucha en http://127.0.0.1:3000/api; detener con Ctrl+C en esa terminal. No hay página HTML de login en la API. Para usar exclusivamente los datos de revisión manual y la colección Postman:

```powershell
cd api
node --env-file=.env.testing src/server.js
```

Escucha en http://127.0.0.1:3001/api. La colección tiene base_url= http://127.0.0.1:3001/api. Importe el JSON, ejecute primero Login vendedor y luego Productos. El script usa una variable local token durante la ejecución; no lo guarde en valores exportados ni comparta claves técnicas/JWT. La contraseña pública de la semilla ya figura en las ubicaciones permitidas. La ejecución gráfica de Postman continúa pendiente; sus 108 peticiones y scripts sí se ejecutaron mediante Node contra HTTP real: 336 comprobaciones aprobadas, token solo en memoria.

SPA_ORIGIN está configurado como http://127.0.0.1:5500, origen previsto para la futura SPA. CORS autoriza solo esa combinación exacta de protocolo/host/puerto; no equivale a localhost ni acepta *. Las peticiones sin Origin, como Postman, también requieren JWT en rutas protegidas. Un origen ajeno no obtiene cabecera de autorización CORS; CORS no sustituye la autenticación. Si se elige otro puerto para la SPA, cambie la variable local y reinicie la API. JWT_EXPIRES_IN=1h por defecto; admite segundos numéricos o duraciones como 2m.

En otra computadora, instale desde el lock con npm.cmd ci, copie los ejemplos solo si no existen y complete las credenciales localmente. Un administrador de MySQL debe crear cuentas nuevas limitadas; en este equipo ya existen y no se deben recrear. Ejemplo SQL para una instalación nueva, ejecutado únicamente en su consola local autenticada como administrador:

```sql
CREATE USER 'crm_api'@'127.0.0.1' IDENTIFIED BY RANDOM PASSWORD;
GRANT SELECT ON crm_ferreteria.users TO 'crm_api'@'127.0.0.1';
GRANT SELECT ON crm_ferreteria.productos TO 'crm_api'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON crm_ferreteria.clientes TO 'crm_api'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON crm_ferreteria.oportunidades TO 'crm_api'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_ferreteria.oportunidad_productos TO 'crm_api'@'127.0.0.1';
GRANT SELECT, INSERT ON crm_ferreteria.historial_etapas TO 'crm_api'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON crm_ferreteria.actividades TO 'crm_api'@'127.0.0.1';
CREATE USER 'crm_api_test'@'127.0.0.1' IDENTIFIED BY RANDOM PASSWORD;
GRANT SELECT ON crm_ferreteria_test.users TO 'crm_api_test'@'127.0.0.1';
GRANT SELECT ON crm_ferreteria_test.productos TO 'crm_api_test'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON crm_ferreteria_test.clientes TO 'crm_api_test'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON crm_ferreteria_test.oportunidades TO 'crm_api_test'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_ferreteria_test.oportunidad_productos TO 'crm_api_test'@'127.0.0.1';
GRANT SELECT, INSERT ON crm_ferreteria_test.historial_etapas TO 'crm_api_test'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE ON crm_ferreteria_test.actividades TO 'crm_api_test'@'127.0.0.1';
```

Guarde las contraseñas que MySQL muestra solo en los .env correspondientes. Genere cada JWT_SECRET con crypto.randomBytes y escríbalo directamente al archivo local, sin imprimirlo; no reutilice la clave de APP_KEY de Laravel. Nunca apunte el perfil de pruebas a la base principal. Los ejemplos conservan DB_USERNAME, DB_PASSWORD y JWT_SECRET vacíos.

En una copia nueva, desde api/, copie cada ejemplo únicamente si no existe su archivo local. Este comando genera solo las claves vacías y conserva las existentes, sin mostrar valores:

```powershell
@'
import { readFileSync, writeFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { randomBytes } from 'node:crypto';
for (const file of ['.env', '.env.testing']) {
  const text = readFileSync(file, 'utf8');
  if (!parseEnv(text).JWT_SECRET) {
    writeFileSync(file, text.replace(/^JWT_SECRET=.*$/m, 'JWT_SECRET=' + randomBytes(48).toString('hex')));
  }
}
'@ | node --input-type=module
```

### Pruebas y estado de los datos

Desde api/:

```powershell
npm.cmd test
```

Resultado actual: **185 pruebas aprobadas**, HTTP TCP real y MySQL de pruebas. Cubren Laravel bcrypt $2y$, roles/estado, claves incorrectas, formato JSON, campos extra, tokens inválidos/vencidos, algoritmo, sub/exp, cambios posteriores de acceso, expiración configurable, inyección, productos, CORS, privilegios y 500 genérico. Los fixtures se crean mediante el auxiliar PHP dentro de Laravel con la cuenta crm_laravel_test; la API conserva los permisos mínimos por tabla descritos arriba. Configure PHP_BINARY en api/.env.testing con su ruta local de php.exe. Node no genera hashes de contraseñas ni crea cuentas del CRM.

Las pruebas aceptan datos manuales existentes: comparan huellas del núcleo antes/después y borran únicamente sus identidades y clientes temporales aleatorios. No cargan semillas, reinician tablas ni cambian cuentas preexistentes. La base de pruebas quedó con 12 cuentas, 11 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales y 8 actividades, conservando los datos que ya había al iniciar esta etapa. Las huellas de todas las filas principales también permanecen idénticas.

No se repitió la suite Laravel, que requiere tablas de negocio vacías: no la ejecute sobre la base preparada para revisión manual. El panel de pruebas se preparó anteriormente con ambas semillas; esa preparación y una comprobación HTTP de login no acreditan la revisión visual completa. Cuentas, catálogo, clientes/confirmaciones, Mi equipo y reportes en escritorio/pantalla estrecha, revisión en pareja y Postman gráfico siguen pendientes. A3 implementa clientes y cartera: 32 vectores de formato/normalización coinciden con el panel y nueve carreras reales verifican R3. A4–A6 se describen a continuación; SPA sigue pendiente.

Se comprobó además el arranque real en puerto 3000 usando temporalmente el perfil test y se detuvo ese proceso al terminar. Para uso normal rigen los comandos anteriores. El commit de esta etapa está autorizado tras verificar: «feat: implementar autenticación JWT de vendedores en API». Sin push ni cambios de spec-v1.

Referencias primarias consultadas: [Express 5 y errores async](https://expressjs.com/en/5x/guide/error-handling/), [jsonwebtoken: algorithms, subject y expiresIn](https://github.com/auth0/node-jsonwebtoken/blob/master/README.md), [Node --env-file](https://nodejs.org/api/cli.html) y [cuentas MySQL con contraseña aleatoria](https://dev.mysql.com/doc/refman/8.4/en/create-user.html).


## API A3: clientes y cartera — 5 de noviembre de 2026

Todas estas rutas exigen JWT de vendedor activo; el middleware consulta su cuenta actual. No aceptan vendedor_id. Las fichas públicas contienen solo id, nombre, nit, telefono y correo; NULL se presenta como CF.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/clientes?q= | Arreglo de su cartera; búsqueda por nombre o NIT |
| POST | /api/clientes | Crea y asigna a usted; 201 |
| GET | /api/clientes/disponibles | Arreglo de disponibles, solo id/nombre |
| POST | /api/clientes/:id/tomar | Incorpora un disponible; 200 |
| GET | /api/clientes/:id | Ficha propia; ajena/inexistente 404 |
| PATCH | /api/clientes/:id | Edita únicamente campos enviados; 200 |

POST requiere nombre, nit y telefono; correo es opcional. PATCH conserva campos omitidos; un objeto vacío es una edición sin cambios. Ambos rechazan campos extra con 422. NIT/teléfono se normalizan antes de validar; los índices resuelven duplicados con 409. Crear/tomar sin cupo y tomar un cliente ya asignado también devuelven 409. No hay rutas para eliminar, liberar ni reasignar.

Recorrido: petición → authenticate en auth.js → ruta en clients.js → validateClient en client-validation.js → withPortfolio/checkCapacity en client-store.js → SQL parametrizado sobre MySQL. Al crear se bloquea la cartera, se cuenta su ocupación y se inserta con el vendedor del token. Al tomar se bloquea además el cliente, se exige propietario NULL y se comprueba cupo antes de asignarlo. Las escrituras y la comprobación se confirman juntas.

MySQL permite FOR SHARE con SELECT, pero exige privilegios adicionales para FOR UPDATE sobre users. El usuario autorizó conservar users en solo lectura: la API usa GET_LOCK por base/vendedor para excluir otras peticiones API y FOR SHARE para excluir el FOR UPDATE del panel. El recuento usa clientes FOR UPDATE dentro de la transacción; máximo diez. Siempre se libera el bloqueo nombrado, se revierte ante error y se reintenta hasta tres veces ante interbloqueos/esperas. Detalles y orden en [protocolo-cartera.md](docs/protocolo-cartera.md). Al cerrar A3 se comprobaron SELECT en users/productos y SELECT, INSERT, UPDATE en clientes, sin esquema ni DELETE. A4 amplía solo oportunidades, líneas e historial como se detalla arriba.

Para probar manualmente, inicie el perfil .env.testing como se indica arriba e importe la colección. Use únicamente datos de pruebas: estas peticiones sí crean/editan/toman clientes y no los eliminan después. Configure telefono_prueba con un teléfono válido no usado, disponible_id con un cliente disponible que pueda tomar y correo_cupo con un vendedor de pruebas cuya cartera tenga diez clientes. cliente_id se rellena al crear; token y token_cupo solo deben vivir durante la sesión. No elija registros manuales que quiera conservar para probar cambios. Ejecutar otra vez una creación con el mismo teléfono produce el 409 esperado; prepare otro teléfono para repetir el recorrido. Ningún JWT vigente está exportado.

Al cerrar A3, npm.cmd test desde api/ ejecutaba 43 casos previos, dos de normalización (32 vectores comparados con el FormRequest real del panel) y 30 casos A3. Incluye cinco carreras API/API y cuatro API/panel: cupo, toma e identidades. API usa HTTP TCP; el panel se invoca desde dos procesos/conexiones mediante su kernel HTTP aprobado, sin modificarlo. La colección se ejecutó automáticamente con fetch y sus scripts: 31 peticiones, 63 comprobaciones. No equivale a revisión gráfica de Postman.

Las pruebas requieren PHP_BINARY apuntando al PHP local, dependencias Laravel disponibles y sus credenciales .env.testing independientes. No requieren tablas vacías: verifican base/cuenta antes de limpiar y eliminan solo sus fixtures identificados. Las huellas de todas las filas preexistentes de ambas bases se conservaron. No se ejecutaron migraciones ni semillas, ni se repitió la suite Laravel. A3 no instala paquetes nuevos. Revisión visual del panel/Postman pendiente; siguiente módulo solo tras otra autorización.


## API A4: oportunidades y productos cotizados — 5 de noviembre de 2026

Las ocho rutas requieren vendedor activo. El listado devuelve resúmenes; las demás respuestas correctas devuelven detalle con productos e historial, excepto DELETE, que devuelve 204 sin cuerpo.

| Método | Ruta | Entrada |
| --- | --- | --- |
| GET | /api/oportunidades?etapa= | Etapa opcional válida |
| POST | /api/oportunidades | cliente_id, titulo |
| GET | /api/oportunidades/:id | Sin cuerpo |
| PATCH | /api/oportunidades/:id | titulo |
| PATCH | /api/oportunidades/:id/etapa | etapa; motivo_perdida únicamente al perder |
| POST | /api/oportunidades/:id/productos | producto_id, cantidad |
| PATCH | /api/oportunidades/:id/productos/:lineaId | cantidad |
| DELETE | /api/oportunidades/:id/productos/:lineaId | Sin cuerpo |

cliente_id/producto_id deben ser números enteros positivos; cantidad es un número entero de 1–999. El título se compacta y admite 1–150 caracteres; el motivo, 1–255. Campos extra producen 422, filtros/JSON ilegibles 400. El cliente de creación debe ser de su cartera: ajeno/inexistente 404. El vendedor sale del middleware; la etapa inicial siempre es prospecto.

Solo se avanza prospecto → calificado → propuesta → negociacion → ganada. Se puede perder desde cualquier etapa abierta. Ganar exige líneas y negociación. Repetir etapa devuelve 409; salto/retroceso 422. Etapa, cierre UTC e historial se guardan en una misma transacción. Cerradas rechazan título, etapas y líneas con 409. Las oportunidades abiertas siguen al cliente reasignado; las cerradas conservan al vendedor anterior, quien solo recibe id/nombre del cliente y no su ficha actual. El nuevo vendedor no accede a las cerradas ajenas.

Archivos: opportunities.js define rutas y escrituras pequeñas; opportunity-validation.js valida cuerpos exactos y parámetros; opportunity-store.js reúne bloqueos, transacción y cambio de etapa/historial; opportunity-queries.js construye respuestas públicas y totales SQL. app.js monta las rutas con authenticate y permite DELETE en CORS sin ampliar el origen. errors.js incorpora errores 422 por campo.

Al agregar, writeChange consulta checkedProduct con FOR SHARE y copia su precio DECIMAL a precio_unitario. El vendedor nunca envía el precio. Subtotal es cantidad × precio_unitario y total es SUM de esas líneas, calculados en opportunity-queries.js mediante SQL decimal; Number solo serializa el resultado. Cambiar catálogo no recalcula precios cotizados. Solo se agrega producto activo; repetido 409, inactivo 422. Editar cantidad de una línea existente conserva su precio y exige el mínimo vigente, aunque el producto esté desactivado. Ganar no vuelve a exigir el nuevo mínimo ni actividad del catálogo a cotizaciones válidas anteriores.

El orden de escritura es usuario FOR SHARE → cliente FOR UPDATE → oportunidad FOR UPDATE → producto FOR SHARE si corresponde. Se vuelve a comprobar rol/estado y propiedad. La etapa observada antes de esperar se compara bajo bloqueo y se conserva incluso si la transacción se reintenta: dos cambios que parten del mismo estado no se convierten en dos avances. El detalle GET se lee en una transacción para mantener una instantánea entre resumen, líneas e historial. Vea [protocolo-cartera.md](docs/protocolo-cartera.md).

Para comprobarlo manualmente use exclusivamente el servidor test del puerto 3001 y la colección. Ejecute login y prepare cliente_id de su cartera (puede ser el creado por A3). Configure producto_prueba_id con un producto activo de mínimo 1, producto_minimo_id con uno activo de mínimo 50 y producto_inactivo_id con un producto inactivo. Estos prerrequisitos se preparan en el panel de pruebas, sin tocar desarrollo. oportunidad_id y linea_id se obtienen de las respuestas; no invente IDs ni use registros manuales que quiera conservar para probar cambios. A4 crea dos oportunidades y deja una ganada y otra perdida; no elimina esas oportunidades al acabar.

Ejecute el bloque A4 en orden: crear, consultar, editar título, probar mínimo/precio enviado, agregar/editar/quitar línea, avanzar y cerrar, comprobar inmutabilidad y pérdida. Reiniciar el bloque crea oportunidades nuevas. No exporte tokens. La revisión gráfica sigue pendiente.

Resultado desde api/ con npm.cmd test: **113/113 pruebas aprobadas**, 38 A4 y 75 previas. Tras unificar el instante de cierre/historial se repitieron los 38 casos A4 afectados: 38/38. Se comprobaron cinco carreras A4: misma etapa, avance contra pérdida, dos cierres, producto repetido y cierre contra edición de línea. También espera por cambio de catálogo y creación tras reasignación, importes grandes, precio histórico y reversión ante fallo simulado al insertar historial, tanto en creación como cierre. Al cerrar A4 la colección ejecutó 68 peticiones y 141 comprobaciones mediante fetch/scripts, divididas en los bloques previos (31/63) y A4 (37/78), sobre fixtures propios. No se usó Postman gráfico.

Datos manuales de pruebas conservados mediante comparación de huellas antes/después; datos principales coinciden con las huellas completas del cierre A3. No se reiniciaron bases, ejecutaron migraciones/semillas, instalaron paquetes ni modificó código Laravel. Lockfiles y secretos permanecen fuera de estos cambios según corresponda; los lockfiles siguen versionados. En el cierre A4 quedaron pendientes actividades, resumen mensual y SPA; A5 se describe a continuación. La revisión gráfica y en pareja sigue pendiente.


## API A5: actividades de seguimiento — 5 de noviembre de 2026

| Método | Ruta | Entrada / resultado |
| --- | --- | --- |
| POST | /api/clientes/:id/actividades | tipo, descripcion y vence_en opcional; 201 actividad |
| GET | /api/actividades?estado=pendiente o completada | Sin filtro devuelve todas las permitidas; 200 arreglo |
| PATCH | /api/actividades/:id | Solo completada booleano; 200 actividad |

Las tres rutas exigen vendedor activo. El cliente debe ser de su cartera actual, aunque otro vendedor haya registrado la actividad. Reasignar conserva el autor y cambia quién puede consultar/completar; ajeno o inexistente responde 404. Solo se exponen id, cliente (id/nombre), tipo, descripcion, vence_en, completada y vencida.

activity-validation.js valida llamada/reunion/tarea, descripción compactada de 1–500 caracteres, campos extra y booleano estricto. Descripción solo con espacios, tipos inválidos y campos fuera del contrato producen 422 por campo; JSON ilegible y filtros desconocidos/incorrectos, 400. No hay eliminación de actividades ni edición de descripción/tipo/fecha mediante PATCH.

utcDeadline exige fecha ISO con T y zona Z o ±HH:mm; comprueba calendario, hora y rango UTC de MySQL (1000–9999). Admite segundos opcionales y fracciones; el DATETIME existente conserva segundos completos, sin cambiar el esquema. Ejemplo: 2030-01-15T09:00:00-06:00 se guarda como 2030-01-15 15:00:00 y vuelve como 2030-01-15T15:00:00.000Z. Para no tener vencimiento, omita vence_en; enviarlo nulo, vacío o sin zona produce 422. Se permiten fechas pasadas.

activities.js usa JOIN clientes y c.vendedor_id para leer la cartera actual. Al crear y completar reutiliza withPortfolio de client-store.js: usuario vigente FOR SHARE y después cliente FOR UPDATE; al completar bloquea también la actividad y comprueba otra vez el acceso. El vendedor_id de creación sale del usuario autenticado y nunca cambia al completar. publicActivity convierte la salida a ISO UTC y calcula vencida al responder: pendiente y fecha estrictamente anterior al instante actual; sin fecha o completada, false. No se almacena vencida.

Permisos A5: únicamente SELECT, INSERT, UPDATE sobre actividades para crm_api en crm_ferreteria y crm_api_test en crm_ferreteria_test. Se conservaron los permisos previos, users/productos en SELECT y separación entre bases; sin DELETE de actividades ni privilegios de esquema.

Para la revisión manual arranque el perfil de pruebas con node --env-file=.env.testing src/server.js desde api/ (puerto 3001; detener con Ctrl+C). Ejecute Login vendedor y configure cliente_id de su cartera, preferiblemente creado para estas pruebas. Ejecute el bloque A5: crear sin fecha, con zona y pasada; listar, filtrar, completar y volver a pendiente. actividad_id se toma de la respuesta. Puede probar una reasignación desde el panel de pruebas: el vendedor anterior pierde acceso y el nuevo puede completar sin cambiar el autor. No utilice clientes manuales que quiera conservar para probar cambios. La colección deja tres actividades persistentes; repetirla añade otras tres. No exporte tokens.

Verificación: npm.cmd test desde api/ pasó **150/150 pruebas**, 37 A5 y 113 previas, preservando filas manuales y principales. Incluye creación, aislamiento, reasignación, fechas inválidas/equivalentes, booleanos y vencida. Dos pruebas con SQL de control cambian propietario mientras POST/PATCH esperan: ambos devuelven 404 sin cambios. No equivalen a una nueva carrera HTTP contra el panel. Las carreras de A3/A4 siguen aprobadas.

Al cerrar A5 la colección contenía 92 peticiones para 19 de 20 endpoints y ejecutó 196 comprobaciones mediante Node/fetch y scripts: previas 68/141, A5 24/55. No se ejecutó Postman gráfico. README, plan, protocolo y verificación reflejan el estado real; revisión gráfica del panel/Postman y explicación en pareja pendientes. A6 se describe a continuación; SPA sigue pendiente.


## API A6: resumen mensual del vendedor — 5 de noviembre de 2026

GET /api/reportes/resumen?mes=AAAA-MM requiere vendedor activo. Solo admite mes; no acepta vendedor_id ni cuerpo. El vendedor procede del middleware. Responde exactamente mes, ventas, total, pronostico y cartera con clientes/maximo, siempre números para cantidades/importes y ceros sin resultados. Un mes vacío, repetido, fuera del rango 1000-01–9998-12 o mal formado devuelve 400.

reports.js concentra el flujo. reportMonth obtiene por defecto el mes actual de America/Guatemala y guatemalaMonthStart convierte el primer instante local y el inicio del mes siguiente a UTC usando Intl y la misma zona IANA de Carbon/L6. Para octubre de 2026 los límites son 2026-10-01 06:00:00 inclusivo y 2026-11-01 06:00:00 exclusivo. Las pruebas comparan también límites históricos y años extremos con Carbon real.

sellerSummary usa una consulta SQL parametrizada: primero SUM(cantidad × precio_unitario) por oportunidad; después cuenta ventas ganadas en el intervalo y suma sus importes históricos. El CASE pondera prospecto 0.10, calificado 0.25, propuesta 0.50 y negociacion 0.75, sin filtro mensual; ROUND se aplica después de sumar. La cartera se cuenta en una subconsulta independiente por vendedor actual, sin multiplicarla por líneas. No se consulta el catálogo para sumar; las ventas cerradas conservan su dueño aunque se reasigne el cliente.

| Usuario | Mes | Ventas | Total | Pronóstico | Cartera |
| --- | --- | ---: | ---: | ---: | --- |
| Valeria | 2026-10 | 2 | Q9,250.00 | Q2,512.88 | 3/10 |
| Valeria | 2026-11 | 1 | Q3,600.00 | Q2,512.88 | 3/10 |
| Diego | 2026-10 | 1 | Q6,000.00 | Q112.50 | 2/10 |
| Carlos | 2026-10 | 1 | Q7,200.00 | Q4,125.75 | 9/10 |

El usuario eligió una base aislada para estas cifras: crm_ferreteria_a6_test, con solo VerificacionSeeder. Conserva 7 cuentas, 5 productos, 21 clientes, 11 oportunidades, 13 líneas, 43 historiales y 4 actividades. Se aplicaron las diez migraciones de Laravel y se cargó solo la semilla común; no se reinició ni modificó el contenido previo de otras bases. Las cuentas técnicas son independientes: crm_laravel_a6_test tiene SELECT/INSERT/UPDATE/DELETE/CREATE/ALTER/REFERENCES solo en esa base; crm_api_a6_test únicamente SELECT en users, clientes, oportunidades y oportunidad_productos. Los permisos de desarrollo y revisión manual no cambiaron.

Los secretos están solo en laravel/.env.a6-testing y api/.env.a6-testing ignorados. Sus ejemplos sin credenciales sí se versionan. El perfil aislado de API (puerto 3002) permite login y resumen; para el resto de operaciones use los perfiles completos descritos anteriormente.

Para reproducir la preparación en otra computadora:

1. Un administrador MySQL crea la base aislada y ambas cuentas técnicas con credenciales generadas localmente, conservadas solo en sus perfiles. Concede al usuario Laravel los permisos anteriores sobre la base exacta (escape los guiones bajos al conceder permisos de base). No reutilice root como usuario de aplicación.
2. Copie los ejemplos .env.a6-testing.example solo si no existen los perfiles locales y complete sus credenciales, APP_KEY y JWT_SECRET aleatorio. Genere APP_KEY desde laravel/ con php artisan key:generate --env=a6-testing. Para JWT_SECRET use el procedimiento local anterior apuntando a api/.env.a6-testing, sin imprimir la clave.
3. Desde api/, ejecute php tests/report-database.php --prepare. Comprueba base/cuenta/permisos, aplica migraciones pendientes y solo carga VerificacionSeeder si todas las tablas de negocio están vacías. No borra contenido ni repite una carga existente; rechaza recuentos distintos.
4. Después de crear las tablas, conceda al usuario API únicamente SELECT en las cuatro tablas indicadas. Configure PHP_BINARY en api/.env.testing para las pruebas de Laravel.

Al cerrar A6, npm.cmd test desde api/ ejecutaba 172 casos (150 previos y 22 A6). Para repetir solo A6: node --env-file=.env.testing --test --test-concurrency=1 tests/reports.test.js tests/reports-common.test.js. El segundo archivo exige el perfil aislado preparado y verifica las cuatro cifras mediante login real y HTTP; no cambia sus datos. El auxiliar PHP sin --prepare solo inspecciona base y recuentos. Las pruebas de casos extremos usan fixtures propios en crm_ferreteria_test y conservan sus filas manuales.

Para comprobar únicamente los controles en Postman, desde api/ ejecute node --env-file=.env.a6-testing src/server.js y cambie base_url de la colección a http://127.0.0.1:3002/api. Inicie sesión con cada vendedor de la semilla común y consulte octubre/noviembre antes de ejecutar bloques que cambien datos. Detenga el servidor con Ctrl+C. No ejecute los bloques de escritura de la colección contra este perfil de lectura.

Al cerrar A6 la colección cubría los veinte endpoints: 101 peticiones y 214 comprobaciones ejecutadas por Node/fetch y scripts; A6 añade nueve peticiones/18 comprobaciones. La interfaz Postman y la revisión gráfica del panel siguen pendientes, junto con explicación en pareja. No se avanzó a SPA ni se hizo push.


## Revisión final API A7/A8 — 6 de noviembre de 2026

Los veinte endpoints se contrastaron con las páginas 10–11 y 14 del enunciado y la especificación. Tabla vigente consolidada (los apartados A1–A6 conservan la historia de implementación):

| Método | Ruta | Entrada permitida | Éxito | Errores principales |
| --- | --- | --- | --- | --- |
| POST | /api/auth/login | correo, clave | 200 token y usuario | 400, 401, 403, 422 |
| GET | /api/productos | Sin cuerpo/filtros | 200 arreglo de activos | 400, 401 |
| GET | /api/clientes | q opcional | 200 arreglo propio | 400, 401 |
| POST | /api/clientes | nombre, nit, telefono; correo opcional | 201 cliente propio | 400, 401, 409, 422 |
| GET | /api/clientes/disponibles | Sin cuerpo/filtros | 200 arreglo id/nombre | 400, 401 |
| POST | /api/clientes/:id/tomar | Sin cuerpo/filtros | 200 cliente propio | 400, 401, 404, 409 |
| GET | /api/clientes/:id | Sin cuerpo/filtros | 200 cliente propio | 400, 401, 404 |
| PATCH | /api/clientes/:id | Solo campos del cliente que cambian | 200 cliente propio | 400, 401, 404, 409, 422 |
| POST | /api/clientes/:id/actividades | tipo, descripcion; vence_en opcional | 201 actividad | 400, 401, 404, 422 |
| GET | /api/actividades | estado opcional | 200 arreglo de cartera actual | 400, 401 |
| PATCH | /api/actividades/:id | completada booleano | 200 actividad | 400, 401, 404, 422 |
| GET | /api/oportunidades | etapa opcional | 200 resúmenes propios | 400, 401 |
| POST | /api/oportunidades | cliente_id, titulo | 201 detalle en prospecto | 400, 401, 404, 422 |
| GET | /api/oportunidades/:id | Sin cuerpo/filtros | 200 detalle | 400, 401, 404 |
| PATCH | /api/oportunidades/:id | titulo | 200 detalle | 400, 401, 404, 409, 422 |
| PATCH | /api/oportunidades/:id/etapa | etapa; motivo_perdida solo al perder | 200 detalle | 400, 401, 404, 409, 422 |
| POST | /api/oportunidades/:id/productos | producto_id, cantidad | 201 detalle | 400, 401, 404, 409, 422 |
| PATCH | /api/oportunidades/:id/productos/:lineaId | cantidad | 200 detalle | 400, 401, 404, 409, 422 |
| DELETE | /api/oportunidades/:id/productos/:lineaId | Sin cuerpo/filtros | 204 sin cuerpo | 400, 401, 404, 409 |
| GET | /api/reportes/resumen | mes opcional AAAA-MM | 200 resumen propio | 400, 401 |

Los 400 de cuerpo/filtro no admitido y los 404 por propiedad son reglas transversales; la especificación explica la prioridad de R2 al crear una oportunidad para cliente ajeno. Un fallo inesperado siempre responde 500 genérico. Las listas no tienen envoltorio. Usuario de login solo id/nombre/correo; cliente solo id/nombre/nit/telefono/correo; disponibles solo id/nombre; oportunidad resumida sin líneas/historial y detalle con ambos. Actividades y resumen mantienen las formas de sus apartados. Importes/recuentos numéricos y fechas ISO UTC; 204 sin cuerpo es la excepción deliberada a JSON.

Correcciones comprobadas, sin cambiar reglas de negocio:

- app.js reconoce codificación ilegible de rutas y errores gzip/deflate como 400, sin devolver detalles internos. Antes respondían 500.
- auth.js reutiliza validEmail de client-validation.js: dominios locales y direcciones entre comillas aceptados por Laravel llegan a verificar credenciales. Antes se rechazaban con 422; si la cuenta no existe ahora reciben el mismo 401 que cualquier credencial incorrecta. No se recorta ni transforma la contraseña.
- client-store.js descarta la conexión si pierde la confirmación de GET_LOCK o si falla el rollback. Un bloqueo confirmado se libera antes de devolver la conexión al pool; una liberación incierta ya descartaba la conexión y se conserva. opportunity-store.js también descarta una conexión cuyo rollback no se confirmó.

JWT HS256/sub/exp y usuario actual consultado por petición, propiedad, cupo diez, toma atómica, mínimos, precios históricos, cierre inmutable e historial transaccional siguen aprobados. No se cambiaron Laravel, migraciones, semillas, perfiles, cuentas o permisos. A8 para la API queda revisado; la guía de arranque de las tres piezas se completará al existir SPA. No se marca terminada esa integración ni la revisión gráfica.

Desde api/, npm.cmd test pasó **185/185** casos: 172 previos y 13 nuevos para los faltantes. Las cuatro cifras A6 siguen verificadas en su base aislada. La colección ahora tiene **108 peticiones y 336 comprobaciones**, con un único script global que revisa formato de errores, campos privados, números, booleanos y fechas UTC. Cada ejecutor existente procesa también ese script global. Tras concentrarlo allí se repitieron los cuatro bloques de colección: 4/4 aprobados, con las 108 peticiones y 336 comprobaciones. Es fetch HTTP y ejecución de scripts pm en Node; no se abrió Postman gráfico ni se ejecutó Newman.

Para repetir solo la colección, desde api/: node --env-file=.env.testing --test --test-concurrency=1 --test-name-pattern=colección tests/clients.test.js tests/opportunities.test.js tests/activities.test.js tests/reports.test.js. Estos ejecutores verifican base y cuenta, crean sus propios fixtures y los retiran; no use un servidor apuntando a desarrollo para ejecutar manualmente los bloques de escritura. Para repetir los nuevos casos sin escribir datos: node --env-file=.env.testing --test --test-concurrency=1 tests/api-review.test.js tests/transaction-review.test.js. El primer archivo usa el perfil A6 de lectura y el segundo dobles de conexión; no simula fallos reales de red sobre MySQL.

Recorrido de un alta de cliente: server.js carga config.js/database.js → app.js dirige a authenticate en auth.js → clients.js valida con client-validation.js → client-store.js bloquea vendedor, comprueba cupo y ejecuta INSERT parametrizado → MySQL confirma → se libera el bloqueo nombrado → publicClient devuelve el JSON. Un error revierte la transacción y app.js mantiene el formato contractual; si no se puede asegurar el estado de la conexión se descarta. El panel continúa mediante Eloquent sobre la misma base; el tramo de navegador vendedor se implementará en la futura SPA.

Huella de todas las filas del núcleo y permisos de control idéntica antes/después en crm_ferreteria, crm_ferreteria_test y crm_ferreteria_a6_test. Autoincrementales pueden avanzar en los fixtures de revisión manual. Pendientes: revisión gráfica de navegador/Postman, explicación en pareja, integración y SPA, además de las tareas del aula sin evidencia.

## Entrega

Se entrega el enlace al repositorio accesible y el commit marcado con entrega-final, no este paquete ZIP. El ZIP solo sirve para comenzar el trabajo local. Ambos integrantes deben realizar commits reales y entender todas las piezas para la defensa individual de 15 minutos por pareja.
