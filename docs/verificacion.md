# Verificación y bitácora de IA

Actualizado: 7 de noviembre de 2026. Estados: **histórico aprobado**, **registrado por Diego**, **comprobado hoy** y **pendiente**. No son intercambiables.

## Procedencia y alcance

La mayor parte de las pruebas se ejecutó en [Raulsc87/crm-ferreteria](https://github.com/Raulsc87/crm-ferreteria), hasta [033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044), antes de importar los archivos. Las referencias históricas se conservan mediante enlaces a ese repositorio; esos commits y spec-v1 no existen en el historial nuevo.

El rediseño pertenece a [PR #1](https://github.com/Raulsc87/crm-ferreteria-equipo/pull/1), rama frontend-diego hasta f510413. Hoy revision-raul incluye sus seis commits y los tres de importación de Raúl, sin integrar el PR. No había cambios locales sin guardar.

Esta etapa prepara la ejecución y reduce documentos; **no repite suites ni acredita integración del rediseño**. El [anexo](anexo-evidencias.md) resume la historia necesaria, sin copiar los registros repetitivos.

## Comprobaciones de hoy: preparación, no pruebas funcionales

Ejecutó Codex por solicitud de Raúl, sobre crm-ferreteria-equipo/revision-raul. No se cambió código de negocio, bases, permisos o etiquetas; los documentos quedan sin commit/push.

| Caso | Operación y resultado real | Límite |
| --- | --- | --- |
| REV-01 Git | origin correcto; fetch; revision-raul creada desde origin/frontend-diego f510413; tres commits Raúl + seis Diego conservados | PR abierto; main no integrado |
| REV-02 dependencias | composer install --no-scripts --no-interaction --prefer-dist: 109 instalaciones; npm.cmd ci en API/panel: 92/145 paquetes añadidos; auditorías npm sin vulnerabilidades | Dependencias de lockfiles, sin actualizaciones de contrato; no es ejecución de tests |
| REV-03 perfiles | No había .env.testing en esta copia; se prepararon solo esos dos perfiles a partir de configuración local de pruebas ya existente; sin sobrescribir .env ni mostrar claves | Los ejemplos siguen sin secretos; perfiles/dependencias ignorados |
| REV-04 Laravel | package:discover --env=testing correcto; npm.cmd run build correcto, Vite 7.3.7; configuración sin caché | Solo inicialización/compilación; sin migraciones/semillas |
| REV-05 base | SELECT DATABASE()/CURRENT_USER(): panel y API seleccionan crm_ferreteria_test en MySQL local, cada uno con su cuenta técnica independiente | No se consultaron contraseñas ni se escribió negocio |
| REV-06 HTTP | Panel /login 200; SPA / 200 y css/app.css 200; GET API /productos sin token 401 esperado | Disponibilidad, no login ni validación integral |
| REV-07 origen | SPA publicada en 127.0.0.1:5500, URL API 3001 y SPA_ORIGIN exacto coincidentes | No sustituye revisión humana de interfaz |
| REV-08 documentos | Leídos PDF y documentos completos; agrupados estados/repeticiones; se conservan 20 endpoints y procedencia histórica | Resumen editorial, no cambio de requisitos ni de resultados |
| REV-09 revisión editorial | Ambas tablas conservan 20 endpoints; enlaces locales, UTF-8, bloques Markdown y diff --check correctos; comparación contra secretos locales sin hallazgos | Solo revisión estática; cuatro documentos modificados y un anexo nuevo, sin cambios de código ni lockfiles |

Recuentos leídos al preparar la ejecución, antes de las operaciones manuales de esta revisión: **12 cuentas, 12 productos, 29 clientes, 19 oportunidades, 21 líneas, 69 historiales y 9 actividades**. Son datos existentes de crm_ferreteria_test, no una carga recién sembrada ni valores que deban restablecerse. No se ejecutaron migraciones, seeders, limpiezas o pruebas de escritura.

Servidores actuales: panel http://127.0.0.1:8001/login, API http://127.0.0.1:3001/api y SPA http://127.0.0.1:5500. Arranque/parada en [README](../README.md#iniciar-para-revisión-manual). Los cambios que ustedes guarden durante la revisión sí permanecerán en la base de pruebas.

## Matriz de requisitos y evidencias

Todas las filas “histórico” remiten a ejecuciones anteriores del original; ninguna afirma una nueva aprobación del rediseño. Los nombres de prueba corresponden a los archivos importados que pueden consultarse ahora.

| Código | Criterio y evidencia | Resultado y pendiente |
| --- | --- | --- |
| R1 | PanelAccountsTest, auth.test.js e integral: roles, activo y sesión/JWT ya emitidos; [fuente][E34] | Histórico aprobado; repetir revisión humana con diseño nuevo |
| R2 | ClientManagementTest y suites clientes/oportunidades/actividades: ámbito, 404 y archivo cerrado; [fuente][E24] | Histórico aprobado |
| R3 | Cinco carreras Laravel y nueve A3, incluidas cuatro entre puertas; [fuente][E24] | Histórico aprobado, simultaneidad real |
| R4 | 32 vectores de paridad, NIT/CF/teléfono y conflictos de índices; [fuente][E24] | Histórico aprobado en clientes, no generalizar a otros contratos |
| R5 | opportunities.test.js: creación/historial, etapas, cierre inmutable y cinco carreras; [fuente][E25] | Histórico aprobado |
| R6 | Copia precio, mínimo, total decimal y cambios de catálogo; venta integral Q61.70; [fuente][E34] | Histórico aprobado |
| R7 | L6, A6 y navegador A6: cifras comunes y límites Guatemala/UTC; [fuente][E33] | Histórico aprobado |
| R8 | activities.test.js y F4: zona obligatoria, UTC, vencida y cartera actual; [fuente][E32] | Histórico aprobado |
| SEC | Cantidad mínima 50: 20/49 rechazados, 50/51 aceptados; cambio no invalida líneas previas; [fuente][E25] | Histórico aprobado; comunes mínimo 1 intactos |
| L1 | SchemaIntegrityTest 40/61 y SeederDataTest 3/404; esquema/semillas exactos; [fuente][E15] | Histórico aprobado; no repetir sobre base manual poblada |
| L2 | PanelAccountsTest: 47 casos de acceso, cuentas, CSRF y protección propia; [fuente][E16] | Histórico aprobado; capturas posteriores inspeccionadas |
| L3 | ProductCatalogTest: 52 casos, duplicados, límites, estado/históricos; [fuente][E17] | Histórico aprobado |
| L4 | ClientManagementTest 43 funcionales + cinco carreras, liberación/eliminación; [fuente][E18] | Histórico aprobado |
| L5 | TeamPageTest 25: equipo, inactivos, cartera/ventas, ajenos y frontera; [fuente][E19] | Histórico aprobado |
| L6 | OpportunityReportsTest 31: filtros/ámbito, mes y desgloses; [fuente][E20] | Histórico aprobado; filtro móvil corregido en 033a51e |
| L7 | PanelValidationTest 23: conservación, errores internos, tipos malformados; [fuente][E21] | Histórico aprobado; paridad R3/R4 contrastada en A3 |
| A1 | auth.test.js: hashes Laravel, clave intacta, 200/401/403 y JWT; [fuente][E23] | Histórico aprobado |
| A2 | HS256, exp/sub, cuenta actual, firma/usuario/rol inválidos; [fuente][E23] | Histórico aprobado |
| A3 | Seis rutas, validación, cupo/toma y concurrencia API/panel; [fuente][E24] | Histórico aprobado |
| A4 | Ocho rutas, precio histórico, mínimo, cerradas e historial atómico; [fuente][E25] | Histórico aprobado |
| A5 | Tres rutas, autor y cartera vigente, ISO, filtros y completada; [fuente][E26] | Histórico aprobado |
| A6 | reports.test.js/reports-common.test.js: SQL y cuatro controles A6; [fuente][E27] | Histórico aprobado, A6 solo común y lectura |
| A7 | api-review.test.js/transaction-review.test.js y colección: códigos/formas/privacidad; [fuente][E28] | Histórico aprobado, 20 endpoints |
| A8 | README, colección de 20 rutas; instalación/arranque actual de esta copia | Guía y disponibilidad comprobadas; Postman gráfico e instalación externa pendientes |
| F1 | client.test.mjs y browser.test.mjs: login/logout, 401 y sesión atrasada; [fuente][E29] | Histórico aprobado |
| F2 | clients.test.mjs y clients-browser.mjs: búsqueda, errores, formularios/toma/cupo; [fuente][E30] | Histórico aprobado |
| F3 | opportunities.test.mjs y opportunities-browser.mjs: cotización, etapas, archivo; [fuente][E31] | Histórico aprobado |
| F4 | activities.test.mjs y activities-browser.mjs: vencimientos, filtros/reasignación; [fuente][E32] | Histórico aprobado |
| F5 | summary.test.mjs/summary-browser.test.mjs: cifras comunes, mes, ceros/red/401; [fuente][E33] | Histórico aprobado |
| F6 | Estado/render/eventos, cargas, XSS, respuestas atrasadas, 1280/375 px | Histórico aprobado; Diego registra 44/44 con simulación, integración nueva pendiente |
| S1 | Laravel genera hashes; API verifica bcryptjs; [fuente][E23] | Histórico aprobado, no contraseñas planas en DB |
| S2 | Entornos ignorados, ejemplos/locks; revisión histórica de secretos e importaciones | Histórico revisado; exclusiones de la copia comprobadas hoy |
| S3 | SQL parametrizado, búsquedas de inyección y paridad; [fuente][E24] | Histórico aprobado |
| S4 | DTO públicos/errores/códigos, script global de colección; [fuente][E28] | Histórico aprobado |
| S5 | Recursos ajenos 404 en ambas puertas e integración; [fuente][E34] | Histórico aprobado |
| S6 | CORS exacto, ajeno sin autorización y preflight; [fuente][E23] | Histórico aprobado; configuración actual coincide |
| S7 | Texto hostil seguro en SPA/Blade, sin ejecución; [fuente][E34] | Histórico aprobado; Diego registra también control visual simulado |
| S8 | Barreras SQL, conexiones distintas, índices y estado final; [fuente][E34] | Histórico aprobado; no equivale a doble clic ni colección secuencial |
| P1 | Especificación/spec-v1 anterior a código en el original; [hito](https://github.com/Raulsc87/crm-ferreteria/tree/spec-v1) | Evidencia externa conservada; explicar importación al catedrático, no fingir etiqueta nueva |
| P2 | Plan con participación acreditada y tareas actuales | Actualizado, pendiente revisión en pareja |
| P3 | Esta matriz y anexo con fuentes, fechas y límites | Resumidos sin ejecutar de nuevo las pruebas |
| P4 | AGENTS.md raíz, leído sin modificar | Presente |
| P5 | Bitácora real siguiente con commits del original | Más de tres casos documentados; no se inventa autoría ni incidentes |

## Resultados históricos consolidados

Cierre integral del **6 de noviembre de 2026**, [fuente original][E34], ejecutado por el agente a solicitud de Raúl. No suma resultados de repeticiones.

| Componente | Resultado |
| --- | --- |
| Laravel completo | 270 pruebas, 2.633 aserciones; instancia MySQL temporal propia 3307 |
| API | 185/185, MySQL testing y A6 para controles comunes |
| Frontend antes del rediseño | 46/46: 43 unidades y tres recorridos de navegador |
| Repetición tras ajuste Blade | 31 Laravel/232 aserciones e integral 1/1 |
| Colección mediante Node/fetch/scripts pm | 108 peticiones y 336 comprobaciones, cuatro bloques; no Postman gráfico ni Newman |
| Recursos | Build, sintaxis y formato aprobados |

Colección: A1/A2/A3 36 peticiones/109 comprobaciones; A4 38/118; A5 25/82; A6 9/27. Se corrige la tabla histórica repetida que había mezclado texto de la matriz con las cifras; los valores provienen del cierre integral, no de una nueva ejecución.

### Integración, concurrencia y regla del sector

- INT-01/05: administrador creó vendedor por Blade; login real con hash Laravel y cliente asignado visible en SPA.
- INT-02/03: venta por SPA reflejada en panel; precio Q12.34 × 5 = Q61.70 conservado después de cambiar catálogo a Q20, mínimo 10 e inactivo.
- INT-04: desactivación y cambio de rol por panel invalidaron el siguiente uso del JWT emitido; SPA limpió sesión.
- INT-06: 32 vectores R4 y carreras comunes; reasignación movió abiertas/cartera, conservó crédito cerrado y autor de actividad, acceso por dueño actual.
- CON-01/02/03: cinco carreras API/API de toma/cupo/duplicados y cuatro API/panel; diez tomas dieron un 200 y nueve 409. Panel operó por kernel HTTP en proceso PHP, API por TCP.
- CON-04: cinco carreras A4 (etapa, avance/pérdida, cierres, producto repetido y cierre/cantidad), conexiones distintas y barreras; un éxito/conflicto según estado. Si cantidad confirma antes del cierre, ambas pueden confirmar en ese orden.
- Laravel agregó cinco carreras propias; no se suman como endpoints ni se confunden con secuencias Postman.
- SEC-01…05: mínimo 50 rechaza 20/49 y admite 50/51; edición vuelve a validar vigente, cierre conserva líneas anteriores, semilla común permanece en mínimo 1.

Se comprobaron conexiones distintas y peticiones pendientes antes de liberar la barrera, IS_FREE_LOCK después y filas finales. Fallos de rollback/GET_LOCK/liberación se simularon con dobles: verifican descarte de conexión, no acreditan cortes reales de MySQL. Errores Error/TEST_HISTORY de consola fueron inyecciones deliberadas para probar 500 y rollback, no nuevos defectos de producción.

### Cifras obtenidas con solo VerificacionSeeder

Coincidieron con el PDF en consultas/panel/API; F5 contrastó los cuatro casos de vendedor desde navegador contra la base aislada A6. No son cifras de la base manual actual.

| Ámbito / mes | Ventas | Total Q | Pronóstico Q | Cartera |
| --- | ---: | ---: | ---: | --- |
| Valeria 2026-10 | 2 | 9,250.00 | 2,512.88 | 3/10 |
| Valeria 2026-11 | 1 | 3,600.00 | 2,512.88 | 3/10 |
| Diego 2026-10 | 1 | 6,000.00 | 112.50 | 2/10 |
| Carlos 2026-10 | 1 | 7,200.00 | 4,125.75 | 9/10 |
| Equipo Sergio 2026-10 | 3 | 15,250.00 | 2,625.38 | — |
| Equipo Sandra 2026-10 | 1 | 7,200.00 | 4,125.75 | — |
| Empresa 2026-10 | 4 | 22,450.00 | 6,751.13 | — |

Por producto, octubre: Plan básico 5 unidades/Q6,000; Plan avanzado 2/Q5,200; Instalación 1/Q450; Soporte anual 3/Q10,800. Frontera 03:30 UTC de noviembre pertenece a octubre Guatemala y 06:30 a noviembre. Se usó precio cotizado Q2,600, no catálogo Q2,750.50, y redondeo final del pronóstico. Fuentes: [L6][E20], [A6][E27] y [F5][E33].

## Rediseño de Diego: evidencia registrada, no repetida hoy

Fuente: [registro del commit f510413](https://github.com/Raulsc87/crm-ferreteria-equipo/blob/f5104135db43407c46bdf72f2993a0400e81e9ad/docs/verificacion.md#L1461) y PR #1, 7 de noviembre.

Diego registró 43 unidades y un recorrido visual autónomo aprobados (44/44), sintaxis de 26 JS/MJS y 18 capturas inspeccionadas: nueve pantallas a 1280/375 px, sin desbordamiento. design-browser.test.mjs usa **API simulada en memoria**, sin MySQL. Incluye validaciones/mensajes, filtros, confirmación de cierre, resumen y texto hostil seguro.

El registro indica dos fallos del ejecutor: comillas sin escapar en selector y referencia a formulario reemplazado por render. Se corrigió el ejecutor y la tercera ejecución pasó, en [f510413](https://github.com/Raulsc87/crm-ferreteria-equipo/commit/f5104135db43407c46bdf72f2993a0400e81e9ad). No fueron fallos de negocio ni resultados ejecutados ahora. La integración real del diseño nuevo y la revisión de Raúl/pareja siguen pendientes aunque los servidores ya estén disponibles.

## Bitácora de IA: errores reales y corrección

Todos los commits de esta tabla son del **repositorio original**, no del nuevo. Los incidentes tempranos y de ejecutores se resumen en el anexo. No basta atribuir un problema a la IA sin detección y evidencia.

| Caso | Error y detección real | Corrección y evidencia | Commit del original |
| --- | --- | --- | --- |
| IA-11 | Rutas %ZZ/%FF y gzip/deflate corrupto devolvían 500 en HTTP | Parser distingue petición ilegible: cinco casos nuevos 400 JSON | [055398a](https://github.com/Raulsc87/crm-ferreteria/commit/055398aead74b337d50b5ee5b6d81576ca320ac5) |
| IA-12 | Login rechazaba con 422 correos aceptados por Laravel | Reutiliza validEmail, clave intacta; dos correos válidos inexistentes llegan a 401 | [055398a](https://github.com/Raulsc87/crm-ferreteria/commit/055398aead74b337d50b5ee5b6d81576ca320ac5) |
| IA-13 | Dobles reproducían devolver conexión tras GET_LOCK o rollback sin confirmar | Descartar conexión incierta; seis casos comprueban liberar antes del pool/destroy | [055398a](https://github.com/Raulsc87/crm-ferreteria/commit/055398aead74b337d50b5ee5b6d81576ca320ac5) |
| IA-14 | Un 401 atrasado de restauración borraba una sesión nueva; fallo solapado de navegador | Comparar sesión/token vigentes antes de limpiar; nueve pruebas finales | [e729970](https://github.com/Raulsc87/crm-ferreteria/commit/e7299702a56ed880c2238767d2dc183869d2c427) |
| IA-15 | Cliente asignado no aparecía al volver a Clientes sin refrescar; timeout integral | clients.enter reconsulta y revalida ficha; tres unidades nuevas e integración | [033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044) |
| IA-16 | Captura solicitada a 375 resultó de 524 px por filtro largo; innerWidth ocultaba desborde | Limitar wrappers/selects; comparar ancho solicitado, esperar fuentes; captura 375, 31/232 + integral 1/1 | [033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044) |

Fuentes de detección: [A7/A8][E28], [F1][E29] e [integral][E34]. No se inventa un fallo nuevo de IA para esta edición documental.

## Inspección visual y pendientes

Histórico: agente inspeccionó capturas Edge de formularios, listas, Mi equipo, reportes, cartera, oportunidades, actividades y resumen a 1280/375. Las tablas del panel pueden desplazarse dentro del contenedor; la página no debía desbordar. Esto no es revisión en pareja ni accesibilidad completa.

Hoy se comprobó disponibilidad del diseño real servido, **sin nueva inspección de capturas ni pruebas funcionales**. No declarar aprobación visual humana hasta que ustedes la comuniquen.

Pendientes: revisar diseño y recorrido integrado del PR; comprobar permisos/validaciones/errores en sus navegadores; Postman gráfico; ensayo individual, instalación externa, aula, acceso del catedrático y política de hitos del repositorio importado. No se marca completada entrega-final ni un cambio de requisito todavía no publicado. No se modifica ni reinicia ninguna base para preparar la defensa.

[E15]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L349
[E16]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L413
[E17]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L458
[E18]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L503
[E19]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L568
[E20]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L609
[E21]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L655
[E23]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L707
[E24]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L755
[E25]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L824
[E26]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L910
[E27]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L958
[E28]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1023
[E29]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1101
[E30]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1149
[E31]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1202
[E32]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1261
[E33]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1317
[E34]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L1376
