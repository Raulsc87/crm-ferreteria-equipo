# Verificación y bitácora de IA

Actualizado: 7 de noviembre de 2026. Estados: **histórico aprobado**, **registrado por Diego**, **comprobado hoy** y **pendiente**. No son intercambiables.

## Procedencia y alcance

La mayor parte de las pruebas se ejecutó en [Raulsc87/crm-ferreteria](https://github.com/Raulsc87/crm-ferreteria), hasta [033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044), antes de importar los archivos. Las referencias históricas se conservan mediante enlaces a ese repositorio; esos commits y spec-v1 no existen en el historial nuevo.

El rediseño pertenece a [PR #1](https://github.com/Raulsc87/crm-ferreteria-equipo/pull/1), rama frontend-diego hasta f510413. revision-raul conserva esos nueve commits y b69df52 documental, sin integrar el PR. No había cambios locales sin guardar.

La preparación documental anterior quedó guardada en b69df52. Esta verificación añade pruebas nuevas de la versión combinada, descritas abajo, sin reinterpretar como nuevas las evidencias del original. El [anexo](anexo-evidencias.md) conserva la historia necesaria.

## Aprobación visual e integración autorizada

Raúl confirmó que aprobó visualmente el diseño de Diego. Esta aprobación es individual: no acredita revisión en pareja, Postman gráfico, accesibilidad completa ni nuevas pruebas automáticas.

La verificación ya quedó guardada en 1fd6f7d28288dfed59f69c84abbe5cb68854998c; no se duplica ese commit. Tras fetch, frontend-diego sigue en f5104135db43407c46bdf72f2993a0400e81e9ad y es ancestro de revision-raul. Laravel, API y frontend coinciden con el código probado sobre b69df52: no hay cambios nuevos que requieran repetir suites.

Se autoriza publicar revision-raul, integrar primero el PR #1 mediante merge commit y después un PR de revision-raul hacia main con documentación, resultados y esta aprobación. Se conservan ramas, autores y commits individuales; sin squash, rebase, force push, cambios de base o etiquetas. El estado de los merges se comprueba en GitHub; las autorizaciones restrictivas de apartados anteriores corresponden a etapas ya cerradas. Revisión en pareja y Postman gráfico permanecen pendientes.

## Verificación combinada — 7 de noviembre de 2026

**Nueva ejecución en este repositorio:** revision-raul, referencia b69df529b7a7493ac66a2472a788292fbb8d4242, con el frontend de Diego hasta f510413. Ejecutó Codex por solicitud de Raúl; no es una revisión manual de la pareja.

### Preparación y resultados

Se detuvieron solo los tres servidores de revisión iniciados por el agente para liberar puertos. Las dependencias ya estaban instaladas. Se prepararon únicamente los perfiles locales A6 ausentes, reutilizando la configuración existente sin sobrescribir archivos ni mostrar secretos. No se creó, migró o sembró ninguna base.

Antes de escribir, SELECT DATABASE()/CURRENT_USER()/SHOW GRANTS y huellas completas identificaron las tres bases existentes. API/panel de integración usan crm_ferreteria_test en 3306, con cuentas técnicas independientes y CORS exacto http://127.0.0.1:5500. A6 se usa solo para login/lecturas. Los ejecutores vuelven a comprobar destino y permisos antes de sus fixtures y limpieza.

| Caso actual | Archivo o conjunto | Resultado |
| --- | --- | --- |
| COM-01 unidades | client, clients, opportunities, activities y summary .test.mjs | 43/43 aprobadas |
| COM-02 diseño autónomo | design-browser.test.mjs, API simulada sin MySQL | 1/1; nueve pantallas a 1280/375 px |
| COM-03 frontend real | browser.test.mjs y sus auxiliares de cartera/cotizaciones/actividades | 1/1; API Express y MySQL reales |
| COM-04 integración | integration-browser.test.mjs, panel Blade con CSRF y sesiones separadas + API + SPA | 1/1 |
| COM-05 controles comunes | summary-browser.test.mjs, A6 solo VerificacionSeeder y lectura | 1/1; cuatro controles coinciden |

Son **47 casos distintos**: 43 unidades, uno visual simulado y tres recorridos reales con múltiples comprobaciones. Se ejecutaron en dos comandos, sin sumar repeticiones. No hubo fallos ni necesidad de corregir código o repetir casos. No se inventa un error de IA para esta etapa.

Desde la raíz, con puertos libres:

```powershell
$env:DESIGN_KEEP_SCREENSHOTS='1'
node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/summary.test.mjs frontend/tests/design-browser.test.mjs
```

```powershell
$env:SPA_KEEP_SCREENSHOTS='1'
node --test --test-concurrency=1 frontend/tests/browser.test.mjs frontend/tests/summary-browser.test.mjs frontend/tests/integration-browser.test.mjs
```

Las variables KEEP conservan solo perfiles/capturas propios para inspección posterior; se retiraron los cuatro directorios exactos de esta ejecución tras revisarlos. No se incorporan capturas, cookies, tokens o perfiles al repositorio.

### Qué se comprobó realmente

- Acceso: hash Laravel verificado por API, roles, cuenta inactiva, logout, restauración, JWT vencido y 401 atrasado que no borra una sesión nueva; falta de conexión y texto hostil seguro.
- Cartera: creación/edición, normalización, 422 junto al campo, duplicado/ocupado/cupo 409, recurso ajeno 404, doble envío impedido y búsquedas HTTP solapadas sin sobrescribir resultados recientes.
- Cotizaciones: crear/editar, agregar/modificar/retirar líneas y 204; mínimo 422, repetido 409, inactivo 422, transiciones no permitidas, ganar sin productos y perder sin motivo rechazados; cerradas 409 e historial estable.
- Históricos: recorrido SPA conserva Q12.34 × 6 = Q74.04 y cinco entradas tras modificar catálogo. No solicita ficha privada al consultar una cerrada de cliente reasignado.
- Panel → SPA: administrador crea dos vendedores y producto; supervisor asigna y reasigna cliente. Abiertas pasan al nuevo vendedor, cerradas conservan dueño/crédito y actividad conserva autor.
- Venta integral: mínimo 5 rechaza 1, acepta 5 a Q12.34; catálogo cambia a Q20/mínimo 10/inactivo, la línea conserva Q61.70, editar a 6 se rechaza y cerrar sigue permitido. Resumen y reporte Laravel muestran esa venta de fixture; reactivar permite cotizar al nuevo precio.
- Actividades: tres tipos, vencimiento vacío/futuro/pasado, filtros y completar/reabrir; fecha Guatemala interpretada correctamente con navegador en Tokio. Reasignación retira acceso con 404 y el nuevo dueño completa sin cambiar autor.
- Estado/rol desde panel: desactivar un vendedor y convertir otro a supervisor hace que sus JWT ya emitidos reciban 401 en la siguiente petición; SPA limpia sesión.
- A6: Valeria octubre/noviembre, Diego y Carlos coinciden con los cuatro controles de la tabla histórica. Mes inicial de Guatemala probado con navegador en Tokio y reloj de página en la frontera de mes; ceros, mes inválido 400, red desconectada, vencimiento, reentrada, cartera compartida y respuestas atrasadas correctos.

No se repitieron las suites completas Laravel/API ni las carreras SQL de cartera/etapas: no cambió su código. La evidencia concurrente histórica conserva su alcance; doble clic y peticiones de lectura solapadas no se presentan como nuevas carreras transaccionales.

### Inspección visual ejecutada

El agente inspeccionó las **18 capturas del recorrido autónomo**: acceso con errores, lista/formulario/ficha de cliente con actividad, embudo, cotización, confirmación, actividades y resumen; cada pantalla a 1280 y 375 px.

Además inspeccionó **ocho capturas representativas de los recorridos reales**: resumen y actividad reasignada en ambos anchos, errores de cliente a 375, mínimo rechazado a 375, venta cerrada a 1280 y Valeria octubre A6 a 375. Legibilidad, mensajes junto al campo, controles, tarjetas e historial visibles; sin desbordamiento de página en esos estados. El recorrido integral también comprueba el ancho solicitado, incluidos formularios/tablas del panel.

Esto acredita inspección de capturas por el agente, no revisión manual en pareja, Postman gráfico ni auditoría completa de accesibilidad. No se afirma inspeccionar cada captura generada ni aprobar todos los estados posibles.

### Conservación y pendientes

Huellas de **todas las filas/columnas** del núcleo y permisos de las tres cuentas de control idénticos antes/después:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 12 | 29 | 19 | 21 | 69 | 9 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Las pruebas de escritura retiraron solo sus propios IDs/prefijos aleatorios; registros manuales conservados. Los autoincrementales pueden avanzar. A6 no recibió escrituras de negocio. Sin reinicios, migraciones, semillas, cambios de permisos, limpieza general o modificaciones del repositorio original.

Pendientes: revisión humana en pareja, Postman gráfico, instalación externa y tareas de entrega del plan. La integración automatizada del rediseño queda comprobada; no equivale a autorizar integración de ramas. No se modificó código de aplicaciones o pruebas. Al finalizar las pruebas, resultados/documentación quedaron sin commit ni push; el cierre documental se autorizó después. PR y etiquetas no cambiaron.

Revisión final de esta etapa: sintaxis de 26 archivos JS/MJS aprobada con node --check; enlaces locales, codificación, exclusiones y git diff --check correctos, sin secretos reales detectados. Solo README, plan y verificación quedan modificados. Se restablecieron los tres servidores manuales: login del panel 200, frontend 200 y productos API sin token 401 esperado; no fue otra prueba funcional. Los perfiles A6 preparados siguen ignorados.

### Cierre documental posterior

Se autorizó guardar únicamente README.md, docs/plan.md y docs/verificacion.md con el mensaje «docs: registrar verificación del rediseño integrado» y publicar revision-raul en origin, sin force push. Este cierre conserva los resultados ya ejecutados y no repite pruebas ni operaciones de base. Revisión en pareja y Postman gráfico siguen pendientes; no se autoriza integrar ramas, cerrar el PR ni cambiar etiquetas.

## Preparación anterior del 7 de noviembre: sin pruebas funcionales

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

Las filas “histórico” remiten al original. COM-01…05 añaden evidencia nueva para acceso, cartera, cotizaciones, actividades, resumen e integración del rediseño, sin volver a acreditar las carreras SQL históricas. Los nombres de prueba corresponden a los archivos importados que pueden consultarse ahora.

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
| F6 | Estado/render/eventos, cargas, XSS, respuestas atrasadas, 1280/375 px | Histórico y COM-01…05 aprobados; pareja pendiente |
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

El registro indica dos fallos del ejecutor: comillas sin escapar en selector y referencia a formulario reemplazado por render. Se corrigió el ejecutor y la tercera ejecución pasó, en [f510413](https://github.com/Raulsc87/crm-ferreteria-equipo/commit/f5104135db43407c46bdf72f2993a0400e81e9ad). No fueron fallos de negocio ni resultados ejecutados ahora. La integración se comprobó después en COM-01…05; la revisión humana en pareja sigue pendiente.

## Bitácora de IA: errores reales y corrección

Estos seis casos ocurrieron durante el desarrollo original. Esta bitácora conserva los enlaces a sus correcciones en `Raulsc87/crm-ferreteria`. 

### 1. Una respuesta atrasada cerraba una sesión nueva (IA-14)

- **Error:** una respuesta de sesión vencida podía llegar después de que el vendedor iniciara sesión de nuevo y borrar esa sesión nueva.
- **Detección:** una prueba automatizada en el navegador retrasó la respuesta de la sesión anterior hasta después del nuevo inicio de sesión y comprobó que se perdía el acceso.
- **Corrección:** antes de borrar la sesión, se comprueba que siga siendo la misma que originó la petición.
- **Verificación:** las nueve pruebas finales pasaron, incluido el caso de las dos sesiones solapadas.
- **Evidencia:** [commit e729970](https://github.com/Raulsc87/crm-ferreteria/commit/e7299702a56ed880c2238767d2dc183869d2c427).

### 2. La lista no se actualizaba al regresar a Clientes (IA-15)

- **Error:** al volver a Clientes desde otra sección, se mostraba la lista guardada en memoria. Un cliente recién asignado desde el panel no aparecía sin actualizar la página.
- **Detección:** el recorrido automatizado de integración asignó un cliente desde el panel y regresó a Clientes; la espera terminó sin encontrarlo.
- **Corrección:** al entrar en Clientes, se consultan otra vez las listas y el cupo, y se comprueba si la ficha abierta sigue siendo accesible.
- **Verificación:** pasaron tres pruebas nuevas y el recorrido de integración, sin actualizar la página manualmente. También se comprobó la pérdida de sesión durante esa consulta.
- **Evidencia:** [commit 033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044).

### 3. Un filtro desbordaba la página en pantalla estrecha (IA-16)

- **Error:** el filtro de vendedor de las oportunidades del panel ocupaba demasiado ancho cuando había nombres largos.
- **Detección:** al inspeccionar una captura solicitada a 375 píxeles, el agente encontró una imagen de 524 píxeles. La comprobación anterior no detectaba ese desbordamiento.
- **Corrección:** se limitó el ancho del filtro y de sus contenedores. La prueba pasó a comparar el ancho con los 375 píxeles solicitados y a esperar la carga de las fuentes.
- **Verificación:** la captura final midió 375 píxeles de ancho. Pasaron las pruebas afectadas de Laravel y el recorrido de integración.
- **Evidencia:** [commit 033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044).

### 4. La API confundía peticiones ilegibles con fallos del servidor (IA-11)

- **Error:** algunas direcciones mal codificadas, como `%ZZ`, y cuerpos comprimidos dañados recibían el código 500, que indica un fallo interno del servidor.
- **Detección:** las pruebas enviaron esas peticiones a la API real y observaron respuestas 500.
- **Corrección:** se reconocen esos errores de lectura y se responde con el código 400, que indica una petición ilegible, y un mensaje general en formato JSON.
- **Verificación:** cinco casos nuevos recibieron el código 400 y la respuesta JSON esperada.
- **Evidencia:** [commit 055398a](https://github.com/Raulsc87/crm-ferreteria/commit/055398aead74b337d50b5ee5b6d81576ca320ac5).

### 5. El acceso de la API rechazaba correos válidos para Laravel (IA-12)

- **Error:** la validación del inicio de sesión rechazaba ciertos formatos de correo que Laravel sí aceptaba.
- **Detección:** se compararon ambos validadores con correos de dominio local y direcciones entre comillas; la API los rechazaba con el código 422, como si su formato fuera inválido.
- **Corrección:** el inicio de sesión reutiliza la función de validación de correo existente, sin modificar la contraseña recibida.
- **Verificación:** dos correos válidos sin cuenta registrada llegaron a la consulta de usuarios y recibieron el código 401 por credenciales incorrectas. También pasó la comparación con el validador de Laravel.
- **Evidencia:** [commit 055398a](https://github.com/Raulsc87/crm-ferreteria/commit/055398aead74b337d50b5ee5b6d81576ca320ac5).

### 6. Se podía reutilizar una conexión cuyo estado era incierto (IA-13)

- **Error:** después de ciertos fallos, la API podía devolver una conexión a la reserva de conexiones reutilizables sin saber si conservaba un bloqueo o cambios pendientes.
- **Detección:** pruebas con conexiones simuladas reprodujeron fallos al adquirir un bloqueo o al cancelar una transacción, es decir, una operación que debe confirmarse completa o deshacerse. No fueron cortes observados en el servidor real.
- **Corrección:** si no se puede confirmar que la conexión quedó en un estado seguro, se descarta. Los bloqueos deben liberarse antes de devolver una conexión para reutilizarla.
- **Verificación:** seis pruebas comprobaron la confirmación o cancelación de operaciones, la liberación de bloqueos y el descarte de conexiones con estado incierto.
- **Evidencia:** [commit 055398a](https://github.com/Raulsc87/crm-ferreteria/commit/055398aead74b337d50b5ee5b6d81576ca320ac5).

## Inspección visual y pendientes

Histórico: agente inspeccionó capturas Edge de formularios, listas, Mi equipo, reportes, cartera, oportunidades, actividades y resumen a 1280/375. Las tablas del panel pueden desplazarse dentro del contenedor; la página no debía desbordar. Esto no es revisión en pareja ni accesibilidad completa.

La preparación anterior solo comprobó disponibilidad. COM-01…05 documenta ahora pruebas reales y capturas inspeccionadas por el agente; la revisión en pareja permanece pendiente; la aprobación visual de Raúl se registra por separado.

Raúl aprobó visualmente el diseño, según su confirmación. Pendientes: revisar en pareja el recorrido del PR; comprobar permisos/validaciones/errores en sus navegadores; Postman gráfico; ensayo individual, instalación externa, aula, acceso del catedrático y política de hitos del repositorio importado. No se marca completada entrega-final ni un cambio de requisito todavía no publicado. No se modifica ni reinicia ninguna base para preparar la defensa.

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
