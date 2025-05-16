# Energy Monitoring Backend

API backend para el sistema de monitoreo energético.

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/alexisfelixr/energy-monitoring-backend.git
cd energy-monitoring-backend
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configuración del entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# JWT
JWT_SECRET=energy_monitoring_secret_key_2025

# App
HOST=localhost
PORT=3001

# Database
DATABASE_HOST=yamanote.proxy.rlwy.net
DATABASE_PORT=33873
DATABASE_USER=postgres
DATABASE_PASSWORD=ZVPmAWeMmHmxoOVJkAzdcrHqTAHrlvoQ
DATABASE_NAME=railway
```

## Ejecución en Desarrollo

```bash
npm run start:dev
# o
yarn start:dev
```

El servidor estará disponible en [http://localhost:3001](http://localhost:3001).

## Construcción para Producción

```bash
npm run build
# o
yarn build
```

## Iniciar en Producción

```bash
npm run start:prod
# o
yarn start:prod
```

## Documentación API

La documentación de la API está disponible mediante Swagger UI en:
[http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Estructura del Proyecto

El proyecto sigue la estructura modular de NestJS:

- `/src/auth`: Autenticación y autorización
- `/src/areas`: Gestión de áreas
- `/src/centros`: Gestión de centros
- `/src/mediciones`: Registro y consulta de mediciones
- `/src/sensores`: Gestión de sensores
- `/src/generators`: Generación de datos simulados

## Endpoints Principales

- `POST /auth/login`: Autenticar usuario
- `POST /auth/register`: Registrar nuevo usuario
- `GET /mediciones/centro/:centroId/monitoring`: Obtener datos de monitoreo para un centro
- `GET /sensores/centro/:centroId`: Obtener sensores de un centro
- `GET /areas/centro/:centroId`: Obtener áreas de un centro
- `GET /mediciones/historico`: Obtener datos históricos con filtros

## Generación de Datos Simulados

El sistema incluye un generador de datos simulados que crea mediciones aleatorias para pruebas y demostraciones:

- Se ejecuta automáticamente cada 15 minutos a través de un cron job
- Genera datos con patrones realistas según la hora del día
- También ofrece un endpoint para generar datos históricos manualmente

## Despliegue en Producción

La API está desplegada en Railway y puedes acceder a la documentación Swagger en:
[https://energy-monitoring-backend-production.up.railway.app/api/docs](https://energy-monitoring-backend-production.up.railway.app/api/docs)
