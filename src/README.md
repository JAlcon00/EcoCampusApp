# EcoCampus API

## Descripción
Backend de la API de EcoCampus Inteligente. Está estructurado en capas de rutas, controladores, servicios, validadores, middleware y Prisma para el acceso a datos.

## Ejecución
- `npm install`
- `npm run dev`
- `npm run build`
- `npm start`

## Autenticación
### Rutas de auth
- `POST /api/auth/login` — Iniciar sesión con `email` y `password`
- `POST /api/auth/refresh` — Renovar token JWT (requiere `Authorization: Bearer <token>`)
- `POST /api/auth/logout` — Cerrar sesión (recomendado borrar token en cliente, requiere JWT)
- `GET /api/auth/me` — Obtener datos del usuario autenticado (requiere JWT)

### Endpoint de login
POST `/api/auth/login`

Body:
- `email`: string, correo válido
- `password`: string, mínimo 6 caracteres

Respuesta:
- `accessToken`: JWT de acceso
- `expiresIn`: duración del token
- `tokenType`: tipo de token (`Bearer`)
- `user`: datos básicos del usuario

### Validaciones aplicadas
- `email` debe ser un correo válido
- `password` debe tener al menos 6 caracteres
- Usuario debe existir y tener `status: ACTIVE`
- Contraseña se compara con el hash almacenado en Prisma

### Endpoints protegidos
- `POST /api/auth/refresh`
  - Requiere encabezado `Authorization: Bearer <token>`
  - Devuelve un nuevo `accessToken` con la misma estructura que el login
- `POST /api/auth/logout`
  - Requiere encabezado `Authorization: Bearer <token>`
  - En sistemas JWT stateless, solo invalida la sesión en el cliente
- `GET /api/auth/me`
  - Requiere encabezado `Authorization: Bearer <token>`
  - Devuelve los datos del usuario extraídos del JWT

## Consistencia de entidades y Prisma
### Naming general
- En el código TypeScript se usa `camelCase`.
- En Prisma se usan campos `camelCase` con `@map` para columnas `snake_case` en la base de datos.

### Ejemplos clave
- `User.passwordHash` se mapea a `password_hash`
- `createdAt`, `updatedAt`, `resolvedAt`, `detectedAt`, `installedAt`, `recordedAt`, `calculatedAt`
- `buildingId`, `classroomId`, `sensorId`, `readingId`, `resolvedByUserId` usan `@map` para mantener consistencia con la base de datos

### Estado actual
- No se encontraron inconsistencias directas entre los modelos TypeScript y el esquema Prisma.
- El esquema Prisma ya define enums para `UserRole`, `UserStatus`, `BuildingStatus`, `ClassroomType`, `SensorType`, `AlertType`, `AlertSeverity`, `AlertStatus`, `RankingPeriod`, etc.

## Recomendaciones de documentación final
- Mantener actualizado este README con endpoints y ejemplos de petición.
- Agregar un diagrama sencillo de entidades si se desea una referencia rápida.
- Documentar los roles y permisos por ruta.
