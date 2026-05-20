# EcoCampus API Backend

## EQUIPO HORIZON SPECTER

FERNANDO CONTRERAS MORA
JOSE DE JESUS ALMANZA CONTRERAS 
RICARDO RIVAS RIVAS 
VICTOR TAVARES ESTRADA 
JONATHAN ABRAHAM BONIFACIO MORENO
MOISES JIMENEZ CRUZ 
ANDRE DAVID  RAMIREZ SANCHEZ 
SARAY ALEXANDRA MARTINEZ

## Visión general

EcoCampus API es el backend de una plataforma de gestión inteligente para campus. Está diseñado con arquitectura en capas y usa Express, Prisma y JWT para la autenticación.

## Estructura principal de carpetas

- `src/`
  - `app.ts` - Entrada principal de la aplicación.
  - `config.ts` - Configuración de variables de entorno.
  - `controllers/` - Lógicos HTTP y respuestas.
  - `services/` - Reglas de negocio y orquestación.
  - `repositories/` - Acceso a datos (si aplica).
  - `models/` - Tipos y DTOs de dominio.
  - `middlewares/` - Autenticación, autorización y manejo de errores.
  - `routes/` - Definición de rutas y permisos.
  - `utils/` - Helpers y utilidades transversales.
  - `validators/` - Esquemas de validación con Zod.
  - `prisma/` - Cliente Prisma.
- `prisma/`
  - `schema.prisma` - Esquema de base de datos y modelos.
- `docs/` - Documentación interna adicional.
- `package.json` - Dependencias y scripts.
- `tsconfig.json` - Configuración de TypeScript.

## Convenciones de nombres

- Código TypeScript: `camelCase`.
- Prisma model fields: `camelCase` con `@map` para columnas `snake_case` en MySQL.
- Enums y constantes: `UPPER_SNAKE_CASE` o `PascalCase` según Prisma.
- Rutas: `kebab-case` en la URL, p.ej. `/api/buildings`.

## Variables de entorno base

La configuración de la aplicación se realiza mediante variables de entorno que se cargan en `src/config.ts`. En desarrollo, se recomienda usar un archivo `.env` local que no se versiona en el repositorio.

## Documentación operativa inicial

### Instalación

```bash
npm install
npm run dev
```

### Compilación y producción

```bash
npm run build
npm start
```

### Endpoints básicos

- `GET /health` - Verificación del servicio.
- `POST /api/auth/login` - Inicio de sesión.
- `POST /api/auth/refresh` - Renovación de token.
- `POST /api/auth/logout` - Cierre de sesión.
- `GET /api/auth/me` - Información del usuario autenticado.

## Módulos principales

### Auth

- Maneja inicio de sesión y JWT.
- `src/services/auth.service.ts` genera y verifica tokens.
- `src/middlewares/auth.ts` valida headers, expiración y roles.
- `src/routes/auth.routes.ts` expone login y rutas protegidas.

### Users

- Solo accesible por `ADMIN`.
- CRUD de usuarios.
- `src/routes/users.routes.ts` aplica `authenticate` + `authorize('ADMIN')`.

### Buildings

- Rutas protegidas para cualquier usuario autenticado.
- Creación/actualización/eliminación solo `ADMIN`.
- Métricas accesibles por `ADMIN` y `MAINTENANCE`.
- Listado de salones por edificio disponible para usuarios autenticados.

### Classrooms

- Rutas protegidas.
- Creación/actualización por `ADMIN` y `MAINTENANCE`.
- Eliminación por `ADMIN`.
- Listado de sensores por salón accesible para usuarios autenticados.

### Sensors

- Rutas protegidas.
- Creación/actualización/estado por `ADMIN` y `MAINTENANCE`.
- Eliminación por `ADMIN`.
- Consulta de sensores de salón disponible para autenticados.

### Readings, Alerts, Rankings, Dashboard, AI

- Acceso protegido por JWT.
- Lecturas y alertas restringidas a roles operativos.
- AI y dashboard disponibles solo para usuarios autenticados.

## Estándares de respuesta y error

### Formato estándar de éxito

Todos los responses de éxito usan el helper `sendSuccess` en `src/utils/index.ts`:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "errors": null,
  "statusCode": 200
}
```

### Formato estándar de error

El middleware `src/middlewares/error.ts` devuelve:

```json
{
  "success": false,
  "message": "Descripción del error",
  "data": null,
  "errors": [...],
  "statusCode": 400
}
```

### Códigos HTTP base

- `200 OK` - Operación exitosa.
- `400 Bad Request` - Validación de datos o parámetros.
- `401 Unauthorized` - Token faltante, inválido o expirado.
- `403 Forbidden` - Permiso denegado o cuenta inactiva.
- `404 Not Found` - Recurso inexistente.
- `409 Conflict` - Conflicto de integridad (Prisma `P2002`).
- `500 Internal Server Error` - Error inesperado del servidor.

## Roles y permisos

### Roles definidos

- `ADMIN` - Administración total.
- `MAINTENANCE` - Operaciones de mantenimiento.
- `STUDENT` - Usuario final con acceso de lectura.

### Permisos por módulo

| Módulo | `ADMIN` | `MAINTENANCE` | `STUDENT` | Nota |
|--------|---------|---------------|-----------|------|
| Auth (`/api/auth`) | Login público, refresh/logout autenticados | Sí | Sí | Login es público; refresh/me requieren auth |
| Users | Sí | No | No | Solo `ADMIN` CRUD usuarios |
| Buildings | Leer: Sí<br>CRUD: `ADMIN` | Leer: Sí<br>Métricas: Sí | Leer: Sí | Todos autenticados pueden listar/buildings details |
| Classrooms | Leer: Sí | Crear/editar: Sí | Leer: Sí | Solo `ADMIN` elimina |
| Sensors | Leer: Sí | Crear/editar: Sí | Leer: Sí | Solo `ADMIN` elimina |
| Readings | `ADMIN`, `MAINTENANCE` | `ADMIN`, `MAINTENANCE` | No | Lecturas centralizadas para operaciones |
| Alerts | `ADMIN`, `MAINTENANCE` | `ADMIN`, `MAINTENANCE` | No | Resolución de alertas operativa |
| Rankings | Sí | Sí | Sí | Acceso autenticado general |
| Dashboard | Sí | Sí | Sí | Acceso autenticado general |
| AI | Lectura: Sí<br>Análisis: `ADMIN` | Lectura: Sí<br>Análisis: No | Lectura: Sí | Consulta de datos protegida |

### Rutas públicas y privadas

- Públicas:
  - `GET /health`
  - `POST /api/auth/login`
- Privadas (requieren JWT):
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `GET /api/users`, `/api/users/:id`, etc.
  - `GET /api/buildings`, `/api/classrooms`, `/api/sensors`, `/api/readings`, `/api/alerts`, `/api/rankings`, `/api/dashboard`, `/api/ai`

## Middleware de autenticación

### Validación de headers

El middleware `authenticate` en `src/middlewares/auth.ts` espera:

```http
Authorization: Bearer <token>
```

Si falta o no comienza con `Bearer ` devuelve `401 Unauthorized`.

### Validación de expiración

El token se verifica con `jsonwebtoken` y `config.jwtSecret`.

- Si el token está expirado, la verificación falla y se devuelve `401`.
- Si el token es inválido o malformado, también se devuelve `401`.

### Manejo de autorización

El middleware `authorize` comprueba el role del usuario extraído del JWT.

- Si el usuario no está autenticado: `401 Unauthorized`.
- Si no tiene el role requerido: `403 Forbidden`.

## Usuarios, edificios, salones y sensores

### Modelo de usuario

El modelo `User` en Prisma incluye:

- `id`: UUID
- `name`
- `email` (único)
- `passwordHash`
- `role`: `ADMIN`, `MAINTENANCE`, `STUDENT`
- `status`: `ACTIVE`, `INACTIVE`

### Relaciones edificio-salón

- `Building` tiene muchos `Classroom`.
- `Classroom` pertenece a un `Building`.
- `Classroom` tiene muchos `Sensor`.
- `Sensor` pertenece a un `Classroom`.

### Estados y asociación de sensores

Sensores tienen:

- `type`: `ENERGY`, `AIR_CONDITIONING`, `LIGHTING`, `OCCUPANCY`
- `status`: `ACTIVE`, `INACTIVE`, `MAINTENANCE`
- `installedAt`, `createdAt`, `updatedAt`

### Relaciones adicionales relevantes

- `Sensor` almacena `EnergyReading`.
- `Sensor` puede tener `Alert` y `AiAnalysis`.
- `Building` y `Classroom` pueden tener alertas y rankings.

## Recomendaciones finales

- Mantener las variables de configuración sensibles fuera del código y solo en entorno seguro.
- Usar `JWT_EXPIRES_IN=8h` en desarrollo y producción.
- Revisar `src/routes/*` para validar permisos cuando se agreguen nuevos endpoints.
- Agregar diagramas ER y ejemplos de request/response en `docs/` si se quiere ampliar.

---

## Documentación académica

### Contexto y alcance
Este proyecto se configura como un sistema de backend para la gestión inteligente de un campus universitario. La propuesta integra una arquitectura en capas con persistentemente tipada, control de acceso basado en JWT y un modelo de datos relacional que soporta monitoreo de sensores y generación de alertas.

### Componentes arquitectónicos
- `Express` como marco de servidor y gestor de rutas.
- `Prisma` como ORM que materializa un esquema relacional sobre MySQL.
- `jsonwebtoken` para la creación y verificación de tokens JWT.
- `Zod` para la validación de entrada y la protección del dominio de datos.
- Separación de responsabilidades: rutas, controladores, servicios, repositorios, modelos, middlewares y utilidades.

### Diseño de dominio
El dominio modela una plataforma de administración de recursos del campus mediante:
- usuarios con roles y estado operativo;
- edificios y salones con jerarquía estructural;
- sensores y lecturas de consumo;
- alertas asociadas a entidades físicas y eventos de lectura;
- rankings de ahorro energético calculados en periodos definidos.

### Seguridad y autorización
El modelo de seguridad se basa en:
- autenticación mediante JWT con expiración configurada;
- autorización en función del rol del usuario (`ADMIN`, `MAINTENANCE`, `STUDENT`);
- middleware centralizado para manejo de tokens y verificación de permisos;
- normalización de errores para exposición uniforme de fallas HTTP.

### Evaluación crítica
Desde un punto de vista académico, el proyecto presenta fortalezas relevantes:
- diseño modular y acoplado de forma débil;
- tipado estricto con TypeScript y validación temprana de datos;
- esquema relacional con índices y relaciones bien definidos;
- consistencia en los formatos de respuesta y en el tratamiento de errores.

Oportunidades de mejora con vocación académica incluyen:
- incorporación de pruebas automatizadas de unidad e integración;
- documentación formal de la API con OpenAPI o Swagger;
- mecanismos de refresco de token y protección contra ataques de fuerza bruta;
- diagramas ER y flujos de datos que evidencien la topología del sistema.

### Conclusión
EcoCampus API representa un caso de estudio de backend orientado a la gestión energética y operativa de un campus. Su configuración actual es adecuada para apoyar análisis avanzado y extensiones de inteligencia artificial, manteniendo una base técnica clara y escalable.

Esta sección complementa la guía operativa del proyecto con una descripción académica de la arquitectura, el dominio y las decisiones de diseño.