# Anexo: evidencia histórica necesaria

Este anexo conserva resultados, límites y errores necesarios para defender el proyecto. No copia el diario completo de comandos, autorizaciones, instalaciones ni cada repetición de una suite.

## Dos repositorios y una importación

| Evidencia | Procedencia |
| --- | --- |
| Especificación anterior al negocio | [spec-v1 del original](https://github.com/Raulsc87/crm-ferreteria/tree/spec-v1), commit [bfb6f0b](https://github.com/Raulsc87/crm-ferreteria/commit/bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166) |
| Cierre original con pruebas/correcciones | [033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044) y su [registro completo](https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md) |
| Importaciones al repositorio nuevo | [8b0341b](https://github.com/Raulsc87/crm-ferreteria-equipo/commit/8b0341b23696867b5aba745a8e8b142fc69885c5) documentos; [7a904de](https://github.com/Raulsc87/crm-ferreteria-equipo/commit/7a904de81e639243983bc78f9ecb2a0bfed56090) Laravel; [17bdd09](https://github.com/Raulsc87/crm-ferreteria-equipo/commit/17bdd095d3a2eb99dd10d96cae9e08416f29175f) API, autor Raul Soto |
| Frontend y rediseño de Diego | [PR #1](https://github.com/Raulsc87/crm-ferreteria-equipo/pull/1), seis commits cc341bb…f510413, autor Diego7, pendientes de integrar |

El original conserva sus 23 commits y etiqueta; no se reescribió. Objeto anotado spec-v1: e52929d8837fc9c2d46dcbff258760c4e505ba9e, destino bfb6f0bb34d5b8c11dfcb903f7b52fec7d26f166. No existe esa etiqueta en crm-ferreteria-equipo. Los hashes siguientes siempre enlazan al original: no se presentan como ancestros de la importación.

La documentación importada incluía estados “todavía no existe API/SPA”, bases vacías y sin remoto. Son cortes de etapas antiguas; se reemplazan por el estado actual, sin convertir antiguos pendientes en aprobaciones nuevas. Las referencias numéricas 24/34 del protocolo remiten a [A3 original][E24] y [cierre integral original][E34].

## Evolución de resultados, sin sumar ejecuciones

Fechas: entorno/esquema/semillas/L2 el 1 de noviembre; L3/L4 el 4; L5–L7/API el 5; A7/A8 y SPA/integral el 6, de 2026. Ejecutó el agente con autorización de Raúl; no se atribuyen esas ejecuciones a Diego. Comandos y resultados detallados permanecen enlazados al corte original.

| Etapa histórica | Resultado final registrado | Evidencia original |
| --- | --- | --- |
| Entorno y base Laravel | PHP 8.4.24, Composer 2.11.1, Node 24.18.1, npm 11.16.0, MySQL 8.4.13; Laravel 13.39.0 y Breeze 2.4.2; zip/fileinfo/pdo_mysql; login HTTP, sin registro | [Preparación][E12] |
| Esquema | Diez migraciones, 15 tablas InnoDB, diez FK, siete CHECK; 40 pruebas/61 aserciones | [Esquema][E14] |
| Semillas | Tres pruebas/404 aserciones: exactitud común, carga combinada y conservación de todas las columnas comunes | [Semillas][E15] |
| L2 | 47 casos propios; regresión 91/856 | [Cuentas][E16] |
| L3 | 52 casos propios; regresión 143/1.221 | [Catálogo][E17] |
| L4 | 43 funcionales, cinco carreras; regresión 191/2.011 | [Clientes][E18] |
| L5 | 25 casos propios; regresión 216/2.161 | [Equipo][E19] |
| L6 | 31 casos propios; regresión 247/2.393 | [Reportes][E20] |
| L7 | 23 casos propios; regresión 270/2.633 | [Validación][E21] |
| A1/A2 | 43 pruebas, hashes reales Laravel y JWT; colección inicial parcial | [Acceso][E23] |
| A3 | 75 pruebas; 32 vectores R4 y nueve carreras, cuatro entre puertas | [Cartera][E24] |
| A4 | 113 pruebas acumuladas; 38 propias y cinco carreras; repetición afectada 38/38 | [Cotizaciones][E25] |
| A5 | 150 acumuladas; 37 propias, cartera actual y fechas | [Seguimiento][E26] |
| A6 | 172 acumuladas; 22 propias, controles en base aislada común | [Resumen][E27] |
| A7/A8 | 185 acumuladas; 13 casos de faltantes; colección final 108/336 | [Revisión API][E28] |
| F1/F2/F3/F4/F5 | Cierres sucesivos 9, 15, 24, 32 y 41 pruebas; no son sumables | [F1][E29], [F2][E30], [F3][E31], [F4][E32], [F5][E33] |
| Integral | Laravel 270/2.633, API 185, frontend 46; repetición Blade 31/232 + integral 1/1 | [Integral][E34] |

Los primeros resultados Laravel se obtuvieron cuando las tablas de pruebas estaban vacías. Después de preparar la revisión manual quedaron pobladas; el cierre integral usó **otra instancia MySQL temporal 3307** para esa suite, sin sustituir el servicio de 3306. No volver a usar los comandos históricos de PHPUnit directamente sobre la base manual.

## Semillas, fechas y conservación

Orden: VerificacionSeeder exacto y después SectorSeeder. Relaciones por IDs obtenidos al insertar, nunca fijos. La semilla común tiene 7/5/21/11/13/43/4 filas en users/productos/clientes/oportunidades/líneas/historial/actividades. Sector agrega 4/5/7/6/6/19/4, sin modificar filas comunes. Primera carga combinada: 11/10/28/17/19/62/8. Los 43 pasos comunes incluyen creación y avances, tres días entre registros, terminando en cierre o 2026-10-02 16:00 UTC para abiertas; Plan familiar se pierde desde propuesta.

Los reportes no existían durante las primeras comprobaciones de datos: las consultas de semillas no se presentan como pruebas de interfaz. Panel L6, API A6 y F5 añadieron luego sus evidencias específicas.

Al cierre integral del 6 de noviembre, huellas de todas las filas/columnas y permisos coincidieron antes/después:
- Principal: 11/10/28/17/19/62/8.
- Manual: 12/11/28/17/19/62/8.
- A6 solo común: 7/5/21/11/13/43/4.

Estos recuentos son históricos, no describen el estado manual de hoy. Las pruebas creaban fixtures aleatorios propios, verificaban DATABASE()/CURRENT_USER()/permisos antes de escribir y limpiar, retiraban solo esos IDs/prefijos y comparaban huellas completas. Los autoincrementales podían avanzar. No se guardaron hashes de contraseña, tokens ni secretos en evidencia.

A6 se preparó por elección del usuario para no reiniciar datos manuales: diez migraciones ordinarias y solo VerificacionSeeder, cuenta API de lectura en users/clientes/oportunidades/líneas. No se ampliaron permisos de otros perfiles. Root se introdujo localmente en campo enmascarado, nunca en chat, comandos visibles o documentos.

## Errores tempranos reales de IA

Complementan IA-11…16 de [verificación](verificacion.md#bitácora-de-ia-errores-reales-y-corrección). Los fallos del ejecutor se distinguen de defectos de negocio.

| Caso | Detección → corrección | Commit o límite de evidencia |
| --- | --- | --- |
| IA-01 | Ejecutor mezcló require/await y variable PowerShell reservada → cambiar ejecutor y repetir HTTP 200/404 | Auxiliar temporal, sin commit correctivo; no se cuenta como caso completo P5 |
| IA-02 | Ventana MySQL oculta y StandardInputEncoding no disponible → mostrar ventana, transporte UTF-8 por stdin y prueba vacía antes de SQL | Auxiliar temporal, sin commit correctivo; no fue defecto de conexión Laravel |
| IA-03 | Test esperaba etapas en orden distinto del sort alfabético → corregir expectativa, semillas intactas; 3/404 | [4c17097](https://github.com/Raulsc87/crm-ferreteria/commit/4c170978354bc067293ce1a4aedbdb92b2b0c060) |
| IA-04 | Test perdía errores tras POST por no conservar cookie → reenviar cookie y comprobar GET; 91/856 | [624aa7e](https://github.com/Raulsc87/crm-ferreteria/commit/624aa7ef95cdd0763277365abdd8d8f076d25008) |
| IA-05 | Test exigía atributos HTML contiguos para mínimo 1 → comprobar nombre/valor sin imponer orden; 143/1.221 | [8d42a27](https://github.com/Raulsc87/crm-ferreteria/commit/8d42a274acf3914cee88154fdbe9d88c95235c83) |
| IA-06 | Destino propio del supervisor devolvía 404 en vez de validación de no vendedor → distinguirlo sin permitir asignación; 191/2.011 | [8792318](https://github.com/Raulsc87/crm-ferreteria/commit/879231885bdf4627c464893e1fb27616abbadd49) |
| IA-07 | Consulta de administrador omitía titulares históricos que cambiaron de rol → conservar todas las oportunidades y añadir test; 247/2.393 | [a5276c7](https://github.com/Raulsc87/crm-ferreteria/commit/a5276c709abff9143cb03e3709602fe32ebcc9a4) |
| IA-08 | Test leía errores flash después de GET que los consumía → capturarlos antes, conservar cookie | [af7a4ab](https://github.com/Raulsc87/crm-ferreteria/commit/af7a4ab3fc451ebe82f04b20f7a2806936708a2f) |
| IA-09 | Test esperaba teléfono normalizado en datos anteriores → exigir formato original escrito; 270/2.633 | [af7a4ab](https://github.com/Raulsc87/crm-ferreteria/commit/af7a4ab3fc451ebe82f04b20f7a2806936708a2f) |
| IA-10 | Cuerpo vacío login respondía 422 → distinguir cero bytes (400) de objeto vacío (422); 43 pruebas | [dbfaee2](https://github.com/Raulsc87/crm-ferreteria/commit/dbfaee217f7ecb721ae2882e6b96d463ff6dd68b) |

Otros incidentes de pruebas con evidencia conservada:
- A6: un nombre aleatorio podía contener CF y rompía la expectativa de búsqueda; se cambió solo el fixture en [39ff5ea](https://github.com/Raulsc87/crm-ferreteria/commit/39ff5ea771476b501208851d6aede66adff12262). La preparación local también intentó permisos por tabla antes de migrar; se corrigió el orden únicamente en la nueva base vacía.
- F3: temporizadores del test invocaban API después de cerrar pool; se cancelaron al cerrar respuesta, en [8f22215](https://github.com/Raulsc87/crm-ferreteria/commit/8f2221561f7d8b93103622666713db3145a0b514).
- F4: navegar desde una ficha sin volver al listado y manipular un selector aún cargando causaron timeouts; se corrigieron recorridos/esperas en [aa747c0](https://github.com/Raulsc87/crm-ferreteria/commit/aa747c0589b8df455e988c0da39b9f73d130d6b5).
- F5: caché devolvía 304 donde el test exigía 200; se desactivó solo caché del navegador de pruebas en [ac75526](https://github.com/Raulsc87/crm-ferreteria/commit/ac75526da673d5fe505c4945fc1498e97e85e83e).
- Integral: selector del ejecutor esperaba main form en login Blade; se corrigió el selector en [033a51e](https://github.com/Raulsc87/crm-ferreteria/commit/033a51e6cb570b9909fe143597bad8bc05da2044), sin cambiar login para ocultarlo.

## Qué no demuestra el historial

Capturas inspeccionadas no equivalen a revisión en pareja. API simulada del rediseño no acredita MySQL. Colección por fetch/scripts no equivale a Postman gráfico ni a concurrencia. Ver --version no prueba autenticación. No constan instalación externa, defensa, aula, integración del PR nuevo ni acceso del catedrático. Deben registrarse cuando se realicen.

[E12]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L246
[E14]: https://github.com/Raulsc87/crm-ferreteria/blob/033a51e6cb570b9909fe143597bad8bc05da2044/docs/verificacion.md#L304
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
