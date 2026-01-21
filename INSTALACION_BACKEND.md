# 🚀 Instalación y Configuración del Backend

## 📋 Requisitos Previos

- Node.js 14+ instalado
- npm o yarn
- Archivo GeoJSON en `public/data/geo/unidades_vecinales_simple.geojson`

## 🔧 Instalación

### Opción 1: Script Automático (Recomendado)

```bash
# Dar permisos de ejecución al script
chmod +x start-backend.sh

# Ejecutar el script
./start-backend.sh
```

### Opción 2: Manual

```bash
# 1. Ir a la carpeta del servidor
cd server

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
npm start
```

## ✅ Verificación

Una vez iniciado el servidor, deberías ver:

```
🚀 Vecino Activo Backend running on http://localhost:3001
📍 API endpoints:
   - GET /api/health
   - GET /api/neighborhoods
   - GET /api/neighborhoods/region/:region
   - GET /api/neighborhoods/bbox?minLat=...&maxLat=...&minLng=...&maxLng=...
```

### Probar el servidor

Abre tu navegador en:
```
http://localhost:3001/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Vecino Activo API is running"
}
```

## 🎯 Uso con el Frontend

### 1. Iniciar el Backend (Terminal 1)

```bash
cd server
npm start
```

### 2. Iniciar el Frontend (Terminal 2)

```bash
# En la raíz del proyecto
PORT=3003 npm start
```

### 3. Abrir la Aplicación

```
http://localhost:3003
```

### 4. Ver el Mapa con Vecindarios

1. Inicia sesión en la aplicación
2. Click en el icono de mapa (🗺️) en el sidebar
3. Click en el botón "🏘️ Vecindarios" para mostrar/ocultar las unidades vecinales
4. Las áreas azules son las unidades vecinales de Chile
5. Click en cualquier área para ver información

## 📊 Endpoints Disponibles

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Obtener Vecindarios (Área de Santiago)
```bash
curl "http://localhost:3001/api/neighborhoods/bbox?minLat=-33.6&maxLat=-33.3&minLng=-70.8&maxLng=-70.5"
```

### 3. Obtener Todos los Vecindarios (⚠️ Archivo grande)
```bash
curl http://localhost:3001/api/neighborhoods
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'express'"

```bash
cd server
npm install
```

### Error: "Port 3001 is already in use"

Opción 1: Detener el proceso que usa el puerto
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

Opción 2: Cambiar el puerto en `server/index.js`
```javascript
const PORT = 3002; // Cambiar a otro puerto
```

### Error: "GeoJSON file not found"

Verifica que el archivo existe:
```bash
ls -lh public/data/geo/unidades_vecinales_simple.geojson
```

Si no existe, necesitas el archivo GeoJSON de las unidades vecinales de Chile.

### CORS Error en el Frontend

Asegúrate de que:
1. El backend esté corriendo en `http://localhost:3001`
2. El frontend esté corriendo en `http://localhost:3003`
3. El middleware CORS esté habilitado en el backend

### El mapa no muestra vecindarios

1. Verifica que el backend esté corriendo
2. Abre la consola del navegador (F12)
3. Busca errores de red o CORS
4. Verifica que el botón "🏘️ Vecindarios" esté activo (azul)

## 🔄 Modo Desarrollo

Para desarrollo con auto-reload:

```bash
cd server
npm run dev
```

Esto usa `nodemon` para reiniciar automáticamente el servidor cuando cambies archivos.

## 📦 Estructura del Proyecto

```
vecino_activo_v2/
├── server/                          # Backend
│   ├── index.js                     # Servidor Express
│   ├── package.json                 # Dependencias
│   └── README.md                    # Documentación
├── src/
│   └── services/
│       └── neighborhoodService.js   # Cliente API
├── public/
│   └── data/
│       └── geo/
│           └── unidades_vecinales_simple.geojson  # Datos GeoJSON
├── start-backend.sh                 # Script de inicio
└── INSTALACION_BACKEND.md          # Esta guía
```

## 🚀 Despliegue en Producción

### Opción 1: Heroku

```bash
# En la carpeta server/
heroku create vecino-activo-api
git push heroku main
```

### Opción 2: DigitalOcean

1. Crear un Droplet con Node.js
2. Clonar el repositorio
3. Instalar dependencias
4. Usar PM2 para mantener el servidor corriendo

```bash
npm install -g pm2
pm2 start server/index.js --name vecino-activo-api
pm2 save
pm2 startup
```

### Opción 3: Vercel/Netlify

Crear un archivo `vercel.json` o `netlify.toml` para configurar el despliegue.

## 📝 Notas Importantes

- El archivo GeoJSON es de 32MB, puede tardar en cargar
- El backend filtra por bounding box para mejorar el rendimiento
- En producción, considera usar una base de datos espacial (PostGIS)
- El servidor no tiene autenticación, agrégala en producción

## 🔮 Próximas Mejoras

- [ ] Caché en memoria del GeoJSON
- [ ] Compresión gzip
- [ ] Rate limiting
- [ ] Autenticación JWT
- [ ] Base de datos PostgreSQL + PostGIS
- [ ] Tiles vectoriales pre-generados

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

**Versión:** 1.0.0
**Última actualización:** Enero 2025
