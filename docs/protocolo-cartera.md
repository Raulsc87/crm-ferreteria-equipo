# Protocolo de cartera y reasignación

## Ajuste autorizado para A3 antes de implementar sus escrituras

El usuario autorizó conservar users en SELECT y verificar una variante compatible con el panel. MySQL 8.4 rechaza FOR UPDATE sobre users con ese permiso (1142), incluso después de conceder escritura solo en clientes. FOR SHARE sí está permitido. No se amplían privilegios sobre users.

Revisión integral del 6 de noviembre (verificación, sección 34): mismo protocolo sin cambios. Reejecutadas las carreras API/panel y verificadas asignación/reasignación desde el panel HTTP real hacia dos sesiones SPA. Abiertas transferidas, venta cerrada con crédito/precio histórico y actividad con autor original/acceso del dueño actual. La SPA reconsulta también cartera y ficha al volver a Clientes para reflejar una reasignación externa; esa actualización visual no sustituye la autorización y los bloqueos del servidor.

- La API obtiene GET_LOCK con nombre por base/vendedor, antes de iniciar la transacción. Así serializa sus propias altas, tomas y ediciones, incluso entre procesos distintos.
- Dentro de la transacción vuelve a leer al vendedor con FOR SHARE y exige rol/estado actuales. Ese bloqueo compartido permanece hasta commit/rollback y se excluye con el FOR UPDATE del panel, que conserva su código aprobado. Por tanto, API y panel no pueden aumentar simultáneamente la misma cartera.
- Después bloquea el cliente cuando corresponde, comprueba propiedad/disponibilidad y cuenta IDs de clientes con FOR UPDATE. Esa lectura es actual, no un COUNT de una instantánea previa. Exige menos de diez para crear/tomar.
- Confirma o revierte y siempre libera el bloqueo nombrado en la misma conexión antes de devolverla al pool. Si la liberación falla, destruye esa conexión para no dejar bloqueos en el pool. Ante interbloqueo/espera agotada puede repetir la transacción hasta tres veces; agotados los intentos devuelve conflicto, sin cambios parciales.

La toma solo cambia NULL por el vendedor autenticado; no reasigna una cartera ajena. Si el cliente ya tiene propietario, devuelve 409 sin adquirir el bloqueo de otro vendedor ni escribir. PATCH solo permite identidad/contacto y revalida propietario después de bloquear. No hay operaciones API para liberar/reasignar/eliminar clientes. La evidencia API/API y API/panel está registrada abajo y en verificación, sección 24.

Implementado por ClientManager en Laravel para L4 y por client-store.js/clients.js en la API A3, con la variante autorizada descrita arriba. El siguiente orden detalla el panel; la API no adquiere FOR UPDATE sobre users.

## Orden y comprobaciones comunes

1. Leer el propietario actual como orientación, fuera de la transacción. No contar clientes ni autorizar basándose solo en esa lectura.
2. Iniciar transacción. Reunir los IDs del actor y de los vendedores de origen y destino, sin duplicados, y ordenarlos numéricamente.
3. Bloquear cada fila users en ese orden. Los vendedores involucrados reciben FOR UPDATE. El actor administrador/supervisor recibe bloqueo compartido si no coincide con un vendedor involucrado; así varias acciones no se serializan solo por compartir administrador. Si el actor es también vendedor, basta el bloqueo exclusivo de esa fila: no adquirir primero uno compartido para luego promoverlo.
4. Revalidar estado y rol actuales del actor y el destino. Para el panel, supervisor solo puede asignar a un vendedor activo de su propio equipo. Un destino de otro equipo responde 404; un destino inexistente, inactivo o sin rol vendedor produce validación clara.
5. Bloquear el cliente con FOR UPDATE y comprobar de nuevo su alcance actual. Un supervisor recibe 404 si el cliente ahora pertenece a otro equipo. Si el propietario difiere de la lectura orientativa, revertir y devolver conflicto; no continuar sin bloquear al nuevo origen.
6. Asignar, liberar y eliminar comparan además el propietario esperado al mostrar la confirmación. Ese campo detecta formularios obsoletos; nunca autoriza ni sustituye al dueño leído de MySQL. Para la futura toma del vendedor, el origen esperado es NULL y el destino sale del token, no del cuerpo.
7. Antes de aumentar una cartera, leer los IDs de todos los clientes de destino con FOR UPDATE y contarlos mientras se mantiene bloqueada su fila users. Exigir menos de diez; si el cliente ya pertenece al destino, no suma otro lugar. No usar un COUNT obtenido antes del bloqueo ni una instantánea antigua de REPEATABLE READ.
8. Escribir cliente y efectos asociados en esa misma transacción y confirmar. Cualquier excepción revierte todo. Los bloqueos se conservan hasta commit/rollback; Laravel permite hasta tres intentos de la transacción ante interbloqueos.

Todos los caminos que cambian asignaciones —alta asignada, toma, asignación, reasignación, liberación y eliminación— deben seguir el protocolo. Un camino sin bloqueo común del vendedor podría superar diez aunque los demás estén bien. La edición de identidad usa el mismo orden de bloqueo y no permite cambiar vendedor_id.

## Efectos asociados, sin cambiar las decisiones de la especificación

- Bloquear cliente antes de sus oportunidades; obtenerlas por ID ascendente. Solo las abiertas pasan al destino; ganadas y perdidas conservan propietario, cierre y crédito histórico. No generar historial de etapa al reasignar.
- Conservar líneas, precios, cantidades e historial existentes.
- Las actividades conservan vendedor_id, que identifica a su autor. La consulta/finalización en módulos futuros dependerá de la cartera actual del cliente, no de ese autor.
- Liberar solo si no hay oportunidades abiertas ni actividades pendientes. Bloquear esas filas después del cliente, primero oportunidades y después actividades, por ID ascendente. Mantener cerradas y completadas.
- Eliminar solo por administrador y si no existe ninguna oportunidad. La FK conserva la barrera final y elimina en cascada únicamente las actividades del cliente eliminado.
- L2 ya bloquea la fila del vendedor al cambiar su supervisor/estado; por ello no puede cambiar el equipo o disponibilidad de ese vendedor a mitad de una escritura L4 que lo tenga bloqueado.

## Conflictos y adaptación futura de la API

Los índices únicos de NIT y teléfono son la barrera final contra duplicados normalizados. Normalizar y validar antes, pero tratar también el error MySQL 1062 después de competir por el índice. La API A3 devuelve 409 con su contrato exacto, tanto por duplicado detectado previamente como por índice. Nunca devolver SQL ni valores internos de otros clientes.

En el panel, los errores normales de formulario se redirigen con mensajes por campo; para peticiones que aceptan JSON, validación previa devuelve 422 y ClientConflict devuelve 409. Cupo, asignación obsoleta, liberación bloqueada e índices usan ClientConflict. No copiar estas respuestas Laravel como contrato de la API: A3 usa sus códigos y formatos especificados.

La futura toma debe resolver cliente ya tomado con 409 según su contrato. Las fichas ajenas mantienen 404; la política del panel no reemplaza las reglas particulares del endpoint de toma. No confiar en rol/propietario transportados por el cliente o únicamente en datos de un JWT sin consultar la cuenta actual.

## Evidencia real en MySQL de pruebas

ClientConcurrencyTest envía peticiones del kernel HTTP de Laravel desde dos procesos PHP, con dos administradores distintos y conexiones MySQL distintas. El coordinador retiene una barrera SQL sobre los vendedores: ambos ejecutores deben llegar a su SELECT FOR UPDATE después de validar. Se comprueba que ambos sigan ejecutándose, que sus tiempos crucen la liberación de la barrera y que sus IDs de conexión difieran.

Se probaron cinco carreras: dos altas con cupo nueve; asignación del mismo disponible a dos destinos; dos reasignaciones hacia cupo nueve; NIT normalizado repetido; teléfono normalizado repetido. Cada carrera tuvo un éxito 302 y un conflicto 409. El cupo terminó en diez, la toma tuvo un solo ganador y cada identidad repetida dejó una sola fila.

No son peticiones TCP a un servidor público ni un Collection Runner secuencial. Son ejecuciones HTTP reales del mismo kernel/controlador/servicio con transacciones simultáneas en InnoDB. En aquella etapa L4 no se implementó API o SPA.

Las pruebas comprueban base efectiva y cuenta restringida a crm_ferreteria_test. Sus fixtures concurrentes se confirman temporalmente para ser visibles entre conexiones y se eliminan después por sus IDs/prefijo aleatorio propio. Antes de cada limpieza se vuelven a comprobar DATABASE(), CURRENT_USER() y SHOW GRANTS. Nunca reinician tablas ni borran datos preexistentes.

## R4: normalización que debe reproducir la futura API

Implementación actual del panel: ClientRequest::prepareForValidation y ClientIdentity. Normalizar antes de validar formato y antes de consultar unicidad; los índices únicos de MySQL siguen siendo la última barrera. No convertir indiscriminadamente arrays u objetos en texto: rechazar tipos inválidos.

1. NIT: exigir la presencia del campo, quitar espacios y guiones, pasar a mayúsculas y quitar ceros iniciales. CF y vacío se convierten a NULL; varios NULL son válidos. Solo ceros se conserva como 0 para rechazarlo, nunca se convierte accidentalmente en CF.
2. NIT no CF: compacto de 2–12 caracteres, cuerpo numérico sin cero inicial y verificador final de 0–9 o K. Multiplicar el cuerpo de derecha a izquierda por 2, 3, 4…; calcular (11 − (suma mod 11)) mod 11 y representar 10 como K.
3. Teléfono: quitar espacios, puntos, paréntesis y guiones. Quitar +502 al inicio o 502 solo si el compacto tiene once dígitos. Conservar exactamente ocho dígitos, inicial de 2 a 9. Un teléfono local de ocho dígitos que empieza por 502 no pierde esos dígitos.
4. Comprobar NIT no NULL y teléfono únicos tras normalizar. En edición excluir solo la propia fila autorizada. Interpretar el error MySQL 1062 sin exponer SQL ni datos de otros clientes.

| Entrada | Resultado normalizado | Comportamiento esperado |
| --- | --- | --- |
| 000452 1817-k | 4521817K | NIT válido; duplicado si ya existe ese compacto |
| CF, c-f o vacío | NULL | Varios clientes pueden ser CF; al presentar, usar CF |
| 000 | 0 | NIT inválido, no CF |
| 0019 | 19 | NIT válido de dos caracteres |
| +502 (5555)-1234 o 50255551234 | 55551234 | Misma identidad telefónica y mismo conflicto de duplicado |
| 50212345 | 50212345 | Teléfono local válido de ocho dígitos |
| 15551234 | 15551234 | Inválido por el primer dígito |

Para R3, reutilizar el orden de bloqueo anterior en todos los caminos: con nueve clientes solo puede confirmar una de dos altas/tomas/asignaciones simultáneas; con diez no se admite aumentar la cartera. La cuenta activa del vendedor debe volver a consultarse en MySQL y el destino de la API sale de su token validado, no del cuerpo.

Estado A3: 32 vectores comparados con el FormRequest del panel verifican aceptación/rechazo y normalización R4. Conflictos de índices y cupo se prueban también entre ambas puertas. La equivalencia comprobada se limita a estas reglas de clientes; no acredita módulos futuros ni revisión visual. La API responde con su contrato, sin copiar envoltorios Laravel.

## Evidencia A3 entre puertas

75 pruebas aprobadas en MySQL real, sin reinicios. Cinco carreras API/API: dos altas con cupo nueve; dos tomas distintas con cupo nueve; diez vendedores sobre un disponible; NIT repetido; teléfono repetido. Resultados: un éxito y conflicto 409 para cada pareja; diez tomas producen un 200 y nueve 409.

Cuatro carreras API/panel: alta contra alta con cupo nueve, toma contra asignación del mismo disponible, NIT y teléfono duplicados. Se comprueban conexiones distintas y operaciones pendientes antes de liberar una barrera SQL común; sus tiempos cruzan la liberación. En esta ejecución la API confirmó 201/200 y el panel devolvió 409; cada caso dejó un solo ganador y cupo máximo diez. API atiende HTTP TCP y Laravel su kernel HTTP desde un proceso PHP, no un recorrido de navegador.

Se verifica IS_FREE_LOCK después de cada caso. También se probó pérdida de estado activo y cambio de propietario mientras una escritura espera: 401/404 sin escritura. Antes de cada limpieza se comprueban base/cuenta/permisos y se eliminan exclusivamente fixtures propios. Huellas preexistentes de pruebas y principal conservadas. No se afirma concurrencia de etapas, aún fuera de A3.

## A4: oportunidades, catálogo e historial

La API revalida al vendedor con users FOR SHARE y bloquea cliente antes de oportunidad (ambos FOR UPDATE). El panel L4 adquiere usuarios antes de clientes/oportunidades, así la reasignación no puede atravesar una escritura A4. Crear exige que el cliente bloqueado siga en la cartera. Una abierta exige dueño actual de oportunidad y cliente; una cerrada propia solo es legible como archivo y no da acceso a la ficha del cliente. Título/etapa/líneas de una cerrada reciben 409.

Antes de iniciar el cambio se observa la etapa de la oportunidad propia. Después de bloquearla se compara con la observación: si cambió, 409. No se refresca esa observación al reintentar por interbloqueo. Una petición posterior, que ya observa el nuevo estado, puede avanzar conforme a las reglas. No se agrega un campo de versión al contrato.

Etapa y fecha_cierre usan la misma conexión/transacción y UTC_TIMESTAMP(); el historial toma updated_at de esa escritura para conservar exactamente el mismo instante. La creación inserta también su entrada inicial NULL → prospecto. Rechazos revierten todo. No se generan entradas al editar título/líneas ni por reasignar. El orden del historial es created_at, id para desempatar cambios dentro del mismo segundo.

Para agregar/editar cantidad, el producto se consulta con FOR SHARE: compatible con SELECT y excluyente con la edición de catálogo. Al agregar se exige activo, cantidad mínima y precio actual copiado como DECIMAL. Al editar se exige mínimo vigente y se conserva precio cotizado; no se exige que siga activo. Al cerrar no se revalidan mínimos/precios/actividad del catálogo. Total/subtotales siempre proceden de SQL decimal.

Evidencia A4: 38 casos nuevos aprobados; cinco carreras HTTP TCP con conexiones distintas y barrera SQL. Dos avances al mismo destino, avance contra pérdida y dos cierres producen un 200/un 409, sin historial adicional. Producto repetido produce 201/409. Cierre contra cantidad deja cierre coherente: si el cierre gana, la edición recibe 409; si la edición precede al cierre, ambas pueden confirmar en ese orden y el cierre usa la cantidad confirmada. En la ejecución final el cierre ganó (200/409). Hay pruebas adicionales de espera por catálogo y de propiedad perdida mientras una creación espera; estas usan cambios SQL controlados, no peticiones de panel. Las carreras API/panel reales del apartado A3 siguen aprobadas en la regresión; no se presenta el caso SQL A4 como una nueva carrera HTTP contra panel.

Los privilegios A4 son oportunidades SELECT/INSERT/UPDATE, oportunidad_productos SELECT/INSERT/UPDATE/DELETE e historial_etapas SELECT/INSERT. Users/productos siguen en SELECT y clientes conserva sus permisos A3. La API nunca altera el esquema ni crea cuentas.

## A5: actividades y cartera actual

Listado y modificación se autorizan por clientes.vendedor_id actual, nunca por actividades.vendedor_id, que conserva al autor. POST/PATCH reutilizan withPortfolio: bloqueo nombrado por base/vendedor, usuario FOR SHARE, cliente FOR UPDATE y luego actividad si corresponde. Se revalida propiedad después de esperar. Esto se excluye con el usuario FOR UPDATE que toma el panel al reasignar/liberar/eliminar. Las fechas se validan con zona y se guardan UTC; completada es booleano estricto y vencida se calcula al responder. Las dos pruebas A5 con cambio de dueño bajo barrera SQL devuelven 404 sin escritura; no se presentan como carreras HTTP adicionales contra el panel. Datos previos conservados, 37 casos A5 aprobados dentro de 150 totales.

## Revisión A7/A8 del ciclo de conexión

Si no se recibe confirmación de GET_LOCK, se descarta la conexión: el servidor pudo adquirir el bloqueo aunque la respuesta se perdiera. Tras adquisición confirmada, RELEASE_LOCK termina antes de devolver la conexión al pool, tanto en éxito como en error. Si la liberación o el rollback quedan sin confirmar, no se reutiliza esa conexión: se destruye. opportunityTransaction aplica el mismo descarte ante rollback fallido. Los seis casos de transaction-review.test.js usan dobles de conexión e incluyen fallos simulados; no se presentan como cortes reales de MySQL. Las catorce carreras reales de A3/A4 y los recuentos bajo bloqueo permanecen aprobados; no se cambió el protocolo Laravel ni se ampliaron permisos.
