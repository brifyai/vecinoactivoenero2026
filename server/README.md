# Vecino Activo - Backend API

Backend simple para servir datos GeoJSON de unidades vecinales de Chile.

## 🚀 Instalación

```bash
cd server
npm install
```

## 📦 Dependencias

- **express**: Framework web para Node.js
- **cors**: Middleware para habilitar CORS
- **nodemon**: (dev) Auto-restart del servidor en desarrollo

## ▶️ Ejecutar

### Modo Producción
```bash
npm start
```

### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

## 📍 Endpoints

### 1. Health Check
```
GET /api/health
```
Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "Vecino Activo API is running"
}
```

### 2. Obtener Todas las Unidades Vecinales
```
GET /api/neighborhoods
```
Retorna el GeoJSON completo de todas las unidades vecinales.

**Respuesta:** GeoJSON FeatureCollection

### 3. Obtener Unidades Vecinales por Región
```
GET /api/neighborhoods/region/:region
```
Filtra las unidades vecinales por región.

**Parámetros:**
- `region`: Nombre de la región (ej: "Metropolitana")

**Respuesta:** GeoJSON FeatureCollection filtrado

### 4. Obtener Unidades Vecinales por Bounding Box
```
GET /api/neighborhoods/bbox?minLat=...&maxLat=...&minLng=...&maxLng=...
```
Retorna solo las unidades vecinales dentro del área visible del mapa.

**Query Parameters:**
- `minLat`: Latitud mínima
- `maxLat`: Latitud máxima
- `minLng`: Longitud mínima
- `maxLng`: Longitud máxima

**Ejemplo:**
```
GET /api/neighborhoods/bbox?minLat=-33.6&maxLat=-33.3&minLng=-70.8&maxLng=-70.5
```

**Respuesta:** GeoJSON FeatureCollection filtrado

## 🗂️ Estructura de Archivos

```
server/
├── index.js          # Servidor Express principal
├── package.json      # Dependencias y scripts
└── README.md         # Esta documentación
```

## 🔧 Configuración

### Puerto
Por defecto el servidor usa el puerto `3001`. Para cambiarlo, modifica la constante `PORT` en `index.js`:

```javascript
const PORT = 3001; // Cambiar aquí
```

### CORS
El servidor permite peticiones desde cualquier origen. Para restringir, modifica la configuración de CORS en `index.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:3003' // Solo permitir desde el frontend
}));
```

## 📊 Rendimiento

El servidor carga el archivo GeoJSON en cada petición. Para mejorar el rendimiento en producción:

1. **Caché en memoria**: Cargar el GeoJSON una vez al iniciar
2. **Base de datos espacial**: Usar PostgreSQL con PostGIS
3. **Tiles vectoriales**: Generar tiles pre-procesados

## 🐛 Troubleshooting

### Error: "GeoJSON file not found"
Verifica que el archivo existe en:
```
../public/data/geo/unidades_vecinales_simple.geojson
```

### Error: "EADDRINUSE"
El puerto 3001 ya está en uso. Cambia el puerto o detén el proceso:
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### CORS Error
Asegúrate de que el servidor backend esté corriendo antes de iniciar el frontend.

## 📝 Notas

- El archivo GeoJSON debe estar en formato válido
- Las coordenadas deben estar en formato [longitud, latitud]
- El servidor no persiste datos, solo sirve el archivo GeoJSON

## 🔮 Mejoras Futuras

- [ ] Caché en memoria del GeoJSON
- [ ] Compresión gzip de respuestas
- [ ] Rate limiting
- [ ] Autenticación JWT
- [ ] Base de datos PostgreSQL + PostGIS
- [ ] Generación de tiles vectoriales
- [ ] Búsqueda por nombre de vecindario
- [ ] Estadísticas de uso

---

**Versión:** 1.0.0
**Última actualización:** Enero 2025
