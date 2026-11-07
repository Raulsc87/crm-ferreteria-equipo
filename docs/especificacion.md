# Especificación del CRM de ventas para una ferretería

Versión de trabajo: 1.0, candidata a la etiqueta `spec-v1`.

Integrantes: Raúl y Diego. Sector: ferretería, confirmado como disponible por el equipo. Curso: Programación Web, Universidad Mesoamericana. Fecha: 30 de octubre de 2026.

Fuente de requisitos: `Proyecto_Final_CRM_Enunciado.pdf`, 22 páginas. Esta especificación adapta el núcleo obligatorio; ante una omisión, prevalece el enunciado. El documento no acredita implementación, pruebas ejecutadas ni una etiqueta Git creada.

## 1. Objetivo y alcance

Construir un CRM para que una ferretería organice sus clientes, cotizaciones u oportunidades de venta, actividades de seguimiento y resultados comerciales. El catálogo contiene materiales, herramientas y servicios. Una oportunidad ganada representa una venta para los reportes.

La solución consta de un panel Laravel para administrador y supervisor, una API REST propia con Express para vendedores y una SPA sin framework. Las tres piezas trabajan con una sola base MySQL. No se incluyen inventario, facturación fiscal, pagos en línea ni tienda pública como requisitos de esta versión.

La adaptación de vocabulario a la ferretería se limita a las pantallas. No se cambian nombres de tablas, rutas ni campos del contrato común.

## 2. Arquitectura y herramientas obligatorias

| Pieza | Herramientas | Responsabilidad |
| --- | --- | --- |
| Panel | PHP 8.4, Composer, Laravel 13, Breeze con stack Blade, Eloquent | Cuentas, catálogo, clientes, asignaciones, equipos, consulta de oportunidades y reportes |
| API | Node.js 24 LTS, Express 5, mysql2, jsonwebtoken, bcryptjs y cors | Autenticación JWT y operaciones del vendedor, con SQL parametrizado escrito a mano |
| SPA | HTML, Bootstrap 5.3 y JavaScript con módulos | Interfaz del vendedor, patrón estado → render y delegación de eventos |
| Base | MySQL 8.4 LTS, tablas transaccionales InnoDB | Datos compartidos, integridad, unicidad y restricciones CHECK |
| Pruebas | Postman | Contrato, errores, permisos, regla del sector y evidencias |

Solo las migraciones de Laravel crean o alteran el esquema. La API no ejecuta CREATE ni ALTER y no usa ORM ni constructores de consultas. Laravel utiliza Eloquent; sus reportes pueden utilizar el constructor de consultas permitido por el enunciado.

La configuración de ambas aplicaciones apunta a la misma base MySQL. Se conservan las tablas auxiliares que necesita Laravel; las siete tablas de negocio indicadas más adelante forman el núcleo común.

## 3. Roles y acceso

| Rol | Puerta | Facultades | Restricciones |
| --- | --- | --- | --- |
| Administrador | Panel | Crear y editar cuentas; administrar catálogo; administrar todos los clientes; consultar oportunidades y reportes globales | No usa la API del vendedor; no borra cuentas; no puede desactivarse ni quitarse su propio rol |
| Supervisor | Panel | Consultar su equipo y clientes disponibles; crear y editar clientes de su ámbito; asignar, reasignar y liberar dentro de su equipo; consultar oportunidades y reportes del equipo | No administra cuentas ni catálogo, no accede a otros equipos ni a la API |
| Vendedor | SPA mediante API | Gestionar su cartera, tomar clientes disponibles, trabajar sus oportunidades y actividades y consultar su resumen | No entra al panel ni accede a recursos ajenos |

Cada vendedor pertenece a un supervisor. Al crear o editar cuentas, el supervisor seleccionado debe tener rol supervisor y estar activo. No se permite convertir una cuenta de supervisor en otro rol mientras tenga vendedores asociados; primero deben reasignarse. Desactivar un supervisor conserva las asociaciones y los datos; el administrador mantiene la gestión y puede reorganizar el equipo.

Una cuenta desactivada no inicia sesión. Una sesión o JWT ya emitido pierde validez en la siguiente petición al comprobar el estado actual del usuario en la base.

No existe registro público. Solo el administrador crea cuentas desde Laravel. Solo Laravel genera hashes de contraseñas; la API los compara con bcryptjs.

## 4. Modelo de datos

Todas las tablas del núcleo tienen `id` como clave primaria. Las referencias usan tipos compatibles con `users.id`. Todas tienen `created_at` y `updated_at`, excepto `historial_etapas`, que solo tiene `created_at`. Las fechas se guardan en UTC.

| Tabla | Columnas de negocio | Integridad principal |
| --- | --- | --- |
| users | Columnas originales de Laravel; rol, supervisor_id nullable, activo | Rol administrador/supervisor/vendedor, por defecto vendedor; activo por defecto verdadero; supervisor_id FK a users, obligatorio solo para vendedores; correo único |
| productos | nombre VARCHAR(120), precio DECIMAL(10,2), activo; cantidad_minima SMALLINT DEFAULT 1 | Nombre obligatorio y único; precio > 0; activo por defecto verdadero; cantidad_minima entre 1 y 999 |
| clientes | vendedor_id nullable, nombre VARCHAR(150), nit VARCHAR(12) nullable, telefono CHAR(8), correo VARCHAR(150) nullable | vendedor_id FK a users; nombre obligatorio; NIT y teléfono únicos; teléfono de ocho dígitos, inicial de 2 a 9 |
| oportunidades | cliente_id, vendedor_id, titulo VARCHAR(150), etapa, motivo_perdida VARCHAR(255) nullable, fecha_cierre DATETIME nullable | FKs a clientes y users; título obligatorio; etapa por defecto prospecto; motivo y cierre coherentes con la etapa |
| oportunidad_productos | oportunidad_id, producto_id, cantidad SMALLINT, precio_unitario DECIMAL(10,2) | FKs; UNIQUE(oportunidad_id, producto_id); cantidad 1–999; precio > 0; al borrar oportunidad se borran sus líneas |
| historial_etapas | oportunidad_id, usuario_id, etapa_anterior nullable, etapa_nueva, created_at DATETIME | FKs; etapa_nueva obligatoria; etapa_anterior vacía solo en creación; al borrar oportunidad se borra su historial |
| actividades | cliente_id, vendedor_id, tipo, descripcion VARCHAR(500), vence_en DATETIME nullable, completada | FKs; tipo llamada/reunion/tarea; descripción obligatoria; completada por defecto falso; al borrar cliente se borran sus actividades |

Los importes usan DECIMAL, nunca FLOAT. Se rechazan precios con más de dos decimales y fuera de la capacidad del campo. La suma y el redondeo de los reportes se realizan en la base con aritmética decimal; solo se convierten a números al serializar JSON.

Los CHECK comprueban precios positivos, cantidades, teléfono y coherencia de etapa: etapas abiertas sin motivo ni cierre; ganada con cierre y sin motivo; perdida con cierre y motivo no vacío. Las FK y los índices únicos constituyen la última barrera de integridad. La relación entre rol y presencia de supervisor_id también se comprueba; que el usuario referenciado sea supervisor se valida en el servidor, porque un CHECK no consulta otra fila.

Las cuentas y los productos se desactivan. El administrador solo elimina clientes sin oportunidades. No se añaden endpoints de eliminación de oportunidades ni de cuentas.

## 5. Regla propia de la ferretería

**Un producto tiene una cantidad mínima de venta. Al agregarlo a una oportunidad o cambiar su cantidad, la cantidad solicitada debe ser al menos ese mínimo y no superar 999.**

Ejemplo: martillo con mínimo 1; ladrillo con mínimo 50. Cotizar 20 ladrillos se rechaza; cotizar 50 se acepta. No se exigen múltiplos del mínimo: 51 también se acepta.

La única columna adicional es `productos.cantidad_minima`, obligatoria con valor predeterminado 1 y CHECK entre 1 y 999. El administrador la configura en el catálogo. Los productos de VerificacionSeeder conservan 1. SectorSeeder introduce productos de ferretería con sus mínimos; no modifica productos ni precios de la semilla común.

La API consulta el mínimo en el servidor; no acepta un mínimo ni un precio enviados por el vendedor. Una cantidad entera dentro de 1–999 pero inferior al mínimo devuelve 422 con un error en `cantidad`. El servidor bloquea y comprueba el producto durante la modificación de la línea para evitar lecturas incoherentes.

El mínimo se aplica al agregar o cambiar cantidades. Cambiar el mínimo del catálogo no modifica ni invalida líneas previamente cotizadas, ni altera reportes o totales históricos. Una modificación posterior de cantidad debe cumplir el mínimo vigente. No se añade una condición adicional para ganar una oportunidad con líneas previamente válidas.

Esta regla no cambia las rutas, los cuerpos ni la forma de las respuestas del núcleo. La SPA comunica el rechazo mediante el mensaje de validación del servidor.

## 6. Decisiones del equipo

Estas decisiones concretan las preguntas abiertas del enunciado. Son decisiones de diseño, pendientes de comprobar durante la implementación.

| Pregunta | Decisión adoptada | Alternativa descartada y motivo |
| --- | --- | --- |
| Transiciones del embudo | Solo se avanza una etapa abierta por vez; se gana desde negociacion; se puede perder desde cualquier etapa abierta. No hay saltos ni retrocesos. Una transición no admitida devuelve 422; repetir la etapa actual o modificar una cerrada devuelve 409 | Saltos y retrocesos: complican la explicación y el control del historial. Perder solo desde negociación: impediría representar la pérdida desde propuesta de la semilla |
| Reasignación de cliente | Las oportunidades abiertas pasan al nuevo vendedor. Las cerradas conservan su dueño y crédito histórico. Las actividades conservan quién las registró, pero su consulta y finalización dependen de la cartera actual del cliente | Cambiar el dueño de ventas cerradas alteraría el crédito histórico. Mantener abiertas con el vendedor anterior dejaría seguimiento fuera de su cartera |
| Consulta de ventas históricas tras reasignación | El vendedor anterior puede consultar sus oportunidades cerradas y su resumen; el vínculo histórico solo muestra id y nombre del cliente, nunca acceso a su ficha actual ni teléfono, NIT o correo. El nuevo vendedor no consulta esas oportunidades cerradas ajenas | Mostrar la ficha completa expondría datos de un cliente que ya salió de la cartera |
| Liberación de cliente | Se permite si no tiene oportunidades abiertas ni actividades pendientes. Se conservan oportunidades cerradas y actividades completadas; estas últimas se consultan según la cartera actual | Liberar con trabajo pendiente dejaría oportunidades sin responsable actual |
| Desactivar vendedor | Se bloquea su acceso y sus clientes permanecen asignados hasta que el administrador o su supervisor los reasigne. Conserva el crédito de sus ventas cerradas | Liberación automática: produciría cambios de cartera y pendientes sin una decisión explícita |
| Cambiar de supervisor a un vendedor | Se permite a un administrador con supervisor destino activo; la cartera y las oportunidades acompañan al vendedor. La consulta de equipos se basa en la asociación actual | Cambiar también la titularidad de clientes generaría una reasignación innecesaria |
| Campos fuera del contrato | Se rechazan con 422, con mensajes por campo. Nunca se usan para fijar propietario, precio o etapa inicial | Ignorarlos podría ocultar errores del cliente de la API |
| Regla del sector | Cantidad mínima por producto, con valor común 1 | Restricciones generales de monto por venta podrían impedir casos válidos de la semilla |

Reasignar, liberar y desactivar se resuelven en transacciones. El supervisor solo puede actuar sobre clientes de su equipo o disponibles y asignar a vendedores activos de su propio equipo. Las oportunidades abiertas se transfieren en la misma transacción que el cliente; su historial conserva los usuarios originales, sin inventar cambios de etapa.

## 7. Reglas comunes y criterios de aceptación

### R1. Acceso

- Dado un vendedor activo, cuando inicia sesión en la API con credenciales correctas, entonces recibe token y usuario; si intenta el panel, se le indica que debe usar la SPA.
- Dado un administrador o supervisor con contraseña correcta, cuando intenta entrar por la API, entonces recibe 403 y ningún token.
- Dada una cuenta desactivada, cuando inicia sesión, entonces se rechaza el acceso; si ya tenía una sesión o token, la siguiente petición lo invalida.

### R2. Propiedad y visibilidad

- Dado un vendedor, cuando lista clientes u oportunidades, entonces recibe solo los que le corresponden según la cartera y la política de archivo histórico.
- Dado un identificador ajeno, cuando intenta leerlo o modificarlo, entonces recibe 404, igual que si no existiera.
- Dado un supervisor, cuando consulta una URL de otro equipo, entonces recibe 404.
- Dada una petición de creación, cuando se determina el propietario, entonces se obtiene del usuario autenticado y nunca del cuerpo recibido.

### R3. Cartera y concurrencia

- Dado un vendedor con 9 clientes, cuando crea, toma o recibe uno, entonces termina con 10; un intento adicional se rechaza, con 409 en la API.
- Dados clientes disponibles, cuando un vendedor los lista, entonces cada elemento solo contiene id y nombre.
- Dados varios vendedores que intentan tomar simultáneamente el mismo cliente disponible, cuando concluyen las peticiones, entonces exactamente uno lo obtiene y los demás reciben 409.
- Dado un vendedor con 9 clientes y varias altas o tomas simultáneas, cuando concluyen, entonces su cartera nunca supera 10.

### R4. Identidad del cliente

- Dado el NIT `452 1817-k`, cuando se normaliza, entonces se guarda `4521817K`; se eliminan espacios, guiones y ceros iniciales y se convierte a mayúsculas antes de validar.
- Dado un NIT compacto de 2–12 caracteres, cuando se valida, entonces se separa el verificador, se pondera el cuerpo de derecha a izquierda por 2, 3, 4… y se calcula `(11 - (suma mod 11)) mod 11`; el valor 10 se representa como K.
- Dado CF, cuando se guarda, entonces el NIT es NULL y se devuelve `CF`; varios clientes pueden tener CF.
- Dado un teléfono con espacios, guiones, puntos, paréntesis o prefijo 502/+502, cuando se normaliza, entonces queda un número de ocho dígitos que comienza de 2 a 9, o se rechaza con 422.
- Dado un NIT no CF o teléfono ya existente, cuando se intenta crear o editar un cliente con el mismo valor normalizado, entonces la API devuelve 409, incluso con peticiones simultáneas.
- Dados los mismos datos, cuando se envían desde Laravel y desde la API, entonces ambos aceptan o rechazan con las mismas reglas de negocio.

### R5. Oportunidades e historial

- Dado un cliente de la cartera, cuando se crea una oportunidad con título válido, entonces nace en prospecto y se inserta el registro inicial del historial con etapa_anterior NULL.
- Dada una oportunidad abierta, cuando cambia por una transición permitida, entonces etapa, fecha de cierre si aplica e historial se guardan en la misma transacción.
- Dada una oportunidad sin productos, cuando se intenta ganar, entonces se rechaza con 422.
- Dada una pérdida sin motivo de 1–255 caracteres después de quitar espacios sobrantes, cuando se solicita, entonces se rechaza con 422.
- Dada una oportunidad ganada o perdida, cuando se intenta cambiar título, etapa o líneas, entonces se devuelve 409 sin cambios.
- Dado un intento rechazado, cuando se consulta el historial, entonces no aparece un registro nuevo.
- Dados cambios concurrentes que parten del mismo estado de una oportunidad, cuando se resuelven, entonces solo uno confirma y el otro recibe 409; no se duplica el historial.

### R6. Dinero y productos

- Dado un producto activo, cuando se agrega a una oportunidad, entonces su precio actual se copia a precio_unitario; el vendedor solo envía producto_id y cantidad.
- Dada una línea existente, cuando cambia el precio del catálogo, entonces su precio cotizado y el reporte histórico no cambian.
- Dado un producto repetido en la misma oportunidad, cuando se intenta agregar, entonces se devuelve 409.
- Dada una cantidad no entera, fuera de 1–999 o inferior al mínimo aplicable, cuando se agrega o modifica, entonces se devuelve 422 sin modificar líneas.
- Dado un producto inactivo, cuando se intenta agregar, entonces se rechaza con 422; las líneas ya existentes se conservan.
- Dada una oportunidad, cuando se consulta, entonces el servidor calcula total como la suma de cantidad × precio_unitario.

### R7. Reportes

- Dadas oportunidades ganadas, cuando se consulta un mes, entonces solo se suman las cerradas dentro de ese mes calendario en Guatemala, UTC−6.
- Dadas oportunidades abiertas, cuando se calcula el pronóstico, entonces se suman sus totales ponderados por 10%, 25%, 50% o 75% según prospecto, calificado, propuesta o negociacion, sin filtro mensual; se redondea la suma a dos decimales.
- Dado un reporte, cuando se calcula, entonces la agregación ocurre en la base; los importes JSON son números.
- Dado un supervisor o administrador, cuando consulta el panel, entonces ve respectivamente su equipo o toda la empresa, con desglose por vendedor y por producto según corresponda.

### R8. Formatos, fechas y actividades

- Dada una respuesta de API, cuando se serializa, entonces no contiene hashes ni campos internos vendedor_id, user_id, usuario_id o supervisor_id. Se conservan los identificadores expresamente requeridos por el contrato, como producto_id en las líneas.
- Dada una fecha sin zona horaria, cuando se recibe en la API, entonces se rechaza con 422; una fecha con zona se convierte a UTC y se devuelve en ISO 8601, por ejemplo `2026-10-05T16:00:00.000Z`.
- Dada una fecha mostrada en la SPA, cuando se renderiza, entonces se usa `America/Guatemala` aunque la computadora esté en otra zona.
- Dada una actividad no completada con vencimiento anterior al momento actual, cuando se responde, entonces vencida es true; sin vencimiento o completada, es false.

### SEC. Regla del sector

- Dado un ladrillo con cantidad_minima 50, cuando se solicitan 20 unidades, entonces se devuelve 422 en cantidad y no se crea la línea.
- Dado el mismo producto, cuando se solicitan 50 o 51 unidades, entonces se acepta si se cumplen las demás reglas.
- Dada una línea con 50 ladrillos, cuando se intenta reducir a 49, entonces se devuelve 422 y permanece en 50.
- Dado un producto de VerificacionSeeder con mínimo 1, cuando se ejecutan los casos comunes, entonces sus resultados no cambian por la regla propia.
- Dada una cotización existente, cuando el administrador aumenta el mínimo del catálogo, entonces no cambia la cotización; una edición posterior de cantidad debe satisfacer el nuevo mínimo.

## 8. Contrato de la API

Base: `http://localhost:3000/api`. Entrada y salida JSON. Todas las rutas requieren `Authorization: Bearer <token>`, excepto POST /auth/login. El JWT usa HS256, identifica al usuario mediante sub y tiene expiración configurable en .env.

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

Hay 20 endpoints obligatorios. lineaId es el identificador de la línea, no el del producto. Las listas se devuelven como arreglos JSON, sin inventar envoltorios ni paginación que cambien el contrato. No se modifica el contrato para adaptarlo al sector.

La tabla reproduce los códigos listados en el enunciado. La regla transversal R2 exige 404 cuando un identificador apunta a un recurso ajeno, incluso al enviar cliente_id en la creación de una oportunidad; se documenta esta prioridad porque ese caso no aparece en la lista de errores de esa fila del contrato.

### Formas de respuesta

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

### Códigos y precedencia

| Código | Uso |
| --- | --- |
| 200 | Lectura o modificación correcta |
| 201 | Creación de cliente, oportunidad, línea o actividad |
| 204 | Eliminación de línea, sin cuerpo de respuesta |
| 400 | JSON mal formado, cuerpo obligatorio ausente, filtro/parámetro no admitido o mes inválido |
| 401 | Credenciales incorrectas; token ausente, alterado, vencido o inválido; usuario del token desactivado o que dejó de ser vendedor |
| 403 | Login con contraseña correcta de administrador, supervisor o cuenta desactivada |
| 404 | Recurso inexistente o ajeno; una línea que no pertenece a la oportunidad indicada tampoco es accesible |
| 409 | Cartera llena, cliente ya tomado, duplicados, oportunidad cerrada o conflicto concurrente |
| 422 | Datos inválidos, campos fuera del contrato, transición no permitida, cantidad inferior al mínimo o fecha sin zona |
| 500 | Fallo inesperado con mensaje genérico; detalle solo en consola |

Se autentica antes de exponer recursos. Los filtros y JSON se validan; cuando hay un recurso identificado se comprueba su acceso antes de comunicar su estado. Correo inexistente y contraseña incorrecta producen la misma respuesta 401. Los errores controlados y las rutas inexistentes siempre responden JSON, nunca páginas HTML ni trazas.

## 9. Requisitos del panel y aceptación

| Código | Dado / Cuando / Entonces |
| --- | --- |
| L1 | Dada una base vacía, cuando se ejecuta migrate:fresh --seed, entonces se crean las tablas, restricciones y ambas semillas sin pasos manuales; con --seeder=VerificacionSeeder se carga solo la común. users se amplía con una migración nueva |
| L2 | Dado un administrador autenticado, cuando crea o edita una cuenta, entonces valida nombre, correo, contraseña, rol, supervisor y estado; no existen rutas de registro público y no puede desactivarse ni retirarse su propio rol |
| L3 | Dado el administrador, cuando crea o edita un producto, entonces valida nombre único, precio positivo con hasta dos decimales y cantidad mínima; desactivar conserva el producto y sus cotizaciones |
| L4 | Dado un usuario del panel, cuando consulta clientes, entonces puede buscar por nombre o NIT y filtrar por vendedor o sin asignar dentro de su ámbito; las altas, ediciones y asignaciones cumplen R3/R4; solo el administrador elimina clientes sin oportunidades |
| L5 | Dado un supervisor, cuando abre su equipo, entonces ve solo sus vendedores, cartera ocupada de 10 y ventas del mes; no puede asignar a vendedores ajenos o inactivos |
| L6 | Dado el panel, cuando se consultan oportunidades, entonces son de solo lectura, filtrables por etapa/vendedor y muestran total y cierre en Guatemala; el reporte tiene selector mensual, ventas, total y pronóstico, con desgloses y alcance por rol |
| L7 | Dados datos inválidos, cuando se envía un formulario, entonces el servidor valida con FormRequest o validate, conserva lo escrito y presenta junto al campo un mensaje en español que trata de usted; sus reglas coinciden con la API |

## 10. Requisitos de API y aceptación

| Código | Dado / Cuando / Entonces |
| --- | --- |
| A1 | Dado un vendedor activo y clave correcta, cuando inicia sesión, entonces se verifica el hash de Laravel con bcryptjs y se emite JWT HS256 con sub y expiración configurada |
| A2 | Dada una ruta protegida, cuando se solicita, entonces se verifica firma, algoritmo y expiración y se consulta de nuevo users; un token inválido o usuario deshabilitado devuelve 401 |
| A3 | Dadas operaciones de clientes, cuando se ejecutan, entonces respetan propiedad, normalización, cartera de 10 y exclusión concurrente |
| A4 | Dadas operaciones de oportunidades o líneas, cuando se ejecutan, entonces respetan etapas, precio copiado, cantidades, regla del sector, cierre inmutable e historial transaccional |
| A5 | Dada una actividad, cuando se registra, consulta o completa, entonces se comprueba la cartera actual del cliente, tipo, descripción, booleano y fechas con zona; vencida se calcula al responder |
| A6 | Dada la semilla común, cuando se solicita el resumen mensual, entonces SQL produce exactamente las cifras de control como números |
| A7 | Dada cualquier respuesta o error, cuando llega al cliente, entonces usa JSON, código y forma establecidos; un error 500 no revela detalles internos |
| A8 | Dada una instalación desde cero, cuando se sigue README, entonces pueden iniciarse las tres piezas; docs/api.postman_collection.json contiene al menos una petición por endpoint, errores principales y la regla propia |

## 11. Requisitos de SPA y aceptación

| Código | Dado / Cuando / Entonces |
| --- | --- |
| F1 | Dado un login correcto, cuando entra el vendedor, entonces se guarda solo su sesión en LocalStorage; cerrar sesión la elimina; cualquier 401 durante el uso vuelve al login con aviso y un 403 de login se comunica |
| F2 | Dada su cartera, cuando la consulta, entonces ve clientes, búsqueda procesada por el servidor y ocupación de 10; al crear conserva datos ante errores y los muestra junto al campo; al tomar un disponible comunica un 409 |
| F3 | Dado el embudo, cuando se muestra, entonces hay cuatro columnas abiertas y lista de cerradas; el detalle presenta líneas, precios cotizados, subtotales, total e historial; permite productos, cantidades y transiciones válidas; perder solicita motivo |
| F4 | Dadas actividades, cuando se muestran, entonces se distinguen pendientes, completadas y vencidas; una actividad nueva convierte la hora local de Guatemala a ISO con zona y puede marcarse completada |
| F5 | Dado un mes elegido, cuando se consulta resumen, entonces se muestran ventas, total, pronóstico y cartera, con quetzales y fechas de Guatemala |
| F6 | Dada cualquier operación, cuando hay peticiones, entonces se indica carga; si falla la conexión se muestra un mensaje claro; se usa estado → render, delegación de eventos y texto seguro; a 375 px no hay desplazamiento horizontal |

## 12. Seguridad y concurrencia

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

Para cartera, ambas aplicaciones bloquean la misma fila de vendedor antes de contar y modificar asignaciones; todas las rutas de alta, toma y asignación siguen ese protocolo. Reasignaciones bloquean los vendedores involucrados en orden estable y luego el cliente; se vuelve a comprobar propietario y cupo dentro de la transacción. Para evitar una cuenta con cartera llena por altas simultáneas, el recuento es una lectura consistente con los bloqueos de esa transacción, no una cuenta previamente obtenida fuera de ella.

Para oportunidades se observa la etapa al inicio de la operación y se comprueba de nuevo bajo bloqueo antes de confirmar; una petición basada en estado ya cambiado recibe 409. El historial, la etapa y el cierre se confirman juntos. Las operaciones sobre líneas también bloquean la oportunidad y comprueban que siga abierta. Una operación secuencial que comienza después del cambio confirmado utiliza el estado nuevo y puede avanzar según las reglas.

La unicidad depende finalmente de los índices MySQL; una consulta previa no sustituye esa protección. Las violaciones de unicidad se traducen a 409 sin filtrar detalles SQL. Los bloqueos se adquieren en orden consistente y los errores transaccionales se resuelven sin resultados parciales ni trazas al usuario.

## 13. Semillas y cifras de control

VerificacionSeeder reproduce exactamente nombres, correos, roles, estados, equipos, productos, clientes, oportunidades, precios cotizados y fechas de la sección 11 del enunciado. No se sustituyen sus datos por nombres de ferretería.

Inventario esperado del núcleo: 7 cuentas, 5 productos, 21 clientes, 11 oportunidades, 43 registros de historial y 4 actividades. Los identificadores pueden variar; las relaciones se construyen a partir de los registros correspondientes, sin asumir ids fijos.

Todas las cuentas comunes usan la contraseña pública indicada en la sección 11 del enunciado. Su valor literal solo puede aparecer en seeders, README y colección de Postman; se almacena únicamente como hash en la base.

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

La venta de Valeria del 1 de noviembre a las 03:30 UTC pertenece a octubre en Guatemala. La del 1 de noviembre a las 06:30 UTC pertenece a noviembre. Renovación de planes conserva el Plan avanzado cotizado a Q2,600.00, aunque el catálogo muestre Q2,750.50.

SectorSeeder corre después de VerificacionSeeder y agrega supervisores, vendedores, productos, clientes, oportunidades en todas las etapas y actividades propios de ferretería. No reutiliza correos, NIT ni teléfonos comunes, no supera diez clientes por vendedor y usa precios creíbles del mercado guatemalteco, que deben verificarse al preparar el catálogo. Los productos con mínimo mayor que 1 se crean aquí. La defensa utiliza únicamente VerificacionSeeder.

## 14. Proceso, documentación y aceptación de entrega

| Código | Compromiso verificable |
| --- | --- |
| P1 | Esta especificación se revisa antes del código de negocio y se marca en Git con spec-v1; incluye sector, regla, criterios, contrato, modelo y decisiones justificadas |
| P2 | docs/plan.md define arquitectura, estructura, fases, tareas, responsable y encargos a la IA; se actualiza antes de cada fase |
| P3 | docs/verificacion.md relaciona cada criterio con prueba, evidencia y resultado real, incluyendo seguridad, concurrencia y cifras de control |
| P4 | AGENTS.md en la raíz establece las reglas del proyecto para el agente |
| P5 | La bitácora en verificacion.md documenta al menos tres errores reales propuestos por IA, detección y commit correctivo; no se inventan casos |

El repositorio tendrá README.md, AGENTS.md, .gitignore, docs/especificacion.md, docs/plan.md, docs/verificacion.md, docs/api.postman_collection.json, laravel/, api/ y frontend/. Se excluyen vendor/, node_modules/ y secretos; se incluyen archivos de dependencias y .env.example necesarios para reproducir la instalación.

Mientras se prepara la especificación se puede instalar y configurar el entorno y crear el esqueleto Laravel/Breeze, sin adelantar implementación del negocio. Raúl y Diego realizan commits propios y significativos a lo largo del proyecto; ambos deben entender todas las piezas. La distribución concreta de tareas se fija en plan.md.

Cuando el catedrático publique el cambio de requisito, se actualizarán primero especificación y plan, se creará la etiqueta spec-v2 y se implementará con migraciones nuevas, sin editar las ya existentes. Después se repetirán las verificaciones afectadas y las de regresión relevantes.

La entrega consiste en enlace al repositorio accesible para el catedrático e identificador del commit etiquetado entrega-final, obtenido con git rev-parse entrega-final. Lo que quede fuera de ese commit no está entregado. El enunciado indica la semana anterior al examen final, sin fijar aquí una fecha calendario.

La defensa dura 15 minutos por pareja, con nota individual: tres piezas corriendo en una computadora, Postman abierto, repositorio en entrega-final y base cargada solo con `php artisan migrate:fresh --seeder=VerificacionSeeder`. Cualquiera responde sobre cualquier parte y puede recibir una petición de cambio de código en vivo.

No se incluyen como obligatorios el despliegue en nube, resumen con modelo de lenguaje, exportación CSV, limitación de intentos de login ni pruebas automatizadas; son retos opcionales posteriores al cumplimiento del núcleo.

## 15. Estado de esta etapa

- Confirmado: integrantes Raúl y Diego, sector ferretería y disponibilidad informada por el equipo.
- Definido para revisión: regla de cantidad mínima y decisiones de la sección 6.
- Preparado: primera especificación; no hay aplicación implementada ni pruebas ejecutadas en esta etapa.
- Siguiente etapa: revisar este documento, preparar plan.md y AGENTS.md y crear el repositorio. La etiqueta spec-v1 debe crearse en ese repositorio; este archivo por sí solo no crea la etiqueta.
