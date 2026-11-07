# Registro de verificación y bitácora de IA

Equipo: Raúl y Diego. Proyecto: CRM Ferretería. Estado inicial histórico: documentación preparada. Estado actual: revisión integral automática e inspección de capturas aprobadas; pareja/Postman gráfico/entrega pendientes (sección 34).

## 1. Cómo registrar pruebas

Cada criterio de aceptación de docs/especificacion.md deberá tener un caso identificable. La matriz inicial agrupa por requisito; se ampliará con una fila por criterio al ejecutar las pruebas. No declarar cubierto un requisito si quedan criterios sin comprobar.

Cada caso registra: identificador, requisito/criterio, fecha, responsable, precondiciones y semilla utilizada, pasos o petición, resultado esperado, resultado obtenido, evidencia y commit probado cuando exista. Usar los estados Pendiente, Aprobado, Fallido o Bloqueado.

No guardar tokens vigentes, secretos ni contraseñas reales en capturas o archivos. Distinguir una comprobación documental de una prueba funcional.

## 2. Matriz vigente

| Código | Criterio o área | Estado funcional | Evidencia |
| --- | --- | --- | --- |
| R1 | Acceso por rol y cuenta activa | Aprobado panel/API/SPA | Sección 34: cuenta creada en panel, login real, rol/estado actuales y 401 con token emitido |
| R2 | Propiedad y visibilidad | Aprobado por suites e integración | Secciones 18–28 y 34: ámbitos, ajenos 404 y reasignación entre sesiones SPA |
| R3 | Cartera máxima y toma atómica | Aprobado en ambas puertas | Secciones 24 y 34: nueve carreras A3, incluidas cuatro API/panel, y cinco Laravel |
| R4 | NIT y teléfono normalizados y únicos | Aprobado; paridad comprobada | Secciones 24 y 34: 32 vectores comunes, normalización e índices únicos concurrentes |
| R5 | Embudo, cierre e historial | Aprobado API/SPA | Secciones 25, 31 y 34: etapas/historial atómicos, carreras y cierre inmutable |
| R6 | Precios cotizados y totales | Aprobado integración real | Sección 34: catálogo 12.34 → 20.00, cotización conservada y venta 61.70 en ambas puertas |
| R7 | Reportes y mes de Guatemala | Aprobado panel/API/SPA | Secciones 20, 27, 33–34: cifras comunes, fronteras UTC, precio histórico y venta real del recorrido |
| R8 | Respuestas, fechas y actividades | Aprobado API/SPA | Secciones 26, 32 y 34: fechas UTC/Guatemala, actividades y autor histórico con cartera vigente |
| SEC | Cantidad mínima de venta del sector | Aprobado | Secciones 25, 31 y 34: mínimo vigente, conservación histórica y validación tras cambio de catálogo |
| L1 | Migraciones, restricciones y semillas | Aprobado en esquema/datos | Secciones 14 y 15: migraciones, 40 pruebas de integridad y 3 pruebas de semillas; no acredita módulos |
| L2 | Cuentas y roles del panel | Aprobado automático e inspección de capturas | Secciones 16 y 34: formularios reales, roles, estado y suites; pareja pendiente |
| L3 | Catálogo y desactivación | Aprobado automático e inspección de capturas | Secciones 17 y 34: catálogo desde panel y efecto en SPA sin cambiar históricos |
| L4 | Clientes y asignación | Aprobado integración real e inspección | Secciones 18 y 34: asignación/reasignación HTTP y actualización de cartera/ficha |
| L5 | Equipos y aislamiento | Aprobado suite e inspección de capturas | Secciones 19 y 34: equipo, inactivos y ventas históricas; pareja pendiente |
| L6 | Oportunidades de consulta y reportes | Aprobado suite/integración e inspección | Secciones 20 y 34: consulta y reporte reflejan venta SPA; filtro corregido a 375 px |
| L7 | Validación del panel | Aprobado automático; pareja pendiente | Secciones 21, 24 y 34: validación, errores, formularios y paridad de identidad |
| A1 | Login JWT | Aprobado por HTTP real/MySQL | Sección 23: hashes Laravel, credenciales, roles y contrato |
| A2 | Middleware y vigencia del usuario | Aprobado por HTTP real/MySQL | Sección 23: firma HS256, exp/sub y usuario actual; productos protegido |
| A3 | Clientes y cartera API | Aprobado | Secciones 24 y 34: contratos, cartera, paridad y concurrencia entre puertas |
| A4 | Oportunidades y líneas | Aprobado | Secciones 25 y 34: precio, cantidades, cierre, historial y cinco carreras |
| A5 | Actividades y fechas | Aprobado | Secciones 26 y 34: cartera actual, fechas y autor preservado |
| A6 | Resumen SQL | Aprobado | Secciones 27, 33 y 34: cifras comunes A6 y recorrido real con venta nueva |
| A7 | Códigos y errores JSON | Aprobado veinte endpoints | Secciones 28 y 34: 185 pruebas API, JSON/códigos/privacidad y errores uniformes |
| A8 | README y Postman | Guía/colección aprobadas; instalación externa y Postman gráfico pendientes | Sección 34: tres URLs/comandos, 20/20 endpoints, 108 peticiones/336 comprobaciones; no se reinstaló otra computadora |
| F1 | Sesión y tratamiento de 401 | Aprobado en primera etapa SPA | Sección 29: acceso real, persistencia limitada, cierre y 401 vigente/atrasado |
| F2 | Cartera y formularios | Aprobado en SPA; revisión en pareja pendiente | Sección 30: búsqueda, ficha, alta/edición, disponibles/toma, cupo y errores reales |
| F3 | Embudo y detalle | Aprobado en SPA; revisión en pareja pendiente | Sección 31: cuatro columnas, cerradas, filtro, cotizaciones e historial, transiciones y errores reales |
| F4 | Seguimiento de actividades | Aprobado en SPA; revisión en pareja pendiente | Sección 32: alta, filtros, estado/vencida, cartera actual y fechas Guatemala con navegador en Tokio |
| F5 | Resumen mensual | Aprobado en SPA con A6 común | Sección 33: cuatro cifras comunes, mes Guatemala, ceros, errores, respuestas atrasadas y cartera compartida |
| F6 | Carga, fallos, texto seguro y 375 px | Aprobado automático y capturas; pareja pendiente | Secciones 29–34: 46 pruebas frontend, carga, errores, XSS y 375 px; filtros del panel corregidos |
| S1 | Hashes y verificación | Aprobado en cuentas y login implementados | Secciones 16 y 23: Laravel genera bcrypt; API solo compara |
| S2 | Secretos fuera de Git | Comprobado en archivos preparados y exclusiones | Sección 34: revisión de secretos, entornos/dependencias ignorados y ejemplos/locks conservados |
| S3 | SQL parametrizado | Aprobado | Secciones 23–28 y 34: SQL parametrizado, Eloquent y pruebas de inyección |
| S4 | Respuestas sin datos internos | Aprobado contratos públicos | Secciones 28 y 34: scripts globales de colección, sin hashes/secretos/propietarios |
| S5 | 404 de recursos ajenos | Aprobado | Secciones 18–28 y 34: recursos ajenos 404 en ambas puertas |
| S6 | CORS exacto | Aprobado para la API implementada | Sección 23: origen exacto, origen ajeno sin autorización CORS y preflight |
| S7 | Protección contra XSS | Aprobado automático y capturas | Secciones 29–34: texto malicioso seguro, Blade escapado y ausencia de hashes |
| S8 | Integridad concurrente | Aprobado pruebas realmente solapadas | Secciones 24–25 y 34: cartera, toma, duplicados y etapas con barreras/conexiones distintas |
| P1 | Especificación anterior a implementación y spec-v1 | Comprobado con Git | Sección 34: spec-v1 bfb6f0b es ancestro y no contiene aplicaciones |
| P2 | Plan actualizado con responsables | Actualizado por etapas | docs/plan.md y sección 34; responsables son propuesta, no atribución de contribuciones |
| P3 | Matriz de verificación completa | Matriz/evidencia actualizadas | Sección 34; revisiones humanas y entrega diferenciadas como pendientes |
| P4 | Contexto del agente | Presente y leído | AGENTS.md en raíz; sección 34 |
| P5 | Tres errores reales de IA con commit correctivo | Comprobado con casos reales y commits | Sección 34: IA-11/12/13 en 055398a y IA-14 en e729970; IA-15/16 en este cierre |

La matriz comenzó sin evidencias; ahora enlaza las comprobaciones reales por etapa y el cierre integral de la sección 34. Aprobado automático no significa revisión en pareja, Postman gráfico ni entrega realizada.

## 3. Casos de integración imprescindibles

| Caso | Resultado que debe demostrarse | Estado |
| --- | --- | --- |
| INT-01 | Cliente asignado desde Laravel aparece en la cartera del vendedor correcto en SPA | Aprobado, recorrido HTTP/navegador real; sección 34 |
| INT-02 | Venta ganada desde SPA/API aparece en el reporte Laravel del ámbito correcto | Aprobado, recorrido HTTP/navegador real; sección 34 |
| INT-03 | Cambiar precio del catálogo no cambia el precio cotizado ni ventas históricas | Aprobado, recorrido HTTP/navegador real; sección 34 |
| INT-04 | Desactivar vendedor invalida su siguiente petición con un JWT ya emitido | Aprobado, recorrido HTTP/navegador real; sección 34 |
| INT-05 | Cuenta creada en Laravel inicia sesión en API usando bcryptjs | Aprobado, recorrido HTTP/navegador real; sección 34 |
| INT-06 | Laravel y API normalizan y validan de la misma manera NIT y teléfono | Aprobado, 32 vectores y carreras; secciones 24 y 34 |

## 4. Casos simultáneos

| Caso | Preparación | Resultado esperado | Estado |
| --- | --- | --- | --- |
| CON-01 | Varios vendedores activos toman el mismo cliente disponible con peticiones solapadas | Un éxito y el resto 409; un propietario final | Aprobado en suites con barreras; sección 34 |
| CON-02 | Vendedor con nueve clientes recibe varias altas/tomas/asignaciones simultáneas | Nunca supera diez; cupo aplicado en ambas puertas | Aprobado en suites con barreras; sección 34 |
| CON-03 | Altas simultáneas con NIT no CF o teléfono iguales después de normalizar | Solo una inserción; el resto 409 por unicidad | Aprobado en suites con barreras; sección 34 |
| CON-04 | Cambios de etapa simultáneos basados en el mismo estado inicial | Una confirmación, conflicto para la otra petición y un único cambio de historial | Aprobado en suites con barreras; sección 34 |

Registrar número de peticiones, instante de inicio, respuesta por petición y consulta final a la base. Ejecutarlas secuencialmente no demuestra simultaneidad.

## 5. Regla de cantidad mínima

| Caso | Resultado esperado | Estado |
| --- | --- | --- |
| SEC-01 | Producto con mínimo 50 y cantidad 20: 422 en cantidad, sin línea creada | Aprobado, API/colección e integración; sección 34 |
| SEC-02 | Cantidad 50: aceptada; cantidad 51: también aceptada | Aprobado, API/colección e integración; sección 34 |
| SEC-03 | Reducir de 50 a 49: rechazado y la línea permanece con 50 | Aprobado, API/colección e integración; sección 34 |
| SEC-04 | Mínimo común 1: sin cambios en resultados de VerificacionSeeder | Aprobado en datos; sección 15 |
| SEC-05 | Aumentar mínimo no cambia cotizaciones previas; una edición posterior respeta el mínimo nuevo | Aprobado, API/colección e integración; sección 34 |

## 6. Cifras de control

Usar únicamente VerificacionSeeder, sin datos del sector y sin modificaciones de otras pruebas. Restablecer la base solo cuando el equipo autorice expresamente esa operación en una base de pruebas.

| Ámbito | Mes | Ventas esperadas | Total esperado | Pronóstico esperado | Resultado obtenido |
| --- | --- | ---: | ---: | ---: | --- |
| Valeria | 2026-10 | 2 | Q9,250.00 | Q2,512.88 | Coincide por consulta de datos; sección 15 |
| Valeria | 2026-11 | 1 | Q3,600.00 | Q2,512.88 | Coincide por consulta de datos; sección 15 |
| Diego | 2026-10 | 1 | Q6,000.00 | Q112.50 | Coincide por consulta de datos; sección 15 |
| Carlos | 2026-10 | 1 | Q7,200.00 | Q4,125.75 | Coincide por consulta de datos; sección 15 |
| Equipo Sergio | 2026-10 | 3 | Q15,250.00 | Q2,625.38 | Coincide por consulta de datos; sección 15 |
| Equipo Sandra | 2026-10 | 1 | Q7,200.00 | Q4,125.75 | Coincide por consulta de datos; sección 15 |
| Empresa | 2026-10 | 4 | Q22,450.00 | Q6,751.13 | Coincide por consulta de datos; sección 15 |

Los desgloses y carteras coinciden por consultas sobre MySQL (sección 15). La comparación en panel y API sigue pendiente; no existen esos reportes ni se ha validado su serialización JSON.

## 7. Bitácora de errores de IA

Todavía no se han registrado casos completos con commit correctivo. Esta tabla se llena con errores reales durante el trabajo; no se inventan propuestas incorrectas para cumplir el mínimo.

| Caso real | Propuesta incorrecta y contexto | Criterio incumplido | Cómo se detectó | Corrección | Commit correctivo | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IA-01 / comprobaciones de esta etapa Laravel | El ejecutor HTTP inicial mezcló require y await de módulo en Node; una alternativa usó una variable reservada de PowerShell | Evidencia de verificación inválida hasta repetir correctamente; sin cambio del panel | Errores reales ERR_AMBIGUOUS_MODULE_SYNTAX y variable HOME de solo lectura | Se usó Invoke-WebRequest y nombres de variables propios; se obtuvieron 200 para login/recursos y 404 para registro | Sin commit del ejecutor temporal | Corrección comprobada; asociación a commit pendiente |
| IA-02 / entrada local MySQL | El asistente WinForms se lanzó oculto y además usaba StandardInputEncoding, inexistente en este PowerShell | El usuario no pudo completar la entrada local; conexión sin verificar | Avisos del usuario, ventana visible=False y fallo de interfaz; reflexión confirmó propiedad no disponible | Se abrió visible y se sustituyó la propiedad por transporte UTF-8 codificado en base64 por entrada estándar; prueba sin contraseña terminó en ROOT_VACIO antes de conectar a MySQL | Sin commit correctivo: esta etapa prohíbe otro commit; asistente temporal fuera del repositorio | Ventana visible y canal comprobados; resultado SQL registrado por separado |
| IA-03 / prueba de semillas | La expectativa de etapas ordenadas colocó prospecto antes de propuesta, aunque sort usa el orden alfabético contrario | La prueba falló pese a que las seis etapas estaban cargadas correctamente | PHPUnit: 3 pruebas, 383 aserciones, un fallo en la comparación del arreglo | Se corrigió únicamente el arreglo esperado; las semillas no cambiaron. Nueva ejecución: 3 pruebas, 404 aserciones aprobadas | 4c170978354bc067293ce1a4aedbdb92b2b0c060, que incorpora la expectativa corregida | Corrección comprobada e incorporada; no fue un error de datos |
| IA-04 / cookies en pruebas L2 | El ejecutor hizo POST inválido seguido de GET sin conservar explícitamente la cookie de sesión | No acreditaba la presentación de errores como la recibe un navegador | Primera ejecución: 46 casos, 11 fallos; errores presentes en sesión tras POST y ausentes al entrar en el siguiente GET | Se conservó la cookie de la respuesta; los once casos comprobaron mensajes por campo y datos no sensibles. También se verificó login/logout conservando cookies y descartando la instancia del guard | Commit de cierre L2: feat: implementar cuentas y acceso por roles, autorizado posteriormente | Corrección del ejecutor verificada e incluida en este cierre; no se cambió la aplicación para ocultar el fallo |
| IA-05 / prueba del mínimo inicial del catálogo | La aserción exigía que name y value estuvieran contiguos en el HTML, aunque el componente inserta otros atributos entre ellos | Expectativa de prueba demasiado ligada al orden de atributos | Primera ejecución L3: 52 pruebas, 362 aserciones y un fallo; HTML y modelo ya mostraban mínimo 1 | Se verificó el mismo input por su nombre y valor sin imponer el orden de atributos. Suite final: 143 pruebas y 1.221 aserciones aprobadas; sin cambiar el formulario para ocultar el fallo | Commit de cierre L3: feat: implementar catálogo de productos, autorizado posteriormente | Corrección comprobada e incluida en el cierre; no fue un error del valor inicial |
| IA-06 / destino de asignación del supervisor | La comprobación de equipo trató la propia cuenta del supervisor como si fuera otro equipo, antes de indicar que no era un vendedor | Mensaje/código incorrecto para un destino propio no válido; no hubo escritura | Primera ejecución ClientManagementTest: 42 pruebas, 348 aserciones y un fallo, 404 en vez de validación 422 | Se distingue la cuenta propia del supervisor; sigue sin poder asignarse clientes, pero recibe error de vendedor inválido. Destinos de otros equipos siguen con 404. Suite final: 191 pruebas y 2.011 aserciones aprobadas | Commit de cierre L4: feat: implementar clientes y asignación de vendedores, autorizado posteriormente | Corrección comprobada e incluida en este cierre, sin relajar permisos de equipo |
| IA-07 / alcance del administrador en consultas L6 | La primera consulta restringía también al administrador a titulares con rol vendedor actual | Podía omitir oportunidades y crédito histórico si L2 cambiaba el rol del vendedor | Detectado en revisión contra AccountManager, que conserva datos al cambiar roles, y el requisito «todas las oportunidades»; no fue el fallo de menú descrito en sección 20 | Administrador consulta todas las oportunidades; filtros/desglose incluyen titulares históricos. Supervisor sigue limitado a vendedores actuales de su equipo. Se añadió test_admin_keeps_all_opportunities_when_historical_owner_changes_role | Incluido en el commit L6 autorizado: feat: implementar consulta de oportunidades y reportes | Verificado por la suite final 247 pruebas/2.393 aserciones; sin modificar reglas de cuentas |
| IA-08 / lectura de mensajes flash en el test L7 | El caso nuevo intentaba obtener el error de sesión después del GET que consumía el mensaje flash | Once errores en el ejecutor; la respuesta del formulario era correcta | Primera selección PanelValidationTest: 20 pruebas, 166 aserciones, 11 errores «Call to a member function first() on null» | Capturar el mensaje antes de ejecutar GET y comprobarlo después en la página; conservar la cookie de sesión | Incluido en el commit L7 autorizado: feat: completar validación del panel Laravel | Suite final 270 pruebas/2.633 aserciones; no se relajaron validaciones ni autorización |
| IA-09 / expectativa del formato conservado | Un test L7 nuevo esperaba el teléfono compacto en old input después de una validación fallida | Un fallo del test; el panel conservaba correctamente el formato escrito | Regresión de 270 pruebas/2.627 aserciones: esperaba 59001112 pero obtuvo +502 (5900)-1112 | Comprobar conservación del texto original de NIT/teléfono y mantener la plantilla de cliente aprobada sin modificaciones; normalización para validar/guardar sigue cubierta por L4 | Incluido en el commit L7 autorizado: feat: completar validación del panel Laravel | Resultado final 270 pruebas/2.633 aserciones aprobadas |
| IA-10 / cuerpo vacío del login API | El parser JSON convertía el cuerpo vacío en un objeto y el login devolvía 422 | Incumplía 400 para cuerpo obligatorio ausente | Primera ejecución npm test: 41 casos, 40 aprobados y uno fallido, 422 en vez de 400 | Registrar la longitud del JSON recibido y distinguir cero bytes de un objeto vacío; cero bytes 400, objeto vacío 422 por campo | Incluido en el commit autorizado: feat: implementar autenticación JWT de vendedores en API | Final 43 casos aprobados y petición de cuerpo ausente de la colección responde 400 |

Un caso no está completo hasta identificar su evidencia y el commit que lo corrige. El equipo debe documentar al menos tres casos reales.

## 8. Preparación de la defensa

- [ ] Instalación reproducida desde cero siguiendo README.
- [ ] Tres piezas funcionando y Postman preparado.
- [ ] Base identificada de pruebas y cargada solo con VerificacionSeeder para la defensa.
- [ ] Repositorio en el commit de entrega-final.
- [ ] Ambas personas explican roles, flujo, transacciones, fechas y dinero.
- [ ] Ambas personas pueden ubicar y modificar código de cualquier componente.
- [ ] Evidencias, colección y bitácora incorporadas al commit entregado.

## 9. Revisión documental y del entorno — 1 de noviembre de 2026

Responsable de ejecución: agente Codex, por solicitud de Raúl y Diego. Carpeta: `C:\Users\rauls\OneDrive\Desktop\crm-ferreteria`. Incluye los resultados de la revisión inicial y la búsqueda adicional de Composer y MySQL de esta sesión. No hay commit probado: esta carpeta todavía no es un repositorio Git. No se utilizó base de pruebas ni semilla.

Estas son comprobaciones documentales y del entorno, no pruebas funcionales del CRM. La matriz de la sección 2 y los casos funcionales, de integración, seguridad y concurrencia conservan su estado Pendiente. Ejecutar una herramienta con `--version` no acredita que Laravel, la API, Postman o la conexión MySQL funcionen.

### Documentación y estado local

| Caso / trazabilidad | Estado de comprobación | Evidencia y resultado real | Límite o pendiente |
| --- | --- | --- | --- |
| DOC-01 / P1, P2, P4 | Aprobado | Lectura de AGENTS.md, README.md, docs/especificacion.md y docs/plan.md; contraste inicial con las 22 páginas de docs/enunciado.pdf. Arquitectura, roles, modelo, 20 endpoints, semillas y cifras documentadas están alineados en lo principal | No acredita implementación ni cumplimiento completo de P1–P4 |
| DOC-02 / P1, A7, S5 | Pendiente | El enunciado exige 404 para recursos ajenos (R2), pero no lista 404 en POST /oportunidades. La sección 8 de la especificación ya documenta que prioriza R2 para un cliente_id ajeno | Confirmar la interpretación con el catedrático antes de implementar ese caso; no se cambió el contrato |
| DOC-03 / P2 | Aprobado | Carpeta actual accesible; `Test-Path docs/enunciado.pdf` devuelve True. Las dos tareas correspondientes se actualizaron en plan.md | El PDF está en la carpeta, todavía no versionado en Git |
| DOC-04 / P1 | Pendiente | `git status --short`, y en la revisión inicial `git log -5 --oneline` y `git tag --list`, responden `fatal: not a git repository` | Crear o vincular el repositorio y crear spec-v1 solo mediante instrucciones explícitas |
| DOC-05 / P2 | Pendiente | No se dispone de evidencia del registro del sector en el aula ni de revisión en pareja de decisiones y responsables | Las casillas correspondientes permanecen sin marcar |

### Herramientas locales

| Caso | Estado de disponibilidad | Comando / evidencia | Resultado y explicación |
| --- | --- | --- | --- |
| ENV-01 PHP | Aprobado | `Get-Command php`; `php --version` | PHP 8.4.24 CLI, Zend Engine 4.4.24. Coincide con PHP 8.4 exigido. En la inspección inicial, el entorno restringido negó la ejecución; la consulta de versión fuera de él sí respondió, repetida en esta etapa. No demuestra configuración de extensiones ni compatibilidad de dependencias |
| ENV-02 Composer | Bloqueado | `Get-Command composer,composer.bat,composer.phar -All`; consultas acotadas de rutas y registro descritas abajo | Sin comandos, archivos en las ubicaciones examinadas ni entrada de instalación. No se pudo ejecutar Composer ni identificar su versión; instalación no detectada, sin afirmar ausencia absoluta |
| ENV-03 Node.js | Aprobado | `node --version` | v24.18.1; coincide con la versión mayor 24 exigida. No hay API creada |
| ENV-04 npm | Aprobado | `npm.cmd --version` | 11.16.0. En la revisión inicial, `npm --version` intentó cargar npm.ps1 y PowerShell lo bloqueó. npm.cmd funciona; no se cambiaron políticas de PowerShell |
| ENV-05 Git | Aprobado | `git --version` | 2.55.0.windows.3. La herramienta está disponible, pero la carpeta no tiene repositorio local |
| ENV-06 MySQL | Bloqueado | `Get-Command mysql,mysqld -All`; consultas de servicios, rutas y registro descritas abajo | No detectado. No hay versión de cliente o servidor identificada, ni servicio MySQL registrado cuyo estado pueda comprobarse. No se probó conexión ni se modificó una base |
| ENV-07 MariaDB | Aprobado (identificación acotada) | `Get-Command mariadb,mariadbd -All`; búsqueda separada en servicios, rutas y registro | Tampoco detectado en lo revisado. No se tomó MariaDB como sustituto de MySQL 8.4 LTS |

Aquí Bloqueado significa que falta una herramienta localizable para comprobar su versión; no es una prueba funcional fallida. No hay pruebas funcionales aprobadas o fallidas en esta etapa.

### Alcance de la búsqueda de Composer y MySQL

Se consultó PATH mediante Get-Command. Además se revisaron las siguientes ubicaciones habituales con Test-Path/Get-Item y, en la primera consulta, Get-ChildItem solo sobre las rutas existentes; no se recorrió el disco recursivamente:

- Composer: `C:\ProgramData\ComposerSetup\bin`, `%APPDATA%\Composer`, `%LOCALAPPDATA%\ComposerSetup`, `C:\Program Files\Composer`, `C:\Program Files (x86)\Composer`, `C:\tools\composer`, `%USERPROFILE%\scoop\apps\composer`, `%USERPROFILE%\composer.phar` y `C:\composer\composer.phar`.
- MySQL: `C:\Program Files\MySQL`, `C:\Program Files (x86)\MySQL`, `C:\ProgramData\MySQL`, `C:\mysql`, `C:\tools\mysql` y `%USERPROFILE%\scoop\apps\mysql`. También `C:\xampp`, `C:\laragon` y `C:\Program Files\MariaDB*` para distinguir instalaciones alternativas.
- Gestores: patrones `composer*` y `mysql*` en `C:\ProgramData\chocolatey\bin`, y `*Composer*` / `*MySQL*` en `%LOCALAPPDATA%\Microsoft\WinGet\Packages`.

Todas esas rutas/patrones resultaron ausentes. Se consultaron con Get-ItemProperty las ramas Uninstall de HKLM (64 y 32 bits) y HKCU; no hubo entradas cuyo DisplayName contuviera Composer, MySQL o MariaDB.

Get-Service no devolvió servicios con MySQL o MariaDB en Name/DisplayName. La lectura de `HKLM:\SYSTEM\CurrentControlSet\Services\*` tampoco encontró ImagePath con mysqld o mariadbd. Estas consultas se confirmaron fuera del entorno restringido, sin iniciar, detener ni cambiar servicios. En la revisión inicial, una consulta alternativa con Get-CimInstance Win32_Service había sido denegada; las consultas posteriores a servicios y registro sí finalizaron sin ese bloqueo.

Una instalación portátil en otra ruta, otra cuenta de Windows, WSL, contenedor o equipo remoto queda fuera de esta búsqueda. No se detectó una instalación utilizable de Composer ni de MySQL en el entorno revisado.

### Pendientes y límites de esta etapa

Falta disponer de Composer y MySQL 8.4 LTS: instalarlos en una etapa autorizada o proporcionar la ubicación de una instalación existente para validarla. Después habrá que comprobar sus versiones, configurar el acceso a MySQL y validar la combinación Laravel 13/Breeze Blade. PHP, Node, npm y Git no requieren instalación según estas comprobaciones de versión.

No se instalaron herramientas o dependencias, no se crearon aplicaciones ni bases, no se ejecutaron migraciones, semillas o pruebas Postman y no se crearon commits, etiquetas ni push. Solo se editaron docs/plan.md y este registro. Esta revisión del entorno no completa la fase 1: siguen pendientes la preparación y conexión de Laravel/MySQL y la configuración de puertos y orígenes.

## 10. Instalación autorizada del entorno — 1 de noviembre de 2026

Continuación posterior a la sección 9. Ejecución: agente Codex; la contraseña y las pantallas de configuración de MySQL corresponden al usuario. Autorizados Composer, MySQL Community Server 8.4 LTS y requisitos indispensables de sus instaladores oficiales. No se autorizó crear Laravel ni esquema o datos del proyecto. Sin commit probado ni pruebas funcionales del CRM; la matriz funcional permanece Pendiente.

### Composer

| Caso | Estado | Evidencia y resultado |
| --- | --- | --- |
| INST-01 / PHP | Aprobado | `(Get-Command php).Source` y `php --version` confirman `C:\Users\rauls\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`, PHP 8.4.24 CLI |
| INST-02 / descarga | Aprobado | Descarga de `https://getcomposer.org/Composer-Setup.exe` a `%TEMP%\crm-Composer-Setup.exe`; Get-AuthenticodeSignature devuelve Valid, firmante John Stevenson |
| INST-03 / instalación | Aprobado | Instalador oficial con `/CURRENTUSER /VERYSILENT /SUPPRESSMSGBOXES /NORESTART` y `/PHP=` apuntando a ese ejecutable. Instalado en `%LOCALAPPDATA%\ComposerSetup\bin`; no se instalaron dependencias del CRM |
| INST-04 / versión y PATH | Aprobado | Tras incorporar el directorio instalado solo al PATH del proceso de comprobación, `composer --version` devuelve Composer 2.11.1 (2026-10-30), usando PHP 8.4.24 en la ruta confirmada. El PATH persistente de usuario incluye ComposerSetup\bin. Las terminales previas deben reabrirse para recibirlo |

Procedimiento consultado: [instalación oficial de Composer](https://getcomposer.org/doc/00-intro.md) y [parámetros del instalador Windows](https://github.com/composer/windows-setup/blob/main/README.md). Composer administra dependencias PHP; en esta etapa solo se instaló la herramienta.

### MySQL

| Caso | Estado | Evidencia y resultado |
| --- | --- | --- |
| INST-05 / puerto | Aprobado (previo a instalación) | `netstat -ano -p tcp` no mostró conexiones en 3306/33060. Una escucha temporal con TcpListener sobre 127.0.0.1:3306 pudo iniciarse y se cerró inmediatamente: puerto disponible. No acredita que MySQL escuche después |
| INST-06 / runtime | Aprobado (presencia) | Las ramas Uninstall de Windows muestran Microsoft Visual C++ v14 Redistributable x64 14.51.36247 y runtimes 2022 x64. Ya estaban instalados; no se instaló otro runtime |
| INST-07 / MSI oficial | Aprobado | Descarga de `https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-8.4.13-winx64.msi` a `%TEMP%\crm-mysql-8.4.13-winx64.msi` (136192000 bytes). Firma Authenticode Valid, Oracle America, Inc.; MD5 `FF44ED8AF9F45ACA5ECE06BB0DB5E5DB`, coincide con la página oficial de descarga |
| INST-08 / asistente | Aprobado (finalización informada por el usuario, instalación corroborada) | El MSI verificado se abrió con msiexec y elevación. El usuario confirmó que terminó y Execute mostró los pasos correctos. Los binarios y el servicio instalados se verificaron después. Contraseña introducida exclusivamente por el usuario en el asistente |
| INST-09 / servidor y servicio | Aprobado | `C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe --version` y `mysql.exe --version` devuelven 8.4.13, MySQL Community Server - GPL. `Get-Service MySQL84`: Running. Registro del servicio: inicio 2 (automático), cuenta NT AUTHORITY\NetworkService y uso de `C:\ProgramData\MySQL\MySQL Server 8.4\my.ini` |
| INST-10 / escucha local | Aprobado | Tras configurar y reiniciar MySQL84, Get-NetTCPConnection muestra 127.0.0.1:3306 y 127.0.0.1:33060 con el proceso servidor. En my.ini se verificaron bind-address=127.0.0.1 y mysqlx-bind-address=127.0.0.1. Un cliente TCP de Node recibió el saludo MySQL: protocolo 10, versión 8.4.13, y cerró sin autenticar ni ejecutar SQL |
| INST-11 / acceso de aplicaciones | Pendiente | No se probó login con contraseña, permisos SQL ni conexión Laravel/API; esas aplicaciones no existen todavía. Esta comprobación no se sustituye por comprobar el puerto o el saludo inicial |

Configuración indicada para el asistente: Typical; MySQL Configurator; perfil Development; TCP/IP 3306, sin abrir el puerto en Windows Firewall; contraseña root introducida exclusivamente por el usuario; servicio MySQL84 con cuenta predeterminada e inicio con Windows; omitir bases de ejemplo. El usuario informó finalización correcta. Se verificaron por separado versión, servicio, cuenta, inicio y escucha; no se inspeccionaron el perfil de memoria ni las bases existentes. La consulta Get-NetFirewallRule por DisplayName con MySQL no devolvió reglas coincidentes; no se crearon reglas desde el agente. No se registró la contraseña ni se solicitó enviarla por chat.

La escucha inicial del servicio estaba en todas las interfaces (`::`). Para completar la configuración local autorizada se añadieron únicamente bind-address y mysqlx-bind-address bajo [mysqld] en my.ini, ambos con 127.0.0.1. Se conservó una copia previa en temporales, fuera del proyecto. El primer intento de escritura fue denegado por Windows y no alteró el archivo; el ajuste se aplicó después mediante PowerShell elevado con UAC y reinicio de MySQL84. La verificación posterior confirmó Running, ambas direcciones locales y respuesta del servidor. No se cambiaron políticas de PowerShell ni se alteró el esquema del proyecto.

Fuentes: [MSI Community Server 8.4 LTS](https://dev.mysql.com/downloads/mysql/8.4.html?os=3), [instalación en Windows](https://dev.mysql.com/doc/refman/8.4/en/windows-installation.html) y [MySQL Configurator](https://dev.mysql.com/doc/refman/8.4/en/mysql-configurator-workflow-server.html). No se instaló MariaDB, Workbench ni aplicaciones del CRM.

Incidencia de comprobación: una invocación auxiliar `php -r` sin operación útil falló por comillas al pasar por PowerShell; se descartó ese comando y se volvió a comprobar Composer con `composer --version`, correctamente. No afectó archivos del proyecto ni la instalación; no existe commit correctivo asociado.

Resultado de esta etapa: Composer 2.11.1 con PHP 8.4.24 y MySQL Community Server 8.4.13 instalados y comprobados al nivel descrito. MySQL84 funciona y responde localmente. No se crearon Laravel, API, tablas o datos del CRM; no se ejecutaron migraciones, semillas ni consultas SQL. Solo se actualizaron plan.md y verificacion.md dentro del proyecto; el instalador y el ajuste local también realizaron los cambios de entorno indicados. No se crearon commits, etiquetas o push. La fase 1 completa sigue pendiente de sus siguientes etapas autorizadas, incluida la futura conexión de las aplicaciones.

## 11. Preparación del repositorio y del hito spec-v1 — 1 de noviembre de 2026

Etapa autorizada expresamente por el usuario: inicializar main, revisar los archivos iniciales, crear el commit documental con el mensaje solicitado y etiquetarlo mediante spec-v1 anotada. Sin remoto, push, aplicaciones ni cambios de base. Esta sección se redacta antes del commit: el resultado final se comprueba en Git y se informa al cerrar la etapa, sin insertar en el propio commit un hash autorreferente.

| Caso | Estado de revisión previo al commit | Evidencia |
| --- | --- | --- |
| GIT-01 / carpeta y rama | Aprobado | Carpeta C:\Users\rauls\OneDrive\Desktop\crm-ferreteria; inicialmente git rev-parse y git status indicaron que no había repositorio. `git init -b main` creó uno vacío; después rev-parse confirmó la raíz y status indicó `No commits yet on main` |
| GIT-02 / identidad | Aprobado | `git config --show-origin --get user.name` y user.email mostraron la configuración existente en C:/Users/rauls/.gitconfig: Raul Soto, raulsoto77t@gmail.com. git var confirmó autor y committer. No se cambió configuración global ni se añadieron coautores |
| GIT-03 / exclusiones | Aprobado | `git check-ignore -v --no-index` confirmó exclusión de .env, laravel/.env, api/.env, api/.env.production, auth.json, *.key, node_modules y vendor. Las reglas !.env.example y !.env.*.example conservan ejemplos; los lockfiles no quedan excluidos. Se usaron rutas ficticias, sin crear archivos de prueba |
| GIT-04 / contraste documental | Aprobado con salvedad registrada | Relectura de AGENTS.md, README, especificación y plan; contraste con el PDF, especialmente sector, versiones, R2–R8, contrato y proceso. La especificación mantiene los 20 endpoints, regla mínima compatible con semilla y decisiones permitidas por el enunciado. Se actualizó el estado del README y el plan para reflejar el entorno y el repositorio |
| GIT-05 / salvedad de 404 | Pendiente de consulta, interpretación documentada | Se explicó al usuario antes del hito la omisión de 404 en la fila POST /oportunidades frente a R2. La sección 8 de la especificación ya prioriza R2 para un cliente_id ajeno; no se cambió ese criterio. No se detectó otra contradicción que impida guardar la especificación antes de implementar |
| GIT-06 / etiqueta previa | Aprobado | `git tag --list spec-v1` no devolvió coincidencias en el repositorio recién inicializado. No existe etiqueta anterior que deba sustituirse |

Git detectó diferencia de propietario entre el usuario del entorno aislado y el propietario de la carpeta. Se utilizó `git -c safe.directory=C:/Users/rauls/OneDrive/Desktop/crm-ferreteria ...` solo para los comandos de esta carpeta, sin añadir excepciones globales ni cambiar autoría.

Contenido previsto del commit: `.gitignore`, `AGENTS.md`, `README.md`, `docs/enunciado.pdf`, `docs/especificacion.md`, `docs/plan.md` y `docs/verificacion.md`. No se incluyen instaladores, configuraciones de MySQL, secretos ni dependencias. Mensaje exacto: `docs: especificación y planificación inicial del CRM ferretería`.

Antes de confirmar se revisan el índice mediante `git diff --cached --stat`, `git diff --cached --check` y la lista completa con `git diff --cached --name-only`. Al cerrar se ejecutan `git show -s --format=fuller HEAD`, `git cat-file -t refs/tags/spec-v1`, `git rev-parse HEAD`, `git rev-parse "spec-v1^{commit}"`, `git status --short --branch` y `git remote -v`. Se espera etiqueta de tipo tag, ambos hashes de commit iguales, main limpio y sin remotos. Esos resultados finales se informan en la respuesta de cierre; no equivalen a pruebas funcionales del CRM.

## 12. Base del panel Laravel/Breeze — 1 de noviembre de 2026

Etapa solicitada por el usuario, ejecutada por Codex. Alcance: esqueleto Laravel 13, Breeze Blade, configuración MySQL sin credenciales ni base, compilación y comprobaciones de HTTP del formulario. No se ejecutaron migraciones, seeders, consultas SQL ni pruebas con base. No hay autenticación completa aprobada, roles ni módulos del negocio. La matriz funcional mantiene sus pendientes; estas evidencias son parciales para L2/A8 y de preparación del entorno.

### Ejecución e incidencias reales

1. `git rev-parse "spec-v1^{commit}"` confirmó bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166; estado inicial limpio en main. El hito documental ya existe antes del código. No se creó otro repositorio dentro de laravel/.
2. `composer create-project laravel/laravel laravel "^13.0" --no-scripts --no-interaction --prefer-dist`: primer intento detenido por zip deshabilitada. Se habilitaron zip y pdo_mysql, cuyas DLL ya existían. Segundo intento creó el esqueleto v13.0.0, pero Composer detectó fileinfo deshabilitada. Se habilitó su DLL y se completó con `composer install --no-scripts --no-interaction --prefer-dist` dentro de laravel/. Se respaldó php.ini en temporales antes de los cambios. No se utilizaron --ignore-platform-reqs, omisiones de seguridad ni paquetes sustitutos.
3. Se ajustó .env.example y se copió a .env; `php artisan key:generate --no-interaction` generó APP_KEY sin mostrarla. MySQL previsto: 127.0.0.1:3306/crm_ferreteria; usuario y contraseña vacíos. Sesiones/caché en archivos, cola sync y zona UTC. Se quitaron los comandos de SQLite y migraciones de composer.json. No se ejecutaron los hooks post-create-project-cmd ni el script setup.
4. `php artisan package:discover --no-ansi`; `composer require laravel/breeze --dev --no-scripts --no-interaction`; nuevo descubrimiento explícito; `php artisan breeze:install blade --no-interaction --no-ansi`. Breeze generó controladores, vistas, componentes y pruebas de fábrica, e invocó npm install/build por su propio ejecutor de Windows. Después se utilizó explícitamente npm.cmd. Ninguna prueba de fábrica fue ejecutada.
5. Se retiraron GET/POST register, el enlace de bienvenida, RegisteredUserController, la vista register y las pruebas generadas que esperaban registro. Se retiraron también DELETE /profile y su método, formulario y pruebas de borrado de cuenta, incompatibles con la conservación de cuentas del contrato. No se implementaron roles, administración de cuentas ni desactivaciones.
6. `npm.cmd uninstall --save-dev @tailwindcss/vite` eliminó el plugin de Tailwind 4 que el esqueleto dejaba sin uso al instalar Blade/Tailwind 3; `npm.cmd run build` compiló. `npm.cmd install --no-fund` confirmó el árbol final actualizado. No se añadieron frameworks a la SPA, que aún no existe. Tailwind y Alpine son dependencias generadas del panel Breeze.

### Resultados comprobados

| Caso / trazabilidad | Estado | Comando o evidencia y resultado |
| --- | --- | --- |
| LBASE-01 / versión | Aprobado | `php artisan --version`: Laravel Framework 13.39.0; composer.lock incluye laravel/breeze v2.4.2 |
| LBASE-02 / inicialización | Aprobado | package:discover finalizó correctamente; key:generate informó Application key set successfully; presencia de APP_KEY confirmada sin registrar el valor |
| LBASE-03 / configuración | Aprobado | Arranque del kernel de consola y lectura selectiva de config: mysql, host 127.0.0.1, puerto 3306, base prevista crm_ferreteria; session=file, cache=file, queue=sync, timezone=UTC; credenciales vacías. No se abrió conexión SQL |
| LBASE-04 / plataforma | Aprobado | `composer validate --no-check-publish`: válido; `composer check-platform-reqs`: requisitos satisfechos; `php -m` confirmó zip, pdo_mysql y fileinfo habilitadas |
| LBASE-05 / dependencias | Aprobado con aviso informativo | `composer audit`: sin avisos de vulnerabilidad. npm.cmd install: 146 paquetes auditados, 0 vulnerabilidades. npm informó un script pendiente de aprobación de esbuild; no se aprobó ni se desactivó la protección. La compilación pasó con el binario instalado |
| LBASE-06 / compilación | Aprobado | `npm.cmd run build`: Vite 7.3.7, 3 módulos, build correcto. CSS app-CEQ-E8Gc.css (37.03 kB), JS app-BPrTyeqd.js (55.13 kB) y public/build/manifest.json. Los generados quedan excluidos de Git |
| LBASE-07 / rutas y sintaxis | Aprobado | `php artisan route:list --except-vendor`: 17 rutas propias; GET/POST login presentes, sin register ni DELETE profile. `route:list --path=register` informó que no hay coincidencias (mensaje ERROR esperado para ese filtro vacío). php -l aprobó routes/auth.php, routes/web.php y ProfileController.php |
| LBASE-08 / HTTP formulario | Aprobado | Servidor iniciado con `php artisan serve --host=127.0.0.1 --port=8000 --no-reload`. Invoke-WebRequest: GET /login 200 con formulario POST a login, campos email/password; CSS y JS compilados 200. GET / 200, sin enlace register. No se envió POST login |
| LBASE-09 / sin registro público | Aprobado | Invoke-WebRequest: GET /register 404 y POST /register 404. Registro eliminado del enrutamiento, controlador y vistas; esto no acredita la gestión futura de cuentas |
| LBASE-10 / Git y archivos locales | Aprobado | git check-ignore confirmó .env, vendor, node_modules y public/build excluidos; .env.example y lockfiles conservables. Test-Path devolvió False para database/database.sqlite y laravel/.git. Se conservó el repositorio original y spec-v1; no hubo commit, etiqueta nueva ni push |
| LBASE-11 / autenticación y negocio | Pendiente | No existen tablas o cuentas del proyecto; no se probaron login contra MySQL, roles, estado activo, recuperación de contraseña ni los módulos del CRM. La fase 1 sigue incompleta en cuanto a conexión de base |

Incidencias de las herramientas de comprobación: el primer ejecutor Node mezcló require y await; corregido a módulos, una lectura posterior de recursos falló dentro de undici. Se sustituyó por Invoke-WebRequest, que verificó login, CSS, JS y registro. Se corrigió también la variable reservada HOME usada en la consulta de portada, repitiéndola correctamente. Estos fallos no fueron errores HTTP del panel ni pruebas aprobadas; los resultados de la tabla corresponden a las ejecuciones posteriores correctas. Caso IA-01 registrado sin inventar commit correctivo.

phpunit.xml ya no usa SQLite; base y credenciales de pruebas quedan vacías con force=true. No ejecutar aún php artisan test ni los tests generados con RefreshDatabase. La futura fase de pruebas requiere una base MySQL de pruebas identificada y autorización para operaciones sobre ella. Las migraciones predeterminadas son archivos del esqueleto sin aplicar; no se alteraron ni ejecutaron para introducir negocio.

El servidor de desarrollo se dejó iniciado en 127.0.0.1:8000 (PID inicial de artisan 25252, salida en temporales fuera del repositorio). Si ya no está activo, arrancar con el comando del README. No se asegura persistencia después de cerrar la sesión de Windows. Flujo comprobado: navegador → ruta/controlador Breeze → vista Blade → recursos compilados, con sesión en archivo. Panel → Eloquent → MySQL compartida y navegador → API → SQL son flujos todavía pendientes.

## 13. Commit del panel y conexión local MySQL — 1 de noviembre de 2026

Etapa autorizada por el usuario: guardar primero el avance Laravel en un único commit, preparar crm_ferreteria conservando cualquier contenido existente, crear un usuario técnico local limitado y comprobar una lectura desde Laravel. No se autorizan tablas, cuentas del CRM, migraciones ni seeders, módulos, API, SPA, otro commit o push.

| Caso | Estado | Evidencia y resultado |
| --- | --- | --- |
| CONEX-01 / revisión del avance | Aprobado | 107 archivos revisados en el índice. Exclusiones comprobadas para laravel/.env, vendor, node_modules y public/build; comparación en memoria de APP_KEY y patrones de secretos sin coincidencias en los archivos preparados. composer.lock y package-lock.json incluidos. Se corrigieron tres espacios finales en la vista de bienvenida antes de aprobar git diff --cached --check |
| CONEX-02 / único commit | Aprobado | ad95384d12d8f92fa258bd132fef87b742ae5d4f, mensaje exacto chore: preparar Laravel y Breeze Blade sin registro público. Autoría existente de Raul Soto. spec-v1 permanece en bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. Estado limpio inmediatamente después del commit; documentación posterior deliberadamente sin otro commit |
| CONEX-03 / entrada local | Aprobado tras corregir IA-02 | El usuario confirmó Conexión preparada en la ventana local; resultado del asistente ok=true. Contraseña root enmascarada enviada por entrada estándar con transporte UTF-8/base64 (codificación, no cifrado), sin argumentos ni archivos con root. La clave técnica se generó con random_bytes y solo se guardó en laravel/.env |
| CONEX-04 / base y cuenta técnica | Aprobado | Inspección previa de information_schema: database_existed=false; creación de crm_ferreteria con utf8mb4 y utf8mb4_unicode_ci. Cuenta nueva crm_laravel@127.0.0.1. tables_before=[] y tables_after=[]: no se crearon tablas ni se reinició contenido existente |
| CONEX-05 / lectura Laravel | Aprobado | Tras `php artisan config:clear --no-ansi`, arranque del kernel de Laravel y DB::connection()->selectOne('SELECT 1 AS ok, DATABASE() AS selected_database, CURRENT_USER() AS technical_account'): ok=1, base crm_ferreteria, cuenta crm_laravel@127.0.0.1, driver mysql. Consulta de information_schema desde esa conexión: table_count=0 |
| CONEX-06 / privilegios | Aprobado | SHOW GRANTS desde la cuenta técnica confirma únicamente USAGE (sin privilegios efectivos globales) y SELECT, INSERT, UPDATE, DELETE sobre crm\_ferreteria.*. Sin GRANT OPTION, roles o permisos sobre otras bases; el guion bajo está escapado. No se concedieron CREATE, ALTER o DROP |
| CONEX-07 / límites | Pendiente para fases posteriores | No se ejecutaron migraciones/seeders ni se probaron autenticación CRM, roles, modelos del negocio o escritura de datos. Una lectura de conectividad no acredita esos requisitos. Permisos de esquema y base de pruebas pendientes de autorización |
| CONEX-08 / revisión final de Git | Aprobado | Comparación en memoria de APP_KEY y contraseña técnica frente a todos los archivos versionados: sin coincidencias. .env excluido; vendor y node_modules no versionados; ambos lockfiles conservados; ejemplo con clave y credenciales vacías. git diff --check correcto. HEAD permanece en ad95384 y spec-v1 en bfb6f0b; solo README, plan y verificación modificados sin otro commit; índice vacío |

El asistente concedió únicamente SELECT, INSERT, UPDATE y DELETE sobre crm_ferreteria; no concedió permisos globales efectivos, GRANT OPTION ni creación/borrado de esquema. El guion bajo se escapó al conceder permisos porque partial_revokes estaba desactivado, para que no actúe como comodín de otras bases. No se crearon tablas ni se escribieron filas del CRM. Los permisos para futuras migraciones deberán revisarse dentro de la fase de esquema autorizada.

La contraseña root no se solicitó por chat ni se incorporó a .env. Los errores del asistente se limitaron a etapa y códigos no sensibles. El procedimiento se preparó para detenerse si encontraba una cuenta técnica existente ajena a esta configuración, sin cambiarla; en esta ejecución la cuenta fue nueva. Solo se actualizaron en .env las opciones DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME y DB_PASSWORD; se conservó APP_KEY. .env.example mantiene clave y credenciales vacías, sin valores reales. No se imprimió el contenido completo de .env ni contraseñas.

Incidencia de entrada local: el usuario informó que no veía la ventana o había un error. Primero no existía result.json y la ventana estaba oculta (visible=False). Se mostró mediante ShowWindowAsync y SetForegroundWindow, sin consultar el campo de contraseña. Después el resultado indicó fallo de interfaz: este PowerShell carece de la propiedad StandardInputEncoding. El fallo ocurrió antes de iniciar PHP con credenciales. Se cerró ese asistente, se corrigió el transporte de entrada y se probó con contraseña vacía: respuesta ROOT_VACIO, sin conexión SQL. La ventana nueva se lanzó con WindowStyle Normal y su visibilidad se comprobó como True. No se reinició MySQL ni se ejecutó SQL para corregir la interfaz. El usuario completó después la entrada local y se obtuvieron los resultados aprobados de esta sección. Caso real IA-02; sin otro commit correctivo por la limitación explícita de esta etapa.

Consultas de lectura finales: SELECT 1, DATABASE(), CURRENT_USER(), recuento de information_schema.TABLES para la base seleccionada y SHOW GRANTS FOR CURRENT_USER. No se ejecutaron pruebas de escritura para comprobar privilegios. Las únicas operaciones administrativas fueron crear la base ausente y la cuenta técnica, y conceder sus permisos acotados; no se crearon cuentas en una tabla users. Flujo verificado: arranque Laravel → conexión DB del framework → PDO MySQL → SELECT sobre el servidor local; los módulos Eloquent y navegador → API → SQL siguen pendientes.

## 14. Preparación del esquema — 1 de noviembre de 2026

Alcance autorizado: un commit previo de la conexión, permisos mínimos, base separada de pruebas, migraciones del núcleo y comprobaciones de restricciones. La solicitud contiene una contradicción: pide ejecutar las migraciones pendientes y también «No uses migrate». Se detuvo la ejecución hasta que el usuario confirmó «Sí, permitir migrate; sin fresh ni borrados». Después se aplicó el esquema y se ejecutaron las pruebas autorizadas. No hay semillas, pantallas de negocio, API o SPA implementadas en esta etapa.

| Caso | Estado | Evidencia y resultado |
| --- | --- | --- |
| ESQ-01 / contrato | Aprobado documental | Leídos AGENTS, README, especificación y plan; extraída y contrastada sección 6 del PDF, páginas 5–7. Tipos, nulabilidad, FKs, únicos y CHECK coinciden con las migraciones preparadas; cantidad_minima corresponde a la regla sectorial previamente especificada |
| ESQ-02 / commit de conexión | Aprobado | 6ea8a8133dd120aab07b6aef7d72dc8890f4fcd5, chore: verificar conexión local con MySQL. Solo README, plan y verificación; comparación en memoria contra APP_KEY/DB_PASSWORD sin coincidencias, revisión del índice y diff --check correctas. Sin temporales, .env ni dependencias. spec-v1 permanece en bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166 |
| ESQ-03 / estado previo | Aprobado, lectura | Laravel devolvió DATABASE()=crm_ferreteria, CURRENT_USER()=crm_laravel@127.0.0.1, VERSION()=8.4.13 y lista de tablas vacía. SHOW GRANTS inicial confirmó solo los cuatro permisos DML documentados |
| ESQ-04 / permisos | Aprobado | Root introducido en ventana local enmascarada. SHOW GRANTS posterior confirma SELECT, INSERT, UPDATE, DELETE, CREATE, REFERENCES, ALTER sobre crm\_ferreteria.* para crm_laravel. USAGE no concede privilegios efectivos globales. Sin DROP, GRANT OPTION ni permisos sobre la base de pruebas |
| ESQ-05 / aislamiento de pruebas | Aprobado, preparación y lectura | crm_ferreteria_test no existía: creada con utf8mb4/utf8mb4_unicode_ci, tablas antes/después vacías. Cuenta nueva crm_laravel_test@127.0.0.1 con los mismos siete permisos exclusivamente sobre crm\_ferreteria\_test.*. Credencial aleatoria solo en .env.testing ignorado; ejemplo sin clave ni credenciales |
| ESQ-06 / conexiones reales | Aprobado, lectura | Desde Laravel, ambas conexiones devolvieron su DATABASE() y CURRENT_USER() correctos, @@session.time_zone=+00:00, listas de tablas vacías y permisos acotados. No se imprimieron contraseñas ni archivos .env |
| ESQ-07 / archivos | Aprobado estático | Siete migraciones nuevas: extend_users_for_crm, create_productos_table, create_clientes_table, create_oportunidades_table, create_oportunidad_productos_table, create_historial_etapas_table, create_actividades_table. php -l aprobó las siete y ambos archivos de pruebas. Pint formateó únicamente los archivos de esta etapa. La migración original de users y auxiliares no se editaron |
| ESQ-08 / protección de pruebas | Aprobado, sin escrituras | Se invocó createApplication de SchemaIntegrityTest con la base de desarrollo seleccionada: la lectura DATABASE() produjo la excepción esperada antes de setup/traits/escrituras. TestCase también bloquea RefreshDatabase, DatabaseMigrations y DatabaseTruncation. phpunit.xml fija la base test, y exige .env.testing para pruebas del framework |
| ESQ-09 / aplicación del esquema | Aprobado | Tras comprobar DATABASE() y CURRENT_USER(), kernel de Artisan call(migrate, --no-interaction): diez migraciones DONE en cada base, lote 1. Tres originales y siete nuevas. Sin fresh, rollback de migraciones, DROP, TRUNCATE ni DELETE |
| ESQ-10 / restricciones reales | Aprobado | php vendor/bin/phpunit --filter=SchemaIntegrityTest: OK (40 tests, 61 assertions), PHP 8.4.24, PHPUnit 12.5.42. Duplicados rechazados con 1062, CHECK con 3819, teléfono NULL con 1048, referencias inexistentes con 1452. Casos válidos y varios NIT NULL aceptados. Reglas de cascada verificadas por metadatos, sin probar DELETE |
| ESQ-11 / estructura y limpieza | Aprobado | information_schema: estructuras idénticas en ambas bases, 15 tablas InnoDB, 10 FKs, 7 CHECK con ENFORCED=YES. Columnas, nulabilidad, tipos, valores predeterminados e índices únicos inspeccionados. Todas las tablas con cero filas excepto migrations, diez entradas. Sin cuentas ni datos permanentes del CRM |

Los casos ejecutados usan DatabaseTransactions y solo filas temporales propias, no semillas ni cuentas permanentes. Tras aplicar el esquema y antes de cada prueba, TestCase comprueba por lectura que DATABASE() sea crm_ferreteria_test. Al finalizar cada caso se revierte la transacción; los contadores autoincrementales pueden avanzar. Las pruebas heredadas de Breeze con mecanismos de reinicio no se ejecutaron y quedan bloqueadas hasta adaptarlas. No se han probado aquí autenticación, concurrencia, endpoints, permisos de negocio ni validaciones de las aplicaciones.

Las migraciones declaran índices únicos para correo de users, nombre de producto, NIT, teléfono y pareja oportunidad/producto; FKs compatibles con BIGINT UNSIGNED; cascadas solo para líneas/historial de oportunidad y actividades de cliente. CHECK de precio positivo en catálogo/líneas, cantidades y mínimo 1–999, teléfono y cierre; CHECK adicional de presencia de supervisor según rol. Los campos de fecha indicados por el enunciado usan DATETIME; historial tiene solo created_at, las demás tablas conservan timestamps. La conexión fija UTC e InnoDB.

Quedarán para las aplicaciones: normalizar/validar NIT y teléfono antes de guardar, correo, precisión decimal, obligatoriedad de textos no vacíos, supervisor/vendedor con rol y estado correctos, cupo y toma concurrente, propietario, mínimo vigente entre filas, precio obtenido del catálogo, transiciones/inmutabilidad, exigir líneas para ganar y escribir historial en la misma transacción. MySQL ya protege la integridad declarada, pero no implementa por sí solo estos flujos. Panel → Eloquent y futura API → SQL compartirán esa protección; aún no están implementados.

Incidencia real del asistente: PowerShell escribió el PHP temporal con BOM UTF-8; php -l rechazó strict_types antes de cualquier conexión. Se reescribió sin BOM y la sintaxis pasó; prueba con entrada vacía devolvió ROOT_VACIO antes de SQL. Después el asistente local terminó con ok=true. La contraseña root viajó solo en memoria por stdin, sin argumentos ni archivos; el resultado temporal contiene únicamente estado, nombres y permisos. No se creó commit correctivo adicional ni se versionaron estos auxiliares. Este incidente no fue un fallo de las migraciones ni una prueba de restricciones.

Migraciones comprobadas en ambas bases (lote 1):

- 0001_01_01_000000_create_users_table
- 0001_01_01_000001_create_cache_table
- 0001_01_01_000002_create_jobs_table
- 2026_11_01_000001_extend_users_for_crm
- 2026_11_01_000002_create_productos_table
- 2026_11_01_000003_create_clientes_table
- 2026_11_01_000004_create_oportunidades_table
- 2026_11_01_000005_create_oportunidad_productos_table
- 2026_11_01_000006_create_historial_etapas_table
- 2026_11_01_000007_create_actividades_table

La comprobación de cascadas se ajustó antes de ejecutar la suite para consultar REFERENTIAL_CONSTRAINTS sin borrar filas temporales, respetando la aclaración del usuario. No se ejecutaron seeders ni pruebas de Breeze. Los 40 casos pasaron en su primera ejecución; las filas se revirtieron mediante rollback de transacciones de prueba, no mediante rollback de migraciones.

Otra incidencia documental real: el transporte de texto por PowerShell hacia Node sustituyó tildes por interrogaciones en fragmentos de README/plan y evitó algunas sustituciones previstas. Se detectó al releerlos y se corrigió usando escapes Unicode en el script de edición y escritura UTF-8. No afectó al esquema ni a los datos. Sin commit correctivo adicional autorizado.

Revisión final: comparación de APP_KEY y contraseñas reales contra archivos versionados y nuevos no ignorados, sin coincidencias; .env y .env.testing ignorados, ejemplos sin credenciales y dependencias excluidas. diff --check correcto; migraciones originales sin diferencias. HEAD sigue en 6ea8a8133dd120aab07b6aef7d72dc8890f4fcd5, spec-v1 en bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166 e índice vacío. Los cambios de esquema, pruebas y documentación permanecen sin otro commit ni push.

## 15. Semillas y cifras reales — 1 de noviembre de 2026

Etapa autorizada: guardar el esquema, implementar exactamente la sección 11 del enunciado (páginas 17–19), añadir un sector separado, verificar ambas modalidades en MySQL de pruebas y cargar desarrollo si sus tablas seguían vacías. No se implementaron pantallas, control de roles, reportes, API ni SPA. Estas evidencias verifican datos y consultas, no funcionamiento de módulos.

| Caso / trazabilidad | Resultado | Evidencia y límite |
| --- | --- | --- |
| SEM-01 / commit previo | Aprobado | 2b89b0595d3e92eb616a104b6e57cf2a1704f565, feat: crear y verificar esquema del CRM; 15 archivos del esquema, pruebas y documentación. Revisión de índice, diff --check y comparación en memoria contra secretos correctas. Sin .env, vendor, node_modules ni temporales. spec-v1 conservada |
| SEM-02 / precondiciones | Aprobado | DATABASE()/CURRENT_USER() y recuentos: las siete tablas del negocio vacías tanto en crm_ferreteria como en crm_ferreteria_test. SHOW GRANTS confirma cada cuenta limitada a su base; DML más CREATE/ALTER/REFERENCES y USAGE sin privilegios globales efectivos. No hizo falta root ni añadir permisos |
| SEM-03 / carga común | Aprobado | SeederDataTest carga solo VerificacionSeeder dentro de una transacción de pruebas. Compara cuentas/equipos/estado, productos, los 21 clientes, las 11 oportunidades y sus 13 líneas, las actividades, fechas y secuencias de historial contra la sección 11. Todos los productos comunes con mínimo 1 |
| SEM-04 / hashes e identidades | Aprobado en datos | Hash::make de Laravel produce bcrypt; Hash::check verifica las cuentas sin imprimir hashes ni claves. Relaciones por IDs obtenidos en inserciones, no IDs fijos. Los contadores ya habían avanzado por pruebas anteriores. No se prueba aún login HTTP ni bcryptjs |
| SEM-05 / carga combinada | Aprobado | DatabaseSeeder llama primero VerificacionSeeder y luego SectorSeeder en una transacción. Sin Test User. Cuenta sectorial, catálogo, clientes y oportunidades independientes; seis etapas presentes, tres mínimos mayores de 1, ninguna cartera mayor de diez y todas las cantidades respetan los mínimos. NIT no nulos pasan módulo 11 |
| SEM-06 / conservación | Aprobado | Tercera prueba toma todas las columnas de las siete tablas comunes (incluidos IDs, hashes y fechas) antes de SectorSeeder y las compara después: idénticas. Ambas semillas rechazan repeticiones sin modificar las filas. La comparación completa se realiza en memoria, sin publicar hashes |
| SEM-07 / ejecución de pruebas | Aprobado tras corregir IA-03 | php vendor/bin/phpunit --filter=SeederDataTest: OK (3 tests, 404 assertions), PHP 8.4.24, PHPUnit 12.5.42. Primera ejecución: fallo de orden alfabético en la expectativa de etapas; corregido y repetido. DatabaseTransactions revierte cada caso; consulta posterior confirma cero filas en las siete tablas de crm_ferreteria_test |
| SEM-08 / carga de desarrollo | Aprobado | Se volvió a comprobar DATABASE()=crm_ferreteria y CURRENT_USER()=crm_laravel@127.0.0.1, y las siete tablas vacías. Kernel de Artisan ejecutó db:seed --class=Database\\Seeders\\DatabaseSeeder --no-interaction en una transacción exterior; recuentos y cifras verificados antes de confirmar. Ambos seeders DONE. No se reinició el esquema |
| SEM-09 / cifras | Aprobado en consultas | SeedControlQueries usa SUM de cantidades por precio guardado, límites de mes de Guatemala convertidos a UTC y ROUND una sola vez sobre el pronóstico acumulado. Resultados de las tablas siguientes coinciden. Los DECIMAL se conservan como cadenas exactas en el ejecutor de verificación; no es una respuesta API ni valida su serialización |
| SEM-10 / alcance | Pendientes funcionales | Reportes panel/API, autenticación y control de roles/activo, propiedad, cupo transaccional, normalización de entrada, transiciones y validación del mínimo en aplicaciones siguen pendientes. No se ejecutaron Postman, pruebas concurrentes ni la suite completa heredada de Breeze |

### Recuentos obtenidos

| Tabla | Solo VerificacionSeeder en pruebas | Añadido por SectorSeeder | Ambas en desarrollo |
| --- | ---: | ---: | ---: |
| users | 7 | 4 | 11 |
| productos | 5 | 5 | 10 |
| clientes | 21 | 7 | 28 |
| oportunidades | 11 | 6 | 17 |
| oportunidad_productos | 13 | 6 | 19 |
| historial_etapas | 43 | 19 | 62 |
| actividades | 4 | 4 | 8 |

La modalidad combinada también se verificó dentro de pruebas. El estado final de crm_ferreteria_test es cero filas de negocio, por reversión de las transacciones propias; el esquema y sus diez entradas de migraciones se conservaron. No hubo migrate, migrate:fresh, rollback de migraciones, DROP, TRUNCATE ni DELETE en esta etapa, ni operaciones destructivas o cambios de privilegios. No se necesitó sustituir la autorización ambigua de migrate por un reinicio.

### Cifras comunes obtenidas

| Ámbito | Mes | Ventas | Total Q | Pronóstico Q | Cartera |
| --- | --- | ---: | ---: | ---: | --- |
| Valeria López | 2026-10 | 2 | 9,250.00 | 2,512.88 | 3 de 10 |
| Valeria López | 2026-11 | 1 | 3,600.00 | 2,512.88 | 3 de 10 |
| Diego Castillo | 2026-10 | 1 | 6,000.00 | 112.50 | 2 de 10 |
| Carlos Ajú | 2026-10 | 1 | 7,200.00 | 4,125.75 | 9 de 10 |
| Equipo Sergio Ruiz | 2026-10 | 3 | 15,250.00 | 2,625.38 | 5 entre sus vendedores |
| Equipo Sandra Pérez | 2026-10 | 1 | 7,200.00 | 4,125.75 | 10 entre sus vendedores, incluido Iván inactivo |
| Empresa común | 2026-10 | 4 | 22,450.00 | 6,751.13 | 15 asignados |

| Producto común / octubre | Unidades | Total Q |
| --- | ---: | ---: |
| Plan básico | 5 | 6,000.00 |
| Plan avanzado | 2 | 5,200.00 |
| Instalación | 1 | 450.00 |
| Soporte anual | 3 | 10,800.00 |

La venta del 1 de noviembre a las 03:30 UTC corresponde al 31 de octubre a las 21:30 de Guatemala; la de 06:30 UTC corresponde al 1 de noviembre a las 00:30. Límites de octubre usados: [2026-10-01 06:00:00 UTC, 2026-11-01 06:00:00 UTC). Renovación de planes conserva Plan avanzado a Q2,600.00 frente a Q2,750.50 de catálogo. Historial: cada fila la firma su vendedor; registro inicial con etapa_anterior NULL, tres días entre avances, final en cierre o 2026-10-02 16:00 UTC para abiertas. Plan familiar se pierde desde propuesta. Fechas created_at/updated_at no especificadas por el PDF para cuentas, clientes, productos y actividades se fijaron en 2026-08-31 12:00 UTC para reproducibilidad; no se usa la hora de ejecución.

La consulta común filtra las siete cuentas del enunciado cuando se ejecuta sobre la carga combinada. Incluir el sector en toda la empresa produce 4 ventas/Q22,450.00 en octubre y Q7,190.13 de pronóstico: el sector aporta Q439.00 de pronóstico abierto y su venta de Q120.00 se cierra en diciembre. No se presenta Q7,190.13 como la cifra de la semilla común. Las pruebas comparan además todas las filas comunes antes/después para demostrar que el filtro no oculta modificaciones.

### Referencias del sector y reproducción

Precios consultados el 1 de noviembre de 2026: block Q4.10 en [Ferretería Guatemala](https://www.ferreteriaguatemala.com/category/materiales-de-contruccion); cemento UGC Progreso 42.5 kg Q83.00, tubo de drenaje Q65.00, ducto PVC Q18.00 y guantes Q12.00 en [Mundo Ferretero](https://mundoferreterogt.com/). Precios referenciales sin flete. Mínimos del proyecto: 50 blocks, 5 sacos, 1 tubo de drenaje, 3 ductos, 1 par de guantes; no se atribuyen estos mínimos a las tiendas. Identidades sectoriales ficticias, con dominio .test y sin reutilizar las comunes.

Desde laravel/: `php vendor/bin/phpunit --filter=SeederDataTest` verifica ambas modalidades sin persistir datos; `php tests/inspect-seeds.php` consulta desarrollo y `php tests/inspect-seeds.php --testing` consulta pruebas. Ambos ejecutores de inspección se probaron: desarrollo devuelve los recuentos y cifras anteriores; pruebas devuelve ceros y precio histórico null, porque quedó vacía. Cargas persistentes alternativas sobre tablas previamente vacías: `php artisan db:seed --class=VerificacionSeeder --env=testing` o `php artisan db:seed --env=testing`, no ambas consecutivamente. Desarrollo ya está cargado: no repetir db:seed. Las semillas se detienen ante contenido existente; no lo borran ni actualizan.

Archivos de esta etapa: DatabaseSeeder modificado; nuevos SeedData, VerificacionSeeder, SectorSeeder, SeederDataTest, SeedControlQueries e inspect-seeds.php; README, plan y verificación actualizados. Las consultas auxiliares están bajo tests/, sin rutas ni reportes de aplicación. spec-v1 permanece intacta. No hay otro commit ni push de las semillas.

Revisión final de archivos: comparación contra APP_KEY y contraseñas técnicas sin coincidencias en archivos versionados/nuevos; literal público limitado a README y seeders, sin copiarlo a tests o documentos de verificación. Migraciones sin diferencias, lockfiles conservados, índice vacío, HEAD en 2b89b0595d3e92eb616a104b6e57cf2a1704f565 y spec-v1 en bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. diff --check correcto. Pint detectó únicamente una línea vacía final sobrante en inspect-seeds.php y la corrigió; sin cambio de comportamiento.

## 16. L2: cuentas y acceso del panel — 1 de noviembre de 2026

Alcance: login/logout Breeze, estado/rol actual, gestión de cuentas exclusivamente por administrador y formularios Blade en español. Contrastado L2 en página 12 del PDF y decisiones de supervisores en la especificación. Sin contradicciones nuevas. No se implementaron catálogo, clientes, reportes, API ni SPA. Pruebas HTTP mediante el kernel real de Laravel y MySQL de pruebas; no son pruebas de Postman ni de navegador gráfico.

| Caso / criterio | Estado | Evidencia real |
| --- | --- | --- |
| L2-01 / commit previo | Aprobado | 4c170978354bc067293ce1a4aedbdb92b2b0c060, feat: cargar y verificar semillas del CRM. Diez archivos de semillas/pruebas/documentación revisados, sin secretos ni temporales. spec-v1 intacta |
| L2-02 / login y logout | Aprobado | Administrador y supervisor activos entran; el ID de sesión cambia. Se conservaron cookies y se descartó la instancia del guard para el GET posterior. Logout devuelve a login, deja al usuario invitado y regenera CSRF. Vendedor e Iván inactivo reciben mensajes específicos en español y no se crea clave de autenticación en sesión. Administrador/supervisor desactivados también rechazados |
| L2-03 / acceso actual | Aprobado | Tras login, cambios por SQL sin refrescar el modelo del guard: desactivación invalida acceso en dashboard, listado, alta, edición, guardado y logout. Reactivar la cuenta no recupera esa sesión. Cambiar administrador a vendedor invalida; cambiarlo a supervisor permite inicio pero deniega cuentas |
| L2-04 / autorización directa | Aprobado | Supervisor recibe 403 en GET listado/alta/edición, POST, PUT y PATCH directos; sin filas creadas ni cuenta objetivo modificada. Invitados van a login; vendedor con guard forzado pierde acceso. Middleware can:manage-accounts en todas las rutas /cuentas, además de auth y EnsurePanelAccess |
| L2-05 / cuentas y contraseña | Aprobado | Administrador lista/crea/edita. Alta de vendedor, supervisor y administrador correctas. Hash bcrypt generado por cast hashed de Eloquent, verificado sin imprimirlo. Contraseña vacía en edición conserva hash; nueva contraseña lo reemplaza. No existe DELETE; intento devuelve 405 sin eliminar |
| L2-06 / validación | Aprobado | Once conjuntos inválidos: nombre, correo, duplicado con mayúsculas, contraseña ausente/corta/confirmación distinta, rol, estado y supervisor. Mensajes por campo en español, datos no sensibles conservados, contraseñas excluidas de old input y HTML. Nombre con script se muestra escapado. Correo normalizado a minúsculas antes de validar unicidad |
| L2-07 / supervisores | Aprobado | Rechaza supervisor inexistente, vendedor, inactivo o el propio usuario. Bloquea cambio de rol con vendedores asociados, incluso si están inactivos. Desactivar supervisor conserva asociaciones; reasignar vendedores permite después cambiar el rol del supervisor. Reasignar/desactivar vendedor no altera clientes, oportunidades, líneas, actividades ni historial |
| L2-08 / propio administrador | Aprobado | No puede desactivarse ni pasar a supervisor; conserva estado/rol tras rechazos. Edición válida de su cuenta permitida. Las reglas también se comprueban dentro de AccountManager con bloqueo de la cuenta actual |
| L2-09 / CSRF y superficies retiradas | Aprobado | Prueba específica activa PreventRequestForgery incluso bajo PHPUnit: POST sin token devuelve 419 y no escribe; con token/cookie válido guarda. GET/POST register 404; profile y password auxiliares 404. No se expone registro, eliminación ni autoservicio que eluda el administrador |
| L2-10 / suite | Aprobado tras corregir IA-04 | Selección PanelAccountsTest/SeederDataTest/SchemaIntegrityTest: 90 casos y 852 aserciones. Tras retirar pruebas de fábrica obsoletas y actualizar portada, suite completa: php vendor/bin/phpunit, OK (91 tests, 856 assertions), PHP 8.4.24, PHPUnit 12.5.42. L2 aporta 47 casos específicos. No se ejecutó RefreshDatabase |
| L2-11 / rutas y recursos | Aprobado | route:list --except-vendor -v: diez rutas, con controles en cada ruta protegida. npm.cmd run build: Vite 7.3.7, CSS app-YarC6oWS.css y JS app-BPrTyeqd.js. Invoke-WebRequest GET /login: 200, formulario español, sin enlace register; sin enviar credenciales a desarrollo |
| L2-12 / conservación de bases | Aprobado | SHA-256 en memoria de todas las filas/columnas ordenadas por id de las siete tablas de crm_ferreteria antes/después: coincidencia exacta. No se publicaron hashes de contraseñas. DATABASE() de pruebas crm_ferreteria_test, CURRENT_USER() crm_laravel_test@127.0.0.1; recuentos finales cero en las siete tablas. No hubo migraciones, SQL destructivo, semillas persistentes ni cambios de permisos |

### Implementación y flujo

POST /login pasa por LoginRequest; Auth::attemptWhen comprueba primero contraseña mediante el proveedor Eloquent y después activo/rol antes de crear sesión. Un error de credenciales no revela si la cuenta existe. Los mensajes de vendedor/inactivo se emiten solo tras comprobar la contraseña. Se conserva el limitador de intentos que generó Breeze; no se añadieron dependencias. La sesión se regenera al entrar y se invalida al salir.

Las rutas protegidas aplican auth y EnsurePanelAccess: consulta nueva de User por ID en cada petición, sustituye la instancia del guard por el estado actual y expulsa a quien pierde acceso. can:manage-accounts autoriza solo administrador activo; ocultar el enlace es complementario. AccountRequest autoriza también los guardados. AccountManager revalida actor/objetivo/supervisor bajo bloqueos en orden de ID y transacción, evitando guardar basándose exclusivamente en los datos leídos antes de validar. El índice único de correo sigue como barrera final; error 1062 se convierte en validación de correo sin mostrar SQL.

Formularios Blade: campos y errores junto al control, escape por defecto, conservación de nombre/correo/rol/supervisor/estado y ningún value de contraseña. Se exige contraseña de 8 caracteres como mínimo y 72 bytes como máximo al crear; vacía en edición conserva la actual. Los roles distintos de vendedor deben enviar supervisor vacío. Si el supervisor previo se desactivó, se solicita elegir uno activo al editar al vendedor.

El administrador no puede desactivarse ni quitarse el rol. Un supervisor con asociados conserva su rol hasta reasignarlos; la desactivación conserva el equipo. La gestión solo escribe users mediante Eloquent, sin modificar datos comerciales. No hay endpoint de borrado. Las rutas de perfil, recuperación/cambio autónomo de contraseña y verificación de correo generadas por Breeze se retiraron del enrutamiento para que la administración sea exclusiva en esta etapa; sus archivos de plantilla/controlador sin ruta no se consideran funcionalidades implementadas. Se conservaron login/logout. La página explica que la contraseña se restablece mediante el administrador.

### Pruebas y límites

PanelAccountsTest usa DatabaseTransactions y la semilla común dentro de cada caso. TestCase comprueba la base efectiva antes de iniciar el trait; la clase verifica además la cuenta técnica de pruebas. La suite retirada de fábrica esperaba usuarios sin rol/supervisor y rutas de autoservicio ya inexistentes; se sustituyó su cobertura de acceso por los casos L2, se retiró el ejemplo unitario tautológico y se ajustó portada para comprobar sus redirecciones. phpunit.xml conserva únicamente Feature para no depender de un directorio Unit vacío en un clon.

Incidencia real IA-04: primera ejecución de 46 casos tuvo once fallos al buscar mensajes en el GET siguiente. La validación ya había rechazado los campos, pero el ejecutor no reenviaba la cookie. Se comprobó la presencia de errores en sesión tras POST y su ausencia en la vista del siguiente GET. Se conservó la cookie real de la respuesta; los once casos pasaron, incluidos errores por campo. Se añadieron comprobaciones de login/logout con cookies y CSRF. No se omitió la expectativa de errores ni se cambió código de aplicación para hacer pasar esa prueba.

No se acredita concurrencia simultánea de cambios de cuentas con estas pruebas secuenciales, ni diseño visual/responsive mediante navegador gráfico. No hay login API, JWT, módulos comerciales ni reportes comprobados. El rechazo de vendedores indica la aplicación del vendedor, pero esta aún no existe y no se inventa una URL.

Comandos: `php vendor/bin/phpunit --filter=PanelAccountsTest`, `php vendor/bin/phpunit`, `php artisan route:list --except-vendor -v` y `npm.cmd run build`, desde laravel/. Abrir http://127.0.0.1:8000/login; el administrador dispone del enlace Cuentas. Sin segundo commit ni push; spec-v1 conservada.

Revisión final de Git: sin coincidencias de claves técnicas/APP_KEY en archivos versionados o nuevos no ignorados; literal público de semilla solo en lugares permitidos. Migraciones y semillas sin diferencias frente a HEAD; índice vacío. HEAD 4c170978354bc067293ce1a4aedbdb92b2b0c060 y spec-v1 bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. diff --check correcto. phpunit --list-suites confirmó Feature tras retirar la suite Unit vacía. Los archivos L2 y su documentación permanecen sin commit.

### Cierre documental y Git de L2

El usuario autorizó posteriormente guardar L2 con el mensaje «feat: implementar cuentas y acceso por roles». Este cierre incorpora código, pruebas y documentación de la sección 16, incluida la corrección IA-04. Los estados anteriores de archivos sin commit describen el final de la implementación antes de esta autorización. Se conservan los resultados ya obtenidos: 91 pruebas y 856 aserciones; no se vuelven a ejecutar ni se modifica la base. El hash del cierre se obtiene con git log -1 y se comunica al terminar. spec-v1 debe permanecer en bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166; no se hace push. El catálogo se implementará manualmente; el agente se detiene tras este commit.

## 17. L3: catálogo de productos — 4 de noviembre de 2026

Autorización posterior del usuario para implementar únicamente L3; sustituye la decisión de trabajo manual registrada al cerrar L2. Leídos AGENTS, README, especificación y plan; apartado L3 extraído de la página 12 del PDF y contrastado con la regla sectorial de cantidad mínima. Git inicial limpio, main en 624aa7ef95cdd0763277365abdd8d8f076d25008; spec-v1 anotada conservada en bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. Sin contradicciones del contrato.

| Caso / trazabilidad | Estado | Evidencia real y límite |
| --- | --- | --- |
| L3-01 / listado y formularios | Aprobado | ProductCatalogTest verifica menú solo para administrador, listado de activos/inactivos, alta con mínimo inicial 1 y edición con valores actuales. Blade coherente con L2, mensajes en español y escape de texto |
| L3-02 / alta y edición | Aprobado | POST crea con nombre recortado y espacios repetidos reducidos a uno; precio 25.50, mínimo 1 y activo. PUT permite conservar el propio nombre al validar unicidad y cambiar precio/mínimo. Nombre de 120 caracteres y mínimos 1/999 aceptados |
| L3-03 / validación exacta | Aprobado | 24 conjuntos inválidos se prueban tanto por POST como por PUT: nombre vacío/espacios/largo/arreglo; precio vacío/cero/negativo/excesivo/tres decimales/redondeable/exponente/coma/texto/arreglo/booleano; mínimo nulo/cero/negativo/excesivo/fracción/texto; estado nulo/texto/fuera de rango. Rechazos sin crear ni modificar productos |
| L3-04 / dinero | Aprobado | Acepta 0.01, 1, 1.5, 99999999.99 y ceros iniciales válidos. Modelo devuelve cadenas decimales con dos posiciones. ProductPrice comprueba formato, positividad y cantidad de dígitos enteros como texto, sin aritmética flotante ni redondeo; tabla existente DECIMAL(10,2) |
| L3-05 / duplicados | Aprobado | Rechaza nombre existente tras normalizar espacios; también diferencia solo de mayúsculas según colación de MySQL. Rechaza renombrar otro producto con un nombre existente y conserva la fila. Índice único preexistente sigue como barrera final; error 1062 se traduce a error de nombre sin mostrar SQL. No se ejecutó una prueba simultánea de duplicados |
| L3-06 / estado e historia | Aprobado | PATCH desactiva y reactiva sin borrar. En ambos casos se sube precio de Plan avanzado a 99999999.99 y mínimo 999: todas las filas/columnas de users, clientes, oportunidades, líneas, historial y actividades permanecen idénticas. Renovación de planes conserva cantidad 2 y precio cotizado 2600.00. Las consultas de control y ventas por producto no cambian |
| L3-07 / autorización directa | Aprobado | Seis operaciones (GET listado/alta/edición, POST, PUT y PATCH) rechazadas para supervisor con 403 y para invitado con redirección a login. Administrador inactivo y vendedor con sesión forzada pierden acceso. Cambio de administrador a supervisor entre peticiones bloquea un nuevo guardado. Menú oculto al supervisor; las rutas imponen el permiso independientemente del menú |
| L3-08 / formulario y CSRF | Aprobado | POST inválido y GET posterior con cookie conservada muestran errores por campo y lo escrito. Un nombre con script se muestra escapado tanto en formulario como listado. Prueba específica activa PreventRequestForgery bajo PHPUnit: sin token 419 y sin escritura; token/cookie válido permite alta |
| L3-09 / sin eliminación | Aprobado | No hay ruta destroy ni método de borrado. DELETE al producto devuelve 405 y conserva fila/recuento. Edición/actualización de identificador inexistente devuelve 404 |
| L3-10 / suite y regresión | Aprobado tras corregir IA-05 | Primera selección L3: 52 casos, un fallo por exigir atributos HTML contiguos. Se corrigió la aserción. php vendor/bin/phpunit final: OK (143 tests, 1221 assertions), PHP 8.4.24 y PHPUnit 12.5.42. Incluye 52 casos nuevos de catálogo y toda la regresión previa de L2, semillas e integridad |
| L3-11 / rutas y compilación | Aprobado | route:list --path=productos -v muestra cinco rutas, todas con web/auth/EnsurePanelAccess/can:manage-accounts, usando el permiso de administrador ya definido en L2. Pint --test aprobado. npm.cmd run build: Vite 7.3.7, CSS app-CMjlKDqb.css (36.96 kB), JS app-BPrTyeqd.js (55.13 kB). Sin paquetes nuevos |
| L3-12 / conservación de bases | Aprobado | Huellas SHA-256 en memoria de las siete tablas completas de crm_ferreteria antes/después: coincidencia exacta. Consulta final de pruebas confirma DATABASE()=crm_ferreteria_test y CURRENT_USER()=crm_laravel_test@127.0.0.1; cero filas en las siete tablas tras revertir transacciones. No se mostraron contraseñas ni hashes de cuentas |

La evidencia histórica de L3-06 usa consultas de verificación de datos, no reportes implementados: empresa común octubre conserva 4 ventas/Q22,450.00 y pronóstico Q6,751.13; Valeria octubre conserva Q9,250.00. Plan avanzado en octubre conserva 2 unidades/Q5,200.00. También se compararon las demás cifras de la sección 11 y todas las filas de líneas, así que no se depende solo de un total agregado.

### Flujo y archivos

El formulario de resources/views/products/form.blade.php envía POST /productos o PUT /productos/{product}, con CSRF. routes/web.php hereda autenticación, comprobación actual de estado/rol y can:manage-accounts de L2. ProductRequest autoriza, normaliza nombre y valida nombre/precio/mínimo/activo; ProductPrice comprueba el dinero antes de que MySQL pueda redondearlo. ProductController recibe solo campos validados y guarda mediante Product (Eloquent) sobre productos, en transacción. Antes de guardar vuelve a leer y bloquear al actor y comprueba su permiso; en edición bloquea también el producto. No guarda relaciones ni recorre cotizaciones. Model Product define tabla, campos permitidos, precio decimal:2, entero y booleano; el valor inicial del mínimo es 1 y el estado inicial activo.

El listado index.blade.php permite abrir edición tanto de activos como de inactivos. El estado se modifica desde el formulario de edición; no se añadió una operación aparte de eliminación. navigation.blade.php incluye Productos dentro del permiso ya utilizado para Cuentas. La página 403 se generalizó a «realizar esta operación» para servir también al catálogo. No se modificó el criterio del Gate de administrador, ni las rutas de autenticación.

### Ejecución, límites y reproducción

ProductCatalogTest usa la semilla común y DatabaseTransactions en crm_ferreteria_test. TestCase comprueba DATABASE() antes del trait; la clase comprueba además la cuenta técnica antes de cargar datos. Se revirtieron únicamente transacciones propias. No hubo migraciones, reinicios, SQL destructivo, cambios de permisos, instalaciones o cargas persistentes; los datos principales permanecen intactos. El PHP instalado requirió su ruta absoluta y ejecución fuera del entorno restringido para realizar las comprobaciones; no se cambió la configuración de PHP o de PowerShell.

Comandos ejecutados desde laravel/: `php vendor/bin/phpunit --filter=ProductCatalogTest` (primera ejecución con el fallo indicado), `php vendor/bin/phpunit` (suite final aprobada), `php artisan route:list --path=productos -v`, Pint sobre los archivos de L3 y `npm.cmd run build`. No se repitió una suite aprobada sin cambios o fallos que lo justificaran.

README incluye el flujo con cada archivo y pasos manuales para abrir /productos con un administrador. Para probar escrituras manualmente sin alterar desarrollo, documenta un servidor en el puerto 8001 con --env=testing, sesiones en archivo mediante variables de proceso y semilla común solo si las tablas están vacías. Ese procedimiento manual no se ejecutó: la evidencia de esta etapa corresponde a pruebas HTTP del framework. Las pruebas manuales dejarían datos persistentes en la base test; el README lo distingue del estado vacío al finalizar esta etapa y no propone borrados automáticos.

Pendientes: revisión visual en navegador gráfico, pruebas simultáneas del catálogo y validación del mínimo vigente al agregar/cambiar líneas en futuras aplicaciones. No se implementaron inventario, existencias, proveedores, clientes, reportes de panel/API, API o SPA. Las rutas de registro público siguen ausentes. Sin commits, etiquetas o push en L3.

Revisión final de archivos: sin coincidencias de APP_KEY o contraseñas técnicas al comparar en memoria archivos versionados y nuevos no ignorados; literal público de la semilla solo en ubicaciones permitidas. Sin temporales, dependencias ni archivos de entorno versionados. Migraciones, semillas y lockfiles sin diferencias. diff --check correcto. HEAD permanece en 624aa7ef95cdd0763277365abdd8d8f076d25008 e índice vacío; spec-v1 conserva tanto objeto de etiqueta e52929d8837fc9c2d46dcbff258760c4e505ba9e como commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. Solo código, pruebas y documentación de L3 pendientes en el árbol de trabajo.

### Cierre documental y Git de L3

El usuario autorizó posteriormente el commit «feat: implementar catálogo de productos», que incorpora el código, pruebas y documentación de esta sección, incluida la corrección IA-05. Los estados anteriores de cambios sin commit corresponden al final de la implementación, antes de esta autorización. Se conservan los resultados ya ejecutados: 143 pruebas y 1.221 aserciones; no se repiten las pruebas ni se consulta o modifica la base en este cierre. Se revisan el índice y las exclusiones antes de confirmar; el hash final se comunica al terminar. spec-v1 se conserva, sin push ni implementación de otro módulo.

La revisión del índice detectó una línea vacía sobrante al final de cada vista nueva de productos; se retiraron ambas sin cambiar comportamiento. Se conservaron las pruebas existentes. La comparación contra secretos reales no encontró coincidencias y se comprobaron las exclusiones de entornos, dependencias y compilados.

## 18. L4: clientes y asignación — 4 de noviembre de 2026

Autorizado únicamente L4. Contrastadas R2/R3/R4 en la página 8 del enunciado, L4 en la página 13 y decisiones de la sección 6 de la especificación. Leídos AGENTS, README y plan. Estado inicial: main limpio en 8d42a274acf3914cee88154fdbe9d88c95235c83; spec-v1 apunta a bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. No se cambiaron decisiones ni esquema.

| Caso / criterio | Estado | Evidencia real |
| --- | --- | --- |
| L4-01 / ámbito y listado | Aprobado | Administrador ve 21 clientes de semilla; Sergio ve 11: cinco de su equipo y seis disponibles. No aparecen clientes de Carlos/Iván. Listado de disponibles muestra identificación sin NIT/teléfono/correo. El menú Clientes está disponible para ambos roles del panel |
| L4-02 / búsqueda y filtros | Aprobado | Búsqueda por nombre, NIT con espacios/guiones y CF; filtro por vendedor y sin asignar. Vendedor de otro equipo devuelve 404. Búsquedas con porcentaje literal o texto de inyección no amplían resultados ni causan SQL inválido; bindings y condiciones OR agrupadas dentro del ámbito |
| L4-03 / recursos ajenos | Aprobado | Nueve operaciones GET/PUT/PATCH/POST/DELETE sobre un cliente de Carlos desde Sergio devuelven 404, incluso con datos inválidos que de otro modo generarían errores. La autorización ocurre antes de la validación. Invitado, vendedor con guard forzado e inactivo no pueden usar el módulo |
| L4-04 / identidad | Aprobado | Edición de Comercial El Quetzal acepta 000452 1817-k y +502 (5555)-1234 y conserva 4521817K/55551234. Algoritmo comprueba el ejemplo y rechaza verificador incorrecto. Un teléfono local de ocho dígitos que empieza por 502 no pierde su prefijo por error. CF, c-f y campo vacío se almacenan NULL; varios clientes pueden ser CF |
| L4-05 / validación y duplicados | Aprobado | 18 conjuntos inválidos por POST y PUT: nombre, NIT/verificador/ceros, teléfono/prefijo/formato y correo. Ninguno escribe. NIT y teléfono repetidos tras normalizar se rechazan por campo. Se aceptan nombre de 150 caracteres, correo válido de 150, NIT válido de dos caracteres, y correo NULL. Las carreras comprueban además los índices únicos |
| L4-06 / asignación y cupo | Aprobado | Alta asignada solo a destino permitido. Rechaza vendedores de otro equipo (404), inactivos o cuentas sin rol vendedor. Carlos pasa de nueve a diez; un alta/asignación posterior se rechaza por cupo. Dos carreras con cupo nueve confirman límite bajo operaciones simultáneas |
| L4-07 / reasignación | Aprobado | Comercial El Quetzal pasa de Valeria a Diego: Ampliación a bodega y Seguimiento anual cambian de propietario; Renovación de planes conserva todas sus columnas y crédito. Todas las líneas, historial y actividades permanecen idénticos. Transferencia posterior por administrador a Carlos hace que Sergio pierda acceso a la ficha (404) |
| L4-08 / liberación | Aprobado | Bloqueada con oportunidades abiertas o actividades pendientes. Al cerrar los pendientes de un fixture y completar actividades dentro de la transacción de prueba, permite liberar y conserva íntegramente oportunidades cerradas y actividades. Formularios obsoletos y acciones sin confirmación no escriben |
| L4-09 / eliminación | Aprobado | Supervisor no puede abrir confirmación ni ejecutar DELETE de un cliente propio (403); cliente de otro equipo mantiene 404. Administrador elimina fixture sin oportunidades y su actividad desaparece por FK CASCADE. Se rechaza eliminación con oportunidad ganada. Requiere confirmación explícita |
| L4-10 / validación y escape de interfaz | Aprobado | POST inválido con cookie conservada muestra errores junto al campo y mantiene lo escrito. Nombre con script se muestra escapado. CF aparece en formulario en lugar de NULL. Prueba con PreventRequestForgery activado rechaza escritura sin CSRF (419) |
| L4-11 / concurrencia real | Aprobado en kernel HTTP y MySQL | Cinco carreras en procesos PHP independientes y conexiones distintas, descritas abajo. Cada una produjo un éxito 302 y un conflicto 409. No es una ejecución secuencial ni una simulación del repositorio de datos |
| L4-12 / suite final | Aprobado tras IA-06 | php vendor/bin/phpunit: OK (191 tests, 2011 assertions), PHP 8.4.24, PHPUnit 12.5.42; incluye 43 casos funcionales L4, cinco concurrentes y toda la regresión previa. ClientManagementTest inicial tuvo un fallo por el destino propio del supervisor, corregido antes de la suite final |
| L4-13 / rutas, formato y recursos | Aprobado | route:list --path=clientes -v: once rutas protegidas por auth/EnsurePanelAccess; las de recurso por can:view,client, y eliminación por can:delete,client. Pint --test aprobado. Vite 7.3.7 compiló CSS app-CW38moex.css (37.14 kB) y JS app-BPrTyeqd.js (55.13 kB) |
| L4-14 / conservación de datos | Aprobado | Huellas SHA-256 en memoria de todas las columnas/filas de las siete tablas principales, antes/después: idénticas. Consulta final DATABASE()=crm_ferreteria_test, CURRENT_USER()=crm_laravel_test@127.0.0.1; siete tablas de negocio con cero filas. Sin cambios de credenciales/permisos/migraciones, reinicios o semillas permanentes |

### Peticiones simultáneas y resultados

ClientConcurrencyTest crea fixtures propios confirmados temporalmente para que dos conexiones puedan verlos. Lanza dos ejecutores PHP CLI, cada uno con una petición real del kernel HTTP de Laravel, administrador distinto y conexión MySQL distinta. El coordinador bloquea previamente las filas de vendedor. Ambos ejecutores anuncian que están a punto de ejecutar su SELECT FOR UPDATE, después de autorización/validación; se exige que sigan ejecutándose y que sus intervalos crucen el instante de liberación de la barrera SQL. Solo entonces se comprueban códigos y estado final.

| Carrera | Resultado observado | Estado final |
| --- | --- | --- |
| Dos altas hacia vendedor con nueve clientes | Un 302 y un 409 con error vendedor_id | Diez clientes, sin sobrecupo |
| Mismo disponible a dos vendedores | Un 302 y un 409 | Un solo propietario/ganador |
| Dos reasignaciones hacia vendedor con nueve | Un 302 y un 409 | Destino diez; origen conserva al cliente rechazado |
| Mismo NIT con dos representaciones normalizadas | Un 302 y un 409 con error nit | Una fila con ese NIT |
| Mismo teléfono con prefijo/separadores distintos | Un 302 y un 409 con error telefono | Una fila con ese teléfono |

La selección inicial de concurrencia pasó cinco pruebas y 605 aserciones (incluía aserciones repetidas en el sondeo de barreras). Antes de la suite final se sustituyó ese sondeo por fallar solo si el ejecutor terminaba prematuramente, evitando que el número de aserciones dependiera del tiempo de arranque. La suite final aprobada es 191/2011; no se suman cifras de ejecuciones distintas. Las carreras se ejecutaron nuevamente dentro de esa suite, con los mismos cinco resultados lógicos y órdenes de ganadores que pueden variar.

Las peticiones son del kernel HTTP en procesos independientes, no tráfico TCP ni peticiones de la futura API. El ejecutor solo admite crm_ferreteria_test y su cuenta técnica; autentica exclusivamente actores temporales con dominio concurrency.test. Datos de solicitud por stdin, sin contraseñas o credenciales en argumentos/salidas. El callback de barrera es exclusivo de tests; no modifica consultas ni fuerza un resultado de negocio.

Cada limpieza comprueba otra vez DATABASE(), CURRENT_USER() y SHOW GRANTS para confirmar aislamiento. Se borran únicamente clientes del prefijo aleatorio propio del caso y los IDs de sus usuarios temporales, en orden compatible con las FK. No se reinicia ninguna tabla ni se eliminan filas preexistentes. Los directorios de barrera son temporales propios fuera del repositorio y se retiran al terminar. Si ya hay datos de negocio al iniciar, la clase se detiene en vez de borrarlos. Los demás casos L4 usan DatabaseTransactions y revierten sus propias filas.

### Decisiones aplicadas y protección en el servidor

La visibilidad de Client depende de la asociación actual del vendedor a su supervisor, e incluye vendedores inactivos: desactivar no libera carteras. ClientPolicy devuelve 404 para el recurso ajeno antes de FormRequest. Después de bloquear, ClientManager revalida cuenta y alcance actual para que un cambio entre peticiones no permita escribir fuera del equipo.

La edición de identidad no acepta ni siquiera vendedor_id=NULL: la regla missing impide usar esa vía para liberar sin comprobar pendientes. El servicio además selecciona explícitamente solo nombre/NIT/teléfono/correo al editar. El vendedor de un alta es un destino de asignación solicitado por el administrador/supervisor y autorizado en el servidor; nunca confiere permisos por venir en el formulario. La futura API obtendrá dueño/destino desde su sesión/token según el contrato, no copiará el formulario del panel.

Solo se transfieren oportunidades abiertas. Cerradas conservan vendedor, fecha, precio y crédito histórico. Las actividades mantienen autor, y su consulta/finalización en futuros módulos dependerá de la cartera actual. No se añadió una página de actividades ni se reescribió historial al reasignar. Liberar conserva ventas y actividades completadas pero se bloquea por cualquier abierta/pendiente. Eliminar comprueba todas las oportunidades y deja actuar la cascada existente de actividades.

Protocolo para ambas aplicaciones: docs/protocolo-cartera.md. Orden: filas de cuentas implicadas por ID (vendedores exclusivas; actor no vendedor compartida), cliente, oportunidades y actividades por ID. Recuento mediante lectura actual bajo bloqueo del vendedor. Si cambia el propietario entre lectura orientativa y bloqueo, no seguir sin su fila de origen: conflicto y reversión. Los índices únicos y las FK son barreras finales; errores esperados se traducen a mensajes por campo. Las comprobaciones de aplicación no sustituyen la integridad de MySQL.

En solicitudes JSON del panel, validación previa da 422; conflictos de cupo, asignación, índices o pendientes dan 409. Formularios HTML se redirigen con errores por campo y datos anteriores. Esto no define la respuesta de una API: las formas/códigos contractuales de Express siguen pendientes.

### Reproducción y límites

Desde laravel/: `php vendor/bin/phpunit --filter=ClientManagementTest`, `php vendor/bin/phpunit --filter=ClientConcurrencyTest`, `php vendor/bin/phpunit`, `php artisan route:list --path=clientes -v`, Pint y `npm.cmd run build`. Ejecuciones reales: primera selección funcional (42 casos, un fallo), selección concurrente (cinco aprobados), suite final (191/2011 aprobada) y verificaciones de lectura/formato. No se repitió una suite aprobada sin una modificación que lo justificara.

Archivos principales: ClientController, ClientRequest/ClientActionRequest, ClientIdentity/GuatemalanNit, ClientPolicy, ClientManager/ClientConflict y modelo Client. Modelos mínimos Opportunity y Activity sirven solo a las relaciones/bloqueos de L4. Vistas clients/index, form y confirm; rutas y menú existentes actualizados. Pruebas ClientManagementTest y ClientConcurrencyTest, ejecutor tests/Support/client-request-worker.php. README incluye pasos manuales en el servidor de pruebas del puerto 8001, sin modificar principal; ese recorrido visual/manual no se ejecutó aquí.

Pendientes: página de equipo L5, reportes, oportunidades/actividades como módulos, API y SPA. No hay evidencia aún de paridad de normalización con Express, tokens, Postman ni concurrencia de cambios de etapa. El registro público permanece ausente. No se instalaron paquetes ni se cambiaron políticas de PowerShell. Sin commits, push o cambios de spec-v1.

Revisión final: comparación en memoria contra APP_KEY y contraseñas técnicas, sin coincidencias en archivos versionados o nuevos no ignorados; literal público de semilla solo en ubicaciones permitidas. Sin temporales, dependencias ni entornos incluidos. Migraciones, semillas y lockfiles sin diferencias. diff --check correcto, índice vacío y HEAD en 8d42a274acf3914cee88154fdbe9d88c95235c83; spec-v1 mantiene el objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. Los cambios L4 quedan sin commit.

### Cierre documental y Git de L4

El usuario autorizó posteriormente el commit «feat: implementar clientes y asignación de vendedores». Incluye código, pruebas, vistas, documentación y docs/protocolo-cartera.md, revisado frente a ClientManager y la evidencia de concurrencia. Los estados anteriores sin commit describen el final de la implementación antes de esta autorización. Se conservan los resultados ya ejecutados de 191 pruebas y 2.011 aserciones, incluidas las cinco carreras simultáneas; no se repiten pruebas ni se consulta o modifica la base durante este cierre. Se comprueban exclusiones e índice antes de confirmar. El hash final se comunica al terminar, con estado de Git y spec-v1 conservada; sin push ni avance de otro módulo.

## 19. L5: Mi equipo del supervisor — 5 de noviembre de 2026

Alcance autorizado: página de consulta L5 solamente. Leídos AGENTS.md, README, especificación (L5, decisiones de equipo y R7) y plan; este se actualizó antes del código. Estado inicial: main limpio en 879231885bdf4627c464893e1fb27616abbadd49; spec-v1 resuelve a bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. Se reutilizan auth, EnsurePanelAccess y las asociaciones de L2/L4. No se modificaron decisiones, esquema, semillas ni protocolo de asignación.

| Caso / criterio | Estado | Evidencia real |
| --- | --- | --- |
| L5-01 / acceso y menú | Aprobado | Supervisor activo accede; administrador 403 sin enlace; invitado redirige a login. Vendedor y supervisor desactivado no acceden. Si el supervisor cambia a administrador en la base, la siguiente petición devuelve 403 pese a la sesión existente |
| L5-02 / aislamiento | Aprobado | Sergio solo ve Valeria/Diego; Sandra solo Carlos/Iván. supervisor_id, vendedor_id y equipo_id en query devuelven 404, igual que rutas con identificadores. El único parámetro admitido es mes; el equipo proviene de request->user()->sellers() |
| L5-03 / estado y carteras | Aprobado | Octubre común: Valeria 3/10, Diego 2/10, Carlos 9/10 e Iván inactivo 1/10. Iván se muestra sin ventas con Q0.00. Mes sin ventas conserva carteras y ceros; supervisor sin vendedores muestra estado vacío |
| L5-04 / cifras comunes | Aprobado | Octubre: Valeria 2 ventas/Q9,250.00, Diego 1/Q6,000.00; equipo Sergio 3/Q15,250.00. Carlos 1/Q7,200.00 e Iván 0/Q0.00. Noviembre: Valeria 1/Q3,600.00. Contraste de resultados de la vista con valores explícitos de la sección 11, no con una llamada al mismo cálculo del controlador |
| L5-05 / UTC y Guatemala | Aprobado | Mes por defecto con reloj en 2026-11-01 03:30 UTC es octubre; a las 06:00 UTC es noviembre. Los cierres comunes 03:30 y 06:30 se reparten correctamente. Fixtures adicionales a 05:59:59/06:00:00 UTC al inicio y final prueban inclusión/exclusión exacta del intervalo; dos ventas de Q0.01 suman Q0.02 sin redondeo previo |
| L5-06 / sin multiplicación de relaciones | Aprobado | Semilla con varias líneas por venta y varios clientes: Valeria conserva dos ventas, tres clientes y Q9,250.00; Diego una venta, dos clientes y Q6,000.00. Se suman líneas por oportunidad y ventas por vendedor antes de unir, y la cartera se cuenta por subconsulta independiente |
| L5-07 / historia y asociación actual | Aprobado | Cambiar precio de Plan avanzado a Q99,999,999.99, mínimo a 999 y estado inactivo conserva Q9,250.00 de Valeria. Reasignar María Coyoy a Carlos dentro del fixture conserva la venta de noviembre acreditada a Valeria, aunque cambia su cartera. Mover Valeria inactiva al equipo de Sandra la retira de Sergio y muestra en Sandra sus tres clientes y ventas históricas |
| L5-08 / validación y salida | Aprobado | Nueve meses inválidos: formato, vacío, array, inyección, meses 00/13 y años fuera de rango; error por campo en español. Límites válidos 1000-01/9998-12 y febrero bisiesto 2024-02 aceptados. Formulario HTML muestra el error junto al campo. Nombre malicioso se escapa; no aparecen hashes, correo, NIT ni teléfono del vendedor/cliente |
| L5-09 / solo lectura | Aprobado | GET conserva todas las columnas/filas del núcleo en el fixture; POST /mi-equipo devuelve 405. No hay operaciones de escritura en TeamController. Asignar, reasignar y liberar conservan las protecciones existentes L4 |
| L5-10 / pruebas finales | Aprobado | Primera selección TeamPageTest: 22 pruebas/138 aserciones. Se añadieron tres casos de límites válidos y se ajustó el fixture de reasignación para respetar cupos. Suite completa final: OK (216 tests, 2161 assertions), incluidos 25 casos L5 y toda la regresión; PHP 8.4.24, PHPUnit 12.5.42 |
| L5-11 / rutas, formato y compilación | Aprobado | route:list --path=mi-equipo -v muestra una ruta GET/HEAD con web/auth/EnsurePanelAccess/can:view-team. Pint --test aprobado. npm.cmd run build: Vite 7.3.7, CSS app-CNV956KI.css (37.32 kB), JS app-BPrTyeqd.js (55.13 kB). Primer intento de compilación bloqueado por acceso a directorios de esbuild en el sandbox; ejecución fuera de ese entorno aprobada, sin cambiar políticas ni instalar paquetes |
| L5-12 / conservación | Aprobado | SHA-256 en memoria de todas las filas/columnas de las siete tablas principales: coincidencia exacta antes/después. Recuento principal conservado: 11/10/28/17/19/62/8. Consulta final test: DATABASE()=crm_ferreteria_test, CURRENT_USER()=crm_laravel_test@127.0.0.1, siete tablas vacías |

### Consultas y archivos

TeamController tiene solo index y monthlySales. La ruta exige el Gate view-team (supervisor activo) además de los controles L2 que recargan rol/estado desde MySQL en cada petición. Las relaciones User::sellers y User::clients permiten leer directamente asociación actual y cartera; no se acepta un propietario del navegador. Un parámetro extra da 404 antes de consultar cifras; no se crean fichas de vendedores ni rutas para equipos ajenos.

El inicio del mes se construye en America/Guatemala y se convierte a UTC. La condición es fecha_cierre >= inicio y < inicio del mes siguiente. Para octubre son 2026-10-01 06:00:00 y 2026-11-01 06:00:00 UTC. El filtro está ligado a oportunidades ganadas y a su vendedor histórico. No depende de created_at ni del precio del catálogo, ni de la asignación actual del cliente.

Las líneas se agrupan por oportunidad con SUM(cantidad * precio_unitario). Una segunda agrupación por vendedor cuenta oportunidades y suma esos totales. La consulta Eloquent del equipo une ese resultado y utiliza withCount('clients') por separado. Las uniones no generan combinaciones de clientes × líneas; los vendedores sin ventas permanecen por LEFT JOIN y reciben cero por COALESCE. Todas las sumas monetarias ocurren como DECIMAL en MySQL; la conversión de la vista solo da formato a quetzales.

Vista team/index.blade.php, navegación y dashboard mantienen el estilo Blade del panel. README explica el flujo, cada archivo y recorrido manual. No se añadieron servicios, paquetes, nuevos modelos ni capas para esta página de lectura.

### Ejecución, seguridad y pendientes

TeamPageTest comprueba la cuenta técnica y usa DatabaseTransactions; TestCase comprueba DATABASE() antes de iniciar el trait. La semilla común se carga temporalmente y se revierte sin vaciar tablas. La suite final volvió a ejecutar las cinco carreras de L4: cada una tuvo un éxito 302 y un conflicto 409, conexiones distintas y solapamiento bajo bloqueo; carteras finales sin superar diez, un propietario y una fila por identidad duplicada. Solo sus propios fixtures se limpian siguiendo los controles existentes; no se reinició ninguna base.

Comandos efectivos desde laravel/: `php vendor/bin/phpunit --filter=TeamPageTest`, `php vendor/bin/phpunit`, `php artisan route:list --path=mi-equipo -v`, Pint y `npm.cmd run build`. Para PHP se utilizó la ruta absoluta instalada y ejecución fuera del entorno restringido. Las lecturas de huellas e identidad se hicieron con scripts por stdin, sin crear archivos temporales en el proyecto ni imprimir credenciales.

No hubo migraciones, semillas persistentes, cambios de permisos/credenciales ni escritura en crm_ferreteria. El recorrido de navegador descrito en README es de lectura y no se ejecutó gráficamente: la evidencia funcional son peticiones HTTP del framework y MySQL real de pruebas. L6 (consulta de oportunidades y reportes generales/pronóstico), API, SPA, Postman y cambios de etapa concurrentes siguen pendientes. No se crearon commits, etiquetas ni push; spec-v1 se conserva.

Revisión final: 155 archivos versionados/nuevos no ignorados comparados en memoria contra las claves APP_KEY y contraseñas técnicas locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas; no hay entornos, dependencias ni temporales entre los archivos revisados. diff --check correcto; migraciones, semillas, lockfiles y protocolo-cartera sin cambios. HEAD permanece en 879231885bdf4627c464893e1fb27616abbadd49, índice vacío y cambios L5 únicamente en el árbol de trabajo. spec-v1 conserva objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166.

Cierre L5 autorizado posteriormente con «feat: implementar página del equipo del supervisor». Se conservan los resultados automatizados de 216 pruebas/2.161 aserciones; no se repiten para el cierre. La revisión visual en navegador sigue pendiente. Se revisan exclusiones, secretos y archivos incluidos antes del commit; sin push ni cambios de spec-v1. Los estados anteriores sin commit corresponden al final de la implementación.

## 20. L6: consulta de oportunidades y reportes — 5 de noviembre de 2026

Alcance autorizado: guardar L5, implementar L6 y guardar L6 si pasan las comprobaciones. L5 quedó guardado en d3bdd6d96bb9d23242f756cdbed71a4ec4133d6a, conservando 216 pruebas/2.161 aserciones y revisión visual pendiente; no se repitieron para ese cierre. Leídos AGENTS, README, especificación y plan; contrastados L6 en página 13, R7 en página 9 y cifras de sección 11 en página 19 del PDF. Plan actualizado antes del código. spec-v1 mantiene el hito documental original.

| Caso / criterio | Estado | Evidencia real |
| --- | --- | --- |
| L6-01 / listado y ámbito | Aprobado | Semilla común: administrador 11 oportunidades; Sergio 9; Sandra 2. El listado de Sergio no muestra clientes, vendedores ni títulos del otro equipo. Solo GET/HEAD; no existe ficha individual ni operación de escritura en este módulo |
| L6-02 / filtros y 404 | Aprobado | Combinación ganada + Valeria devuelve sus tres ventas de todos los meses; prospecto + Diego e Iván sin ventas producen estado vacío. Vendedor de otro equipo o inexistente devuelve 404. supervisor_id en listado/reporte, vendedor_id en reporte y ruta individual ajena devuelven 404; ningún filtro amplía ámbito |
| L6-03 / totales y cierres | Aprobado | Renovación de planes muestra Q5,650.00 con dos líneas históricas; Seguimiento anual sin líneas Q0.00 y Sin cierre. Cierres 2026-11-01 03:30 UTC y 06:30 UTC se muestran como 31/10/2026 21:30 y 01/11/2026 00:30 Guatemala |
| L6-04 / resumen empresa | Aprobado | Octubre común: 4 ventas, total Q22,450.00 y pronóstico Q6,751.13. Noviembre: 1/Q3,600.00 y mismo pronóstico. Mes 2099-02 sin ventas: 0/Q0.00 y mismo pronóstico, acreditando ausencia de filtro mensual sobre abiertas |
| L6-05 / resumen equipos | Aprobado | Sergio octubre 3/Q15,250.00/pronóstico Q2,625.38. Sandra 1/Q7,200.00/Q4,125.75. Ningún vendedor ajeno aparece en tablas o selector |
| L6-06 / desglose por vendedor | Aprobado | Valeria octubre 2/Q9,250.00/Q2,512.88; Diego 1/Q6,000.00/Q112.50; Carlos 1/Q7,200.00/Q4,125.75; Iván inactivo 0/Q0.00/Q0.00. Valores explícitos de sección 11, no una llamada al mismo helper para obtener expectativas |
| L6-07 / desglose por producto | Aprobado | Octubre empresa: Plan básico 5 unidades/Q6,000.00; Plan avanzado 2/Q5,200.00; Instalación 1/Q450.00; Soporte anual 3/Q10,800.00. Licencia anterior, solo en una perdida, presenta ceros. Pronóstico por producto: Plan avanzado Q6,188.63 e Instalación Q562.50; los demás cero. Sergio solo acredita 1 Soporte anual/Q3,600.00; Sandra solo tiene cotizaciones de Plan avanzado/Soporte anual |
| L6-08 / límites UTC | Aprobado | Reloj en 2026-11-01 05:59:59 UTC elige octubre; 06:00:00 elige noviembre. Fixture de cierre exactamente al inicio se incluye; al inicio del mes siguiente se excluye; moverlo un segundo antes del inicio lo excluye. L5 mantiene además sus pruebas de fronteras y meses válidos compartiendo ReportMonth |
| L6-09 / redondeo SQL | Aprobado | Dos abiertas adicionales de Q0.05 al 10%, una de Carlos y otra de Iván, añaden Q0.01 al pronóstico de Sandra: Q4,125.76. Las filas individuales redondeadas muestran Q4,125.76 y Q0.01; sumarlas daría un resultado distinto. El resumen usa ROUND(SUM(...), 2), nunca la suma de filas ya redondeadas |
| L6-10 / historia y estado actual | Aprobado | Cambiar todos los precios a Q99,999,999.99, mínimos a 999 y desactivar productos conserva desglose completo, resumen y Q5,650.00 de la oportunidad. Reasignar María Coyoy conserva la venta de Valeria. Cambiar Valeria al equipo de Sandra retira sus oportunidades del equipo de Sergio; cambiarla de rol conserva todas las oportunidades y cifras para administrador (corrección IA-07) |
| L6-11 / permisos y validación | Aprobado | Invitado, vendedor y supervisor desactivado no acceden; estado actual se recarga en la siguiente petición. Seis filtros inválidos (etapa, arrays, vendedor, inyección y página) y cinco meses inválidos reciben errores por campo en español. HTML muestra errores junto al campo y conserva selección válida del vendedor aunque la etapa falle |
| L6-12 / salida y lectura | Aprobado | Títulos y nombres de producto maliciosos se escapan. No se exponen hashes, teléfono ni NIT. POST/PUT/PATCH/DELETE de oportunidades y reportes devuelven 405. Todas las columnas/filas del núcleo del fixture coinciden antes/después de consultar |
| L6-13 / suite final | Aprobado | PHP 8.4.24, PHPUnit 12.5.42: OK (247 tests, 2393 assertions). Incluye 31 casos L6, los 25 casos L5 y toda la regresión previa. Pruebas L6 usan solo VerificacionSeeder en crm_ferreteria_test y DatabaseTransactions; no SectorSeeder en esa clase |
| L6-14 / rutas y compilación | Aprobado | route:list --except-vendor -v: 29 rutas totales; dos nuevas GET/HEAD con web/auth/EnsurePanelAccess. Pint --test aprobado. npm.cmd run build, Vite 7.3.7: CSS app-Ca5AMo9o.css (37.41 kB), JS app-BPrTyeqd.js (55.13 kB), sin dependencias nuevas |
| L6-15 / bases conservadas | Aprobado | Huellas SHA-256 completas en memoria del núcleo principal antes/después idénticas; recuentos 11/10/28/17/19/62/8. Lectura final test: DATABASE()=crm_ferreteria_test, CURRENT_USER()=crm_laravel_test@127.0.0.1; siete tablas de negocio vacías. Sin migraciones, cambios de permisos/credenciales ni cargas permanentes |

### Organización y cálculos

OpportunityController tiene index y filters: valida y comprueba el vendedor dentro del ámbito antes de construir la consulta paginada. ReportController prepara resumen y desgloses. Ambas rutas heredan los controles L2 y utilizan SalesQueries::opportunities para mantener el alcance. El administrador ve todas las oportunidades incluso si el titular cambió de rol; el supervisor solo las de quienes actualmente siguen siendo vendedores de su equipo. No se alteró AccountManager ni la política de reasignación.

SalesQueries concentra consultas compartidas, sin paquetes ni capas adicionales. lineTotals agrupa por oportunidad cantidades × precios históricos. totals agrega ventas mensuales, total y pronóstico independiente del mes; summary lo calcula para el ámbito completo y bySeller lo agrupa antes de unir a los usuarios. Esa unión devuelve una fila por vendedor; no multiplica por clientes ni por líneas. byProduct agrupa líneas históricas por producto con unidades e importe del mes y pronóstico abierto. COUNT DISTINCT cuenta oportunidades distintas dentro de cada producto; sumar esa columna entre productos no equivale a ventas de empresa.

ReportMonth valida el selector y construye el primer día del mes local a medianoche; SalesQueries convierte ese instante y el primer día del mes siguiente a UTC. Octubre comprende [2026-10-01 06:00:00, 2026-11-01 06:00:00). TeamController utiliza ahora ReportMonth y bySeller en lugar de repetir validación y cálculo mensual; sus pruebas L5 se conservaron y pasaron en la regresión.

Vistas opportunities/index y reports/index muestran quetzales, etiquetas en español y estados vacíos. Las conversiones de presentación no calculan sumas: las agregaciones usan DECIMAL en MySQL. Solo expresiones constantes de la aplicación se combinan en SQL; fechas y filtros usan bindings. README incorpora el flujo panel → consultas Eloquent/constructor → misma base MySQL y pasos manuales de lectura.

### Ejecuciones e incidencias reales

Primera selección `php vendor/bin/phpunit --filter='OpportunityReportsTest|TeamPageTest'`: 55 pruebas, 358 aserciones, un fallo porque la navegación renderizada todavía no incluía Reportes. El archivo fuente sí tenía el enlace. Se limpió únicamente la caché de vistas mediante `php artisan view:clear`; no se modificaron credenciales, configuración de seguridad o datos para resolverlo. La navegación actual se comprobó después por HTTP.

Durante la revisión se detectó y corrigió IA-07 antes de la suite final: la consulta del administrador no debía excluir titulares que cambiaron de rol. Se añadió el caso correspondiente. Primera regresión completa aprobada: 247/2.388. Después se mejoró la conservación de filtros válidos frente a errores y se amplió su caso HTTP; la regresión se repitió por ese cambio. Resultado final único vigente: 247/2.393; no se suman resultados de ejecuciones distintas.

La regresión volvió a ejecutar las cinco carreras de L4: conexiones distintas y solapamiento real bajo bloqueo; un éxito 302 y un conflicto 409 en cada carrera, cupo máximo diez, un ganador del disponible y una fila por identidad duplicada. Se limpiaron solo fixtures propios conforme al protocolo existente. No se ejecutaron pruebas de cambios de etapa concurrentes, API, SPA ni Postman.

Comandos reales desde laravel/: PHPUnit (selección y regresiones indicadas), `php artisan route:list --except-vendor -v`, `php artisan view:clear`, Pint y `npm.cmd run build`. PHP requirió la ruta absoluta instalada y ejecución fuera del entorno restringido. Las lecturas de identidad y huellas se realizaron por stdin sin archivos temporales del proyecto ni exposición de credenciales.

Revisión visual de L5 y L6 pendiente. El recorrido de navegador de README no se ejecutó gráficamente; la evidencia funcional procede del kernel HTTP de Laravel y MySQL real. Se conserva el resultado L5 original dentro de su commit y se registran aquí las verificaciones de reutilización. No se implementaron operaciones del vendedor, API ni SPA. El usuario autoriza guardar L6 tras aprobar las comprobaciones con «feat: implementar consulta de oportunidades y reportes», sin push ni cambios de spec-v1.

Revisión previa al commit: 162 archivos versionados/nuevos no ignorados comparados en memoria contra claves y contraseñas técnicas locales, sin coincidencias; literal público de la semilla solo en ubicaciones permitidas. Sin entornos, dependencias ni temporales entre los archivos incluidos. diff --check correcto. Migraciones, semillas, lockfiles y protocolo-cartera permanecen sin cambios. Se prepara únicamente código, vistas, pruebas y documentación L6. spec-v1 conserva objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. El hash del commit final y estado de Git se comunican al terminar.

## 21. L7: validación en el servidor del panel — 5 de noviembre de 2026

Etapa autorizada: revisar L7, corregir únicamente faltantes y guardar el resultado si pasan las comprobaciones. Inicio en main limpio, commit a5276c709abff9143cb03e3709602fe32ebcc9a4. Leídos AGENTS, README, especificación y plan; L7 contrastado en página 13 del PDF. Plan actualizado antes del código. Se conservaron FormRequests, reglas, servicios transaccionales, permisos y cálculos aprobados.

| Caso / criterio | Estado | Evidencia real |
| --- | --- | --- |
| L7-01 / cobertura del servidor | Aprobado en panel | Revisión de LoginRequest, AccountRequest, ProductRequest, ClientRequest y ClientActionRequest; validate en ClientController, OpportunityController y ReportMonth. Reglas de estado/rol, cupo y destino se vuelven a comprobar en servicios y middleware. Los controladores guardan datos validados, no el cuerpo completo. GET de cuentas/productos no utiliza filtros de usuario |
| L7-02 / mensajes | Aprobado por HTTP | Mensajes de validación definidos en español con imperativos de usted: Ingrese, Seleccione, Revise, Confirme, Use. Regresión mantiene mensajes de cuentas, productos, identidad, cupo y asignación. Se añadió mínimo positivo al filtro vendedor_id de clientes: 0 devuelve 422 con «Seleccione un vendedor válido.» |
| L7-03 / conservación de filtros | Corregido y aprobado | Clientes recupera q, vendedor_id y sin_asignar cuando se rechaza la combinación de vendedor + sin asignar. Se comprueban texto, opción seleccionada, casilla marcada y mensaje junto al campo. Mi equipo/Reportes conservan el mes escalar recibido al volver con error. Los filtros de oportunidades ya conservaban selecciones válidas desde L6 |
| L7-04 / datos malformados | Corregido y aprobado | Once entradas array por POST en campos escalares de cuentas/productos/clientes vuelven al formulario con error y GET 200, sin alterar recuentos 7/5/21. También búsqueda de clientes, asignación, meses y login admiten el error sin romper la página. bootstrap/app.php descarta arrays de old input tras ValidationException; mantiene escalares y NULL. Los arrays no son datos válidos del panel actual |
| L7-05 / contraseñas | Aprobado | Una cuenta inválida conserva nombre pero no password/password_confirmation en old input ni HTML. Login con email/password arrays presenta ambos errores y mantiene usuario invitado. Se conserva la exclusión de contraseñas de Laravel; no se añade una excepción que las vuelva a guardar |
| L7-06 / R4 y unicidad | Aprobado en panel; API pendiente | Regresión L4 mantiene normalización previa de NIT/teléfono, módulo 11, CF NULL múltiple, ceros, prefijo y unicidad. ClientIdentity y ClientRequest sin cambios. Se amplió protocolo-cartera con pasos y vectores que deberá repetir la futura API. No existe evidencia de equivalencia entre puertas |
| L7-07 / duplicados MySQL | Aprobado | Dos casos nuevos insertan un duplicado justo después de validar y antes del INSERT original: MySQL produce 1062 real para correo de cuenta y nombre de producto. Sus manejadores existentes devuelven 422 con error por campo en español, sin SQL. La transacción revierte ambas inserciones; recuento idéntico. Este gancho prueba manejo de error, no concurrencia de cuentas/productos |
| L7-08 / R3, cupo y asignación | Aprobado en panel | Pruebas existentes verifican máximo diez, destino activo/permitido, confirmación obsoleta, liberación y eliminación con dependencias. Las cinco carreras L4 se repitieron en regresión: un 302/un 409 por carrera, conexiones distintas y solapamiento bajo bloqueo; cupo diez, un propietario y una fila por identidad duplicada |
| L7-09 / errores sin datos internos | Corregido y aprobado | Con app.debug=true, error real SELECT de columna inexistente y RuntimeException con texto sintético producen HTML 500 genérico y JSON exacto con solo message en español. No aparecen SQLSTATE, nombre de columna, texto interno ni trazas. JSON de 404, 405 y 401 queda también genérico en español; conserva estado y Allow=GET, HEAD en 405. Las rutas de fallo son exclusivas del test |
| L7-10 / peticiones directas y salida | Aprobado por regresión | Casos L2–L6 mantienen auth/rol/estado actual, 403/404, CSRF, protección propia del administrador, normalización, cupo, historial conservado y escape XSS. El manejo común conserva los errores de ValidationException y ClientConflict; no reemplaza sus mensajes por campo ni sus códigos |
| L7-11 / suite final | Aprobado | PHP 8.4.24 y PHPUnit 12.5.42: OK (270 tests, 2633 assertions), incluidos 23 casos L7 y todos los anteriores. Suite completa necesaria porque bootstrap/app.php afecta transversalmente las respuestas. Sin reinicios ni migraciones |
| L7-12 / formato y compilación | Aprobado | Pint --test de bootstrap/app.php, ClientController y PanelValidationTest correcto. npm.cmd run build: Vite 7.3.7, CSS app-Ca5AMo9o.css (37.41 kB), JS app-BPrTyeqd.js (55.13 kB). Sin dependencias nuevas; los cambios no añadieron clases de estilo |
| L7-13 / conservación de bases | Aprobado | Huellas SHA-256 en memoria de todas las columnas/filas de las siete tablas principales antes/después idénticas; recuentos 11/10/28/17/19/62/8. Consulta final test: DATABASE()=crm_ferreteria_test, CURRENT_USER()=crm_laravel_test@127.0.0.1; siete tablas de negocio vacías. Sin cambios de permisos, credenciales ni datos principales |

### Cambios concretos y límites

bootstrap/app.php filtra únicamente la entrada anterior tras un error: conserva escalares/NULL y descarta arrays que los campos actuales no admiten. No cambia los datos que validan FormRequest ni oculta sus errores. Las contraseñas ya fueron excluidas por el manejador de Laravel. Si una etapa futura añade campos de tipo array legítimos, deberá revisar expresamente esta recuperación de formularios.

El mismo callback conserva respuestas de validación y sus códigos; para errores HTTP JSON elimina detalles de depuración conservando la respuesta y sus cabeceras. Para errores internos entrega una página mínima errors/500.blade.php o JSON genérico, sin depender de autenticación, consultas ni componentes del panel para mostrar el fallo. El diagnóstico continúa en el registro interno. No se cambió APP_DEBUG, .env, políticas ni verificaciones de seguridad para conseguir los resultados.

ClientController añade min:1 al filtro de vendedor. Vistas clients/index, team/index y reports/index recuperan los valores anteriores. No se reescribieron AccountManager, ProductController, ClientManager ni normalizadores: sus reglas y captura de duplicados estaban implementadas. PanelValidationTest añade solo evidencia de huecos detectados. protocolo-cartera documenta R3/R4 para una futura implementación independiente con SQL parametrizado en Express, sin afirmar equivalencia.

### Ejecuciones y error real del test

Primera selección PanelValidationTest: 20 pruebas/166 aserciones, once errores del propio test (IA-08): intentaba leer la bolsa flash después del GET que la consumía. Se capturó el mensaje antes, sin cambiar la validación para resolverlo. Se añadió además comprobación del login malformado. Primera suite completa aprobada: 268 pruebas/2.613 aserciones. Después se protegieron también los errores HTTP JSON de depuración y se añadió su caso, justificando repetir la suite: regresión intermedia 269/2.622. Se añadió después un caso de conservación del formato original de NIT/teléfono: su primera expectativa asumía erróneamente que old input contenía valores normalizados (IA-09), provocando un fallo en 270 pruebas/2.627 aserciones. Se corrigió la expectativa y se mantuvo la plantilla de cliente aprobada sin cambios. Resultado final: 270 pruebas/2.633 aserciones aprobadas.

Comandos reales desde laravel/: `php vendor/bin/phpunit --filter=PanelValidationTest`, `php vendor/bin/phpunit`, `php artisan view:clear`, Pint y `npm.cmd run build`. PHP se ejecutó con la ruta absoluta instalada fuera del entorno restringido. Las lecturas de huellas e identidad se enviaron por stdin sin temporales del proyecto ni impresión de secretos. TestCase comprueba la base antes de los traits; PanelValidationTest comprueba además la cuenta técnica y usa VerificacionSeeder en DatabaseTransactions. Las limpiezas concurrentes de la regresión conservan sus comprobaciones y se limitan a fixtures propios.

### Pendientes reales del panel y siguiente etapa

La validación del panel queda cubierta por revisión de código y pruebas HTTP automatizadas, pero sigue pendiente la revisión visual de cuentas, catálogo, clientes/confirmaciones, Mi equipo y reportes en navegador, escritorio y pantalla estrecha. Deben revisarse legibilidad, ubicación/foco de errores, navegación y comprensión en pareja. No se realizó aquí recorrido gráfico ni se declara probado.

L7 exige también paridad con la API: ese criterio integral sigue pendiente porque no existe. A1/A2 será la próxima etapa cuando se autorice: Express 5, mysql2 con SQL parametrizado y conexión explícita a la misma MySQL; POST /api/auth/login con correo/clave, bcryptjs compatible con hashes de Laravel, acceso solo al vendedor activo y JWT HS256 con sub/exp. Middleware valida firma/algoritmo/expiración/sub y consulta rol/estado actuales en cada petición; token inválido o cuenta que pierde acceso devuelve 401. Configurar JWT_SECRET aleatorio fuera de Git, CORS con origen exacto y verificar contrato con Postman. No se implementó nada de API/SPA en L7.

El commit «feat: completar validación del panel Laravel» está autorizado al pasar las comprobaciones. No se crean etiquetas ni se hace push; spec-v1 conserva el hito documental original.

Revisión de cierre: 164 archivos versionados/nuevos no ignorados comparados en memoria contra APP_KEY y contraseñas técnicas locales, sin coincidencias; literal público de semilla solo en ubicaciones permitidas. Sin dependencias, entornos ni temporales en los archivos preparados. route:list conserva 29 rutas y no contiene las rutas de error exclusivas de PanelValidationTest. Migraciones, semillas, lockfiles, reglas y servicios de negocio aprobados permanecen sin cambios. diff --check correcto. Autor local existente conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. El hash final del commit L7 y el estado de Git se comunican al terminar.

## 22. Preparación del panel para revisión manual

Etapa posterior al cierre L7, documentada ahora para mantener el estado real de la base de pruebas. Se leyó el procedimiento del README y se comprobó DATABASE()=crm_ferreteria_test con CURRENT_USER()=crm_laravel_test@127.0.0.1, permisos limitados y las siete tablas de negocio vacías. Se cargaron VerificacionSeeder y SectorSeeder en ese orden, sin reiniciar ni borrar bases: 11 cuentas, 10 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales y 8 actividades.

Se levantó temporalmente Laravel en 127.0.0.1:8001 con --env=testing y sesiones/caché en archivos. HTTP comprobó login 200, envío de login 302, cuentas 200 y logout 302. Los once IDs devueltos por el listado correspondían a los recién consultados en la base de pruebas, no a los IDs de desarrollo; la configuración no estaba cacheada. Se indicó al usuario cómo detener su árbol de procesos. No hubo cambios de código, commits ni repetición de la suite automatizada. Las huellas principales coincidieron con el estado verificado anterior.

Preparar el servidor y probar login/cuentas no acredita la revisión visual completa. Continúan pendientes los recorridos manuales de todos los formularios, errores, navegación y pantalla estrecha, además de la revisión en pareja. La permanencia del proceso entre sesiones no se da por garantizada: puede arrancarse de nuevo con el procedimiento del README sin repetir semillas si ya hay datos.

## 23. API A1/A2 y GET /api/productos — 5 de noviembre de 2026

Inicio: main limpio en af7a4ab3fc451ebe82f04b20f7a2806936708a2f. Leídos AGENTS, README, especificación, plan y protocolo-cartera; contrastados contrato en página 10, A1 en página 13 y A2/A7/A8 en página 14 del PDF. Plan actualizado antes de crear api/. Alcance exclusivo: login, middleware y consulta protegida de productos; no se añadieron otras operaciones del CRM ni SPA.

| Caso / criterio | Estado | Evidencia real |
| --- | --- | --- |
| API-01 / dependencias y estructura | Aprobado | Node 24.18.1/npm 11.16.0. npm.cmd install: 92 paquetes añadidos, 93 auditados, cero vulnerabilidades. Directas: Express 5.3.0, mysql2 3.24.6, jsonwebtoken 9.0.3, bcryptjs 3.0.3, cors 2.8.6. Sin ORM, constructor SQL, dotenv, generador de hashes Node ni paquetes de pruebas adicionales |
| API-02 / cuenta técnica propia | Aprobado | crm_api@127.0.0.1 conecta a crm_ferreteria; crm_api_test@127.0.0.1 a crm_ferreteria_test. SHOW GRANTS en cada una muestra solo USAGE y dos SELECT por tabla (users/productos). No privilegios globales efectivos, escritura, otras tablas, esquema, CREATE USER ni GRANT OPTION. SELECT de clientes con la cuenta API de pruebas fue rechazado por MySQL |
| API-03 / entrada local de root | Aprobado | Root introducido por el usuario en ventana local enmascarada; confirmación «Cuentas API preparadas». Se pasó al auxiliar por stdin, no por argumentos ni archivos. Contraseñas técnicas y dos JWT_SECRET aleatorios independientes de 96 caracteres se escribieron directamente en api/.env y .env.testing, ignorados. Ejemplos sin credenciales. Ventana cerrada y sus tres temporales propios retirados fuera del repositorio |
| API-04 / login y contrato | Aprobado | Vendedor activo y clave correcta 200, exactamente token y usuario; usuario solo id/nombre/correo. bcryptjs compara hashes $2y$ creados por Laravel, incluidos fixtures con espacios iniciales/finales en clave y las cuentas comunes en la colección. Correo se normaliza; la clave no se recorta ni transforma |
| API-05 / credenciales y roles | Aprobado | Correo inexistente y contraseña incorrecta: mismo 401 y mismo objeto error. Administrador, supervisor e inactivo con clave correcta: 403 sin token; con clave incorrecta: 401. No se crea usuario ni se actualiza contraseña desde la API |
| API-06 / firma y expiración | Aprobado | JWT HS256 con sub textual del id, iat y exp, sin rol, estado ni hashes. Configuración 1h produce 3.600 segundos; una instancia con 2m produce 120. Middleware rechaza firma alterada, expiración pasada, HS384, algoritmo none/sin firma, exp ausente y nbf futuro |
| API-07 / sub y cuenta actual | Aprobado | sub ausente, 0, negativo, inyección, cero inicial, numérico en lugar de texto, objeto y fuera de rango seguro: 401. Cuenta temporal eliminada: 401 con JWT vigente. Desactivar al vendedor invalida el mismo token; reactivarlo lo admite; cambiarlo a supervisor lo vuelve a rechazar. SQL consulta estado/rol actuales por petición |
| API-08 / productos | Aprobado | GET protegido devuelve arreglo sin envoltura de productos activos, solo id/nombre/precio numérico. Se compara con SELECT activo=1 en MySQL. Sin token o Bearer mal formado devuelve 401. Cuenta API no tiene permisos para modificar catálogo |
| API-09 / entrada y errores | Aprobado tras IA-10 | JSON mal formado, vacío, null, array, primitivo y contenido no JSON: 400 con error. Objeto sin campos, tipos inválidos, correo inválido, clave vacía, más de 72 bytes y campos extra: 422 con errores por campo como texto. Parámetros no admitidos: 400. Ruta desconocida: 404 JSON. Fallo de pool cerrado: 500 genérico sin SQL/configuración; diagnóstico solo código/nombre en consola |
| API-10 / SQL y CORS | Aprobado | Consultas execute con placeholders ?, sin concatenar entradas. Intento de inyección en correo no autentica ni altera datos (401). SPA_ORIGIN exacto http://127.0.0.1:5500 recibe cabecera correspondiente; origen ajeno no recibe autorización CORS; preflight permitido 204 con origen exacto. No se usa comodín. CORS no sustituye JWT |
| API-11 / HTTP real | Aprobado | npm.cmd test final: 43 tests, 43 pass, 0 fail, usando TCP en puertos efímeros de loopback y MySQL real. Arranque adicional en puerto 3000 con .env.testing y PORT de proceso: anunció crm_ferreteria_test/crm_api_test y atendió la colección; proceso temporal detenido después |
| API-12 / colección parcial | Aprobado por ejecutor Node; interfaz Postman pendiente | docs/api.postman_collection.json: 14 peticiones para dos rutas; 29 comprobaciones ejecutadas contra HTTP real desde Node, incluidas respuestas 200/400/401/403/422. Se ejecutaron sus scripts en contexto pm limitado y variables en memoria. Token exportado vacío; sin secretos técnicos. No se usó interfaz Postman ni Newman ni se declara aprobada la colección completa de veinte endpoints |
| API-13 / conservación | Aprobado | Las huellas de todas las filas/columnas del núcleo principal son idénticas antes/después. Los tests comparan también huellas del núcleo test antes/después y eliminan solo sus cinco identidades aleatorias propias. Lectura final test: 12 cuentas, 11 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales y 8 actividades, incluidos los datos manuales preexistentes. No se reiniciaron tablas ni se recargaron semillas |
| API-14 / comprobaciones estáticas | Aprobado | node --check de los cinco archivos src y auth.test.js sin errores; Pint --test del auxiliar PHP aprobado. api/.env, .env.testing y node_modules están ignorados. Lock de API presente; no cambios en migraciones, semillas, lockfiles Laravel ni código del panel |

### Código y recorrido

api/src/config.js valida variables, origen exacto, clave JWT y duración. database.js crea el pool mysql2 con SQL parametrizado y sentencias múltiples deshabilitadas. app.js define únicamente POST /api/auth/login y GET /api/productos, CORS y formato de errores. Express 5 conduce los rechazos de funciones async a su manejador de errores; no se añadieron wrappers ni clases. server.js comprueba DATABASE()/CURRENT_USER() antes de escuchar, puerto 3000 por defecto y parada mediante Ctrl+C.

auth.js valida el objeto y rechaza campos extra antes de SELECT users WHERE email = ?. bcrypt.compare verifica la clave exacta contra el hash de Laravel. Solo después se comprueban rol y estado. La respuesta pública selecciona tres campos y jwt.sign usa HS256, sub e intervalo configurable. En productos, authenticate exige Bearer y jwt.verify con algorithms=[HS256], exp/sub válido; vuelve a leer el usuario en MySQL, exige vendedor activo y pasa su identidad pública a la ruta. El SELECT de productos proyecta id/nombre/precio y filtra activo; Number convierte el DECIMAL solo al serializar JSON.

La API no genera hashes ni crea cuentas: fixtures.php es exclusivamente un auxiliar de pruebas que arranca Laravel, comprueba su base/cuenta técnica de pruebas y usa User/Eloquent para crear los cinco fixtures. Node envía una contraseña temporal aleatoria por stdin; el auxiliar no devuelve hashes. Al invocarlo se retiran las variables DB_* heredadas de la API para que Laravel cargue su propia cuenta local de .env.testing. Los cambios de estado/rol y eliminación se limitan a emails del prefijo aleatorio validado; no alteran vendedores del usuario. La comparación final usa huellas, no publica las filas ni sus hashes de contraseña.

### Ejecuciones, incidentes y alcance de evidencia

Primera ejecución npm test: 41 casos, 40 aprobados y un fallo (IA-10), cuerpo vacío respondía 422. Se distinguió longitud cero del JSON de un objeto vacío legítimo: 400 frente a 422 por campos. Segunda ejecución: 41/41. Se añadieron dos casos significativos para expiración configurable e inyección SQL; final 43/43. No se suman resultados de ejecuciones distintas.

Se ejecutó la colección de 14 peticiones con fetch de Node y sus scripts básicos mediante vm en memoria, no como sustituto declarado de la interfaz Postman. Se verificaron 29 comprobaciones. Token solo en memoria; no se imprimió ni se guardó. La contraseña pública aparece literalmente solo en README, seeders y colección, como exige AGENTS. Los perfiles técnicos tienen claves distintas y no se exportan en la colección.

La ventana local tuvo que ejecutarse directamente desde PowerShell para confirmar su apertura; no se cambiaron políticas. Un primer ejecutor temporal mezcló require y await de módulo y se corrigió usando ESM explícito antes de efectuar las peticiones. Un intento de generar la colección falló al construir una cadena con plantillas anidadas; no escribió archivos y se corrigió el ejecutor. Estos incidentes de herramienta no se confunden con la corrección funcional IA-10 ni con pruebas de la aplicación fallidas adicionales.

Comandos reales: npm.cmd install, npm.cmd ls --depth=0, npm.cmd test (ejecuciones anteriores), node --check, Pint --test del auxiliar PHP y node --env-file=.env.testing src/server.js con PORT=3000 de proceso para la prueba de arranque. Perfiles y privilegios se comprobaron con SELECT DATABASE(), CURRENT_USER() y SHOW GRANTS. La consulta de verificación de semillas fue solo lectura. No se repitió la suite Laravel: su base ya no está vacía y se conservan sus resultados históricos y la revisión visual pendiente.

### Pendientes y cierre autorizado

Revisión gráfica del panel y Postman pendientes. No se implementaron clientes/cartera, oportunidades, actividades, reportes ni SPA. No hay paridad R3/R4 verificada entre puertas ni integración navegador SPA/API; el protocolo solo guía esa etapa futura. A8 permanece parcial: dos de veinte endpoints en la colección. Las pruebas de expiración/cambio de acceso sí son reales de Node/MySQL, aunque todavía no exista SPA.

El usuario autoriza el commit «feat: implementar autenticación JWT de vendedores en API» tras pasar las comprobaciones. Se conservan autor local y spec-v1; sin push. Se revisan secretos, lockfile y archivos incluidos antes del commit, cuyo hash y estado final se comunican al terminar.

Revisión de cierre: 176 archivos versionados/nuevos no ignorados comparados en memoria contra claves APP_KEY, DB_PASSWORD y JWT_SECRET de ambos perfiles Laravel/API, sin coincidencias; literal público solo en ubicaciones permitidas y token exportado vacío. Exclusiones verificadas para api/.env, .env.testing y node_modules; ejemplos y package-lock.json incluidos. Sin temporales del asistente en el proyecto. diff --check y sintaxis correctos. Estado previo al commit limitado a api/, colección parcial y README/plan/protocolo/verificación. spec-v1 conserva objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166.


## 24. API A3: clientes y cartera — 5 de noviembre de 2026

Partida: main limpio en dbfaee217f7ecb721ae2882e6b96d463ff6dd68b. Leídos AGENTS, README, especificación, contrato del PDF y protocolo-cartera; plan actualizado antes de implementar. Las rutas con identificador se contrastaron como /:id y /:id/tomar en el contrato. Alcance: seis rutas de clientes, sin otros módulos ni SPA.

### Permisos y ajuste previo autorizado

MySQL rechazó realmente SELECT FOR UPDATE sobre users con 1142 mientras la cuenta tenía SELECT, también después de conceder escritura únicamente en clientes. FOR SHARE sí funcionó. Se explicó la incompatibilidad y el usuario autorizó «Sí, conservar SELECT y verificar esa variante»: GET_LOCK por base/vendedor para API/API más FOR SHARE sobre users para excluir el FOR UPDATE existente del panel. Se documentó el ajuste antes del código transaccional, sin cambiar las reglas de negocio ni el panel aprobado.

Root se introdujo exclusivamente en ventana local enmascarada; el usuario confirmó «Permisos A3 preparados». La contraseña viajó por stdin al auxiliar, sin argumentos ni archivos. La ventana se cerró y sus tres archivos temporales propios se retiraron del directorio temporal validado fuera del repositorio. No hubo nuevas claves ni cambios de .env.

Auditoría final SELECT DATABASE(), CURRENT_USER(), SHOW GRANTS:

| Perfil | Base efectiva | Permisos efectivos |
| --- | --- | --- |
| crm_api@127.0.0.1 | crm_ferreteria | SELECT users/productos; SELECT, INSERT, UPDATE clientes |
| crm_api_test@127.0.0.1 | crm_ferreteria_test | SELECT users/productos; SELECT, INSERT, UPDATE clientes |

USAGE global no concede privilegios efectivos. No DELETE, privilegios de esquema, creación de cuentas, GRANT OPTION ni acceso entre bases. No se ampliaron permisos de las cuentas Laravel.

### Criterios y evidencia funcional

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| A3 / seis rutas exactas | Aprobado | GET/POST clientes, GET disponibles declarado antes de :id, POST :id/tomar, GET/PATCH :id; arreglos sin envoltura y códigos contractuales |
| R2 / aislamiento | Aprobado | Usuario obtenido del middleware; listados y fichas con propietario en SQL. Ficha ajena/inexistente 404, incluso PATCH ajeno con JSON ilegible. Disponibles solo id/nombre; fichas solo id/nombre/nit/telefono/correo |
| R4 / normalización | Aprobado en clientes | 32 vectores comparados con prepareForValidation y reglas reales de ClientRequest, sin regla unique en esa comparación de formato. Coinciden aceptación, campos de error y datos normalizados: módulo 11, ceros, K, CF NULL, múltiples CF, prefijo +502/502, teléfono local 50212345, Unicode y correo. Los duplicados se prueban aparte contra índices reales |
| A3 / validación y errores | Aprobado | POST completo y PATCH parcial, campos omitidos conservados, {} sin cambios; nombre/límites/tipos/NIT/teléfono/correo/campos extra 422 por campo. JSON ilegible 400; filtros no admitidos 400; sin token 401; sin endpoints de eliminación/liberación/reasignación |
| R4 / duplicados | Aprobado | NIT y teléfono normalizados globalmente únicos, edición propia válida, conflicto con fila ajena 409 sin exponerla; índices 1062 traducidos, incluidas carreras |
| R3 / cupo y toma | Aprobado | Crear asigna al autenticado; tomar bloquea cliente y exige NULL; inexistente 404, ya tomado 409, crear/tomar con diez 409. Recuento actual de IDs FOR UPDATE bajo bloqueo del vendedor |
| A2 / revalidación de escritura | Aprobado | Desactivación mientras espera el bloqueo: 401 sin insertar. Reasignación mientras espera PATCH: 404 sin modificar datos. JWT y rol/estado se siguen consultando por petición |
| S3 / SQL y CORS | Aprobado | Valores con placeholders ?, búsqueda literal de %/_ e intento de inyección sin ampliar ámbito; columnas PATCH solo lista blanca. CORS conserva origen exacto y admite PATCH |
| A7 / privacidad | Aprobado | Respuestas sin propietario, hashes ni datos internos; conflictos genéricos y mensajes en español. Regresión del 500 genérico sin SQL/configuración aprobada |
| A8 / colección parcial | Aprobado por ejecutor Node; gráfico pendiente | 31 peticiones y 63 comprobaciones contra HTTP real con scripts pm limitados. Ocho de veinte endpoints cubiertos; token/token_cupo exportados vacíos, sin secretos técnicos. No se ejecutó Postman gráfico ni Newman |

### Concurrencia real

Cada carrera coordina peticiones solapadas con una barrera SQL; comprueba que siguen pendientes antes de liberarla, tiempos cruzados y conexiones diferentes. No se considera concurrencia una secuencia de peticiones.

| Carrera | Resultado observado |
| --- | --- |
| API/API: dos altas con nueve clientes | 201 y 409; cartera final diez |
| API/API: dos tomas distintas con nueve clientes | 200 y 409; cartera final diez |
| API/API: diez vendedores toman el mismo disponible | Un 200 y nueve 409; un único propietario |
| API/API: NIT repetido | Un 201 y un 409; una fila |
| API/API: teléfono repetido | Un 201 y un 409; una fila |
| API/panel: dos altas con nueve clientes | API 201, panel 409; cartera final diez |
| API/panel: toma contra asignación del mismo disponible | API 200, panel 409; un único propietario |
| API/panel: NIT repetido | API 201, panel 409; una fila |
| API/panel: teléfono repetido | API 201, panel 409; una fila |

API usa TCP en puerto efímero. El panel usa su kernel HTTP/controlador/ClientManager real desde un proceso PHP con sesión de administrador de pruebas; no un navegador ni un segundo servidor TCP. Los resultados prueban exclusión entre ambas puertas sin modificar código L4. Se verifica además IS_FREE_LOCK después de cada caso: no quedan bloqueos nombrados retenidos por el pool.

### Comandos, conservación y límites

Comandos desde api/: npm.cmd test y node --check para todos los archivos src/tests JavaScript. Desde raíz: PHP local laravel/vendor/bin/pint --test api/tests/client-parity.php api/tests/client-users.php. Sintaxis y Pint aprobados. La suite final pasó **75 pruebas, 75 aprobadas, cero fallos**: 43 previas A1/A2/productos, dos de normalización y 30 A3. Las ejecuciones anteriores también pasaron (26 casos A3 iniciales, después suite de 74 y finalmente 75 al ampliar colección); no se suman ejecuciones distintas. No hubo fallo funcional A3 que registrar como corrección de IA; el rechazo de permisos 1142 fue un impedimento real resuelto mediante consulta previa.

Los auxiliares PHP arrancan Laravel con su perfil test y generan hashes únicamente allí. Node utiliza contraseña temporal aleatoria por stdin. El ejecutor de colección sustituye identidades/IDs por fixtures propios y conserva tokens solo en memoria; no usa los clientes manuales como material de prueba.

Antes de limpiar se comprueban DATABASE(), CURRENT_USER() y permisos acotados. Se eliminan solo filas creadas por cada ejecución, identificadas por IDs/prefijo aleatorio; no hay reinicios ni eliminación de datos preexistentes. La suite compara huellas completas de las siete tablas de pruebas antes/después. Lectura final: **12 cuentas, 11 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades**, incluidos registros manuales existentes. Los contadores autoincrementales pueden avanzar.

Lectura independiente de la base principal comparada con la huella inicial: todas las filas/columnas de las siete tablas idénticas; **11 cuentas, 10 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades**. No se escribieron datos de negocio principales. No se ejecutaron migraciones, semillas ni la suite Laravel, que necesita tablas vacías. Dependencias y lockfiles conservados, sin paquetes nuevos.

README explica arranque test en puerto 3001, contratos y prerrequisitos de colección: teléfono libre, disponible propio para pruebas y vendedor con cartera llena. Ejecutarla manualmente sí deja cambios; las pruebas automatizadas se encargan solo de sus propios fixtures. Continúan pendientes revisión gráfica del panel y Postman, explicación en pareja y módulos API restantes/SPA. La equivalencia comprobada se limita a reglas R3/R4 de clientes; no acredita módulos aún inexistentes.

Cierre autorizado tras pasar las pruebas: «feat: implementar clientes y cartera en API». Se revisan secretos, archivos incluidos y estado Git; sin push y con spec-v1 intacta. El hash de cierre se comunica al terminar.

Revisión de cierre A3: 184 archivos versionados/nuevos no ignorados comparados en memoria contra APP_KEY, DB_PASSWORD y JWT_SECRET de los cuatro perfiles locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas; token y token_cupo exportados vacíos. diff --check correcto; sin entornos, dependencias ni temporales preparados. Autor local existente conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166.


## 25. API A4: oportunidades y productos cotizados — 5 de noviembre de 2026

Inicio en main limpio: 139e0936f7219b4bb918a7e0cc59219c946c1c5a. Leídos AGENTS, README, especificación, plan y protocolo actualizado; R2/R5/R6, contrato/formas y A4 contrastados en páginas 8–11 y 14 del PDF. Plan actualizado antes del código. Alcance: las ocho rutas A4, sin ORM, paquetes nuevos, cambios de esquema/panel ni otros módulos.

### Permisos reales y entrada local

Root introducido exclusivamente en ventana enmascarada; el usuario confirmó «Permisos A4 preparados». El auxiliar recibió la contraseña por stdin, no en argumentos ni archivos. Resultado verificado, ventana cerrada y tres temporales propios retirados fuera del repositorio, validando antes la ruta. Sin cambios de claves, políticas PowerShell ni ejemplos de entorno.

SHOW GRANTS de crm_api@127.0.0.1 y crm_api_test@127.0.0.1 comprobado en crm_ferreteria y crm_ferreteria_test respectivamente:

| Tabla | Permisos por cuenta, solo sobre su base |
| --- | --- |
| users, productos | SELECT |
| clientes | SELECT, INSERT, UPDATE, conservados de A3 |
| oportunidades | SELECT, INSERT, UPDATE |
| oportunidad_productos | SELECT, INSERT, UPDATE, DELETE |
| historial_etapas | SELECT, INSERT |

Siete entradas por cuenta: seis tablas y USAGE global sin privilegio efectivo. Sin actividades, acceso entre bases, esquema, CREATE USER ni GRANT OPTION. Permisos Laravel conservados. FOR SHARE sobre productos funciona con SELECT.

### Criterios y evidencia funcional

| Criterio | Estado | Evidencia real |
| --- | --- | --- |
| A4 / rutas y forma | Aprobado | GET/POST oportunidades, GET/PATCH :id, PATCH :id/etapa, POST :id/productos, PATCH/DELETE :id/productos/:lineaId. Listado resumido sin líneas/historial, detalle con ambos; DELETE 204 vacío |
| R2 / aislamiento | Aprobado | Propietario obtenido del middleware; cliente propio comprobado bajo bloqueo. Ajeno/inexistente 404 en todas las rutas, incluso PATCH ajeno con JSON ilegible; sin JWT 401. lineaId pertenece a esa oportunidad |
| R2 / archivo histórico | Aprobado | Abiertas transferidas al nuevo vendedor; cerradas solo del dueño histórico. Vinculación del cliente limitada a id/nombre, sin acceso a ficha actual ni NIT/teléfono/correo |
| Validación | Aprobado | IDs numéricos enteros positivos, título 1–150, cantidad entera 1–999, motivo 1–255 compactado. Campos extra, propietario/precio/mínimo enviados y tipos/límites inválidos 422 por campo; filtros/JSON ilegibles 400 |
| R5 / creación | Aprobado | Prospecto, probabilidad 10, total cero, motivo/cierre NULL e historial inicial NULL → prospecto. Fallo simulado en historial revierte la creación |
| R5 / etapas | Aprobado | Avance de una abierta por vez; ganar desde negociación con productos; perder desde cualquier abierta. Saltos/retrocesos 422, repetición 409; rechazos sin historial adicional |
| R5 / cierre | Aprobado | Título, etapas y líneas cerradas 409. Fecha UTC e historial mismo instante. Fallo inyectado en INSERT del historial devuelve 500 genérico y revierte etapa/motivo/cierre |
| R6 / catálogo | Aprobado | Precio actual DECIMAL copiado en servidor, sin aritmética JS. Cambio de catálogo no altera líneas. Editar cantidad conserva precio cotizado. Agregar inactivo 422, repetido 409, inexistente 404 |
| Mínimo del sector | Aprobado | Mínimo 50: 49 rechazado, 50/51 aceptados. Al editar aplica mínimo vigente incluso si se desactivó el producto; al cerrar no se exige nuevo mínimo/actividad a líneas previas |
| R6 / total SQL | Aprobado | 50 × 0.10 + 3 × 0.20 = 5.60; edición 61 × 0.10 + 3 × 0.20 = 6.70 con catálogo cambiado a 99.99. 999 × 99999999.99 produce DECIMAL exacto 99899999990.01. Respuestas numéricas |
| A7 / privacidad | Aprobado | DTO exactos, sin hashes ni claves internas; 422 errores por campo y demás errores objeto error. 500 sin SQL/trazas. CORS exacto conservado, DELETE añadido a métodos |
| A8 / colección | Aprobado mediante Node; gráfico pendiente | 68 peticiones / 141 comprobaciones para 16 de 20 endpoints. Bloque previo 31/63; A4 37/78. fetch y scripts pm limitados con fixtures propios, tokens solo en memoria y vacíos al exportar |

### Código y protocolo

opportunities.js define rutas y writeChange, donde se copia checkedProduct.precio después de FOR SHARE a precio_unitario. opportunity-validation.js valida contrato. opportunity-queries.js usa cantidad × precio_unitario y SUM decimal por oportunidad; Number solo serializa. No une historial a líneas para sumar. GET detalle comparte una instantánea entre resumen, productos e historial. Orden histórico created_at, id para desempatar cambios dentro del mismo segundo.

opportunity-store.js ordena users FOR SHARE → cliente FOR UPDATE → oportunidad FOR UPDATE → producto FOR SHARE cuando corresponde; vuelve a comprobar rol/estado y propietario. La etapa observada antes de esperar se compara bajo bloqueo y se conserva incluso en reintentos, sin agregar campos al contrato. El panel conserva su FOR UPDATE en users y el protocolo anterior.

changeStage actualiza etapa, motivo, cierre UTC y updated_at; recordStage inserta historial tomando updated_at de esa escritura dentro de opportunityTransaction. Así cierre e historial comparten instante aunque el reloj cruce de segundo. Un error revierte todo. Ganar comprueba líneas sin revalidar mínimos, precios o actividad actuales del catálogo.

### Concurrencia real A4

Cinco carreras HTTP TCP. Una barrera SQL retiene el cliente mientras ambas peticiones alcanzan el bloqueo desde conexiones distintas; se comprueba que siguen pendientes y que sus tiempos cruzan la liberación. No son peticiones secuenciales.

| Carrera | Resultado final observado |
| --- | --- |
| Dos avances prospecto → calificado | 200/409; una entrada nueva |
| Avanzar a calificado contra perder desde prospecto | 200/409; una entrada nueva |
| Ganar contra perder desde negociación | 200/409; un cierre e historial |
| Agregar el mismo producto dos veces | 201/409; una línea |
| Ganar contra editar cantidad | 200/409; cierre confirmado, edición rechazada |

En cierre/edición, si la edición precede al cierre ambas pueden confirmar en ese orden; la prueba comprueba coherencia en cualquiera de los dos. La ejecución final tuvo cierre ganador. También se prueba competencia entre destinos diferentes válidos al observar el mismo estado.

Pruebas adicionales: UPDATE de catálogo retenido hace esperar FOR SHARE y se usa el mínimo confirmado; crear mientras pierde la cartera termina 404 sin oportunidad/historial. Esos cambios son SQL de control, no carreras HTTP nuevas contra el panel. Las nueve carreras API/API y API/panel A3 siguen aprobadas en la regresión.

### Ejecuciones y conservación

Comandos desde api/: node --env-file=.env.testing --test --test-concurrency=1 tests/opportunities.test.js y npm.cmd test. node --check aprobado para todos los src/tests JavaScript. Sin PHP nuevo ni paquetes/lockfiles modificados. Se reutiliza el auxiliar Laravel de cuentas temporales: solo Laravel genera hashes, quitando las variables DB_* heredadas para cargar su propio perfil test.

Resultados: primera tanda A4 33/33; ampliada 36/36; suite completa con los casos de destinos y reasignación **113/113**, 75 previos y 38 A4. Tras unificar el instante cierre/historial se repitieron solo los afectados: **38/38**, incluidas cinco carreras y las 37 peticiones/78 comprobaciones A4. Cero fallos funcionales. No se suman ejecuciones. Los dos 500 TEST_HISTORY son fallos inyectados deliberadamente para comprobar rollback.

Antes de cada limpieza se comprueban DATABASE(), CURRENT_USER() y permisos de control limitados a crm_ferreteria_test. Se eliminan solo IDs creados por la ejecución: oportunidades con sus líneas/historial, clientes y productos propios; luego cuentas de prefijo aleatorio del auxiliar Laravel. Huellas completas de las siete tablas de pruebas idénticas antes/después de cada suite, incluidos registros manuales.

Lectura final test: **12 cuentas, 11 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades**. Autoincrementales pueden avanzar. Sin reinicios, migraciones/semillas ni repetición de suite Laravel, que necesita tablas vacías.

Lectura íntegra final principal coincide con las huellas completas verificadas al cerrar A3: **11 cuentas, 10 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades**. La captura inicial de esta etapa quedó truncada por el límite de salida; se corrigió la lectura y se usó expresamente la huella íntegra anterior, sin presentar la captura truncada como evidencia completa. No hubo escrituras de negocio principales, solo permisos técnicos autorizados.

Otro incidente del ejecutor: una cadena de documentación con delimitadores Markdown anidados falló antes de escribir; se corrigió construyendo el contenido como texto serializado. No fue fallo de aplicación ni se inventa un caso funcional de IA.

### Pendientes y cierre autorizado

README explica las ocho rutas y el bloque A4 de Postman para puerto 3001: cliente propio, activo mínimo 1, activo mínimo 50 e inactivo; IDs de oportunidad/línea de respuestas. La carga manual crea dos oportunidades y conserva sus cambios; no usar registros manuales que deban mantenerse. Los tests automáticos se limitan a fixtures propios.

Continúan pendientes panel/Postman gráfico, explicación en pareja, actividades, resumen mensual y SPA. A8 parcial: cuatro endpoints pendientes. No se implementaron otros módulos ni modificó esquema.

Commit autorizado al aprobar: «feat: implementar oportunidades y productos cotizados en API». Sin push, con spec-v1 y autor configurado intactos.

Revisión de cierre A4: 189 archivos versionados/nuevos no ignorados comparados en memoria contra APP_KEY, DB_PASSWORD y JWT_SECRET de ambos perfiles Laravel/API, sin coincidencias. Literal público solo en ubicaciones permitidas; token/token_cupo exportados vacíos. Sin entornos, dependencias, lockfiles modificados ni temporales del asistente entre los archivos preparados. Sintaxis y diff --check aprobados. Autor local existente conservado; spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. El hash del commit A4 y estado final se comunican al terminar.


## 26. API A5: actividades de seguimiento — 5 de noviembre de 2026

Inicio en main limpio en 3e6c851c6349dbfa750332021ea871cc0b5f8ddf. Leídos AGENTS, README, especificación, plan y protocolo; contrastados contrato, forma de actividad, R2/R8 y A5 en el PDF (páginas 10–11 y 14; reglas de propiedad/fechas de especificación). Plan actualizado antes del código. Alcance exclusivo: tres rutas de actividades, sin resumen mensual ni SPA.

### Permisos y seguridad

Root introducido únicamente en ventana local enmascarada; confirmación del usuario «Permisos A5 preparados». Contraseña pasada por stdin, nunca argumentos/archivos/documentos. Resultado local verificado; ventana cerrada y sus tres auxiliares propios retirados del directorio temporal comprobado fuera del repositorio. No se modificaron claves ni políticas PowerShell.

SHOW GRANTS y SELECT DATABASE()/CURRENT_USER() verificados en ambos perfiles: crm_api@127.0.0.1 sobre crm_ferreteria y crm_api_test@127.0.0.1 sobre crm_ferreteria_test. Única ampliación: SELECT, INSERT, UPDATE sobre actividades. Se mantienen SELECT users/productos; SELECT/INSERT/UPDATE clientes/oportunidades; SELECT/INSERT/UPDATE/DELETE oportunidad_productos; SELECT/INSERT historial_etapas. Ocho entradas por cuenta, incluida USAGE global sin privilegio efectivo. Sin permisos entre bases, DELETE de actividades, esquema, CREATE USER ni GRANT OPTION. Cuenta API test no puede consultar migrations.

### Criterios y comprobaciones reales

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| A5 / contrato | Aprobado | POST clientes/:id/actividades 201; GET actividades con estado opcional, arreglo 200; PATCH actividades/:id 200 solo completada. Forma exacta y booleanos reales |
| Creación | Aprobado | llamada/reunion/tarea, descripción 1–500 compactada, autor autenticado, completada inicial false. Omisión de fecha guarda NULL |
| R2 / acceso | Aprobado | Listado y modificación se basan en c.vendedor_id actual, no en autor. Ajeno/inexistente 404 incluso JSON ilegible; autenticación precede al acceso |
| Reasignación | Aprobado | Antiguo vendedor pierde listado/PATCH; nuevo accede y completa. vendedor_id original permanece. Cliente disponible no habilita acceso a ninguno |
| R8 / UTC | Aprobado | -06:00, Z, +05:30 y +14:00 representan 2030-01-15T15:00:00.000Z; consulta directa confirma 2030-01-15 15:00:00 almacenado |
| R8 / fechas válidas | Aprobado | Año bisiesto, segundos opcionales y fracciones aceptados; precisión final de segundos por DATETIME existente. Fechas pasadas admitidas |
| R8 / fechas inválidas | Aprobado | Sin zona, fecha inexistente, febrero no bisiesto, mes/hora/minuto/segundo/offset inválidos, texto y fuera de rango MySQL: 422. Fecha enviada NULL/vacía o tipo no textual: 422 |
| R8 / vencida | Aprobado | Pendiente pasada true; completada o sin fecha false; fecha futura false. Prueba unitaria fija reloj y verifica igualdad exacta false y un milisegundo después true |
| Filtros y PATCH | Aprobado | Sin filtro todas las permitidas; pendiente/completada filtran sin ampliar cartera. Filtro vacío/inválido/repetido/desconocido e inyección 400. Booleanos textual/número/NULL/array o ausente 422; true/false aceptados |
| Validación y privacidad | Aprobado | Descripción vacía/espacios, >500 Unicode, tipo incorrecto y campos extra 422; JSON ilegible 400. Sin claves internas, hashes, SQL/trazas ni nuevas rutas de edición/eliminación |
| Espera y propiedad | Aprobado | Dos pruebas retienen cliente por SQL y reasignan mientras POST/PATCH esperan: 404, sin nueva actividad ni modificación. No se presentan como carreras HTTP API/panel |
| A8 / colección | Aprobado por ejecutor Node; gráfico pendiente | 92 peticiones para 19/20 endpoints; 196 comprobaciones. A5 añade 24 peticiones y 55 comprobaciones sobre fixtures propios, sin tokens exportados |

activities.js contiene rutas, ownClient/findActivity y proyección pública. Al listar/autorizar usa JOIN clientes y dueño actual. Al escribir reutiliza withPortfolio: bloqueo nombrado por base/vendedor, revalidación de usuario FOR SHARE y cliente FOR UPDATE; luego actividad cuando corresponde. Este orden se excluye con los bloqueos del panel antes de reasignar/liberar/eliminar. La propiedad se comprueba antes de comunicar validación y otra vez dentro de la transacción.

activity-validation.js contiene utcDeadline: verifica calendario antes de Date.parse para impedir normalización silenciosa de fechas imposibles; exige zona, convierte a UTC y limita al rango de MySQL. Cuando se proporciona vence_en exige texto ISO; sin vencimiento se omite. Las fracciones se descartan a segundos, conforme a DATETIME sin precisión fraccionaria; no se cambió el esquema. publicActivity calcula vencida en memoria al responder, sin guardar esa propiedad.

### Ejecuciones y conservación

Comandos desde api/: node --env-file=.env.testing --test --test-concurrency=1 tests/activities.test.js (primera tanda 36/36); después npm.cmd test con colección ampliada: **150 pruebas, 150 aprobadas, cero fallos**, 37 A5 y 113 previas. No se suman ejecuciones. Las 14 carreras simultáneas A3/A4 se conservan aprobadas. Los errores de consola de pool cerrado/TEST_HISTORY corresponden a pruebas deliberadas previas, no a fallos nuevos de A5.

Colección ejecutada por bloques contra HTTP TCP real con fetch y scripts pm limitados: A1/A2/A3 31 peticiones/63 comprobaciones; A4 37/78; A5 24/55. Tokens solo en memoria; no se usó interfaz Postman ni Newman. La colección manual crea datos y no los limpia; el ejecutor automatizado usa fixtures identificados y los retira.

Antes de cada limpieza se comprueban DATABASE(), CURRENT_USER() y SHOW GRANTS de control limitado a crm_ferreteria_test. Las cuentas temporales se crean/hash mediante Laravel reutilizando su auxiliar, nunca desde la API. Se eliminan exclusivamente IDs propios de actividades/clientes y cuentas aleatorias; ninguna tabla se reinicia ni se recargan semillas. Cada suite compara las huellas completas de las siete tablas test antes/después, conservando registros manuales. Autoincrementales pueden avanzar.

Recuento test final: **12 cuentas, 11 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades**. Huellas principales completas idénticas al inicio de A5: **11 cuentas, 10 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades**. No hubo escrituras de negocio principales, migraciones, semillas, dependencias nuevas, modificación de lockfiles ni código Laravel. No se repitió la suite Laravel que requiere negocio vacío.

Se mantienen pendientes revisión gráfica del panel/Postman y explicación en pareja. Solo falta el resumen mensual para completar los veinte endpoints; no se implementó aquí ni se adelantó SPA. No hubo fallo funcional A5 que registrar como corrección de IA ni se inventaron casos.

Cierre autorizado tras aprobar: «feat: implementar actividades de seguimiento en API». Revisar secretos/archivos incluidos y conservar spec-v1 y autor configurado; sin push.

Revisión de cierre A5: 192 archivos versionados/nuevos no ignorados comparados en memoria contra APP_KEY, DB_PASSWORD y JWT_SECRET de ambos perfiles Laravel/API, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas; token/token_cupo exportados vacíos. Sintaxis JavaScript y diff --check correctos. Sin entornos, dependencias, cambios de lockfiles ni temporales del asistente entre los archivos preparados. Autor real configurado conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. Hash de cierre y estado Git se comunican al terminar.


## 27. API A6: resumen mensual — 5 de noviembre de 2026

Inicio en main limpio e5b88bbc78f8270ac43772900c6d7a3f9a969a77. Leídos AGENTS, README, especificación, plan, contrato R7/R8 y cálculos L6 en SalesQueries/ReportMonth. Plan actualizado antes del código. Solo GET /api/reportes/resumen, sin SPA, paquetes ni cambios de esquema de las bases existentes.

### Fuente de cifras y base aislada elegida

La base de revisión manual contenía ambas semillas y registros propios; VerificacionSeeder exige negocio vacío. Se consultó al usuario y eligió expresamente preparar otra base aislada, conservando la de revisión. Un contraste preliminar por lectura de los vendedores comunes también coincidió, pero se sustituyó como prueba final por la base aislada solicitada.

crm_ferreteria_a6_test recibió las diez migraciones Laravel y únicamente VerificacionSeeder. Recuentos inspeccionados antes/después de los controles: 7 users, 5 productos, 21 clientes, 11 oportunidades, 13 líneas, 43 historiales y 4 actividades. No se ejecutaron fresh, DROP, TRUNCATE, reinicios ni SectorSeeder. report-database.php comprueba DATABASE(), CURRENT_USER() y permisos antes de preparar; sin --prepare únicamente inspecciona. Falta de perfil falla antes de intentar conexión.

Root fue introducido localmente en campo enmascarado, pasado al auxiliar por stdin y nunca guardado en archivos/argumentos. La confirmación «Base A6 preparada» se contrastó con conexiones y recuentos reales. El aviso posterior PERFILES_EXISTENTES fue la protección de un segundo intento, no motivo para sobrescribir perfiles. Ventana/proceso propios cerrados y tres temporales fuera del repositorio retirados después de verificar su ruta.

| Cuenta técnica aislada | Permisos |
| --- | --- |
| crm_laravel_a6_test@127.0.0.1 | SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, REFERENCES solo sobre crm_ferreteria_a6_test, sin privilegios globales efectivos, DROP ni GRANT OPTION |
| crm_api_a6_test@127.0.0.1 | SELECT únicamente en users, clientes, oportunidades y oportunidad_productos de crm_ferreteria_a6_test |

No se ampliaron los permisos de crm_api/crm_api_test ni de las cuentas Laravel existentes. Perfiles nuevos ignorados, APP_KEY y JWT_SECRET generados aleatoriamente sin imprimirlos; ejemplos sin secretos.

### Contrato y evidencia

| Criterio | Estado | Evidencia real |
| --- | --- | --- |
| A6 / middleware y ámbito | Aprobado | Vendedor del usuario autenticado, nunca de parámetros. Sin token 401; vendedor_id/usuario_id o parámetros desconocidos 400. Otro vendedor no modifica cifras ajenas |
| Mes | Aprobado | AAAA-MM, rango igual a L6 1000-01–9998-12. Vacío, espacios, mes imposible, formatos/años inválidos, inyección y repetido 400; error JSON genérico |
| R7 / zona | Aprobado | Mes actual de Guatemala vía Intl. 05:59:59 UTC del 1 de noviembre sigue octubre; 06:00:00 cambia a noviembre. Intervalo inicio inclusivo/siguiente inicio exclusivo |
| L6 / equivalencia de límites | Aprobado | Comparación directa con Carbon de 1000-01, 1983-07, 2006-05, 2026-10, 2026-12 y 9998-12. Intl usa misma zona IANA, incluida su historia, sin paquetes nuevos |
| Ventas y total | Aprobado | SUM de líneas agrupadas por oportunidad y después recuento de ganadas; varias líneas no duplican ventas. Solo precio histórico; cambio de precio/activo/mínimo del catálogo no altera resumen |
| Pronóstico | Aprobado | Cuatro etapas abiertas con ponderaciones decimales en SQL, sin filtro mensual; ROUND al final. Tres oportunidades de 0.01 al 50% aportan 0.02 al total redondeado, evitando 0.03 por redondeos parciales |
| Cartera y crédito | Aprobado | COUNT separado de clientes actuales. Cliente reasignado reduce cartera anterior y aumenta nueva sin mover ventas cerradas del vendedor histórico |
| JSON y ceros | Aprobado | Forma exacta mes/ventas/total/pronostico/cartera; todos los importes y recuentos números. Sin resultados ceros, nunca NULL |
| A8 / colección | Aprobado por Node, gráfico pendiente | 101 peticiones, 214 comprobaciones, cobertura de 20 endpoints. A6 nueve peticiones/18 comprobaciones HTTP, incluyendo 400/401; sin JWT exportados |

reports.js contiene reportMonth/guatemalaMonthStart y sellerSummary. La conversión devuelve límites UTC y consulta fecha_cierre con >= y <. La consulta usa parámetros, una fila agregada por oportunidad y CASE decimal, sin unir catálogo ni filtrar ventas por el dueño actual del cliente. La cartera se calcula separadamente dentro de la misma sentencia SQL. Number solo convierte los DECIMAL/recuentos al responder. app.js monta la ruta con authenticate existente.

### Controles HTTP con solo VerificacionSeeder

| Usuario | Mes | Ventas | Total | Pronóstico | Cartera |
| --- | --- | ---: | ---: | ---: | --- |
| Valeria | 2026-10 | 2 | 9250.00 | 2512.88 | 3/10 |
| Valeria | 2026-11 | 1 | 3600.00 | 2512.88 | 3/10 |
| Diego | 2026-10 | 1 | 6000.00 | 112.50 | 2/10 |
| Carlos | 2026-10 | 1 | 7200.00 | 4125.75 | 9/10 |

reports-common.test.js inicia HTTP TCP contra el perfil de solo lectura aislado, verifica permisos y hace login contra los hashes creados por Laravel; credencial pública leída de la colección, sin copiar el literal a pruebas. Todos los controles coincidieron. reports.test.js cubre los casos extremos con fixtures propios en la base de revisión manual, sin alterar filas preexistentes.

### Ejecuciones, incidentes reales y conservación

Primeras tandas A6: 16/16 y 17/17; colección incorporada y regresión 168/168. Contraste preliminar común 19/19, posteriormente reemplazado por el conjunto aislado elegido. La primera regresión con la base aislada terminó 171/172 por el fixture A3 descrito abajo. Tras corregirlo, **suite final 172/172**, cero fallos: 150 previas y 22 A6. No se suman ejecuciones. Se conservaron las catorce carreras A3/A4 aprobadas; no se inventó una prueba de concurrencia para este endpoint de lectura.

Incidente del auxiliar de entorno: se intentaron conceder SELECT por tabla antes de aplicar migraciones, quedando preparación parcial y reintento CUENTA_EXISTENTE. Se corrigió el orden (cuenta Laravel limitada, perfiles privados, migraciones/semilla y SELECT de API después). Se recuperaron solo las cuentas técnicas A6 limitadas a la base todavía vacía; no se tocaron las otras cuentas. Un intento de inspección sin el perfil llegó a valores por defecto y falló autenticación sin escribir; el auxiliar versionado ahora exige archivo local antes de arrancar Laravel. No se expuso contraseña de root. El auxiliar transitorio no forma parte del commit.

Error real de prueba IA detectado durante la regresión: en clients.test.js el nombre con prefijo hexadecimal aleatorio podía contener CF. Como la búsqueda incluye nombre o NIT, devolvía correctamente dos filas en lugar de la única que asumía el test (2 !== 1). Se fijó únicamente el nombre del cliente no CF del fixture; no cambió lógica de búsqueda ni código de clientes. Origen: prueba añadida en A3 (139e0936f7219b4bb918a7e0cc59219c946c1c5a). Corrección incluida en este commit A6; su hash se comunica al cerrar. Este incidente explica la repetición completa de la suite.

Comandos desde api/: npm.cmd test; node --env-file=.env.testing --test --test-concurrency=1 tests/reports.test.js tests/reports-common.test.js para A6. Preparación explícita: php tests/report-database.php --prepare; inspección sin opción. Sintaxis JS y Pint --test del auxiliar PHP se comprueban antes del commit.

La suite de casos extremos comprueba base/cuenta/permisos antes de borrar solo IDs propios de fixtures; compara huellas completas del núcleo de revisión manual antes/después. Recuento final conservado: 12 cuentas, 11 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades. Los autoincrementales pueden avanzar. No se reinició esa base ni se repitió la suite Laravel que exige negocio vacío.

Huellas principales completas idénticas al inicio de A6: 11 cuentas, 10 productos, 28 clientes, 17 oportunidades, 19 líneas, 62 historiales, 8 actividades. La base aislada nueva permanece solo con la semilla común y se consulta con cuenta API sin escritura. No hubo escrituras de negocio principales, dependencias nuevas ni modificación de lockfiles/migraciones originales.

Revisión gráfica de Postman/panel y explicación en pareja pendientes. README explica perfiles 3001 (revisión manual) y 3002 (solo controles comunes). Cobertura de endpoints no acredita interfaz Postman ni SPA. Cierre autorizado: «feat: implementar resumen mensual del vendedor en API», conservando spec-v1 y autor real; sin push.

Revisión de cierre A6: 198 archivos versionados/nuevos no ignorados comparados en memoria contra APP_KEY, DB_PASSWORD y JWT_SECRET de los seis perfiles locales (incluidos los dos nuevos aislados), sin coincidencias. Literal público de semilla solo en ubicaciones permitidas y tokens exportados vacíos. Perfiles reales ignorados; ejemplos sin credenciales preparados. Sin dependencias, lockfiles modificados ni temporales del asistente en los archivos incluidos. Sintaxis, Pint y diff --check aprobados. Autor existente conservado; spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. El hash final identifica también la corrección del fixture A3 descrita arriba.


## 28. Revisión final A7/A8 de la API — 6 de noviembre de 2026

Inicio: main limpio en 39ff5ea771476b501208851d6aede66adff12262, comprobado con Git. Leídos AGENTS, README, especificación, plan, verificación y protocolo; enunciado páginas 10–11 (veinte rutas, formas/códigos) y 14 (A7/A8) contrastado directamente. spec-v1 mantiene el hito documental. Plan actualizado antes del código, siguiendo las tareas reales de errores/formatos, colección y revisión final; no se adelantó integración/SPA ni se marcó completa la entrega.

### Contraste de los veinte endpoints

La tabla vigente consolidada está en README, sección Revisión final API A7/A8. Se verificaron métodos, rutas, entradas permitidas y respuestas contra enunciado/especificación. Cobertura comprobada también por script: veinte métodos/rutas del contrato y veinte cubiertos en la colección, ninguno ausente. Códigos de colección: 200, 201, 204, 400, 401, 403, 404, 409, 422; 500 genérico comprobado por fallos controlados de los tests, no mediante una ruta de diagnóstico nueva.

| Grupo | Endpoints | Evidencia principal |
| --- | ---: | --- |
| Login y productos | 2 | auth.test.js: 200/401/403/422, hash Laravel, token, activos y precio numérico; api-review.test.js añade entradas ilegibles/correos válidos |
| Clientes/cartera | 6 | clients.test.js y client-validation.test.js: DTO, búsqueda, propiedad, R3/R4, índices y cinco carreras API/API más cuatro API/panel |
| Actividades | 3 | activities.test.js: DTO, creación, PATCH booleano, cartera actual/autor histórico, zonas, vencida y 404 tras esperar reasignación |
| Oportunidades/líneas | 8 | opportunities.test.js: resumen frente a detalle, propietario, archivo cerrado, precio histórico, mínimo, etapas/historial atómicos, 204 y cinco carreras |
| Resumen mensual | 1 | reports.test.js y reports-common.test.js: agregaciones SQL, Guatemala/UTC, ceros, cartera y cuatro cifras en base A6 con solo VerificacionSeeder |

Los errores transversales 400 por cuerpo/filtro ilegible o no admitido y 404 por R2 se conservan, incluida creación de oportunidad para cliente ajeno, como explica la especificación. No se añadieron endpoints, envoltorios, paginación ni cambios de nombres.

### Incumplimientos comprobados y correcciones

| Caso real | Antes / detección | Corrección y prueba |
| --- | --- | --- |
| IA-11: entradas de transporte ilegibles | HTTP real de solo lectura: GET clientes/%ZZ, GET oportunidades/%FF, PATCH actividades/%ZZ y login gzip/deflate corruptos respondían 500 | app.js distingue URIError de decodificación (400) y Z_DATA_ERROR/Z_BUF_ERROR con estado 400, manteniendo mensajes genéricos. Cinco casos nuevos pasan con 400 JSON |
| IA-12: formato del correo del login | Dominios locales y direcciones entre comillas aceptadas por RFCValidation de Laravel eran rechazadas con 422 por la expresión simplificada de auth.js | Login reutiliza validEmail existente, sin cambiar la normalización de clientes ni la contraseña. Dos direcciones válidas inexistentes llegan a MySQL y reciben 401, como el contrato. Comparación con el validador instalado de Laravel aprobada |
| IA-13: reutilización de conexión incierta | Dobles de conexión reproducían devolución al pool después de GET_LOCK sin confirmación o rollback fallido en cartera/oportunidades | client-store.js marca como no reutilizable antes de esperar GET_LOCK y si rollback no confirma; opportunity-store.js descarta también ese caso. Seis pruebas de ciclo verifican commit/rollback, RELEASE_LOCK antes del pool y destroy ante adquisición/liberación/rollback inciertos |

Estos errores estaban en código generado en etapas anteriores: IA-11/IA-12 proceden de A1/A2 (dbfaee217f7ecb721ae2882e6b96d463ff6dd68b); IA-13 afecta cartera A3 (139e0936f7219b4bb918a7e0cc59219c946c1c5a) y transacciones A4 (3e6c851c6349dbfa750332021ea871cc0b5f8ddf). El commit de cierre A7/A8 contiene las correcciones y se identifica al terminar; esta referencia al mismo hito evita inventar un hash antes de crearlo. Los fallos de conexión son inyectados en dobles, no fugas observadas ni cortes reales del servidor MySQL. No se inventan incidentes adicionales para completar una cuota.

No se modificaron cupo, toma, cantidades mínimas, precios históricos, transiciones, fechas/historial ni autorizaciones de negocio. Tampoco Laravel, perfiles, migraciones, semillas, cuentas, permisos, dependencias o lockfiles.

### Controles compartidos y formatos

JWT conserva HS256 permitido, firma/exp/sub válidos y consulta de rol/estado actual en cada petición. Las pruebas de expiración, usuario inexistente, desactivación/cambio de rol, credenciales incorrectas y login 403 siguen aprobadas. El propietario sale de usuario autenticado; identificadores ajenos son 404, el archivo de ventas solo muestra id/nombre de cliente y actividades se autorizan por cartera actual.

Consultas con placeholders ?, sentencias múltiples deshabilitadas y columnas PATCH limitadas a lista blanca. CORS conserva exactamente SPA_ORIGIN configurado; otro origen no recibe autorización. No se confunde CORS con autenticación.

En éxito y rechazo se espera commit/rollback y RELEASE_LOCK antes de devolver una conexión de cartera al pool. Si no se conoce su estado, se destruye. La liberación fallida ya descartaba la conexión y se preservó ese comportamiento. Las carreras reales y los chequeos IS_FREE_LOCK de A3 siguen pasando. Los errores de MySQL se traducen sin publicar consulta, valores ajenos o credenciales.

La colección añade un único script global de revisión: forma exacta de errores, tipos numéricos, booleanos, fechas ISO UTC y ausencia de campos privados en éxitos. Para 422 se permiten nombres de campos rechazados dentro de errores, con mensajes de texto, sin sus valores. 204 sigue sin cuerpo. Los DTO específicos y el 500 genérico mantienen las comprobaciones precisas anteriores. No se descodifican ni exportan tokens para generar evidencias.

### Ejecuciones reales

Primera ejecución enfocada de api-review.test.js y transaction-review.test.js: 13 casos, tres aprobados y diez fallidos, reproduciendo exactamente los faltantes antes de corregirlos. Después: 13/13 aprobados. Regresión completa mediante npm.cmd test: **185/185**, cero fallos, conservando los 172 anteriores y añadiendo solo trece casos de los faltantes. Los errores de consola del pool cerrado y TEST_HISTORY siguen siendo inyecciones deliberadas de pruebas previas.

Se ejecutó la colección con el procedimiento existente: fetch TCP real y scripts pm en vm, sin nuevas dependencias ni Newman. Para no duplicar el mismo chequeo 108 veces, se concentró en collection.event y se actualizó una línea de cada ejecutor existente para procesarlo. Tras ese ajuste se repitieron únicamente los cuatro bloques afectados: **4/4** aprobados, con los mismos totales:

| Bloque | Peticiones | Comprobaciones |
| --- | ---: | ---: |
| A1/A2/A3 | 36 | 109 |
| A4 | 38 | Aprobado | Secciones 25 y 34: precio, cantidades, cierre, historial y cinco carreras |
| A5 | 25 | Aprobado | Secciones 26 y 34: cartera actual, fechas y autor preservado |
| A6 | 9 | Aprobado | Secciones 27, 33 y 34: cifras comunes A6 y recorrido real con venta nueva |
| Total | 108 | 336 |

Comandos desde api/: npm.cmd test; node --env-file=.env.testing --test --test-concurrency=1 tests/api-review.test.js tests/transaction-review.test.js; node --env-file=.env.testing --test --test-concurrency=1 --test-name-pattern=colección tests/clients.test.js tests/opportunities.test.js tests/activities.test.js tests/reports.test.js. Se comprueba además node --check de src/tests y diff --check. No se ejecutó una suite Laravel sobre datos poblados: ningún archivo PHP/panel fue modificado; el contraste R4 de 32 vectores con Laravel forma parte de npm test y sigue aprobado.

Un intento de mover el script de colección mediante texto con acento por stdin de PowerShell no encontró su marcador y terminó sin escribir. Se corrigió el ejecutor usando un marcador ASCII; no fue un fallo funcional de API ni se añadió como un caso inventado de IA.

### Conservación y alcance

Antes de las pruebas que escriben se verificaron por lectura DATABASE(), CURRENT_USER(), permisos y huellas completas de las siete tablas en las tres bases. Los ejecutores que crean fixtures revalidan perfiles y limpian únicamente IDs/prefijos propios. api-review.test.js usa A6 con cuenta de lectura; transaction-review.test.js no conecta con MySQL.

Huella de filas/columnas y permisos de control exactamente iguales antes/después en las tres bases:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Autoincrementales de fixtures pueden avanzar. No fresh, refresh, resets, truncados, borrados generales, recargas ni cambios de cuentas/permisos. Los controles Valeria octubre/noviembre, Diego y Carlos se volvieron a verificar en la base A6, exclusivamente común, con las cuatro cifras originales aprobadas.

README contiene tabla vigente, explicación del recorrido de petición y comandos existentes; plan conserva pendientes reales y protocolo precisa el descarte de conexiones. Revisión automática de API A7/A8 aprobada; siguen pendientes navegador/Postman gráfico, explicación en pareja, integración y SPA. A8 de instalación de las tres piezas se completa cuando exista la SPA; no se declara hecha ahora.

Commit descriptivo autorizado si pasan comprobaciones; sin push y spec-v1 intacta. Se revisan secretos y archivos incluidos antes de crearlo.

Revisión de cierre A7/A8: 200 archivos versionados/nuevos no ignorados contrastados en memoria con APP_KEY, DB_PASSWORD y JWT_SECRET de los seis perfiles locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas; tokens exportados vacíos. Sin entornos reales, dependencias, temporales ni cambios de lockfiles/migraciones entre los archivos preparados. Sintaxis y diff --check correctos. Autor local conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. El commit de esta sección es el correctivo de IA-11/IA-12/IA-13; su hash y estado final se comunican al cerrar.

## 29. Fase 6, primera etapa SPA: acceso y navegación — 6 de noviembre de 2026

Inicio en main limpio, commit 055398aead74b337d50b5ee5b6d81576ca320ac5. Se leyeron AGENTS, README, especificación, plan y requisitos SPA del PDF (páginas 14–16). Plan actualizado antes de implementar. Alcance: F1 y base de F6; fase 6 sigue parcial porque cartera y asignación panel → SPA no están implementadas. F2–F5 y fase 9 pendientes. No se modificó el contrato ni código de API/Laravel.

frontend/ contiene HTML, Bootstrap 5.3.8 local con licencia MIT, módulos JS, servidor estático Node y pruebas con herramientas existentes. El CSS descargado de la distribución oficial coincidió con su SHA-384 publicado; no se añadió CSS propio, framework, compilador ni paquete de pruebas. La configuración pública apunta a API 3001 y origen http://127.0.0.1:5500, exactamente igual a SPA_ORIGIN del perfil testing. DATABASE()/CURRENT_USER() confirmaron crm_ferreteria_test y crm_api_test, independientes de desarrollo. No se publican credenciales.

### Comprobaciones funcionales ejecutadas

Comando desde la raíz: node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/browser.test.mjs. Última ejecución completa: **9 pruebas aprobadas, cero fallos** (ocho casos unitarios/servidor y un caso de navegador con múltiples comprobaciones). Node --check de módulos, servidor y pruebas correcto. No se repitió la suite de API de 185 casos porque no se modificó backend; su resultado previo sigue siendo el de la sección 28.

| Control | Evidencia real y resultado |
| --- | --- |
| Acceso | Navegador Edge existente, HTTP real y hashes Laravel en MySQL: vendedor activo entra; clave incorrecta 401; administrador, supervisor e inactivo 403, sin sesión de SPA |
| Validación | Campos vacíos no envían petición; correo conservado y clave vacía tras error; clave de más de 72 bytes recibe 422 real junto al campo |
| Carga | POST real retrasado deliberadamente: indicador visible, controles deshabilitados y dos envíos producen una sola petición |
| Sesión | Solo token y usuario id/nombre/correo en la clave propia; pruebas de almacenamiento corrupto/bloqueado y otras claves conservadas; contraseña nunca persistida |
| Restauración/cierre | Recarga válida consulta GET /productos con Bearer y origen exacto; respuesta descartada. Cierre limpia la sesión; JWT vencido produce 401 real, limpia y vuelve al acceso |
| Respuesta atrasada | Se retrasa la comprobación de un JWT vencido, se inicia una sesión nueva antes del 401 anterior; la sesión nueva permanece |
| Navegación | Cuatro secciones preparadas, nombre/correo del vendedor y cierre; no se implementan consultas ni formularios de negocio |
| Transporte compartido | Dobles verifican JSON, Bearer solo donde corresponde, contraseña sin transformación, 204 sin parseo, 422 por campo, 401 protegido y respuestas ilegibles. Navegador sin red muestra aviso comprensible |
| Texto seguro | Nombre cacheado y respuestas 422/500 con texto malicioso inyectado: se muestran como texto, sin elementos img ni ejecución. Estos errores maliciosos son simulaciones, no respuestas de la API de producción |
| Servidor estático | Archivos públicos con MIME correcto; rutas de entorno, pruebas, servidor y traversal no se sirven |
| Ancho de pantalla | Acceso y navegación capturados a 1280 y 375 px; comprobación automatizada de ausencia de desbordamiento e inspección de esas capturas realizadas |

El navegador usa un perfil temporal propio, no la sesión personal del usuario. El ejecutor inicia y detiene sus servidores 3001/5500 y cierra Edge; exige puertos libres. Se conservaron temporalmente capturas para inspección y se retiraron después los perfiles propios. La contraseña pública se obtiene en memoria desde la colección autorizada, sin copiar su literal a pruebas ni evidencias. JWT y secretos no se imprimen ni guardan en el repositorio.

### Error real de IA y corrección

IA-14: el catch de restauración de app.js limpiaba incondicionalmente la sesión después de una respuesta antigua. Una prueba solapada con JWT vencido y nuevo login reprodujo la pérdida de la sesión nueva (aserción fallida). Se conserva la referencia a la sesión que comenzó la restauración y solo se actualiza ese estado si sigue vigente; expireSession también compara el token de la petición. Después pasan las nueve pruebas. El commit de esta etapa contiene la corrección; se comunica su hash al cerrar, sin inventarlo por adelantado.

Al preparar esa prueba, una barrera capturó primero el OPTIONS de CORS en vez del GET, causando timeout del propio test. Se corrigió la barrera para esperar el GET antes de acreditar el caso. No se presenta ese timeout como fallo funcional adicional ni se suman resultados de ejecuciones sucesivas.

### Conservación y pendientes

Huella completa de filas/columnas y permisos de control idéntica antes/después en las tres bases, con estos recuentos:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Esta etapa solo hizo login y lecturas: sin semillas, migraciones, cambios de registros, cuentas o permisos; no se reinició ninguna base. Se conservan los registros manuales. Las capturas inspeccionadas acreditan únicamente estos estados de acceso/navegación, no una revisión manual completa de la SPA ni del panel/Postman. Revisión en pareja, módulos de negocio y asignación panel → cartera SPA siguen pendientes.

README documenta inicio en dos terminales, URL 5500, perfil API testing, Ctrl+C, archivos y pruebas. Flujo: index.html → submit delegado de app.js → api.js → API/MySQL → estado de sesión → view.js con textContent. session.js limita la persistencia; el backend mantiene la autorización vigente. Commit descriptivo autorizado tras revisión de secretos; sin push y conservando spec-v1.

Cierre: 211 archivos versionados/nuevos no ignorados contrastados en memoria con secretos de los seis perfiles locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas. Los cinco perfiles temporales propios del navegador se retiraron después de inspeccionar capturas. Sintaxis y diff --check correctos; autor existente conservado. Solo se preparan frontend/, README, plan y verificación: sin entornos, dependencias instaladas, temporales, archivos de API/Laravel ni cambios de etiquetas. spec-v1 conserva objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y destino bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166.

## 30. Fase 6, Clientes y cartera de la SPA (F2) — 6 de noviembre de 2026

Inicio main limpio en e7299702a56ed880c2238767d2dc183869d2c427; spec-v1 en su commit documental original. Se leyeron AGENTS, README, especificación (R3/R4, contrato de seis rutas y F2), plan, protocolo de cartera y módulos frontend existentes. Plan actualizado antes de implementar. No se encontraron contradicciones que requirieran cambiar contrato o decisiones. No se modificaron API, Laravel, esquema, permisos, semillas ni dependencias.

### Archivos y comportamiento

clients.js mantiene el estado de listas, búsqueda, ficha, formulario, ocupación, cargas y errores; forma parte del estado de app.js. Cada búsqueda lleva contador y generación de sesión: una respuesta antigua no publica resultados ni errores sobre una más reciente o una sesión cerrada. Cada carga de ficha/lista/disponibles/ocupación descarta resultados obsoletos. Los borradores se actualizan mediante input delegado, permanecen en memoria ante errores y se retiran al cerrar sesión. No se guardan clientes ni resúmenes en LocalStorage.

clients-view.js renderiza con plantillas HTML y nodos/textContent; index.html añade formulario, lista/ficha y ejemplos de NIT/CF/teléfono. app.js delega submit/input/click y conserva api.js/session.js y el control protegido de 401. view.js integra el render de clientes sin implementar las otras secciones. No se añade framework ni una nueva capa de backend.

Buscar usa GET /clientes?q= con encodeURIComponent; ficha GET /clientes/:id. Crear solo envía nombre/nit/telefono/correo; PATCH envía únicamente esos campos que cambian. La API sigue normalizando y validando definitivamente. Tomar usa POST /clientes/:id/tomar sin cuerpo, deshabilita acciones mientras procesa y evita el doble envío. Disponibles muestra nombre y usa id para la acción, sin pedir ficha ni mostrar datos privados de esos clientes. No hay eliminación, liberación ni reasignación.

La ocupación procede de cartera en GET /reportes/resumen, sin selector ni pantalla de reportes; el resto de su respuesta no se conserva. Al crear, editar o tomar se recargan listas y ocupación; al recibir 409 de toma se conservan su mensaje y la consulta actualizada. Si falla resumen se muestra el aviso, sin inventar una cartera cero. Actualizar listas permite reflejar cambios externos. Inicio sigue con API testing 3001 y SPA 5500, CORS exacto http://127.0.0.1:5500; Ctrl+C detiene cada servidor.

### Pruebas realmente ejecutadas

Primera ejecución de unidades: 14/14 (ocho existentes y seis nuevas). Primera ejecución completa: 15/15. Se ampliaron únicamente las comprobaciones de NIT y la barrera de búsqueda para acreditar solapamiento real; ejecución completa final: **15/15, cero fallos**, sin sumar ejecuciones. No hubo un fallo funcional observado en esta etapa ni se inventa un nuevo caso de IA. Se reutiliza la regresión de la corrección IA-14 de la etapa anterior.

Comando desde la raíz: node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/browser.test.mjs. client.test.mjs conserva ocho pruebas; clients.test.mjs añade seis; browser.test.mjs conserva un caso de múltiples comprobaciones y llama clients-browser.mjs. Este ejecutor usa Edge instalado con su protocolo de depuración, API Express real con las mismas rutas/middleware y MySQL de pruebas; no se instaló navegador ni dependencia. Node --check de módulos/servidor/pruebas y diff --check correctos.

| Control | Resultado y naturaleza de la evidencia |
| --- | --- |
| Cartera vacía y cupo | Vendedor temporal sin clientes: lista vacía y 0/10 desde resumen real; alta 1/10 y toma 2/10. Fixtures propios completan 10/10; alta/toma adicional reciben 409 y el alta conserva formulario |
| Búsqueda | Nombre/prefijo y NIT válido consultados por HTTP; búsqueda sin coincidencias muestra estado vacío. Dos GET solapados: el antiguo queda pendiente mientras el nuevo termina; antiguo luego 200 sin sustituir la lista reciente |
| Creación/normalización | Alta 201 con c-f y teléfono +502 con separadores: ficha devuelve CF y ocho dígitos; NIT válido editado con ceros/guion se devuelve normalizado |
| Validación y duplicado | Entradas inválidas reales producen 422 en nombre/nit/telefono/correo junto al campo; valores conservados. Teléfono repetido produce 409 comprensible, sin perder el borrador |
| Edición y ficha | PATCH real guarda nombre y correo; otro PATCH cambia NIT y borra correo opcional. Unidad comprueba que solo se envían campos cambiados; fichas reflejan respuestas reales |
| Disponibles/toma | Solo nombres visibles e id de acción. POST real incorpora el cliente; doble clic durante retraso deliberado produce exactamente una petición. Otro fixture asignado tras mostrar la lista recibe 409 de ocupado y desaparece al actualizar |
| Autorización | Al transferir exclusivamente una ficha temporal a otro vendedor temporal, GET devuelve 404 y no se muestra contacto. Se conservan las comprobaciones reales previas de roles, expiración y 401 atrasado que no cierra una sesión nueva |
| Estado/transporte | Unidades verifican descarte al cerrar sesión, campos permitidos, doble alta/toma, conservación de 422/409 y fallos de lista/disponibles/resumen. Estos fallos de transporte del módulo usan dobles; no se presenta una caída real de MySQL |
| XSS y almacenamiento | Nombre de fixture con HTML malicioso se ve como texto en ficha/lista, sin imagen ni ejecución. LocalStorage sigue conteniendo solo la sesión pública |
| Interfaz | Capturas de listado, ficha, formulario con errores, disponibles y cartera llena inspeccionadas a 1280 y 375 px. El navegador comprobó ausencia de desbordamiento horizontal en esos estados |

La exclusión de doble clic del navegador no se presenta como una nueva prueba de concurrencia SQL. Los controles API/API y API/panel simultáneos de cupo y toma siguen siendo los de A3, sección 24; no se modificó ese protocolo ni se repitió la suite de backend/panel. No se ejecutó una colección gráfica ni la asignación desde la interfaz de Laravel.

### Preservación y límites

Antes de las pruebas se capturaron por lectura DATABASE(), CURRENT_USER(), permisos y huellas de todas las filas/columnas del núcleo en las tres bases. El ejecutor F2 comprueba control crm_laravel_test limitado a crm_ferreteria_test antes de crear fixtures y antes de limpiar; la API confirma crm_api_test. Se reutiliza api/tests/client-users.php para crear/hash mediante Laravel las doce cuentas temporales del auxiliar existente. Clientes tienen prefijo aleatorio propio y se retiran exclusivamente por sus IDs/prefijo; cuentas se retiran por sus correos exactos generados. No se cambian ni eliminan registros manuales, oportunidades o actividades.

Las huellas y permisos finales coincidieron exactamente con las iniciales:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Autoincrementales de pruebas pueden avanzar. Sin semillas, reinicios, fresh, truncados ni borrados generales. Perfil de Edge propio temporal; capturas inspeccionadas sin tokens/contraseñas. Servidores del ejecutor y navegador cerrados al finalizar. Se retiran sus perfiles tras la inspección. Contraseñas técnicas y JWT no se imprimen; la contraseña pública existente se lee de la colección permitida sin copiar su literal a pruebas.

Pendientes: revisión manual en pareja, panel y Postman gráfico, comprobación completa de asignación desde la interfaz del panel hacia cartera SPA, F3/F4/F5 y finalización de fase 9. El resumen solo aporta ocupación; no hay pantalla de reportes, oportunidades ni actividades. README mantiene arranque/URL y procedimiento manual/automatizado. Commit descriptivo autorizado si pasan los controles; sin push y spec-v1 intacta.

Revisión de cierre: 215 archivos versionados/nuevos no ignorados contrastados con secretos de los seis perfiles locales en memoria, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas. Dos perfiles temporales propios de Edge retirados tras inspeccionar capturas. Sintaxis y diff --check correctos. Solo frontend/ y README/plan/verificación entre los cambios; sin entornos, temporales, dependencias, SQL ni archivos de API/Laravel preparados. Autor existente conservado y spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y destino bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. El hash del commit descriptivo se informa al cerrar.

## 31. Fase 9, únicamente F3: Oportunidades y cotizaciones — 6 de noviembre de 2026

Inicio main limpio en 8c7b0a370c127071879ab2309f9d548d0caeca6b; spec-v1 conserva el commit documental. Leídos AGENTS, README, especificación, plan, contratos/consultas/transiciones A4 y F3 del PDF (página 15). Plan actualizado antes del código. Sin contradicciones detectadas: cuatro columnas abiertas y lista de cerradas, avance de una etapa, ganar solo desde negociación y perder desde cualquier abierta; cerradas inmutables y archivo histórico limitado al nombre/id del cliente. No se cambiaron contrato, API, Laravel, permisos ni dependencias.

### Archivos y flujo

opportunities.js contiene estado y funciones cortas para listado/filtro, creación desde cartera, detalle, título, líneas y etapa. Contadores separados y generación de sesión impiden que una lectura antigua sustituya el filtro/detalle actual o publique información después de cerrar sesión. Los clientes del selector se reducen a id/nombre. Los borradores permanecen en memoria ante fallos, sin usar LocalStorage. Se deshabilitan controles durante operaciones y el estado busy impide envíos duplicados. Un resultado de sesión anterior tampoco inicia una carga de catálogo de otra sesión.

opportunities-view.js usa plantillas de index.html y nodos/textContent para embudo, fichas, formularios, confirmación e historial. Intl formatea quetzales y fechas con America/Guatemala explícito. app.js añade eventos submit/input/change/click delegados y limpia el módulo con la sesión; view.js integra su render. api.js y session.js conservan transporte, JSON/204, Bearer y regreso al acceso por 401.

Listado GET /oportunidades y filtro etapa, cuatro columnas abiertas y cerradas debajo; tarjetas con título, cliente, etapa/probabilidad, total, cierre y motivo. Detalle GET /oportunidades/:id muestra líneas, cantidades, precio histórico, subtotal/total e historial. La vista histórica nunca pide GET /clientes/:id. Crear solo envía cliente_id/titulo; editar solo titulo. Agregar solo producto_id/cantidad, cambiar cantidad solo cantidad y retirar DELETE sin cuerpo. Tras 204 se vuelve a consultar detalle, sin restar ni calcular importes en JS.

Etapa usa únicamente opciones válidas según la especificación, solicita motivo al perder y exige Confirmar cierre para ganada/perdida; Cancelar cierre no escribe. El PATCH solo envía etapa y motivo_perdida cuando corresponde. Éxito actualiza detalle/historial de la API y recarga listado; error conserva el estado confirmado y valores, con errores por campo. Una cerrada oculta todos los formularios y acciones de líneas, manteniendo consulta.

Recorrido al agregar: formulario → app.js → opportunities.add → api.js → opportunities.js de API → checkedProduct/writeChange en opportunity-store.js y opportunities.js, que comprueban propiedad/activo/mínimo y copian el DECIMAL → MySQL → opportunityDetail calcula importes en SQL → estado y render seguro. Cambio de etapa: formulario/confirmación → opportunities.stage de frontend → PATCH → changeStage en API guarda etapa/cierre UTC/historial dentro de opportunityTransaction → respuesta y listado actualizado. El código A4 mencionado permanece sin cambios.

### Comprobaciones ejecutadas

Comando desde raíz: node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/browser.test.mjs. Resultado final: **24/24, cero fallos**, conservando los catorce casos unitarios previos, añadiendo nueve de F3 y ampliando el caso existente de navegador a F1–F3. No se suman ejecuciones. Primera tanda de unidades F3: 8/8; primera completa 23/23. Tras ampliar protección de sesión y evidencia de filtros/detalles: 24/24; se corrigió el apagado del ejecutor descrito abajo y la última completa volvió a dar 24/24 sin ese mensaje.

| Control | Evidencia real y resultado |
| --- | --- |
| Listado/filtro | Vendedor temporal sin oportunidades: estado vacío y cuatro columnas. Posteriormente una abierta, una ganada y una perdida aparecen en sus áreas; filtro ganada solo muestra la venta y prospecto vacío muestra aviso |
| Creación/título | Formulario inválido: 422 junto a cliente_id/titulo; alta 201 en prospecto con historial inicial; título editado mediante PATCH y reflejado en detalle |
| Dinero/contrato | Producto temporal Q12.34 mínimo 5: agregar 5 devuelve subtotal/total Q61.70; cambiar a 6 devuelve Q74.04. Segundo producto a 2 unidades lleva total a Q98.72; DELETE 204 y nueva lectura devuelven Q74.04. Unidades verifican que ningún cuerpo envía precio, subtotal, total ni propietario |
| Errores de líneas | Agregar 1 y cambiar a 3 con mínimo 5 reciben 422 en cantidad y conservan valores; producto repetido 409; producto desactivado después de cargar el selector recibe 422 en producto_id. Catálogo inicial excluye un fixture inactivo |
| Doble envío | Dos envíos del formulario de agregar durante retraso deliberado generan un único POST; controles deshabilitados. Estado busy también se verifica con dobles |
| Transiciones | Salto manipulado prospecto → ganada recibe 422 sin historial extra; avances calificado/propuesta/negociación funcionan y producen cuatro entradas contando creación |
| Cierre | Solicitar/cancelar ganar no cambia etapa; confirmar guarda ganada y quinta entrada. Otra oportunidad sin líneas rechaza ganar con 422; perder sin motivo recibe 422, sin historial extra. Motivo válido se normaliza y cierra perdida |
| Históricos | Solo el producto temporal cambia a precio 99.99/mínimo 99/inactivo; la línea previa conserva precio 12.34, cantidad 6 y total 74.04, y la venta puede cerrarse sin revalidar el mínimo nuevo |
| Cerradas | Formularios ocultos y sin acciones de línea. PATCH título/etapa y POST línea directos desde navegador reciben 409; historial permanece en cinco entradas |
| Propiedad/archivo | Cliente temporal reasignado tras cerrar: venta sigue visible con nombre; el recorrido histórico no solicita la ficha privada, cuya consulta directa responde 404. Crear con cliente ajeno manipulado y GET/PATCH de oportunidad ajena temporal reciben 404 |
| Respuestas atrasadas | Filtros HTTP solapados: nuevo ganada termina mientras antiguo prospecto sigue pendiente y este luego 200 no reemplaza resultados. Detalle antiguo retrasado tampoco reemplaza el de otra oportunidad. Unidades verifican generaciones de sesión y lecturas fallidas |
| Seguridad/UI | Título con HTML malicioso se ve como texto sin imagen/ejecución; dinero mostrado desde API y fechas de historial en Guatemala. Se conserva regresión de F1/F2, roles/401, errores y almacenamiento limitado |

opportunities.test.mjs usa dobles para límites del estado/contrato, fallos de conexión y respuestas desordenadas. opportunities-browser.mjs usa Edge instalado, API real en 3001 y MySQL testing, no simulaciones de reglas de negocio. Los retrasos son deliberados para acreditar doble envío y orden de respuestas. Las transiciones inválidas y los recursos ajenos se prueban manipulando controles o mediante fetch directo autenticado; el formulario normal ofrece solo transiciones permitidas.

Se inspeccionaron capturas de embudo con abierta/cerradas, detalle, mínimo rechazado, confirmación y cerrada a 1280/375 px. El navegador también verificó scrollWidth <= innerWidth en esos estados. Esta evidencia no declara realizada la revisión en pareja ni la revisión manual completa del panel/Postman. No se repitió la suite backend/Laravel: no cambió su código. Las carreras transaccionales A4 conservan su evidencia anterior; no se presentan las operaciones secuenciales de F3 como una nueva prueba SQL simultánea.

### Incidencia real del ejecutor y corrección

Una ejecución con 24 pruebas aprobadas mostró al apagar «Error interno de API: Error». El ejecutor generado conservaba temporizadores artificiales de peticiones y podía invocar la aplicación después de cerrar conexiones/pool. Se ajustó browser.test.mjs para no retrasar OPTIONS, cancelar el temporizador al cerrar la respuesta y no ejecutar callbacks con respuesta destruida. Última ejecución: 24/24, sin ese mensaje. La evidencia se limita al ejecutor local; no demuestra un fallo de producción ni un error funcional del contrato. El commit de esta etapa incluye la corrección. No se inventan otros incidentes ni fallos de aserciones.

### Preservación y pendientes

Antes de escribir se confirmaron identidades y huellas completas por lectura en las tres bases. Cada auxiliar comprueba crm_laravel_test limitado a crm_ferreteria_test mediante DATABASE(), CURRENT_USER() y SHOW GRANTS; la API comprueba crm_api_test y origen http://127.0.0.1:5500. Cuentas temporales/hash creadas por el auxiliar Laravel existente, no por la API. Productos y clientes propios por IDs/prefijo spa-f3 aleatorio; oportunidades por su prefijo. Limpieza solo de esas oportunidades/líneas/historial, después clientes/productos y cuentas exactas propias. El control compara todas las filas preexistentes tras limpiar. No se tocaron semillas ni registros manuales.

Huellas de filas/columnas y permisos finales iguales a las iniciales:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Autoincrementales de pruebas pueden avanzar. Sin reinicios, fresh, truncados ni borrados generales. Los servidores y Edge del ejecutor se cierran al terminar; sus perfiles propios se retiran tras la inspección. Sin tokens/contraseñas en evidencias ni paquetes nuevos. README mantiene arranque y comandos reproducibles, pruebas y explicación de archivos. F3 aprobado; pendientes F4 Actividades, F5 pantalla de resumen, revisión en pareja e integración panel → SPA aún no comprobada. Fase 9 completa pendiente. Commit descriptivo autorizado al pasar revisión de secretos; sin push y spec-v1 intacta.

Cierre: 219 archivos versionados/nuevos no ignorados contrastados en memoria con secretos de los seis perfiles locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas. Los tres perfiles propios del navegador de esta etapa se retiraron después de la inspección. Sintaxis y diff --check correctos. Solo frontend/ y README/plan/verificación preparados; sin entornos, temporales, dependencias ni archivos de API/Laravel. Autor existente conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166; el hash del commit descriptivo se comunica al terminar.

## 32. Fase 9, únicamente F4: Actividades de seguimiento — 6 de noviembre de 2026

Inicio main limpio en 8f2221561f7d8b93103622666713db3145a0b514; spec-v1 en su hito original. Leídos AGENTS, README, especificación R2/R8/F4, plan y contrato/implementación A5. Plan actualizado antes del código. No hay cambios de contratos, backend, Laravel, permisos o dependencias. Resumen permanece sin implementar y la integración panel → SPA/revisión en pareja siguen pendientes.

### Implementación y recorrido

activities.js mantiene estado de formulario, lista/filtro, errores, aviso y operación en curso; sus funciones guardan solo tipo/descripcion y vence_en opcional. Fecha vacía se omite, no se envía null ni cadena vacía porque A5 los rechaza. El borrador y errores por campo se conservan al fallar, sin LocalStorage. El contador de listado y la generación de sesión descartan respuestas antiguas o posteriores al cierre. PATCH envía completada como booleano desde el estado confirmado del elemento, nunca vendedor_id. Se bloquea doble envío, se indican cargas y se recarga lista después de confirmar en API.

deadlineFromGuatemala valida el calendario de datetime-local y obtiene la correspondencia UTC con Intl.DateTimeFormat/formatToParts y timeZone America/Guatemala; no usa new Date de una cadena sin zona ni la zona local del equipo. Devuelve ISO UTC con Z, admitiendo pasado y sin imponer fecha mínima actual. formatDeadline usa la misma zona explícita para mostrar. La API mantiene la validación definitiva de tipo, descripción, ISO y cartera. El valor vencida se muestra directamente desde la respuesta, sin recalcularlo con el reloj de la SPA.

activities-view.js renderiza formulario/listas, mensajes, botones y estados con textContent; vencida se distingue con texto y borde rojo, completada deja de mostrarse vencida según API. index.html añade plantillas y botón Registrar actividad en ficha de cliente; clients-view.js integra el formulario allí. app.js delega submit/input/click y conecta el 404 con relectura de ficha/cartera; view.js integra Actividades. El 401 protegido y limpieza de sesión conservan api.js/session.js. Al perder un cliente se retira el recurso al actualizar, con aviso comprensible. Una revalidación de otra sesión no inicia nuevas consultas de cartera.

Registro: ficha → evento delegado → activities.save → conversión de fecha y POST /clientes/:id/actividades con lista explícita de campos → API authenticate/ownClient y transacción withPortfolio → INSERT con autor desde usuario autenticado → respuesta pública → estado, lista y render. Estado: botón → activities.toggle → PATCH /actividades/:id con booleano → API revalida dueño actual del cliente y conserva vendedor_id histórico → listado recargado. activities.js de API y el esquema no se modificaron.

### Comprobaciones ejecutadas

Comando desde raíz: node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/browser.test.mjs. Las ocho unidades nuevas pasaron 8/8. Primera completa: 31/32 con timeout del recorrido del propio test F4; segunda: 31/32 por una espera insuficiente del test F3 previo. Tras corregir ambos ejecutores, última completa **32/32, cero fallos**: 31 casos unitarios y un caso de navegador ampliado con múltiples controles F1–F4. No se suman ejecuciones. Node --check de módulos/servidor/pruebas correcto.

| Control | Evidencia y resultado |
| --- | --- |
| Alta de tipos | API real: llamada sin vencimiento, reunión futura y tarea pasada creadas desde ficha propia, con respuesta 201 y listado público |
| Validación | Descripción con solo espacios y selector de tipo manipulado reciben 422, errores junto al campo y vencimiento escrito conservado. Unidades verifican fechas imposibles/fuera de rango/sin hora y conservación del borrador |
| Fechas independientes del equipo | Edge configurado en Asia/Tokyo y getTimezoneOffset -540 confirmado. Entrada 2031-04-09 08:30 Guatemala devuelve 2031-04-09T14:30:00.000Z y se muestra 8:30 de Guatemala. Pasado 2020-01-15 10:45 devuelve 2020-01-15T16:45:00.000Z; vacío devuelve null desde API y se muestra Sin vencimiento |
| Lista/estado vencida | Lista vacía inicial, todas/pendientes/completadas. Tarea pasada pendiente vencida=true con aviso/borde; completar la elimina del filtro pendiente y en completadas no se presenta vencida; reabrir vuelve a vencida=true según API |
| Booleano/doble envío | PATCH real completa y reabre; unidad exige cuerpo booleano sin otros campos. Dos clics durante retraso de PATCH producen exactamente una petición; controles deshabilitados |
| Filtros atrasados | Dos GET realmente solapados: completadas termina mientras pendientes sigue esperando; pendientes termina después con 200 sin sustituir filtro/listado actual. Unidad también descarta respuestas de sesión anterior |
| Recursos ajenos | POST sobre cliente temporal ajeno y PATCH sobre actividad temporal ajena reciben 404, sin escritura |
| Reasignación | Después de cargar actividades propias se reasigna solo su cliente temporal a otro vendedor temporal. PATCH obsoleto recibe 404, lista actualizada sin esas actividades y aviso claro. Alta desde otra ficha temporal obsoleta recibe 404, reconsulta y retira la ficha y actualiza cartera |
| Autor histórico | Nuevo propietario inicia sesión y completa la tarea anterior. Consulta SQL de su fixture confirma completada=1 y vendedor_id del autor original, sin cambio de autoría |
| XSS/sesión | Descripción temporal con HTML malicioso mostrada como texto, sin imagen/ejecución. LocalStorage sigue limitado a token y usuario público; se conserva regresión F1–F3 |
| Interfaz | Capturas inspeccionadas de formulario con errores, listas pendientes/vencidas/completadas y pérdida de acceso en 1280/375 px; scrollWidth <= innerWidth comprobado en los estados capturados |

activities.test.mjs usa dobles para estado/contrato/transporte, fechas inválidas y 404. activities-browser.mjs ejecuta HTTP real contra las rutas/middleware A5 y MySQL de pruebas, con Edge existente; no simula las reglas de cartera, vencida ni fechas de la API. Los retrasos de red son deliberados para probar doble envío/orden de respuesta. La zona de Tokio se restaura al terminar. No se ejecutaron nuevas suites backend/panel, pues no cambió su código. No se confunden estas peticiones secuenciales con nuevas carreras transaccionales SQL.

### Errores reales del ejecutor y corrección

El nuevo helper F4 intentó buscar el siguiente cliente desde una ficha todavía abierta, sin volver a Mis clientes: timeout en detail(stale), primera completa 31/32. Se corrigió el recorrido para pulsar Mis clientes antes de actualizar y localizar la fila; la espera de estado terminado ahora exige que exista el formulario/listado de actividades, no la ausencia accidental de sus indicadores.

La siguiente ejecución expuso una espera insuficiente del test F3: el selector conservaba opciones previas mientras se cargaban las nuevas; el test añadía un cliente ajeno antes de que terminara la carga y el nuevo render retiraba esa opción artificial, cambiando el error esperado. Se corrigió únicamente la espera del test opportunities-browser.mjs para exigir que la carga de opciones haya terminado antes de manipularlo. No se cambió el contrato ni código aprobado de F3. Última completa 32/32. Ambos incidentes corresponden a código de pruebas generado por IA; el commit de F4 contiene sus correcciones. No se presentan como fallos funcionales de API ni se inventa otro incidente para completar una cuota.

### Conservación y pendientes

Antes de las pruebas se capturaron DATABASE(), CURRENT_USER(), permisos y huellas completas de todas las filas/columnas del núcleo de las tres bases. El auxiliar F4 exige crm_laravel_test limitado a crm_ferreteria_test antes de fixtures/limpieza; la API verifica crm_api_test y origen exacto http://127.0.0.1:5500. Se reutiliza el auxiliar Laravel de cuentas/hash temporales. Solo se crean/modifican clientes, actividades y cuentas propios; se limpian actividades por cliente propio/prefijo spa-f4 aleatorio, después clientes por ID/prefijo y cuentas por sus correos exactos. Se compara el contenido previo después de limpiar, también si falla un test.

Huella final y permisos idénticos a los iniciales en las tres bases:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Autoincrementales de pruebas pueden avanzar. Sin semillas, reinicios, fresh, truncados ni borrados generales. Perfiles temporales de Edge propios, retirados tras inspección; servidores y navegador cerrados por el ejecutor. Sin secretos ni tokens en documentación/capturas. README contiene inicio, URL, procedimiento manual/automatizado y archivos. Pendientes revisión en pareja, integración panel → SPA aún no comprobada y F5 pantalla de resumen; fase 9 completa pendiente. Commit descriptivo autorizado tras revisar secretos; sin push y conservando spec-v1.

Cierre: 223 archivos versionados/nuevos no ignorados contrastados en memoria con secretos de los seis perfiles locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas y variables exportadas de token/secret vacías. Los tres perfiles propios del navegador se retiraron tras inspección. Sintaxis y diff --check correctos. Solo frontend/ y README/plan/verificación entre los cambios preparados; sin entornos, temporales, dependencias ni archivos de API/Laravel. Autor existente conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166; el hash del commit descriptivo se comunica al cerrar.

## 33. Fase 9, únicamente F5: Resumen del vendedor — 6 de noviembre de 2026

Inicio main limpio en aa747c0589b8df455e988c0da39b9f73d130d6b5, spec-v1 en el hito documental. Leídos AGENTS, README, especificación R7/F5, plan, contrato y perfil/procedimiento A6 existente. Plan actualizado antes del código. F5 consume el mismo contrato, sin vendedor_id, cálculos propios de ventas/pronóstico, gráficas ni dependencias. No se modificaron API, Laravel, cuentas, permisos o datos.

### Implementación y alcance

summary.js inicia el mes mediante Intl y America/Guatemala. Su estado conserva mes solicitado, respuesta confirmada, carga y error. GET /reportes/resumen?mes= incluye únicamente el mes; un contador y generación de sesión descartan resultados/errores atrasados. Al iniciar una consulta se retiran cifras anteriores; solo se muestran datos cuyo mes coincida con la consulta. Al salir se invalida el resultado pendiente para no sobrescribir después la cartera de Clientes. Un reset de sesión descarta datos sin guardarlos en LocalStorage.

summary-view.js e index.html presentan selector, explicación mensual/pronóstico, ventas, total, pronóstico y cartera. Formatean quetzales y texto con textContent, sin aritmética de negocio ni datos privados. app.js delega change/submit, recarga al entrar desde Clientes/Oportunidades y limpia el módulo con la sesión; view.js conecta el render. clients.updateCapacity invalida su lectura anterior de ocupación al recibir el resumen nuevo; esa ocupación procede de API, no del número de filas filtradas en la lista.

La cuenta A6 existente tiene SELECT en users/clientes/oportunidades/oportunidad_productos, sin productos. En #resumen la restauración de sesión usa GET /reportes/resumen como comprobación protegida y después consulta el mes; las otras secciones conservan su comprobación anterior. No se amplían permisos ni se cambia contrato para acomodar la SPA. El servidor estático acepta SPA_API_BASE_URL como URL pública para servir config.js; por defecto conserva 3001. Solo expone esa constante, valida URL HTTP/HTTPS sin credenciales/query/hash y nunca publica el resto del entorno.

Recorrido: selector de index.html → change/submit delegado en app.js → summary.load → api.js añade Bearer y codifica mes → middleware/API calcula por vendedor autenticado con SQL de reports.js → respuesta numérica → estado con mes confirmado y ocupación compartida → summary-view.js presenta texto/quetzales. Los cálculos A6 de SQL no se modificaron.

### Ejecuciones y cifras reales

Comando desde raíz, exclusivamente de lectura: node --test --test-concurrency=1 frontend/tests/client.test.mjs frontend/tests/clients.test.mjs frontend/tests/opportunities.test.mjs frontend/tests/activities.test.mjs frontend/tests/summary.test.mjs frontend/tests/summary-browser.test.mjs. Última ejecución **41/41, cero fallos**: 31 unidades previas, nueve nuevas y un caso de navegador con múltiples controles reales A6. Node --check de módulos/servidor/pruebas correcto. No se ejecutó browser.test.mjs de escritura, ni suites de backend/panel ni preparación/semillas de A6. Esta etapa no es la revisión integral final.

summary-browser.test.mjs comprueba DATABASE()/CURRENT_USER()/SHOW GRANTS de crm_api_a6_test en crm_ferreteria_a6_test: solo USAGE y cuatro SELECT. El control de huellas usa el perfil Laravel A6 existente y solo SELECT. Recuentos iniciales comunes 7/5/21/11/13/43/4. API real en 3002, frontend en 5500 mediante configuración pública y CORS exacto http://127.0.0.1:5500. El servidor de pruebas rechaza métodos de escritura de negocio y verifica que solo hubo GET/OPTIONS y POST de login. No se crean fixtures, ni se modifica ninguna base.

| Vendedor / mes | Ventas | Total | Pronóstico | Cartera | Resultado |
| --- | ---: | ---: | ---: | ---: | --- |
| Valeria / 2026-10 | 2 | Q9,250.00 | Q2,512.88 | 3/10 | Aprobado, interfaz y API A6 reales |
| Valeria / 2026-11 | 1 | Q3,600.00 | Q2,512.88 | 3/10 | Aprobado, mismo pronóstico |
| Diego / 2026-10 | 1 | Q6,000.00 | Q112.50 | 2/10 | Aprobado, interfaz y API A6 reales |
| Carlos / 2026-10 | 1 | Q7,200.00 | Q4,125.75 | 9/10 | Aprobado, interfaz y API A6 reales |

| Control | Evidencia y resultado |
| --- | --- |
| Ceros | Valeria enero 2099: ventas 0 y Q0.00, pronóstico Q2,512.88 y cartera 3/10. La semilla conserva abiertas y no se inventa un pronóstico cero. Todos los campos en cero se cubren con doble de respuesta en unidad |
| Mes inválido | Selector vacío provoca 400 real con aviso y cifras ocultas. GET directo autenticado mes=2026-13 devuelve 400. El navegador no permite escribir ese mes imposible en type=month, por eso se distinguen los dos casos |
| Carga/mes confirmado | Al solicitar otro mes desaparecen las cifras anteriores. La vista de éxito etiqueta mes de data.mes; una respuesta de mes diferente se rechaza en unidad. Falla de conexión no deja datos anteriores bajo el selector nuevo |
| Respuestas atrasadas | GET octubre retrasado deliberadamente queda pendiente mientras noviembre ya se muestra; octubre termina después con 200 sin sustituir noviembre. Unidades cubren también error atrasado, cierre de sesión y salida hacia Clientes |
| Conexión | Red del navegador desactivada: aviso comprensible y resultados ocultos, conservando diciembre seleccionado; al reconectar se consulta de nuevo. No es una caída real de MySQL |
| Sesión | Recarga válida en #resumen funciona sin GET productos. JWT realmente vencido guardado solo en perfil temporal: recarga recibe 401 de API, limpia sesión y vuelve al acceso con aviso |
| Mes Guatemala | Navegador en Asia/Tokyo y reloj de página simulado a 2026-11-01T02:30:00Z: el mes local de Tokio es noviembre y el selector de Guatemala inicia octubre. No se cambian reloj del equipo/API/MySQL ni fechas de la semilla |
| Actualización/cartera | Regreso desde Clientes y desde Oportunidades genera cada vez otro GET del mes seleccionado; indicador Clientes coincide con 3/10. Unidad comprueba que una ocupación pendiente antigua no sustituya la recibida del resumen, ni una respuesta de Resumen se publique después de salir |
| Presentación | Capturas de cifras comunes, ceros y error de conexión inspeccionadas a 1280 y 375 px; scrollWidth <= innerWidth comprobado. Todo se muestra como texto; no se recalculan cifras ni se envía dueño |

### Incidencia real de pruebas y corrección

Las primeras 39 unidades pasaron. La primera ejecución con navegador terminó 39/40: la aserción del servidor esperaba 200 del GET retrasado, pero Express respondió 304 porque el navegador ya tenía el resultado en caché. La aplicación recibió correctamente su cuerpo mediante fetch; no fue un error funcional del resumen ni de sus cifras. Se desactivó únicamente la caché del navegador de pruebas con Network.setCacheDisabled para acreditar el orden de respuestas HTTP reales; segunda ejecución 40/40. Después se añadió la invalidación al salir de Resumen y su prueba para proteger cartera compartida; ejecución final 41/41. No se suman ejecuciones ni se inventan fallos adicionales. El commit de esta etapa incluye el ajuste del ejecutor.

### Conservación y pendientes

Huellas completas de todas las filas/columnas del núcleo y permisos de control iguales antes/después en las tres bases:

| Base | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Esta etapa no hizo escrituras SQL ni creó cuentas/fixtures: sin semillas, reinicios, fresh, truncados o borrados. Se conservaron principal, revisión manual y A6. Edge y servidores propios cerrados al terminar; perfiles temporales retirados después de inspeccionar capturas. Sin credenciales o JWT en evidencias. README contiene inicio de A6 3002, configuración pública, URL /#resumen, regreso a 3001, Ctrl+C, comandos y archivos.

F5 implementado y comprobado en su alcance. Pendientes revisión integral final, revisión en pareja e integración panel → SPA aún no comprobadas; fase 9 no se declara cerrada. Commit descriptivo autorizado tras revisar secretos; sin push ni cambios de spec-v1.

Cierre: 227 archivos versionados/nuevos no ignorados contrastados en memoria con secretos de los seis perfiles locales, sin coincidencias. Literal público de semilla solo en ubicaciones permitidas y variables exportadas de token/secret vacías. Tres perfiles propios de navegador retirados tras inspección. Sintaxis y diff --check correctos. Solo frontend/ y README/plan/verificación preparados; sin entornos, temporales, dependencias ni archivos de API/Laravel. Autor existente conservado. spec-v1 mantiene objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y commit bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166; el hash del commit descriptivo se comunica al cerrar.

## 34. Revisión integral Laravel + API + SPA — 6 de noviembre de 2026

Inicio main limpio en ac75526da673d5fe505c4945fc1498e97e85e83e. Leídos AGENTS, README, especificación, plan, verificación, protocolo y entregables del PDF, páginas 20–21. Plan actualizado antes de implementar pruebas/correcciones. Sin funcionalidades nuevas, dependencias, cambios de contrato/esquema o permisos del servidor existente; dos incumplimientos comprobados se corrigen abajo. No se hace push ni etiqueta de entrega.

### Bases, servidores y aislamiento

Se capturaron antes de escribir DATABASE(), CURRENT_USER(), permisos y huellas de todas las filas/columnas de las siete tablas en las tres bases existentes. El recorrido nativo usa panel PHP 8001, API Express 3001 y SPA 5500 sobre crm_ferreteria_test/127.0.0.1:3306. Antes de crear fixtures, el panel comprueba por petición crm_laravel_test@127.0.0.1 y la API confirma crm_api_test@127.0.0.1; ambos seleccionan la misma base. CORS exacto http://127.0.0.1:5500. Router exclusivo de pruebas en laravel/tests/Support/review-router.php, no añadido a rutas de la aplicación; entorno local con sesiones/cookies/CSRF reales. Solo publica un encabezado técnico de identidad sin secretos durante ese servidor propio. Sus sesiones PHP se guardan en un directorio temporal propio.

La suite histórica Laravel exige tablas vacías y no se ejecutó contra datos manuales. run-isolated.mjs usa el binario MySQL 8.4 ya instalado y otro proceso temporal en 3307, sin instalar servicio ni cambiar MySQL84/3306. Verifica puerto libre y @@datadir; crea en esa instancia propia crm_ferreteria_test y su cuenta limitada, aplica migrate ordinario y genera configuración phpunit temporal con puerto 3307. Pruebas y workers heredan ese puerto, conservando los tests aprobados sin alterar sus reglas. Root de esa instancia se protege inmediatamente con una clave aleatoria en memoria; no se usa root del servidor existente. Al terminar hace SHUTDOWN y retira solo el directorio propio bajo cache/data, comprobado dentro de ese ámbito. Sin fresh, reset, truncados ni borrados de bases existentes. Se creó una instancia nueva de pruebas, no una copia que sustituyera el servidor manual.

### Recorridos HTTP reales de navegador

integration-browser.test.mjs usa Edge existente y cuatro contextos separados: administrador, supervisor y dos vendedores. Las cuentas iniciales del auxiliar son temporales; los dos vendedores del recorrido se crean desde formularios reales del panel y Laravel genera sus hashes. No se reutilizan identidades manuales ni se copia la contraseña pública a pruebas. Se verificó:

| Caso | Evidencia y resultado |
| --- | --- |
| INT-01/05: cuenta y asignación | Administrador crea vendedores con supervisor activo; ambos entran en SPA/API verificando hash real. Supervisor asigna disponible a su vendedor; volver a Clientes muestra cartera sin recarga manual después de IA-15 |
| Roles | Supervisor GET /cuentas y POST /cuentas con CSRF válido reciben 403. Suites Laravel/API revalidan permisos directos, propios, equipo y cuentas inactivas; ocultar enlaces no es la autorización |
| Flujo de venta | Cliente creado en panel → ficha de SPA → oportunidad prospecto → producto → avances calificado/propuesta/negociación → confirmación ganada → resumen con 1 venta/Q61.70. Reporte del panel muestra esa misma venta del fixture |
| INT-03: catálogo | Producto creado en panel a Q12.34 y mínimo 5: cantidad 1 rechazada, 5 aceptada. Panel cambia a Q20.00/mínimo 10/inactivo: línea previa conserva Q12.34 y total Q61.70; editar a 6 rechaza mínimo 10. Se cierra sin invalidar la línea anterior. Otra oportunidad no muestra el inactivo; reactivar desde panel permite cotizar 10 al nuevo precio Q20.00 |
| Reasignación | Supervisor mueve cliente entre sus dos vendedores; cartera anterior queda sin él y la nueva lo muestra. SQL y SPA confirman abierta transferida y ganada conservada por vendedor original. Las consultas de archivo histórico siguen limitadas a id/nombre del cliente |
| Actividades | Vendedor original registra tarea desde ficha; nuevo propietario la consulta y completa tras reasignar. SQL confirma autor original y completada=1; antiguo propietario ya no la lista. Se conserva el protocolo y control de cartera actual |
| INT-04: estado/rol | Administrador desactiva vendedor A desde panel y cambia B a supervisor: la siguiente petición con cada JWT ya emitido recibe 401; SPA elimina LocalStorage y muestra acceso con aviso |
| Navegación/actualización | Recarga al entrar a Clientes y revalidación de ficha; Oportunidades, Actividades y Resumen conservan sus recargas. Regresión frontend mantiene filtros/respuestas atrasadas, dobles envíos, formularios recuperables, XSS y sesión vencida/logout |

### Suites y colección ejecutadas

| Ejecución | Destino | Resultado final |
| --- | --- | --- |
| node laravel/tests/run-isolated.mjs | MySQL temporal propio 3307, esquema nuevo | 270 pruebas, 2.633 aserciones, cero fallos |
| npm.cmd test desde api/ | Perfiles testing 3306 y A6 para cifras comunes | 185/185, cero fallos |
| Suite frontend completa del README | Perfiles testing/A6 y servidores propios | 46/46: 43 unidades y tres casos de navegador con múltiples controles |
| Laravel afectado tras corrección Blade | Instancia nueva temporal 3307 | OpportunityReportsTest: 31 pruebas, 232 aserciones, cero fallos |
| Integral afectado tras corrección Blade/captura | crm_ferreteria_test 3306, fixtures nuevos propios | 1/1; ancho solicitado 1280/375 confirmado |
| Compilación y formato | Recursos del panel/router nuevo | npm.cmd run build, Pint y sintaxis aprobados |

La suite frontend completa usa node --test --test-concurrency=1 con client.test.mjs, clients.test.mjs, opportunities.test.mjs, activities.test.mjs, summary.test.mjs, browser.test.mjs, summary-browser.test.mjs e integration-browser.test.mjs. La corrección de cartera fue seguida por la suite completa; la posterior corrección exclusivamente Blade por los tests Laravel afectados y el recorrido integral con capturas estrictas. No se suman ejecuciones repetidas al informar recuentos.

La colección se ejecutó mediante sus cuatro bloques existentes dentro de npm test, HTTP TCP y scripts pm en vm; no Postman gráfico ni Newman:

| Bloque | Peticiones | Comprobaciones |
| --- | ---: | ---: |
| A1/A2/A3 | 36 | 109 |
| A4 | 38 | 118 |
| A5 | 25 | 82 |
| A6 | 9 | 27 |
| Total | 108 | 336 |

Cobertura estática adicional: 20/20 rutas obligatorias presentes, sin faltantes. API reejecuta cinco carreras API/API de cartera/duplicados, cuatro API/panel y cinco de oportunidades, con barreras, conexiones distintas y resultados de un éxito/un conflicto (diez tomas: un 200 y nueve 409). Laravel ejecutó sus cinco carreras en la instancia temporal, también realmente solapadas. Se conservan GET_LOCK/FOR SHARE en API y FOR UPDATE del panel, liberación antes del pool y descarte de conexiones inciertas. Los mensajes «Error interno de API: Error» y TEST_HISTORY en npm test son inyecciones deliberadas de los casos existentes de 500/rollback; no nuevos fallos de producción. Los controles A6 de Valeria octubre/noviembre, Diego y Carlos volvieron a aprobarse sin resembrar esa base.

### Hallazgos reales de IA y correcciones

| Caso | Detección y evidencia anterior | Corrección y verificación |
| --- | --- | --- |
| IA-15: Clientes obsoleto al volver | El recorrido integral sin pulsar Actualizar listas agotó su espera: el cliente asignado en panel no aparecía después de ir a Oportunidades y regresar. hashchange solo renderizaba la memoria anterior | clients.enter reconsulta listas/cupo y revalida ficha/edición; app.js lo invoca al entrar. Tres unidades nuevas y recorrido real sin recarga manual pasan, incluida sesión terminada durante la revalidación |
| IA-16: filtro de vendedor desborda a 375 px | Inspección de captura panel-oportunidades-375: PNG de 524 px de ancho para viewport solicitado 375. Selector con ancho intrínseco y nombres largos; comparación anterior scrollWidth <= innerWidth no detectaba viewport móvil expandido | Wrappers min-w-0/w-full y selects w-full/max-w-full en Blade; recompilación. Captura espera fuentes/layout y compara contra el ancho solicitado. PNG final de 375 px y pruebas Laravel afectadas/integración aprobadas |

Ambos hallazgos proceden del código generado para F2/L6 y se corrigen en el commit de cierre de esta sección; no representan nuevos requisitos ni se inventa un tercer caso. El primer arranque del nuevo test integral falló por buscar main form en el login Blade, que no contiene main; se corrigió únicamente ese selector del ejecutor. No se presenta como fallo funcional del login. La ejecución inicial con recarga manual había pasado, pero no acreditaba volver sin recarga; se añadió el caso preciso antes de corregir IA-15.

P5 ya contiene más de tres errores reales con commits correctivos: IA-11/12/13 → 055398aead74b337d50b5ee5b6d81576ca320ac5; IA-14 → e7299702a56ed880c2238767d2dc183869d2c427. El hash de este cierre identificará IA-15/16 al terminar; no se inventa un hash antes de crearlo.

### Inspección visual y límites humanos

Se inspeccionaron capturas reales de las aplicaciones ejecutadas en Edge sin interfaz, a 1280/375 px: formularios de cuentas, productos, clientes y confirmación de asignación; listas y navegación de clientes/cuentas/catálogo; Mi equipo, oportunidades y reportes; resumen y actividades de la SPA. La regresión de los módulos conserva además sus capturas de validación, cierre y conexión. Contraseñas vacías y ausencia de hashes comprobadas antes de capturar. Las tablas del panel se desplazan dentro de sus contenedores; la página y filtros caben en 375 tras IA-16. No se exige que todas las columnas sean visibles a la vez.

Esto acredita automatización y una inspección de capturas ejecutada por el agente, no una sesión de revisión en pareja. Postman gráfico, interacción humana en sus navegadores, accesibilidad completa y una reinstalación en otra computadora no se declaran realizados. La revisión visual no puede por sí sola acreditar autorización ni concurrencia; esas evidencias vienen de peticiones/suites.

### Conservación, entregables y pendientes

Huellas finales de todas las filas/columnas del núcleo y permisos de control exactamente iguales antes/después en las tres bases existentes:

| Base existente en 3306 | Cuentas | Productos | Clientes | Oportunidades | Líneas | Historial | Actividades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| crm_ferreteria | 11 | 10 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_test | 12 | 11 | 28 | 17 | 19 | 62 | 8 |
| crm_ferreteria_a6_test | 7 | 5 | 21 | 11 | 13 | 43 | 4 |

Autoincrementales de fixtures en testing pueden avanzar. Los ejecutores verifican destino/permisos antes de limpiar y retiran exclusivamente cuentas por correo exacto y registros propios por ID/prefijo aleatorio; no eliminan datos manuales. Instancias/servidores/navegadores propios cerrados, MySQL temporal y sus directorios retirados; perfiles de capturas se retiran después de inspección. No se modificaron perfiles, servicio existente, permisos ni semillas de las tres bases. Las sesiones/cachés ordinarias ignoradas de Laravel no forman parte del commit.

Entregables del enunciado presentes: README, AGENTS, .gitignore, especificación/plan/verificación y colección, laravel/api/frontend, manifiestos/lockfiles y ejemplos sin secretos. spec-v1 no contiene aplicaciones y es ancestro del código; conserva objeto e52929d8837fc9c2d46dcbff258760c4e505ba9e y destino bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. La matriz inicial se actualizó con evidencias actuales R/L/A/F/S/P e INT/CON/SEC, manteniendo límites de A8 y tareas humanas.

Pendientes concretos: revisión en pareja y ensayo de defensa de 15 minutos, Postman gráfico, confirmar el registro del aula, contribuciones reales de ambos integrantes, acceso del catedrático al repositorio y preparar el hito entrega-final solo cuando se autorice. Git muestra únicamente autor Raul Soto y ningún remoto; no se atribuye trabajo a Diego ni se configura acceso externo. Cambio de requisito/spec-v2 solo cuando se publique. La defensa con solo VerificacionSeeder requiere preparar aparte un entorno exclusivo autorizado; no se reinició una base existente para ello. Se detiene esta etapa después del commit descriptivo, sin push ni etiqueta de entrega.

Revisión previa al commit: 230 archivos versionados o candidatos comprobados contra secretos reales de los perfiles locales; ningún hallazgo. La contraseña pública permanece únicamente en los archivos permitidos. Se excluyen .env, dependencias, compilados y temporales; los nueve perfiles de navegador propios se retiraron tras inspeccionar sus capturas. Sin cambios de dependencias ni lockfiles. git diff --check aprobado. El commit incluye solo las dos correcciones descritas, pruebas/auxiliares de revisión y documentación.
