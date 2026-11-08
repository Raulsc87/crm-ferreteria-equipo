# Plan de trabajo

Actualizado: 7 de noviembre de 2026. Proyecto de Raúl y Diego; sector ferretería. Fuente: [enunciado](enunciado.pdf) y [especificación](especificacion.md).

## Estado del repositorio

- Repositorio de equipo: [Raulsc87/crm-ferreteria-equipo](https://github.com/Raulsc87/crm-ferreteria-equipo).
- main conserva las tres importaciones de Raúl: documentación/configuración, panel Laravel y API REST.
- Diego aportó seis commits en frontend-diego, hasta f510413, y abrió [PR #1](https://github.com/Raulsc87/crm-ferreteria-equipo/pull/1). Sigue sin integrar.
- revision-raul nace de origin/frontend-diego para revisión local. Los cambios documentales actuales se dejan sin commit ni push.
- El proceso previo, sus pruebas y spec-v1 pertenecen al [repositorio original](https://github.com/Raulsc87/crm-ferreteria). No se atribuyen al historial nuevo; fuentes en [anexo](anexo-evidencias.md).

## Arquitectura y responsables reales

Panel Blade/Eloquent y API Express/SQL comparten MySQL. La SPA usa módulos JavaScript y Bootstrap; estado → render y eventos delegados. Solo Laravel gestiona esquema y hashes.

| Parte | Evidencia de participación | Revisión pendiente |
| --- | --- | --- |
| Documentación, Laravel y API importados | Raul Soto: 8b0341b, 7a904de y 17bdd09, con asistencia de IA documentada | Diego revisa y explica; no se declara revisión completada |
| Importación y rediseño SPA | Diego7: cc341bb, e91759c, 49c453a, 63fdc85, 44e1427 y f510413 | Raúl revisa diseño e integración; PR pendiente |
| Revisión local y reducción documental actual | Solicitada por Raúl; ejecutada con Codex; sin commit | Ambos leen y aprueban los documentos |
| Defensa y comprensión de todas las piezas | Responsabilidad de ambos | Ensayo individual de cada integrante |

La distribución inicial era una propuesta, no evidencia de autoría. No se cambian autores ni se fabrican contribuciones. Los commits históricos del original se enlazan por separado.

## Etapas y encargos a la IA

Las fases mantienen los nombres usados durante el desarrollo. Aprobado histórico significa evidencia del original, no una ejecución nueva sobre el diseño de Diego.

| Fase | Tareas y encargo a la IA | Responsable acreditado / actual | Estado y salida |
| --- | --- | --- | --- |
| 0. Documentación y Git | Especificar sector, criterios, modelo y decisiones antes del negocio; contrastar PDF | Raúl, historial original; ambos revisan | Hito original spec-v1; en el nuevo repo solo importación |
| 1. Entorno | Verificar versiones, instalar dependencias fijadas y configurar MySQL sin secretos | Raúl | Histórico preparado; copia actual arranca con perfiles de pruebas |
| 2. Esquema y semillas | Migraciones nuevas, CHECK/FK/únicos; común exacta y sector separado | Raúl, original/importación | Histórico verificado; no se migra ni siembra ahora |
| 3. Panel: acceso y catálogo | L2/L3, servidor autoriza rol/estado y conserva históricos | Raúl, original/importación | Implementado; evidencias históricas en matriz |
| 4. Panel: clientes y equipos | L4/L5, R2/R3/R4, asignación y bloqueos compartidos | Raúl, original/importación | Implementado y contrastado históricamente con API |
| 5. API: acceso y cartera | A1–A3, SQL con ?, hashes Laravel, JWT y cupo concurrente | Raúl, original/importación | Implementado; no ampliar contrato |
| 6. Primera integración | Entrada SPA y asignación panel → cartera; diagnosticar CORS | Original con asistencia IA; revisión actual de Raúl | Histórico aprobado; rediseño requiere revisión real |
| 7. API: oportunidades y actividades | A4/A5/A7, precio copiado, transiciones/historial y seguimiento | Raúl, original/importación | Implementado; preservar reglas y contratos |
| 8. Reportes en ambas puertas | A6/L6, meses Guatemala, precio histórico y cifras comunes | Raúl, original/importación | Histórico coincide; A6 separada de base manual |
| 9. SPA completa | F1–F6 y presentación responsive; sin cambiar backend | Original importado; rediseño real de Diego | Funcionalidad presente; Diego registra 44/44 con API simulada |
| 10. Verificación y entrega | Matriz, errores reales IA, Postman, revisión cruzada y ensayo | Ambos; revisión documental actual de Raúl | En curso; no integrar ni publicar todavía |

## Trabajo de esta etapa

1. Leer AGENTS, documentos completos y las 22 páginas del PDF; comprobar origin y árbol local.
2. Fetch y revision-raul desde origin/frontend-diego; conservar autores y commits. No había trabajo local sin guardar.
3. Instalar dependencias desde lockfiles, preparar solo perfiles locales ausentes y verificar DATABASE() antes de arrancar.
4. Iniciar panel 8001, API 3001 y SPA 5500 sobre crm_ferreteria_test; solo lecturas y disponibilidad HTTP. Conservar todos los datos manuales.
5. Reducir README/especificación/plan/verificación y agrupar evidencia necesaria en un anexo; no alterar negocio ni etiquetas.
6. Revisar exclusiones, enlaces y diff; dejar documentos sin commit para lectura del equipo.

## Pendientes concretos

- [ ] Raúl y Diego revisan el diseño de PR #1 en escritorio y 375 px; completar flujo con datos propios sin borrar registros ajenos.
- [ ] Volver a acreditar integración panel → API → SPA con el rediseño: asignación/reasignación, cotización, cierre, actividad, resumen y bloqueo por rol/estado.
- [ ] Revisar Postman gráfico y los errores principales; las ejecuciones de colección mediante Node no lo sustituyen.
- [ ] Revisar los documentos resumidos antes de autorizar su commit o la integración del PR.
- [ ] Reproducir instalación en otra computadora; comprobar aula y acceso del catedrático al repositorio privado.
- [ ] Ensayar defensa de 15 minutos y cambios de código en vivo, con explicación individual de cualquier pieza.
- [ ] Acordar un entorno exclusivo para defensa con solo VerificacionSeeder, sin reiniciar principal, manual ni A6.
- [ ] Cuando se publique el cambio: actualizar especificación/plan primero, spec-v2 y migraciones nuevas; verificar regresión.
- [ ] Preparar entrega-final y publicar únicamente con autorización.

## Cómo registrar la verificación

Actualizar [matriz](verificacion.md) con fecha, base, criterio, comando, resultado, evidencia y límites. No sumar ejecuciones sucesivas ni convertir un resultado histórico en uno recién ejecutado.

Las pruebas simultáneas deben solaparse y comprobar el estado final. No bastan peticiones secuenciales. Para R3/R4 se mantiene [protocolo-cartera.md](protocolo-cartera.md). No ejecutar suites contra datos manuales sin comprobar su procedimiento y destino; nunca asumir que una base es desechable.

Se mantienen pendientes la decisión externa de 404 en la fila de creación de oportunidad y la revisión del historial exigido en la entrega: la interpretación actual prioriza R2; la procedencia de spec-v1 está documentada, no recreada.
