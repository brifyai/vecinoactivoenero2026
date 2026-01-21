# 🗺️ GUÍA: ACTUALIZAR MAPAS DE UNIDADES VECINALES

**Fecha:** 18 de Enero, 2026  
**Archivos Nuevos:** UnidadesVecinales_2024v4.*

---

## 📋 OPCIONES DE CONVERSIÓN

### OPCIÓN 1: Conversión con GDAL (Recomendada) ⭐

**Requisitos:**
- GDAL instalado en tu sistema

**Instalación de GDAL:**

```bash
# macOS
brew install gdal

# Ubuntu/Debian
sudo apt-get install gdal-bin

# Windows
# Descargar desde: https://gdal.org/download.html
```

**Pasos:**

1. **Copia los archivos Shapefile a una carpeta temporal:**
   ```bash
   mkdir -p ~/temp/unidades-vecinales-2024
   # Copia todos los archivos UnidadesVecinales_2024v4.* ahí
   ```

2. **Ejecuta el script de conversión:**
   ```bash
   ./scripts/convert-shapefile.sh ~/temp/unidades-vecinales-2024
   ```

3. **Verifica los archivos generados:**
   ```bash
   ls -lh public/data/geo/
   ```

4. **Reinicia los servidores:**
   ```bash
   # Backend
   cd server
   npm start
   
   # Frontend (en otra terminal)
   PORT=3003 npm start
   ```

---

### OPCIÓN 2: Conversión Online (Sin Instalaciones) 🌐

**Herramientas Recomendadas:**

1. **MapShaper** (Mejor opción)
   - URL: https://mapshaper.org/
   - Gratuito, sin registro
   - Permite simplificar geometrías

2. **MyGeodata Converter**
   - URL: https://mygeodata.cloud/converter/shp-to-geojson
   - Gratuito, sin registro

**Pasos con MapShaper:**

1. **Sube el Shapefile:**
   - Ve a https://mapshaper.org/
   - Click en "Select" o arrastra los archivos
   - Selecciona TODOS los archivos (.shp, .dbf, .shx, .prj, etc.)
   - Click "Import"

2. **Simplifica (Opcional pero recomendado):**
   - En la consola (arriba), escribe:
     ```
     -simplify 10% keep-shapes
     ```
   - Presiona Enter
   - Esto reduce el tamaño del archivo ~90%

3. **Exporta a GeoJSON:**
   - Click en "Export"
   - Selecciona formato "GeoJSON"
   - Click "Export"
   - Descarga el archivo

4. **Renombra y mueve:**
   ```bash
   # Renombra el archivo descargado
   mv ~/Downloads/UnidadesVecinales_2024v4.json public/data/geo/unidades_vecinales_simple.geojson
   ```

5. **Reinicia los servidores**

---

### OPCIÓN 3: Conversión con Python 🐍

Si tienes Python instalado:

**Instala dependencias:**
```bash
pip install geopandas
```

**Crea el script:**
```python
# convert_shapefile.py
import geopandas as gpd

# Leer Shapefile
print("📍 Leyendo Shapefile...")
gdf = gpd.read_file("ruta/a/UnidadesVecinales_2024v4.shp")

# Convertir a EPSG:4326 (WGS84)
print("🌍 Convirtiendo a WGS84...")
gdf = gdf.to_crs(epsg=4326)

# Simplificar geometrías (opcional)
print("📐 Simplificando geometrías...")
gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.001, preserve_topology=True)

# Guardar como GeoJSON
print("💾 Guardando GeoJSON...")
gdf.to_file("public/data/geo/unidades_vecinales_simple.geojson", driver="GeoJSON")

print("✅ ¡Conversión completada!")
```

**Ejecuta:**
```bash
python convert_shapefile.py
```

---

## 🔍 VERIFICACIÓN

### 1. Verifica el GeoJSON

```bash
# Ver primeras líneas
head -n 20 public/data/geo/unidades_vecinales_simple.geojson

# Ver tamaño
ls -lh public/data/geo/unidades_vecinales_simple.geojson
```

**Tamaño esperado:**
- Completo: 50-200 MB
- Simplificado: 5-20 MB

### 2. Valida la estructura

El archivo debe tener esta estructura:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "COD_UNICO_": "...",
        "CODIGO_UV": "...",
        "NOMBRE_UV": "...",
        "NOMBRE_COM": "...",
        "NOMBRE_REG": "...",
        "PERSONAS": 1234,
        "HOGARES": 567
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], ...]]
      }
    }
  ]
}
```

### 3. Prueba en la app

1. Abre http://localhost:3003/map
2. Verifica que el mapa carga
3. Verifica que los polígonos se muestran
4. Click en un polígono para ver el popup
5. Haz zoom para ver las etiquetas UV

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "ogr2ogr: command not found"

**Solución:** Instala GDAL
```bash
brew install gdal  # macOS
```

### Error: "Cannot open data source"

**Solución:** Verifica que todos los archivos del Shapefile estén presentes:
- .shp (geometrías)
- .dbf (atributos)
- .shx (índice)
- .prj (proyección)

### Error: Mapa no carga

**Solución 1:** Verifica la ruta del archivo
```javascript
// En NeighborhoodContext.js debe ser:
const response = await fetch('/data/geo/unidades_vecinales_simple.geojson');
```

**Solución 2:** Verifica que el archivo esté en `public/data/geo/`

**Solución 3:** Limpia caché y reinicia
```bash
rm -rf node_modules/.cache
npm start
```

### Error: Geometrías incorrectas

**Solución:** Verifica la proyección
```bash
# Ver proyección actual
ogrinfo -al -so UnidadesVecinales_2024v4.shp | grep PROJCS

# Debe ser EPSG:4326 (WGS84) para Leaflet
```

### Archivo muy grande (>50MB)

**Solución:** Simplifica más agresivamente
```bash
# Con ogr2ogr
ogr2ogr -f GeoJSON -simplify 0.005 output.geojson input.shp

# Con MapShaper
-simplify 5% keep-shapes
```

---

## 📊 COMPARACIÓN DE VERSIONES

### Archivos Antiguos vs Nuevos

| Aspecto | Versión Antigua | Versión 2024v4 |
|---------|----------------|----------------|
| Fecha | Desconocida | 30-08-2024 |
| Tamaño .shp | ~100 MB | 128 MB |
| Tamaño .dbf | ~10 MB | 12.7 MB |
| Actualización | ❌ | ✅ |

### Cambios Esperados

- ✅ Datos demográficos actualizados
- ✅ Nuevas unidades vecinales
- ✅ Límites ajustados
- ✅ Información más precisa

---

## 🎯 CHECKLIST DE ACTUALIZACIÓN

- [ ] Archivos Shapefile descargados
- [ ] GDAL instalado (o herramienta online lista)
- [ ] GeoJSON generado
- [ ] GeoJSON simplificado (opcional)
- [ ] Archivo copiado a `public/data/geo/`
- [ ] Archivo renombrado correctamente
- [ ] Backend reiniciado
- [ ] Frontend reiniciado
- [ ] Mapa probado en navegador
- [ ] Popups funcionando
- [ ] Etiquetas UV visibles con zoom
- [ ] Selector de vecindario actualizado

---

## 📝 NOTAS IMPORTANTES

### Backup

Antes de reemplazar, haz backup de los archivos antiguos:

```bash
mkdir -p backups/geo-old
cp public/data/geo/*.geojson backups/geo-old/
```

### Nombres de Campos

Verifica que los nombres de campos coincidan:

```javascript
// En NeighborhoodContext.js
codigo: feature.properties.CODIGO_UV,
nombre: feature.properties.NOMBRE_UV,
comuna: feature.properties.NOMBRE_COM,
region: feature.properties.NOMBRE_REG,
personas: feature.properties.PERSONAS,
hogares: feature.properties.HOGARES
```

Si los nombres cambiaron en la nueva versión, actualiza el código.

### Performance

Para mejor rendimiento:
- Usa el archivo simplificado en producción
- Considera usar tiles vectoriales para >10,000 features
- Implementa lazy loading por región

---

## 🚀 COMANDO RÁPIDO

Si ya tienes GDAL instalado y los archivos en la carpeta correcta:

```bash
# Todo en uno
ogr2ogr -f GeoJSON -t_srs EPSG:4326 -simplify 0.001 \
  public/data/geo/unidades_vecinales_simple.geojson \
  ~/ruta/a/UnidadesVecinales_2024v4.shp && \
  echo "✅ Conversión completada" && \
  ls -lh public/data/geo/unidades_vecinales_simple.geojson
```

---

## 📞 AYUDA ADICIONAL

Si tienes problemas:

1. Verifica que los archivos Shapefile no estén corruptos
2. Prueba con una herramienta online primero
3. Revisa los logs del navegador (F12 → Console)
4. Verifica los logs del backend

---

**¡Listo para actualizar!** 🎉

Elige la opción que mejor se adapte a tu entorno y sigue los pasos.
