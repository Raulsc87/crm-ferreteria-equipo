# Especificación del CRM Ferretería

Requisitos de Raúl y Diego. Fuente obligatoria: [enunciado, 22 páginas](enunciado.pdf). Ante una omisión prevalece el PDF; las decisiones abiertas se concretan aquí. El estado de implementación se registra en el [plan](plan.md) y las pruebas en [verificación](verificacion.md).

La primera especificación y `spec-v1` pertenecen al [repositorio original](https://github.com/Raulsc87/crm-ferreteria/tree/spec-v1), anteriores a su código de negocio. Este repositorio de equipo contiene una importación; no se recrea esa etiqueta ni se finge la misma genealogía.

## Alcance y arquitectura

Organizar cuentas, clientes, oportunidades/cotizaciones, seguimiento y resultados de una ferretería. Una oportunidad ganada representa una venta. No incluye inventario, existencias, proveedores, facturación, pagos ni tienda pública.

| Parte | Tecnología obligatoria | Función |
| --- | --- | --- |
| Panel | PHP 8.4, Laravel 13, Breeze Blade, Eloquent | Administrador y supervisor |
| API | Node.js 24 LTS, Express 5, mysql2, jsonwebtoken, bcryptjs y cors | Operaciones del vendedor; SQL con parámetros ?, sin ORM ni constructor |
| SPA | HTML, Bootstrap 5.3 y módulos JavaScript | Vendedor; estado → render y eventos delegados, sin framework |
| Base | MySQL Community Server 8.4 LTS | Una base compartida por panel y API; fechas UTC, importes DECIMAL |

Solo Laravel crea o cambia el esquema mediante migraciones; users se extiende con una nueva sin editar la original. Se conservan las auxiliares de Laravel. Solo el administrador crea cuentas y solo Laravel genera hashes; la API compara con bcryptjs. Postman verifica el contrato.

## Roles y decisiones

| Rol | Acceso y alcance | Límites |
| --- | --- | --- |
| Administrador | Panel; cuentas, catálogo, todos los clientes/oportunidades y reportes de empresa | Sin API, sin borrado de cuentas; no puede desactivarse ni quitarse su propio rol |
| Supervisor | Panel; su equipo, sus clientes y disponibles; asignaciones y reportes del equipo | Sin cuentas/catálogo/API; recursos de otro equipo 404; solo asigna a vendedores activos propios |
| Vendedor | SPA/API; cartera actual, oportunidades propias, seguimiento y resumen | Sin panel; recursos ajenos o inexistentes 404 |

Cada vendedor requiere un supervisor activo válido al crear/editar cuenta; otros roles no llevan supervisor. Un supervisor con vendedores asociados, incluso inactivos, no cambia de rol hasta reasignarlos. Desactivarlo conserva asociaciones y datos. Cambiar el supervisor de un vendedor mueve su ámbito, no la titularidad de clientes.

| Decisión del equipo | Regla adoptada y motivo |
| --- | --- |
| Transiciones | prospecto → calificado → propuesta → negociacion → ganada; perder desde cualquier abierta. Sin saltos ni retrocesos: simplifica seguimiento y permite la pérdida de la semilla desde propuesta |
| Reasignar cliente | Transfiere abiertas, conserva vendedor/crédito de cerradas. No mueve ventas históricas ni inventa cambios de etapa |
| Consultar archivo tras reasignar | Vendedor anterior lee solo sus cerradas, con id/nombre de cliente; nunca ficha, NIT, teléfono ni correo actuales. Nuevo vendedor no ve las cerradas ajenas |
| Actividades reasignadas | Conservan autor; acceso y finalización dependen del vendedor actual del cliente |
| Liberar cliente | Solo sin oportunidades abiertas ni actividades pendientes; conserva cerradas y completadas. No deja trabajo sin responsable |
| Desactivar vendedor | Bloquea acceso; conserva cartera hasta reasignación explícita, sin liberación automática ni cambio del crédito cerrado |
| Campos desconocidos | 422 por campo; no ignorarlos silenciosamente ni permitir fijar precio/propietario |
| Regla del sector | Cantidad mínima por producto; default 1 no interfiere con la semilla común |

No hay registro público. Cuenta inactiva no entra; rol y estado se consultan de nuevo en cada petición protegida. Sesión/JWT existentes dejan de servir cuando pierden acceso.

## Modelo de datos

Todas las tablas tienen id; referencias compatibles con users.id. Todas llevan created_at/updated_at salvo historial_etapas, que solo tiene created_at. Fechas de negocio DATETIME UTC.

| Tabla | Columnas de negocio | Integridad principal |
| --- | --- | --- |
| users | Columnas originales de Laravel; rol, supervisor_id nullable, activo | Rol administrador/supervisor/vendedor, por defecto vendedor; activo por defecto verdadero; supervisor_id FK a users, obligatorio solo para vendedores; correo único |
| productos | nombre VARCHAR(120), precio DECIMAL(10,2), activo; cantidad_minima SMALLINT DEFAULT 1 | Nombre obligatorio y único; precio > 0; activo por defecto verdadero; cantidad_minima entre 1 y 999 |
| clientes | vendedor_id nullable, nombre VARCHAR(150), nit VARCHAR(12) nullable, telefono CHAR(8), correo VARCHAR(150) nullable | vendedor_id FK a users; nombre obligatorio; NIT y teléfono únicos; teléfono de ocho dígitos, inicial de 2 a 9 |
| oportunidades | cliente_id, vendedor_id, titulo VARCHAR(150), etapa, motivo_perdida VARCHAR(255) nullable, fecha_cierre DATETIME nullable | FKs a clientes y users; título obligatorio; etapa por defecto prospecto; motivo y cierre coherentes con la etapa |
| oportunidad_productos | oportunidad_id, producto_id, cantidad SMALLINT, precio_unitario DECIMAL(10,2) | FKs; UNIQUE(oportunidad_id, producto_id); cantidad 1–999; precio > 0; al borrar oportunidad se borran sus líneas |
| historial_etapas | oportunidad_id, usuario_id, etapa_anterior nullable, etapa_nueva, created_at DATETIME | FKs; etapa_nueva obligatoria; etapa_anterior vacía solo en creación; al borrar oportunidad se borra su historial |
| actividades | cliente_id, vendedor_id, tipo, descripcion VARCHAR(500), vence_en DATETIME nullable, completada | FKs; tipo llamada/reunion/tarea; descripción obligatoria; completada por defecto falso; al borrar cliente se borran sus actividades |


Además de las FK y los índices únicos, MySQL aplica CHECK: precio positivo en catálogo/líneas; cantidades y mínimo 1–999; teléfono compacto; presencia de supervisor según rol; abiertas sin cierre/motivo, ganada con cierre y sin motivo, perdida con cierre y motivo no vacío. La aplicación valida roles de las referencias, NIT, cupo, mínimos entre tablas y transiciones.

No hay eliminación de cuentas o productos: se desactivan. Solo administrador elimina clientes sin ninguna oportunidad; sus actividades se borran en cascada. No se añaden endpoints de eliminación de clientes, cuentas u oportunidades.

## Reglas y criterios de aceptación R1–R8

Cada fila expresa precondición → operación → resultado comprobable.

| Código | Dado / cuando | Entonces |
| --- | --- | --- |
| R1 | Cuenta que solicita acceso o usa sesión/JWT emitido | Solo su puerta y estado actual; credenciales erróneas 401 en API; cuenta sin acceso con clave correcta 403; vendedor en panel recibe indicación de usar SPA |
| R2 | Usuario que consulta/modifica, incluso por URL directa o filtro | Solo su ámbito; ajeno/inexistente 404; propietario sale de sesión/token, nunca del cuerpo |
| R3 | Vendedor con nueve clientes que crea/toma/recibe; varias peticiones simultáneas | Máximo diez; con cupo lleno 409 en API. Toma de un disponible: exactamente un ganador; los demás 409 |
| R4 | Alta/edición de cliente con formatos equivalentes | NIT/teléfono se normalizan antes de validar/unicidad; varios CF válidos, duplicados 409 en API, incluso por índice concurrente; mismas reglas en ambas puertas |
| R5 | Oportunidad creada o cambiada por propietario autorizado | Nace prospecto con historial NULL → prospecto. Cambio permitido, cierre UTC e historial atómicos; ganar exige líneas, perder motivo. Cerradas 409. Rechazos no dejan historial; mismo estado observado en paralelo produce una confirmación y un conflicto |
| R6 | Cotización de producto activo y cantidad válida | Precio copiado del catálogo en servidor; repetido 409; inactivo al agregar 422; subtotal/total SQL decimal. Cambios posteriores de catálogo no alteran líneas ni reportes |
| R7 | Consulta mensual y pronóstico del ámbito autorizado | Ventas por cierre del mes Guatemala [inicio, siguiente inicio); sumas históricas en base; pronóstico de todas las abiertas, redondeado al final; sin resultados ceros numéricos |
| R8 | Entrada/salida de fechas y actividad de cartera actual | Fecha de entrada ISO con zona; sin zona 422; guardar/devolver UTC y mostrar Guatemala. vencida solo pendiente con fecha pasada; sin fecha/completada false; respuestas sin campos privados |

### Identidad del cliente (R4)

Nombre obligatorio, máximo 150; correo opcional válido, máximo 150. NIT y teléfono son texto; arrays/objetos no se convierten a texto.

1. NIT: quitar espacios, guiones y ceros iniciales; pasar a mayúsculas. CF o vacío → NULL; solo ceros permanece inválido.
2. No CF: 2–12 caracteres compactos; cuerpo numérico sin cero inicial y verificador 0–9/K. Ponderar cuerpo de derecha a izquierda por 2, 3, 4…; calcular (11 − (suma mod 11)) mod 11; 10 se representa K.
3. Ejemplo: 000452 1817-k → 4521817K. CF se devuelve como "CF"; varios NULL no chocan con el índice.
4. Teléfono: quitar espacios, puntos, paréntesis y guiones; retirar +502 o 502 solo como prefijo de un número completo. Resultado ocho dígitos con inicial 2–9. El local 50212345 se conserva.
5. NIT no CF y teléfono únicos después de normalizar. Edición excluye solo su propia fila autorizada. Índices MySQL son la barrera final; no exponer SQL ni identidad ajena al traducir conflictos.

### Cartera y transacciones (R3/R5)

Todas las altas, tomas y asignaciones cuentan dentro de transacciones y bajo bloqueos comunes. El panel bloquea usuarios implicados en orden estable, luego cliente y sus pendientes. La API conserva users en SELECT: GET_LOCK por base/vendedor y users FOR SHARE, compatible con el FOR UPDATE del panel. Cuenta IDs actuales de clientes bajo bloqueo antes de aumentar cartera.

API libera el bloqueo nombrado en la misma conexión antes de devolverla al pool; descarta conexiones cuyo rollback/liberación/adquisición no se confirme. Revalida cuenta, ámbito y propietario después de esperar. Detalles y carreras acreditadas: [protocolo-cartera.md](protocolo-cartera.md); sus referencias a secciones antiguas corresponden al registro original enlazado en el anexo.

Cambio de etapa compara el estado observado antes de esperar con el bloqueado: si cambió, 409. Conserva esa observación en reintentos. Etapa, cierre e historial se confirman o revierten juntos. Cambiar título/líneas o reasignar no inventa historial de etapa.

### Dinero y mínimo del sector

Nombre del producto obligatorio, normalizado sin espacios sobrantes, único, máximo 120. Precio positivo de Q0.01 a Q99,999,999.99, hasta dos decimales; cantidades enteras 1–999; activo booleano.

productos.cantidad_minima es SMALLINT obligatorio, default 1, CHECK 1–999. Agregar o editar cantidad exige al menos el mínimo vigente; no exige múltiplos: mínimo 50 admite 50 y 51, rechaza 20 o 49 con 422 en cantidad. VerificacionSeeder conserva mínimo 1.

Al agregar se bloquea producto con FOR SHARE, se exige activo y se copia precio_unitario. Editar cantidad conserva precio histórico y exige mínimo vigente aunque el producto ya esté inactivo. Cambiar catálogo no altera líneas anteriores ni impide cerrar una cotización previamente válida. SPA nunca envía precio, mínimo, subtotales ni total.

### Meses y pronóstico

Mes AAAA-MM, por defecto el actual de America/Guatemala; rango admitido 1000-01–9998-12. Límites locales convertidos a UTC, inicio inclusivo y siguiente inicio exclusivo. Octubre 2026: [2026-10-01 06:00:00, 2026-11-01 06:00:00) UTC.

Una venta es una oportunidad ganada. Total vendido = suma de sus cantidades × precios guardados. Probabilidades: prospecto 10%, calificado 25%, propuesta 50%, negociacion 75%, ganada 100%, perdida 0%. Pronóstico = ROUND(SUM(total × probabilidad), 2) de todas las abiertas, sin mes. No sumar valores ya redondeados ni multiplicar recuentos al unir líneas/clientes.

Panel: empresa o equipo, desglose por vendedor y producto con unidades e importe vendido. Contar ventas distintas por producto no permite sumar esa columna para obtener ventas de empresa. Cartera se cuenta aparte según asignación actual; ventas conservan vendedor histórico.

## Contrato de la API

Base habitual http://127.0.0.1:3000/api; revisión local usa 3001. JSON; Bearer salvo POST /auth/login. JWT HS256, sub textual del id y expiración configurable. Firma/algoritmo/expiración/sub y cuenta vendedora activa se comprueban en cada petición.

| Método | Ruta relativa | Entrada permitida | Éxito | Errores del contrato |
| --- | --- | --- | --- | --- |
| POST | /auth/login | correo, clave | 200 { token, usuario } | 400, 401, 403, 422 |
| GET | /productos | Sin cuerpo | 200, lista de productos activos | 401 |
| GET | /clientes | q opcional: contiene en nombre o NIT | 200, lista de la cartera | 401 |
| POST | /clientes | nombre, nit, telefono; correo opcional | 201, cliente en cartera | 400, 401, 409, 422 |
| GET | /clientes/disponibles | Sin cuerpo | 200, [{ id, nombre }] | 401 |
| POST | /clientes/:id/tomar | Sin cuerpo | 200, cliente en cartera | 401, 404, 409 |
| GET | /clientes/:id | Sin cuerpo | 200, cliente | 401, 404 |
| PATCH | /clientes/:id | Campos del cliente que cambian | 200, cliente | 400, 401, 404, 409, 422 |
| POST | /clientes/:id/actividades | tipo, descripcion; vence_en opcional | 201, actividad | 400, 401, 404, 422 |
| GET | /actividades | estado opcional: pendiente o completada | 200, actividades de la cartera actual | 400, 401 |
| PATCH | /actividades/:id | completada, booleano | 200, actividad | 400, 401, 404, 422 |
| GET | /oportunidades | etapa opcional | 200, resúmenes propios | 400, 401 |
| POST | /oportunidades | cliente_id, titulo | 201, detalle en prospecto | 400, 401, 422 |
| GET | /oportunidades/:id | Sin cuerpo | 200, detalle | 401, 404 |
| PATCH | /oportunidades/:id | titulo | 200, detalle | 400, 401, 404, 409, 422 |
| PATCH | /oportunidades/:id/etapa | etapa; motivo_perdida solo al perder | 200, detalle | 400, 401, 404, 409, 422 |
| POST | /oportunidades/:id/productos | producto_id, cantidad | 201, detalle | 400, 401, 404, 409, 422 |
| PATCH | /oportunidades/:id/productos/:lineaId | cantidad | 200, detalle | 400, 401, 404, 409, 422 |
| DELETE | /oportunidades/:id/productos/:lineaId | Sin cuerpo | 204, sin cuerpo | 401, 404, 409 |
| GET | /reportes/resumen | mes opcional AAAA-MM; por defecto mes actual en Guatemala | 200, resumen | 400, 401 |


Son exactamente veinte endpoints. Listas como arreglos sin envoltorio; lineaId identifica línea, no producto. Campos no admitidos 422; filtros/cuerpos ilegibles o parámetros no admitidos 400. R2 exige 404 también en POST /oportunidades con cliente ajeno, aunque esa fila del PDF omita el código: interpretación explícita conservada, pendiente de confirmar con el catedrático.

Login recibe solo correo/clave; correo normalizado, contraseña intacta. bcryptjs verifica el hash Laravel; clave no vacía y hasta 72 bytes. Correo inexistente/clave errónea comparten el mismo 401. Tras clave correcta, administrador/supervisor/inactivo reciben 403 sin token. usuario solo id/nombre/correo.

POST cliente exige nombre/nit/telefono, correo opcional; PATCH solo campos que cambian. POST oportunidad solo cliente_id/titulo (1–150, espacios compactados), etapa prospecto impuesta. PATCH título solo titulo. IDs de cuerpos enteros positivos; no acepta propietario o precio.

Actividad: tipo llamada/reunion/tarea; descripción 1–500, sin solo espacios; fecha opcional se omite si no existe. Si se envía, texto ISO con T y zona Z o ±HH:mm; calendario válido y rango UTC MySQL. Se admiten fechas pasadas, segundos opcionales/fracciones, almacenando segundos según DATETIME. NULL/vacío/sin zona: 422. PATCH solo completada booleano; estado inválido en GET: 400.

### Respuestas públicas

Cliente:

```json
{"id":1,"nombre":"Comercial El Quetzal","nit":"4521817K","telefono":"55551234","correo":"compras@elquetzal.test"}
```

Inicio de sesión:

```json
{"token":"<JWT firmado>","usuario":{"id":4,"nombre":"Valeria López","correo":"valeria@crm.test"}}
```

Productos activos: elementos con id, nombre y precio numérico. No se exponen propiedades internas ni productos inactivos. La columna adicional del sector se configura en el panel y se valida en el servidor; no exige cambiar esta forma mínima.

Resumen de oportunidad: id, cliente con id y nombre, titulo, etapa, probabilidad numérica, total numérico, fecha_cierre y motivo_perdida. No incluye productos ni historial.

Detalle de oportunidad:

```json
{
  "id":1,
  "cliente":{"id":1,"nombre":"Comercial El Quetzal"},
  "titulo":"Renovación de planes",
  "etapa":"ganada",
  "probabilidad":100,
  "total":5650,
  "fecha_cierre":"2026-10-05T16:00:00.000Z",
  "motivo_perdida":null,
  "productos":[
    {"id":1,"producto_id":2,"nombre":"Plan avanzado","cantidad":2,"precio_unitario":2600,"subtotal":5200},
    {"id":2,"producto_id":3,"nombre":"Instalación","cantidad":1,"precio_unitario":450,"subtotal":450}
  ],
  "historial":[
    {"etapa_anterior":null,"etapa_nueva":"prospecto","usuario":"Valeria López","fecha":"2026-09-23T16:00:00.000Z"}
  ]
}
```

El historial de este ejemplo está abreviado; la respuesta real contiene todos los registros en orden cronológico estable.

Actividad:

```json
{"id":2,"cliente":{"id":2,"nombre":"Ferretería Xela"},"tipo":"tarea","descripcion":"Enviar propuesta de capacitación","vence_en":"2030-01-15T15:00:00.000Z","completada":false,"vencida":false}
```

Resumen mensual:

```json
{"mes":"2026-10","ventas":2,"total":9250,"pronostico":2512.88,"cartera":{"clientes":3,"maximo":10}}
```

Error general y de validación:

```json
{"error":"Su cartera ya tiene 10 clientes, el máximo permitido."}
```

```json
{"errores":{"cantidad":"Ingrese al menos 50 unidades para este producto."}}
```



### Códigos de respuesta

| Código | Significado |
| --- | --- |
| 200 | Consulta/modificación/toma correcta |
| 201 | Creación de cliente, oportunidad, línea o actividad |
| 204 | Línea retirada, sin cuerpo |
| 400 | Cuerpo ilegible/ausente cuando se exige; filtro/parámetro no admitido o inválido |
| 401 | Credenciales erróneas o token/cuenta ya no válidos |
| 403 | Login con clave correcta sin permiso para API |
| 404 | Recurso ajeno o inexistente, incluida línea fuera de la oportunidad |
| 409 | Cupo, cliente tomado, duplicado, cerrada o conflicto de estado |
| 422 | Datos/campos/transiciones/mínimo/fecha inválidos |
| 500 | Error inesperado, mensaje genérico; diagnóstico interno |

Se autentica antes de exponer recursos y se autoriza antes de informar su estado. Los errores no muestran SQL, trazas, hashes ni secretos. 204 es la excepción deliberada a cuerpo JSON.

## Requisitos por aplicación

### Panel L1–L7

| Código | Criterio comprobable |
| --- | --- |
| L1 | En base exclusiva vacía, migraciones/semillas crean núcleo íntegro, ambas cargas o solo VerificacionSeeder; users se extiende sin editar su migración original |
| L2 | Administrador crea/edita nombre, correo, contraseña, rol, supervisor y estado; contraseña obligatoria al crear y vacía conserva al editar; roles, supervisor activo y protección propia aplicados en servidor |
| L3 | Administrador lista/agrega/edita/desactiva; nombre único, precio positivo hasta dos decimales, mínimo y booleano válidos; no borra ni modifica históricos |
| L4 | Clientes buscables por nombre/NIT, filtro vendedor/sin asignar dentro del ámbito; altas/ediciones R3/R4, asignar/reasignar/liberar según decisiones; solo administrador elimina sin oportunidades |
| L5 | Supervisor solo ve su equipo, incluidos inactivos, cartera de diez y ventas del mes; URL ajena 404 y destino activo propio |
| L6 | Oportunidades solo lectura, filtro etapa/vendedor, total y cierre Guatemala; reportes empresa/equipo por vendedor/producto con mes, ventas, total y pronóstico; cifras comunes exactas |
| L7 | Todas las entradas FormRequest/validate; español de usted, datos conservados y errores junto al campo, nunca contraseñas; paridad R3/R4 con API |

### API A1–A8

| Código | Criterio comprobable |
| --- | --- |
| A1 | Login verifica hash Laravel con bcryptjs; vendedor activo 200 token/usuario, credenciales erróneas 401 uniforme y demás roles/inactivo con clave correcta 403 |
| A2 | Bearer en toda ruta protegida; firma HS256, expiración/sub y cuenta actual comprobados; falla 401 |
| A3 | Seis rutas de clientes con R2/R3/R4; toma de diez vendedores produce un ganador y cupo simultáneo máximo diez |
| A4 | Ocho rutas de oportunidades/líneas con R5/R6, precio copiado, mínimo, cierre inmutable e historial atómico concurrente |
| A5 | Seguimiento por cartera actual, autor histórico, ISO con zona y vencida calculada |
| A6 | Resumen SQL con R7 y números exactos de la semilla común |
| A7 | Veinte contratos, códigos y errores JSON; 422 por campo, 500 genérico sin detalles internos |
| A8 | README con arranque desde cero y tabla de rutas; colección con cada endpoint, errores y mínimo del sector |

### SPA F1–F6

| Código | Criterio comprobable |
| --- | --- |
| F1 | Login y 403 comprensible; solo sesión en LocalStorage; logout borra y 401 protegido vuelve al acceso con aviso |
| F2 | Cartera/búsqueda en servidor, ocupación de diez, alta/edición con errores y datos conservados, disponibles/toma y 409 claro |
| F3 | Cuatro columnas abiertas y lista de cerradas; detalle, precio histórico, cantidades, subtotal/total, historial Guatemala, transiciones y motivo al perder |
| F4 | Crear desde cliente, listar pendientes/completadas, distinguir vencidas y completar; fecha Guatemala convertida con zona, independiente del equipo |
| F5 | Selector mensual, ventas, total, pronóstico y cartera desde API, quetzales y fechas Guatemala |
| F6 | Estado → render, eventos delegados, carga y conexión fallida comprensibles, texto seguro y uso a 375 px sin desbordamiento horizontal |

Estos son criterios exigidos, no resultados de pruebas. Los comandos fresh del criterio L1 y de la defensa se reservan a una base exclusiva cuyo reinicio se autorice expresamente; nunca a las bases manual/principal/A6 conservadas.

## Seguridad S1–S8

| Código | Criterio verificable | Dónde se cumple |
| --- | --- | --- |
| S1 | No hay contraseñas planas en la base; solo Laravel genera hashes | Creación/edición de cuentas y seeders Laravel; verificación bcryptjs en API |
| S2 | .env de Laravel/API no entra a Git; .env.example no contiene secretos; JWT_SECRET tiene al menos 32 caracteres aleatorios | .gitignore, configuración y revisión del historial; si se filtra un secreto se rota |
| S3 | Ninguna entrada se concatena en SQL; una búsqueda con intento de inyección no altera la consulta | mysql2 con parámetros; Eloquent/enlaces de parámetros en panel; sin DB::raw con entradas |
| S4 | Ninguna respuesta expone hashes, llaves internas o datos ajenos | Consultas con proyecciones y serializadores explícitos; revisión en Postman |
| S5 | Recursos ajenos devuelven 404 en panel y API | Autorización por rol, equipo, propietario y cartera vigente |
| S6 | CORS permite solo el origen exacto configurado de la SPA, nunca * | Middleware cors y prueba con otro origen; no reemplaza autenticación |
| S7 | Nombres maliciosos se muestran como texto, sin ejecutar scripts | textContent o escape antes de innerHTML; Blade con salida escapada, nunca {!! !!} para datos de usuario |
| S8 | Duplicados, cartera, toma de clientes y etapas siguen siendo correctos en paralelo | Índices únicos, transacciones, bloqueos y comprobaciones de estado |


## Semillas y controles

VerificacionSeeder reproduce exactamente sección 11 del PDF: cuentas/equipos/estados, productos, clientes, cotizaciones, precios históricos, fechas UTC, historial y actividades. Sin IDs fijos ni sustituciones de nombres. Solo Laravel genera hashes. Recuentos: 7 cuentas, 5 productos, 21 clientes, 11 oportunidades, 13 líneas, 43 historiales y 4 actividades.

DatabaseSeeder ejecuta VerificacionSeeder y después SectorSeeder. Sector agrega identidades distintas, catálogo con referencias de Guatemala, vendedores/supervisores, oportunidades de todas las etapas y actividades; sin modificar comunes ni superar diez clientes. Ambas rechazan repeticiones. Contraseña pública únicamente en seeders, README y colección.

| Usuario / ámbito | Mes | Ventas | Total vendido | Pronóstico | Cartera |
| --- | --- | ---: | ---: | ---: | --- |
| Valeria López | 2026-10 | 2 | Q9,250.00 | Q2,512.88 | 3 de 10 |
| Valeria López | 2026-11 | 1 | Q3,600.00 | Q2,512.88 | 3 de 10 |
| Diego Castillo | 2026-10 | 1 | Q6,000.00 | Q112.50 | 2 de 10 |
| Carlos Ajú | 2026-10 | 1 | Q7,200.00 | Q4,125.75 | 9 de 10 |
| Equipo de Sergio Ruiz | 2026-10 | 3 | Q15,250.00 | Q2,625.38 | — |
| Equipo de Sandra Pérez | 2026-10 | 1 | Q7,200.00 | Q4,125.75 | — |
| Toda la empresa | 2026-10 | 4 | Q22,450.00 | Q6,751.13 | — |

| Producto, octubre 2026 | Unidades vendidas | Total |
| --- | ---: | ---: |
| Plan básico | 5 | Q6,000.00 |
| Plan avanzado | 2 | Q5,200.00 |
| Instalación | 1 | Q450.00 |
| Soporte anual | 3 | Q10,800.00 |


Cierre 2026-11-01 03:30 UTC pertenece a octubre Guatemala; 06:30 UTC a noviembre. Renovación de planes conserva Q2,600.00 en Plan avanzado frente a Q2,750.50 del catálogo. La defensa usa solo la semilla común, en un entorno separado autorizado.

## Proceso P1–P5 y entrega

| Código | Entregable y criterio |
| --- | --- |
| P1 | Especificación anterior al código: sector, regla, criterios verificables, contrato, modelo y decisiones con alternativas. Evidencia de spec-v1 en el original, enlazada sin recrearla |
| P2 | Plan actualizado antes de cada fase: arquitectura, tareas, responsables reales y encargos a IA |
| P3 | Matriz con evidencia, resultados, controles, concurrencia y pendientes, sin inventar pruebas |
| P4 | AGENTS.md en raíz con reglas del proyecto |
| P5 | Al menos tres errores reales de IA: propuesta, detección, corrección y commit correctivo con procedencia |

La alternativa a transferir abiertas era dejarlas fuera de cartera; la alternativa a conservar crédito cerrado era alterar ventas históricas. Liberar con pendientes y liberar automáticamente al desactivar se descartaron por dejar seguimiento sin responsable. Ignorar campos extra se descartó para detectar errores de contrato. No se imponen montos mínimos generales que impidan la semilla común.

Archivos de entrega: README, AGENTS, .gitignore, especificación/plan/verificación, colección, laravel/api/frontend, manifiestos/locks y ejemplos sin secretos. Git acredita commits reales de ambos integrantes, sin cambiar autores. Ambos responden por todo el código, incluso el generado con IA.

Cambio del catedrático: especificación y plan primero, spec-v2 y migraciones nuevas después; no editar las aplicadas. No anticipar requisitos. Entrega: enlace accesible al catedrático y hash de entrega-final, semana anterior al examen (sin fecha concreta publicada aquí). La genealogía importada y los hitos originales deben explicarse, no falsificarse.

Defensa oral de 15 minutos por pareja, nota individual: tres servicios, Postman y solo VerificacionSeeder en entorno exclusivo; explicar decisiones y modificar código en vivo. No se crea aquí entrega-final ni se reinicia una base. Despliegue, IA en el producto, CSV y limitación API de intentos son retos opcionales; no sustituyen el núcleo.
