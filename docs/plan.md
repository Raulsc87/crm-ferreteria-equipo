# Plan de trabajo del CRM Ferretería

Equipo: Raúl y Diego. Estado: esquema y ambas semillas verificados, datos cargados en desarrollo; base de pruebas preparada para revisión manual y con sus datos existentes conservados. L2 a L7 implementados y verificados, con controles comunes de cartera contrastados entre panel y API. API A1–A6 implementada y revisión automática A7/A8 de API aprobada; veinte endpoints cubiertos. SPA F1–F5, integración panel → API → SPA y capturas inspeccionadas aprobadas; revisión en pareja, Postman gráfico y entrega pendientes. Fecha inicial: 30 de octubre de 2026. Última revisión: 6 de noviembre de 2026.

Este plan se actualiza antes de cada fase. La fase solicitada limita el trabajo del agente; no se ejecutan todas las fases en una sola instrucción.

Etapa de entorno completada (1 de noviembre de 2026): instalación de Composer con el PHP 8.4.24 existente y MySQL Community Server 8.4 LTS mediante MSI oficial. La contraseña fue introducida exclusivamente por el usuario en el instalador. Resultados y límites en la sección 10 de docs/verificacion.md.

Hito documental completado: spec-v1 anotada apunta a bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166, verificado antes de crear código.

Etapa Laravel/Breeze completada: esqueleto y formulario sin registro público, configuración temporal y compilación; comprobaciones de alcance limitado en verificacion.md, sección 12. Avance guardado mediante el único commit autorizado ad95384d12d8f92fa258bd132fef87b742ae5d4f; spec-v1 permanece en el hito documental original.

Etapa de conexión completada: crm_ferreteria creada tras comprobar que no existía, sin tablas; usuario técnico local crm_laravel con SELECT/INSERT/UPDATE/DELETE únicamente sobre esa base; .env real excluido de Git. SELECT 1 y DATABASE() verificados desde Laravel. Root se introdujo solo en una ventana local enmascarada; su contraseña no se guardó y la contraseña técnica aleatoria está solo en .env. Sin migraciones, seeders, tablas o cuentas del CRM, módulos, API o SPA. No se hizo otro commit, nuevas etiquetas ni push. Resultados e incidencias reales en verificacion.md, sección 13.

- [x] Instalar Composer para el usuario actual y comprobar su versión con PHP 8.4.24: Composer 2.11.1 verificado.
- [x] Completar el MSI y MySQL Configurator y verificar versión del servidor, servicio MySQL84 y puerto local: MySQL Community Server 8.4.13; servicio Running con inicio automático; respuesta local verificada en 127.0.0.1:3306. Protocolo X limitado a 127.0.0.1:33060. La contraseña fue introducida por el usuario en el asistente; no se verificó acceso autenticado desde el proyecto.
- [x] Crear la base Laravel 13/Breeze Blade sin scripts automáticos ni migraciones; configurar MySQL previsto y almacenamiento temporal en archivos; compilar recursos y comprobar login HTTP y ausencia de registro público. Evidencia en verificacion.md, sección 12.
- [x] Autorizar y comprobar la conexión autenticada de Laravel a crm_ferreteria: SELECT 1 correcto y cero tablas. Evidencia en verificacion.md, sección 13.
- [x] Autorizar el esquema sin semillas, revisar permisos mínimos y crear una base separada de pruebas.
- [x] Aclarar el uso de migrate, aplicar las diez migraciones y verificar estructura y restricciones: 40 casos, 61 aserciones. API/SPA y pruebas de los demás módulos siguen pendientes; L2 se verificó posteriormente.

## 1. Arquitectura y estructura prevista

El panel Laravel y la API Express acceden a la misma base MySQL. El panel renderiza vistas Blade para administrador y supervisor; la SPA del vendedor consume la API con JWT. Solo Laravel administra migraciones, seeders y creación de cuentas.

| Ubicación | Responsabilidad |
| --- | --- |
| laravel/ | Migraciones, seeders, modelos Eloquent, solicitudes validadas, autorización, controladores y vistas Blade |
| api/src/ | Configuración, conexión mysql2, rutas, autenticación, controladores, servicios transaccionales, consultas SQL y serialización |
| frontend/index.html | Entrada de la SPA |
| frontend/css/ | Estilos del vendedor |
| frontend/js/ | Sesión, cliente HTTP, estado, render y eventos por funcionalidad |
| docs/ | Enunciado, especificación, plan, evidencias, bitácora y colección de Postman |

La estructura interna se mantiene simple: rutas/controladores reciben peticiones; los servicios aplican reglas y transacciones; las consultas realizan acceso parametrizado; los serializadores determinan el JSON público. La separación no introduce paquetes ni abstracciones innecesarias.

## 2. Responsables propuestos

La distribución es una propuesta de organización, revisable por el equipo. No demuestra trabajo realizado ni reemplaza la responsabilidad individual sobre todo el código.

| Área | Responsable principal propuesto | Revisión cruzada |
| --- | --- | --- |
| Especificación, regla y decisiones | Raúl y Diego | Ambos |
| Migraciones, semillas, cuentas y catálogo Laravel | Raúl | Diego |
| Clientes, asignación, equipos y reportes Laravel | Diego | Raúl |
| Autenticación y clientes API | Raúl | Diego |
| Oportunidades, actividades y reportes API | Diego | Raúl |
| Sesión, cartera y resumen SPA | Raúl | Diego |
| Embudo y actividades SPA | Diego | Raúl |
| Integración, pruebas, documentación y defensa | Raúl y Diego | Ambos |

Cada integrante realiza sus propios commits sobre cambios que revisó y puede explicar. No se cambia el autor de un commit para simular participación.

## 3. Fases y tareas

| Fase | Tareas | Responsable | Encargo a la IA | Condición de salida |
| --- | --- | --- | --- | --- |
| 0. Documentación y Git | Revisar especificación y decisiones; ajustar plan/AGENTS; comprobar registro del sector; preparar repositorio; guardar especificación y spec-v1 | Ambos | Revisar coherencia entre enunciado, requisitos y decisiones; señalar contradicciones sin programar | Documentos revisados, commit documental y etiqueta spec-v1 anteriores al código de negocio |
| 1. Entorno | Comprobar PHP, Composer, Node, npm, Git y MySQL; preparar Laravel 13/Breeze Blade y acceso a MySQL cuando se autorice; definir puertos y orígenes | Raúl, revisa Diego | Primero inspección sin cambios; después preparar solo dependencias/estructura autorizadas y explicar comandos | Versiones verificadas; Laravel base y MySQL conectados; .env excluido; todavía sin adelantar módulos del negocio |
| 2. Esquema y semillas | Extender users con nueva migración; crear núcleo y cantidad_minima; FKs/UNIQUE/CHECK; VerificacionSeeder exacto y SectorSeeder posterior | Raúl, revisa Diego | Traducir modelo a migraciones/semillas sin alterar datos comunes; mostrar reglas protegidas por cada restricción | Base nueva de pruebas reproducible con cada modalidad de semilla; recuentos e integridad comprobados |
| 3. Panel: acceso y catálogo | Breeze login/logout sin registro; roles y cuenta activa; cuentas administradas; catálogo y mínimo de venta | Raúl, revisa Diego | Implementar L2/L3 y controles de acceso, sin añadir registro ni borrar cuentas/productos | Roles correctos, cierre de sesiones desactivadas y validaciones verificadas |
| 4. Panel: clientes y equipos | Listas, búsqueda, filtros, altas/ediciones, asignación, reasignación y liberación; cartera y visibilidad | Diego, revisa Raúl | Implementar L4/L5 con la política acordada y protocolo de bloqueo común para cartera | Reglas R2/R3/R4 iguales en el servidor; acciones ajenas bloqueadas y casos simultáneos cubiertos |
| 5. API: acceso y cartera | Estructura Express 5; conexión mysql2; CORS; login/JWT; usuario activo; errores JSON; clientes y productos; primeras peticiones Postman | Raúl, revisa Diego | Implementar A1/A2/A3 por partes con SQL parametrizado, DTO de respuesta explícito y contrato exacto | Login con hash Laravel, roles/token probados, cartera atómica y errores documentados |
| 6. Primera integración | Crear entrada mínima de SPA, sesión y cartera; probar asignación panel → cartera SPA | Ambos | Implementar el tramo mínimo real navegador/API/base y diagnosticar CORS y origen | Cliente asignado desde panel visible al vendedor correcto sin datos ajenos |
| 7. API: oportunidades y actividades | Oportunidades, líneas, transiciones, historial, fechas; actividades; regla del mínimo; completar peticiones Postman | Diego, revisa Raúl | Implementar A4/A5/A7 sin permitir precio o dueño aportado por el vendedor; añadir casos del mínimo | Oportunidad y actividad completas, bloqueo de cerradas, historial atómico y regla sectorial verificados |
| 8. Reportes en ambas puertas | SQL API para resumen; consulta Laravel por empresa/equipo, vendedor y producto; selector mensual Guatemala | Diego, revisa Raúl | Implementar A6/L6 y explicar frontera UTC/Guatemala y precio guardado | Cifras exactas de VerificacionSeeder en ambas puertas; venta ganada desde API/SPA aparece en panel |
| 9. SPA completa | Cartera con formulario/errores; tablero y cerradas; líneas y cambios de etapa; actividades; resumen; carga, fallos y responsive | Ambos según área | Completar F1–F6 con módulos, estado → render, eventos delegados y texto escapado | Flujo completo en escritorio y 375 px, mensajes claros y fechas/quetzales correctos |
| 10. Verificación y entrega | Colección completa, seguridad, concurrencia, matriz de criterios, bitácora real, README reproducible, revisión cruzada y ensayo | Ambos | Ejecutar y documentar solo pruebas reales; corregir discrepancias con el contrato antes de retos opcionales | Requisitos cubiertos; ambos explican cualquier parte; commit y etiqueta entrega-final creados cuando se autoricen |

Las fases de Laravel pueden adaptarse al avance de clase, sin omitir requisitos ni dejar toda la integración para el final. Preparar el entorno en paralelo a la especificación no autoriza implementar negocio antes de spec-v1.

## 4. Lista inmediata de trabajo

Fases 6/9/10 — revisión integral autorizada sobre ac75526da673d5fe505c4945fc1498e97e85e83e: recorridos reales de navegador Laravel/API/SPA con fixtures propios, cuentas/rol/estado, asignación y reasignación, cotizaciones/históricos, actividades y resumen. Corregir solo incumplimientos comprobados. Conservar las tres bases y registros manuales; comprobar identidades y huellas antes/después. Suite Laravel histórica necesita tablas vacías: usar instancia MySQL temporal local del binario instalado en otro puerto, sin cambiar servicio ni bases existentes, migraciones ordinarias sobre esa instancia y pruebas sin fresh/reset/truncados. API/frontend/colección con procedimientos existentes y limpieza exclusiva de fixtures propios. Inspección 1280/375 px y entregables documentales; no declarar Postman gráfico ni revisión en pareja realizados. Commit descriptivo autorizado al pasar; sin push, entrega-final ni cambios de spec-v1.

Fase 9. SPA completa — solo F5 autorizado sobre aa747c0589b8df455e988c0da39b9f73d130d6b5: resumen con mes inicial de Guatemala, GET con mes, ventas/total/pronóstico/cartera desde API, quetzales, cargas/ceros/errores y descarte de respuestas atrasadas. Ocultar datos anteriores mientras se consulta y etiquetar el mes confirmado. Recargar al entrar/cambiar mes y compartir ocupación con Clientes. Verificar cifras comunes mediante perfil A6 existente, solo lecturas, sin semillas ni fixtures nuevos; comprobar 1280/375 px, otra zona horaria, conexión y sesión. El perfil A6 no tiene SELECT productos: #resumen usará el endpoint de resumen para verificar la sesión al recargar. Mantener revisión integral, pareja e integración pendientes. Commit descriptivo autorizado al pasar; spec-v1 intacta y sin push.

Fase 9. SPA completa — solo F4 autorizado sobre 8f2221561f7d8b93103622666713db3145a0b514: registro desde detalle de cliente, listado/filtros, cambio booleano de completada, vencida desde API y fechas interpretadas/mostradas en America/Guatemala independientemente del equipo. Reutilizar estado/render/eventos/API/sesión; conservar borradores, evitar doble envío y respuestas atrasadas, actualizar vistas ante pérdida de cartera/404. Probar API real con fixtures propios y capturas 1280/375 px, conservar bases/registros manuales. Sin pantalla de resumen ni dependencias nuevas; revisiones en pareja e integración panel → SPA siguen pendientes. Commit descriptivo autorizado al pasar; spec-v1 intacta y sin push.

Fase 9. SPA completa — solo F3 autorizado sobre 8c7b0a370c127071879ab2309f9d548d0caeca6b: embudo con cuatro columnas abiertas y lista de cerradas, filtro por etapa, creación desde cartera, detalle/título, líneas con precio histórico e historial, transiciones y confirmación de cierre. Reutilizar sesión/API, estado → render y eventos delegados; invalidar respuestas atrasadas y bloquear doble envío. Probar API real con fixtures propios, preservar las tres bases y revisar 1280/375 px. Sin actividades ni pantalla de resumen; revisión en pareja e integración panel → SPA pendientes. Commit descriptivo autorizado al pasar; sin push ni cambios de spec-v1.

Fase 6. Primera integración — etapa Clientes/cartera autorizada: completar F2 y los estados F6 de este módulo sobre la base e7299702a56ed880c2238767d2dc183869d2c427. Reutilizar sesión/cliente HTTP, estado → render y eventos delegados. Listar/buscar, detalle, crear/editar y tomar disponibles; ocupación desde resumen sin pantalla de reportes. Ignorar búsquedas atrasadas, conservar formularios y proteger doble envío. Verificar con API real y navegador en 1280/375 px, usando solo fixtures propios en pruebas y retirándolos según el protocolo existente. Sin módulos de oportunidades/actividades/reportes, reinicios, cambios del contrato ni dependencias nuevas. Actualizar evidencias y guardar commit descriptivo al pasar; spec-v1 intacta y sin push. La comprobación completa de asignación desde la interfaz del panel sigue pendiente salvo evidencia específica.

Fase 6. Primera integración — primera etapa SPA autorizada: crear frontend/ con HTML, Bootstrap 5.3 local y módulos JS; acceso real de vendedores, solo sesión en LocalStorage, cliente API compartido y navegación de secciones aún sin módulos. Cubrir F1 y base F6 con estado → render, eventos delegados, carga/errores y texto seguro. Configuración pública de API 3001, origen 127.0.0.1:5500 igual a CORS. Restaurar sesión consultando GET /productos solo para verificar acceso vigente, sin mostrar ni guardar catálogo. Pruebas sin escrituras de negocio contra MySQL de pruebas y navegador existente, sin dependencias de pruebas nuevas. Mantener pendientes cartera/asignación panel → SPA de la propia fase 6, F2–F5, fase 9 y revisión gráfica no ejecutada. Commit descriptivo autorizado al pasar; sin push ni cambios de spec-v1.

Etapa A7/A8 autorizada (6 de noviembre de 2026): contrastar veinte endpoints, formatos/errores, JWT, aislamiento, SQL/CORS y transacciones/liberación de bloqueos con contrato y enunciado. Corregir solo incumplimientos reproducidos, sin dependencias ni reorganizaciones; usar el procedimiento automatizado existente y añadir únicamente casos que cubran faltantes reales. Verificar perfiles antes de escribir, preservar huellas de principal/revisión manual y usar A6 aislada para controles comunes. Actualizar colección/README/evidencias, mantener revisión gráfica pendiente y guardar un commit descriptivo al pasar. Sin SPA, cambios innecesarios de permisos, push ni cambios de spec-v1.

Etapa A6 autorizada: GET /api/reportes/resumen, vendedor desde middleware, mes de Guatemala y límites UTC inclusivo/exclusivo. Agregaciones SQL decimales por oportunidad para ventas/total/pronóstico sin multiplicar recuentos; cartera actual separada y crédito histórico conservado. Reutilizar permisos de lectura. Verificar cifras comunes de VerificacionSeeder, aislamiento, fechas/frontera, meses inválidos/vacíos y precios históricos sin reiniciar bases ni alterar datos manuales. El usuario eligió preparar otra base aislada con solo VerificacionSeeder, conservando la base de revisión manual. Crear crm_ferreteria_a6_test con cuentas técnicas independientes, aplicar migraciones sin fresh y cargar únicamente la semilla común si está vacía; no reiniciar bases existentes; ampliar Postman y mantener revisión gráfica pendiente. Commit autorizado al aprobar: feat: implementar resumen mensual del vendedor en API. Sin SPA, push ni cambios de spec-v1.

Etapa A5 autorizada: tres rutas de actividades, acceso por cartera actual conservando autor, fechas ISO con zona convertidas a UTC, vencida calculada al responder y PATCH booleano estricto. Reutilizar autenticación, SQL parametrizado, errores y bloqueo usuario, luego cliente y actividad. Conceder solo SELECT/INSERT/UPDATE sobre actividades a cada cuenta API en su propia base. Probar en crm_ferreteria_test sin reinicios, preservando datos manuales y principales; ampliar Postman y mantener revisión gráfica pendiente. Commit autorizado tras aprobar: feat: implementar actividades de seguimiento en API. Sin resumen mensual, SPA, push ni cambios de spec-v1.

Etapa A4 autorizada: ocho rutas de oportunidades y productos cotizados; SQL parametrizado, propietario desde JWT, archivo histórico limitado a id/nombre del cliente, transiciones e historial atómicos y cotizaciones inmutables al cierre. Usar FOR SHARE sobre users/productos, cliente antes de oportunidad, comprobar estado observado bajo bloqueo para conflictos simultáneos y mantener permisos mínimos por tabla. Pruebas solo en crm_ferreteria_test con limpieza exclusiva de fixtures propios, conservando datos manuales y principales. Ampliar Postman y evidencias; revisión gráfica pendiente. Commit autorizado solo al pasar: feat: implementar oportunidades y productos cotizados en API. Sin actividades, resumen mensual, SPA, push ni cambios de spec-v1.

Etapa A3 autorizada: seis rutas contractuales de clientes (incluidas /:id/tomar y /:id), cartera máxima diez, R4 igual al panel, SQL parametrizado y permisos limitados a SELECT/INSERT/UPDATE en clientes. Conservar registros manuales y base principal; verificar carreras API/API y API/panel, ampliar colección y documentar revisión gráfica pendiente. Detectada incompatibilidad antes de escrituras: MySQL 8.4 requiere privilegio adicional para FOR UPDATE sobre users y la cuenta debe seguir en solo lectura; comprobación real devuelve 1142. El usuario autorizó bloqueo nombrado por vendedor más FOR SHARE en users, compatible con FOR UPDATE del panel, y confirmó permisos de clientes preparados; ajuste documentado antes del código transaccional. Commit autorizado al aprobar: «feat: implementar clientes y cartera en API». Sin otros módulos, push ni cambios de spec-v1.

Etapa API A1/A2 autorizada: implementar únicamente POST /api/auth/login, middleware JWT y GET /api/productos. Crear api/ con Express 5, mysql2, jsonwebtoken, bcryptjs y cors; Node 24 carga .env. Cuenta técnica independiente con SELECT solo en users/productos, y perfil separado de pruebas; root se introduce localmente, nunca en chat/argumentos/documentos. Verificar hashes Laravel, roles, JWT y pérdida de acceso en crm_ferreteria_test conservando sus datos existentes y desarrollo. Crear colección Postman parcial sin tokens/secretos. Documentar pendientes visuales del panel; sin clientes, oportunidades, actividades, reportes ni SPA. Completado: 43 casos HTTP de API aprobados; 14 peticiones de colección y 29 comprobaciones ejecutadas con Node (Postman gráfico pendiente). Perfiles crm_api/crm_api_test con SELECT solo en users/productos y claves aleatorias fuera de Git; datos principales y de revisión manual conservados. Commit autorizado tras pasar: «feat: implementar autenticación JWT de vendedores en API». Sin push ni cambios de spec-v1.

Etapa L7 autorizada: auditar validación del panel existente y corregir solo faltantes. Revisar conservación de filtros y entradas malformadas al volver al formulario, presentación segura de errores internos y evidencia de conflictos MySQL. Reutilizar pruebas de autorización, R3/R4 y concurrencia, sin modificar sus decisiones. Todas las escrituras de comprobación en crm_ferreteria_test; conservar desarrollo. Documentar revisión visual y equivalencia API pendientes. Si pasa, commit «feat: completar validación del panel Laravel»; sin API, SPA, push ni cambios de spec-v1. Completado: 23 casos L7, suite final 270 pruebas/2.633 aserciones; errores y recuperación segura comprobados, compilación/formato correctos, desarrollo conservado y base test vacía. Evidencias en verificacion.md, sección 21.

Etapa L6 autorizada: tras guardar L5 en d3bdd6d96bb9d23242f756cdbed71a4ec4133d6a, implementar consulta de oportunidades de solo lectura por etapa/vendedor y reporte mensual con ventas, importe, pronóstico abierto sin mes y desgloses por vendedor/producto. Reutilizar cálculos L5 y controles de acceso; verificar cifras comunes en crm_ferreteria_test, conservar desarrollo y registrar revisión visual pendiente. Si pasan las comprobaciones, guardar L6 con «feat: implementar consulta de oportunidades y reportes». Sin API, SPA, push ni cambios de spec-v1. Completado: 31 casos L6; suite final 247 pruebas/2.393 aserciones, cifras comunes exactas, formato/rutas/compilación correctos. Desarrollo conservado por huellas y base de pruebas vacía. Revisión visual pendiente; evidencias en verificacion.md, sección 20.

Cierre L5 autorizado: guardar la página del equipo, pruebas y documentación con «feat: implementar página del equipo del supervisor». Conservar las comprobaciones ya ejecutadas (216 pruebas/2.161 aserciones) y registrar la revisión visual pendiente. No repetir pruebas para este cierre; conservar spec-v1 y no hacer push.

Etapa L5 autorizada el 5 de noviembre de 2026: implementar únicamente «Mi equipo» del supervisor activo. Obtener vendedores de la sesión y su asociación actual, incluidos inactivos; mostrar cartera y ventas ganadas del mes de Guatemala con precios históricos y agregaciones separadas para no multiplicar recuentos. Reutilizar auth/EnsurePanelAccess, verificar aislamiento y cifras comunes en crm_ferreteria_test con transacciones y conservar la base principal. Sin L6, API, SPA, commits ni cambios de spec-v1. Completado: 25 casos específicos L5; suite final 216 pruebas/2.161 aserciones, rutas, formato y compilación correctos. Huellas principales idénticas y base de pruebas vacía tras revertir datos temporales. Evidencias en verificacion.md, sección 19.

Etapa L4 autorizada: clientes y asignación solamente. Aplicar R2/R3/R4 y decisiones actuales: alcance por equipo y 404, identidad normalizada, cupo diez, transferencia exclusiva de oportunidades abiertas, crédito cerrado conservado y liberación sin oportunidades abiertas ni actividades pendientes. Eliminar solo por administrador y sin oportunidades, con cascada de actividades del esquema. Verificar HTTP y peticiones simultáneas sobre crm_ferreteria_test, con limpieza limitada a filas propias; comparar huellas principales. Completado: suite de 191 pruebas/2.011 aserciones, cinco carreras simultáneas con un ganador cada una y sin sobrecupo/duplicados. Base test vacía tras limpieza propia y huellas principales intactas; protocolo en docs/protocolo-cartera.md. Sin L5, reportes, API, SPA, commits ni cambios de spec-v1.

Etapa L3 autorizada el 4 de noviembre de 2026: implementar únicamente catálogo (listado, alta, edición y estado), reutilizando la autorización de administrador de L2. Validar nombre normalizado y único, precio positivo DECIMAL(10,2), mínimo entero 1–999 y estado booleano. Probar por HTTP en crm_ferreteria_test con transacciones, comprobar conservación de cotizaciones y comparar huellas de desarrollo antes/después. La autorización actual sustituye la decisión anterior de implementar el catálogo manualmente. Completado: 52 casos específicos del catálogo; suite final 143/1.221, rutas y compilación correctas. Desarrollo conservado por huellas; pruebas vacías. Sin inventario, clientes, API, SPA, cambios de esquema, commits, etiquetas o push.

Etapa L2 autorizada: guardar semillas en un commit, completar login/logout y control de acceso actual por rol/estado, administración de cuentas solo por administrador y formularios Blade en español. Aplicar las reglas de supervisor activo, conservación de asociaciones al desactivar, bloqueo de cambio de rol de supervisores con vendedores y protección del propio administrador. Todas las pruebas de escritura usarán crm_ferreteria_test con transacciones; comparar huellas de los datos de desarrollo antes/después. Sin catálogo, clientes, reportes, API, SPA ni segundo commit. Completado: semillas guardadas en 4c170978354bc067293ce1a4aedbdb92b2b0c060; L2 y regresión pasaron 91 pruebas/856 aserciones. Huellas de desarrollo intactas y base de pruebas vacía al finalizar. Evidencia en sección 16 de verificación.

Etapa de semillas autorizada: esquema guardado en 2b89b0595d3e92eb616a104b6e57cf2a1704f565; implementar los datos exactos de la sección 11 y un sector separado. Verificar carga común y combinada mediante transacciones revertidas en crm_ferreteria_test, comprobando DATABASE() y cuenta antes de escribir. Si desarrollo sigue vacío, cargar ambas semillas sin reiniciar. Documentar consultas y cifras, sin implementar reportes, roles, pantallas, API ni SPA. Completado: 3 pruebas y 404 aserciones aprobadas, datos comunes conservados íntegramente, carga de desarrollo 11 cuentas/10 productos/28 clientes/17 oportunidades/19 líneas/62 historiales/8 actividades. Pruebas nuevamente vacías. No se ejecutaron operaciones destructivas, migraciones ni cambios de permisos. Cifras y límites en verificación, sección 15.

Etapa del esquema completada (1 de noviembre de 2026): conexión guardada en 6ea8a8133dd120aab07b6aef7d72dc8890f4fcd5; permisos mínimos acotados; crm_ferreteria_test y cuenta independiente; diez migraciones aplicadas en ambas bases, siete nuevas del núcleo. El usuario aclaró expresamente que permite migrate sin fresh, reinicios ni borrados. 40 pruebas y 61 aserciones aprobadas; ambas bases tienen 15 tablas y cero filas de negocio. No incluye semillas, pantallas, API ni SPA. spec-v1 intacta; sin otro commit.

- [x] Elegir sector: ferretería; disponibilidad informada por el equipo.
- [x] Preparar primera especificación y propuesta de regla propia.
- [x] Preparar AGENTS.md, este plan, README, .gitignore y registro inicial de verificación.
- [ ] Verificar que el sector quede registrado en el aula virtual.
- [ ] Revisar en pareja las decisiones de la especificación y la distribución de tareas.
- [x] Extraer la carpeta en el equipo local y abrirla con el agente elegido: carpeta de trabajo accesible en esta sesión.
- [x] Conservar docs/enunciado.pdf en la carpeta del proyecto: archivo presente y contrastado antes del hito documental.
- [x] Inspeccionar versiones locales y registrar faltantes: revisión inicial sin instalaciones en verificacion.md, sección 9; posterior instalación autorizada y versiones confirmadas en sección 10.
- [x] Inicializar el repositorio local en main, mediante instrucción explícita. El commit y la etiqueta de este hito se comprueban con los comandos de cierre de verificacion.md, sección 11.
- [x] Preparar las herramientas locales autorizadas; verificaciones en la sección 10.
- [x] Autorizar y crear solo el esqueleto Laravel/Breeze, sin acceso a la base.
- [x] Preparar la base local y cuenta técnica, configurar credenciales solo en .env y comprobar una lectura desde Laravel.
- [x] Aplicar el esquema y verificar restricciones sobre la base separada de pruebas.
- [x] Implementar VerificacionSeeder exacto y SectorSeeder separado; verificar ambas modalidades, recuentos y cifras (3 pruebas, 404 aserciones) y cargar desarrollo sin reiniciar.
- [x] Implementar y verificar L2: login/logout, rol/estado actual, administración exclusiva, validaciones y protección del administrador.
- [x] Implementar L3 por nueva autorización del 4 de noviembre: catálogo exclusivo, validación y conservación histórica. Suite completa: 143 pruebas, 1.221 aserciones. Cierre autorizado con el mensaje feat: implementar catálogo de productos.
- [x] Implementar L4: clientes por ámbito, identidad, asignación/cupo, liberación y eliminación controlada; 43 casos funcionales y cinco carreras simultáneas.
- [x] Implementar L5: Mi equipo del supervisor, vendedores activos/inactivos, cartera actual y ventas mensuales históricas, aislamiento y frontera UTC/Guatemala verificados.
- [x] Implementar L6: consulta de oportunidades por ámbito y filtros, reporte mensual y pronóstico con desgloses; 31 casos L6, suite final 247 pruebas/2.393 aserciones.
- [x] Revisar y completar L7: validación en servidor, formularios/filtros recuperables, errores sin detalles internos y protocolo R3/R4 documentado; A3 verifica ahora las reglas comunes de clientes.
- [x] Inspeccionar capturas reales del panel y SPA en escritorio/375 px: formularios, listas, Mi equipo, oportunidades, reportes y navegación; sección 34. La revisión en pareja se mantiene separada.
- [ ] Revisar en pareja mensajes, navegación y explicación del código, con Postman gráfico.
- [x] Implementar A1/A2 y GET /api/productos: login bcryptjs, JWT HS256, cuenta vigente por petición y CORS exacto; 43 casos aprobados, colección parcial y permisos SELECT mínimos.
- [x] Implementar A3 autorizado: seis rutas de clientes/cartera, permisos mínimos, normalización y nueve carreras API/API y API/panel; 75 pruebas aprobadas y colección parcial de 31 peticiones/63 comprobaciones. Verificación, sección 24.
- [x] Implementar A4: ocho rutas de oportunidades/líneas, historial y cierre transaccionales, precio histórico y mínimo vigente; 38 casos nuevos, suite final 113/113 y cinco carreras A4. Colección: 68 peticiones/141 comprobaciones, dieciséis de veinte endpoints. Verificación, sección 25.
- [x] Implementar A5: actividades por cartera actual, autor conservado, fechas UTC, filtros y completada/vencida; 37 casos nuevos, suite 150/150. Colección 92 peticiones/196 comprobaciones, 19/20 endpoints. Verificación, sección 26.
- [x] Implementar A6: resumen del vendedor, límites UTC de Guatemala y agregaciones SQL históricas; cuatro controles en base aislada solo VerificacionSeeder. Suite final 172/172, colección 101 peticiones/214 comprobaciones para veinte endpoints. Verificación, sección 27.
- [x] Revisar A7/A8 de API: veinte contratos, errores, JWT/propiedad, SQL/CORS y ciclo de conexiones; corregir solo faltantes comprobados. 185 pruebas y colección de 108 peticiones/336 comprobaciones aprobadas. Evidencia en verificación, sección 28.
- [x] Fase 6, primera etapa SPA: F1 y base F6, acceso real, sesión, cliente HTTP y navegación sin módulos. Nueve pruebas aprobadas; capturas de acceso/navegación inspeccionadas a 1280 y 375 px. Evidencia en verificación, sección 29.
- [x] Fase 6, Clientes/cartera F2: listado/búsqueda, ficha, alta/edición, toma y ocupación desde resumen; 15 pruebas aprobadas y capturas inspeccionadas a 1280/375 px. Verificación, sección 30.
- [x] Fase 9, solo F3: embudo/filtro, creación/título, detalle, productos cotizados y transiciones confirmadas; 24 pruebas frontend aprobadas y capturas inspeccionadas a 1280/375 px. Verificación, sección 31.
- [x] Fase 9, solo F4: alta desde ficha de cliente, filtros/estado, vencida de API, fechas Guatemala y actualización por reasignación; 32 pruebas frontend aprobadas, capturas 1280/375 px y conversión comprobada con navegador en Tokio. Verificación, sección 32.
- [x] Fase 9, solo F5: resumen por mes de Guatemala, cifras API y cartera compartida; 41 pruebas aprobadas con navegador contra A6 exclusivamente de lectura y capturas 1280/375 px. Verificación, sección 33.
- [x] Comprobar integración panel → API → SPA, asignación/reasignación y recorrido completo del vendedor; corregidos refresco al navegar y ancho de filtro. Laravel 270/2.633, API 185/185, frontend 46/46 y colección 108/336; repetición afectada Laravel 31/232 e integral 1/1, sección 34.
- [x] Completar guía de arranque de las tres piezas y contrastar archivos A8/P1–P5; integración automática e inspección visual de fases 6/9 aprobadas.
- [ ] Completar fase 10: revisión en pareja/Postman gráfico, contribuciones reales de ambos, aula y acceso del catedrático, cambio de requisito cuando se publique y hito de entrega autorizado.

La inspección inicial y la búsqueda acotada de herramientas están registradas en docs/verificacion.md, sección 9. PHP 8.4.24, Node.js 24.18.1, npm 11.16.0 (mediante npm.cmd) y Git 2.55.0.windows.3 respondieron. En esa inspección Composer y MySQL no fueron detectados y no se instaló nada. La instalación posterior está en la sección 10; no implica aplicaciones ni pruebas funcionales. La preparación de Git/spec-v1 corresponde a la sección 11. El registro del sector en el aula y la revisión en pareja siguen pendientes.

## 5. Verificación por fase

Las verificaciones estructurales de documentos no equivalen a pruebas de la aplicación. Al existir código se ejecutan comprobaciones relevantes: sintaxis y pruebas del componente modificado, peticiones Postman y revisión de permisos. Se documentan los comandos efectivos, fecha, base de pruebas utilizada, resultado y limitaciones.

La colección debe cubrir los 20 endpoints al menos una vez, éxitos, errores principales y cantidad mínima. Las pruebas que alteran datos parten de una base de pruebas identificada; restaurar semillas requiere una instrucción explícita. No guardar JWT vigentes, claves reales o contraseñas reales en evidencias.

Para concurrencia se disparan peticiones solapadas y se inspecciona el estado final: un solo ganador de un cliente, máximo diez por vendedor, duplicados rechazados y una transición confirmada por estado observado. Se puede utilizar un pequeño ejecutor con fetch de Node para generar simultaneidad; no se presupone que Collection Runner secuencial pruebe ese requisito.

## 6. Cambio de requisito y control de versiones

Cuando se publique el cambio: leerlo; actualizar especificación y criterios; actualizar plan; guardar spec-v2; crear migraciones nuevas cuando proceda; implementar y volver a verificar lo afectado. No reescribir migraciones aplicadas ni inventar anticipadamente el cambio.

Las etiquetas spec-v1, spec-v2 y entrega-final son hitos reales del repositorio. Su existencia y orden se comprueban con Git; escribir sus nombres en estos documentos no las crea. No se crean commits, etiquetas o push sin instrucción explícita del equipo.

## 7. Riesgos que deben resolverse temprano

| Riesgo | Acción prevista |
| --- | --- |
| Dos bases distintas por configuración SQLite/MySQL | Comprobar conexión explícita y un cambio de registro visible desde ambas puertas |
| Hash de Laravel rechazado por API | Probar bcryptjs contra una cuenta creada por Laravel antes de desarrollar el resto del login |
| Reporte incorrecto por UTC o precio actual | Usar frontera de mes en Guatemala y precios de línea; comparar cifras de Valeria desde la primera consulta |
| Cartera correcta solo en peticiones secuenciales | Definir bloqueos comunes antes de implementar altas/asignaciones y probar peticiones solapadas |
| Falta de comprensión o participación de un integrante | Revisión cruzada, commits propios y explicación breve del flujo tras cada fase |
| Diferencia entre contrato y una interpretación del equipo | Consultar el enunciado; registrar cualquier duda específica para el catedrático antes de cambiar el contrato |

Cierre autorizado de L2: guardar código, pruebas y documentación con el mensaje «feat: implementar cuentas y acceso por roles». Se utilizan los resultados ya ejecutados (91 pruebas, 856 aserciones), sin repetir pruebas ni tocar bases. Revisar exclusiones y conservar spec-v1; sin push. Esta decisión de trabajo manual del catálogo fue sustituida por la autorización expresa de L3 del 4 de noviembre, registrada arriba.

Cierre de L3 autorizado: revisar y guardar código, pruebas y documentación con «feat: implementar catálogo de productos». Conservar los resultados ya ejecutados de 143 pruebas y 1.221 aserciones, sin repetirlas ni modificar datos. Revisar exclusiones, mantener spec-v1 intacta y no hacer push. Detener el trabajo antes de otro módulo.

Cierre de L4 autorizado: revisar y guardar código, pruebas, vistas y documentación, incluido docs/protocolo-cartera.md, con «feat: implementar clientes y asignación de vendedores». Conservar los resultados ya ejecutados de 191 pruebas y 2.011 aserciones, sin repetirlas ni modificar datos. Revisar secretos/temporales, conservar spec-v1 y no hacer push. Detener el trabajo antes del siguiente módulo.

Cierre A3: comprobaciones finales 75/75; paridad R4 comprobada con 32 vectores de formato/normalización y conflictos de identidad reales. Variante GET_LOCK + FOR SHARE autorizada y comprobada entre puertas, sin ampliar permisos sobre users. Datos principales y registros manuales de pruebas conservados. Commit autorizado: «feat: implementar clientes y cartera en API». Sin push ni cambios en spec-v1.

Cierre A4: permisos mínimos confirmados para crm_api/crm_api_test; users y productos solo SELECT. 113 pruebas aprobadas y huellas de datos preexistentes conservadas, sin reinicios. Commit autorizado tras revisión de secretos: «feat: implementar oportunidades y productos cotizados en API». Revisión gráfica pendiente, spec-v1 intacta y sin push.

Cierre A5: 150/150 pruebas aprobadas; permisos SELECT/INSERT/UPDATE en actividades concedidos por base, demás permisos conservados. Huellas principales y manuales de pruebas intactas. Revisión gráfica pendiente. Commit autorizado: «feat: implementar actividades de seguimiento en API». Sin push ni cambios de spec-v1.

Cierre A6: base aislada crm_ferreteria_a6_test con solo VerificacionSeeder, por elección expresa del usuario; bases principal y de revisión manual conservadas. 172 pruebas aprobadas y veinte endpoints en colección; revisión gráfica pendiente. Commit autorizado tras revisar secretos: «feat: implementar resumen mensual del vendedor en API». Sin SPA, push ni cambios de spec-v1.

Cierre A7/A8 de API (6 de noviembre): errores de petición ilegible 400, compatibilidad de correo del login y descarte de conexiones de estado incierto corregidos. Reglas de negocio aprobadas conservadas, sin cambios Laravel ni de permisos. Huellas de las tres bases intactas, sin nuevas dependencias. Commit descriptivo autorizado tras revisión final; sin push ni cambios de spec-v1.
