# Bolsa de Horas - Sistema de Gestión

Sistema completo de gestión de bolsa de horas con **Backend Node.js**, **Frontend Angular**, **PostgreSQL + PostGIS** y **Keycloak** para autenticación.

## 📋 Stack Tecnológico

### Backend

- **Node.js 24** (LTS Krypton)
- **Express.js** - Framework web
- **Prisma ORM** - ORM para PostgreSQL
- **TypeScript** - Tipado estático
- **Keycloak Connect** - Autenticación y autorización
- **node-cron** - Tareas programadas

### Frontend

- **Angular 20** - Framework
- **Keycloak Angular** - Integración con Keycloak
- **Chart.js** - Gráficas
- **TailwindCSS** - Estilos

### Base de Datos

- **PostgreSQL 18** - Base de datos relacional
- **PostGIS 3.6** - Extensión geoespacial

### Autenticación

- **Keycloak 26.5** - Identity and Access Management

### DevOps

- **Docker** & **Docker Compose** - Containerización

---

## 🚀 Inicio Rápido

### Prerequisitos

- Docker Desktop instalado y ejecutándose
- Git

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd br-bolsa-de-horas
   ```

2. **Verificar variables de entorno**

   El archivo `.env` ya está configurado con valores por defecto. Revísalo si necesitas cambiar algo:

   ```bash
   cat .env
   ```

3. **Construir e iniciar todos los servicios**

   ```bash
   docker-compose up --build
   ```

   Esto iniciará 4 contenedores:
   - `db` - PostgreSQL 18 + PostGIS 3.6 (Puerto 5432)
   - `keycloak` - Servidor de autenticación (Puerto 8080)
   - `backend` - API REST Node.js (Puerto 3000)
   - `frontend` - Angular + Nginx (Puerto 4200)

4. **Esperar a que todos los servicios estén listos** (~2-3 minutos en primera ejecución)

5. **Acceder a la aplicación**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:3000
   - **Keycloak Admin**: http://localhost:8080

---

## 👥 Usuarios de Prueba

Keycloak viene pre-configurado con dos usuarios:

### Administrador

- **Usuario**: `admin`
- **Password**: `admin123`
- **Email**: `admin@bolsahoras.com`
- **Permisos**: Lectura y escritura completa

### Usuario Normal

- **Usuario**: `usuario`
- **Password**: `user123`
- **Email**: `usuario@bolsahoras.com`
- **Permisos**: Solo lectura

---

## 📁 Estructura del Proyecto

```
br-bolsa-de-horas/
├── br-bolsa-de-horas-be/          # Backend Node.js
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   ├── routes/                # Definición de rutas API
│   │   ├── services/              # Servicios con Prisma
│   │   ├── middleware/            # Keycloak, RBAC, errores
│   │   ├── cron/                  # Jobs programados
│   │   ├── config/                # Configuración BD
│   │   ├── app.ts                 # Configuración Express
│   │   └── index.ts               # Entry point
│   ├── prisma/
│   │   └── schema.prisma          # Modelos de base de datos
│   ├── Dockerfile
│   └── package.json
│
├── br-bolsa-de-horas-fe/          # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/         # Módulo dashboard
│   │   │   ├── iniciativas/       # Módulo iniciativas
│   │   │   ├── gestion-bolsas/    # Módulo gestión bolsas
│   │   │   ├── core/              # Servicios, guards, models
│   │   │   ├── app.config.ts      # Configuración Keycloak
│   │   │   └── app.routes.ts      # Rutas protegidas
│   │   └── environments/          # Variables de entorno
│   ├── nginx.conf                 # Configuración Nginx
│   ├── Dockerfile
│   └── package.json
│
├── db/                            # Scripts SQL
│   ├── 00-create-databases.sql   # Crear BD Keycloak
│   └── 01-db-init.sql            # Esquema principal
│
├── keycloak-config/               # Configuración Keycloak
│   └── bolsa-horas-realm.json    # Realm pre-configurado
│
├── docker-compose.yaml            # Orquestación de servicios
├── .env                           # Variables de entorno
└── README.md
```

---

## 🔌 API Endpoints

Todos los endpoints requieren autenticación via token JWT de Keycloak.

### Iniciativas

| Método   | Endpoint                         | Roles       | Descripción        |
| -------- | -------------------------------- | ----------- | ------------------ |
| `GET`    | `/api/iniciativas`               | admin, user | Listar todas       |
| `GET`    | `/api/iniciativas/:id`           | admin, user | Obtener por ID     |
| `POST`   | `/api/iniciativas`               | admin       | Crear nueva        |
| `PUT`    | `/api/iniciativas/:id`           | admin       | Actualizar         |
| `DELETE` | `/api/iniciativas/:id`           | admin       | Eliminar           |
| `GET`    | `/api/iniciativas/horas-por-mes` | admin, user | Datos para gráfica |

### Bolsas de Horas

| Método   | Endpoint          | Roles       | Descripción    |
| -------- | ----------------- | ----------- | -------------- |
| `GET`    | `/api/bolsas`     | admin, user | Listar todas   |
| `GET`    | `/api/bolsas/:id` | admin, user | Obtener por ID |
| `POST`   | `/api/bolsas`     | admin       | Crear nueva    |
| `PUT`    | `/api/bolsas/:id` | admin       | Actualizar     |
| `DELETE` | `/api/bolsas/:id` | admin       | Eliminar       |

### Dashboard

| Método | Endpoint                 | Roles       | Descripción          |
| ------ | ------------------------ | ----------- | -------------------- |
| `GET`  | `/api/dashboard/totales` | admin, user | Obtener totales KPIs |

---

## 🔧 Desarrollo Local

### Backend

```bash
cd br-bolsa-de-horas-be

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Modo desarrollo
npm run dev
```

### Frontend

```bash
cd br-bolsa-de-horas-fe

# Instalar dependencias
npm install

# Modo desarrollo
npm start
```

---

## 🗄️ Base de Datos

### Tablas Principales

1. **estado_iniciativa** - Estados de iniciativas
2. **estado_bolsa** - Estados de bolsas
3. **bolsa_horas** - Bolsas de horas contratadas
4. **iniciativa** - Iniciativas del proyecto
5. **totales** - Totales calculados automáticamente (triggers)
6. **parametros_sistema** - Parámetros de configuración

### Triggers Automáticos

- **trg_totales_iniciativa**: Recalcula totales al cambiar iniciativas
- **trg_totales_bolsa**: Recalcula totales al cambiar bolsas

### Cron Job

**Función**: `actualizar_estado_bolsa()`  
**Frecuencia**: Diariamente a medianoche  
**Descripción**: Actualiza estados de bolsas según fecha de caducidad

---

## Keycloak

### Configuración de Realm

El realm `bolsa-horas` se importa automáticamente al iniciar Keycloak.

### Clientes Configurados

1. **bolsa-horas-frontend** (Public)
   - Redirect URIs: `http://localhost:4200/*`
   - PKCE habilitado

2. **bolsa-horas-backend** (Bearer-only)
   - Valida tokens del frontend

### Modificar Usuarios

1. Acceder a http://localhost:8080
2. Login: `admin` / `admin`
3. Seleccionar realm `bolsa-horas`
4. Ir a Users → Gestionar usuarios
