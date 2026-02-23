# Bolsa de Horas - Backend API

Backend API para el sistema de gestión de Bolsa de Horas.

## Stack Tecnológico

- Node.js 24 (LTS)
- Express.js
- Prisma ORM
- PostgreSQL 18 + PostGIS 3.6
- Keycloak (Autenticación)
- TypeScript

## Desarrollo Local

### Prerrequisitos

- Node.js 24+
- Docker y Docker Compose

### Instalación

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Modo desarrollo
npm run dev
```

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar las variables necesarias.

## Docker

```bash
# Build
docker build -t bolsa-horas-backend .

# Run
docker run -p 3000:3000 --env-file .env bolsa-horas-backend
```

## API Endpoints

### Iniciativas

- `GET /api/iniciativas` - Listar todas (auth: admin, user)
- `GET /api/iniciativas/:id` - Obtener por ID (auth: admin, user)
- `POST /api/iniciativas` - Crear (auth: admin)
- `PUT /api/iniciativas/:id` - Actualizar (auth: admin)
- `DELETE /api/iniciativas/:id` - Eliminar (auth: admin)
- `GET /api/iniciativas/horas-por-mes` - Gráfica mensual (auth: admin, user)

### Bolsas

- `GET /api/bolsas` - Listar todas (auth: admin, user)
- `GET /api/bolsas/:id` - Obtener por ID (auth: admin, user)
- `POST /api/bolsas` - Crear (auth: admin)
- `PUT /api/bolsas/:id` - Actualizar (auth: admin)
- `DELETE /api/bolsas/:id` - Eliminar (auth: admin)

### Dashboard

- `GET /api/dashboard/totales` - Obtener totales (auth: admin, user)

## Autorización

- **admin**: Acceso completo (CRUD)
- **user**: Solo lectura (GET)
