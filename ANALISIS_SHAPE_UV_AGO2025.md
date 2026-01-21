# Análisis del Shapefile Shape_UV_ago2025

## 📊 Información General

**Archivo:** Shape_UV_ago2025.shp  
**Fecha de Creación:** 16 de Septiembre de 2025  
**Última Actualización DBF:** 16 de Septiembre de 2025  
**Sistema de Coordenadas:** SIRGAS 2000 (EPSG:4674)  
**Tipo de Geometría:** 3D Polygon  

## 📈 Estadísticas

- **Total de Features (UVs):** 6,891 unidades vecinales
- **Cobertura:** Todo Chile (incluye Antártica)
- **Extensión Geográfica:**
  - Oeste: -109.454916°
  - Este: -66.415594°
  - Sur: -56.537766°
  - Norte: -17.498399°

## 🗂️ Estructura de Campos (Atributos)

| Campo | Tipo | Longitud | Descripción |
|-------|------|----------|-------------|
| `t_reg_ca` | String | 254 | Código de Región |
| `t_prov_ca` | String | 254 | Código de Provincia |
| `t_com` | String | 254 | Código de Comuna |
| `t_reg_nom` | String | 254 | Nombre de Región |
| `t_prov_nom` | String | 254 | Nombre de Provincia |
| `t_com_nom` | String | 50 | Nombre de Comuna |
| `t_id_uv_ca` | String | 20 | ID único de UV (Código Catastral) |
| `uv_carto` | String | 254 | Código UV Cartográfico |
| `t_uv_nom` | String | 254 | Nombre de la Unidad Vecinal |
| `Shape_Leng` | Real | 19.11 | Longitud del perímetro |
| `Shape_Le_1` | Real | 19.11 | Longitud alternativa |
| `Shape_Area` | Real | 19.11 | Área del polígono |

## 🔄 Comparación con Versión Anterior (2024v4)

### Diferencias Clave:

| Aspecto | 2024v4 | Agosto 2025 |
|---------|--------|-------------|
| **Cantidad de UVs** | 6,887 | 6,891 |
| **Diferencia** | - | +4 UVs |
| **Campos** | Mismos campos | Mismos campos |
| **Geometría** | 2D/3D Polygon | 3D Polygon |

### Cambios Identificados:

1. ✅ **+4 Unidades Vecinales nuevas** (incremento de 6,887 a 6,891)
2. ✅ **Actualización de geometrías** (posibles ajustes de límites)
3. ✅ **Fecha más reciente** (Septiembre 2025 vs versiones anteriores)

## 📝 Historial de Actualizaciones (según XML)

El archivo tiene un historial extenso de actualizaciones:

1. **2020-12-07:** Conversión inicial desde base de datos
2. **2022-01-24:** Merge con datos RSH 2021
3. **2022-07-15:** Actualización julio 2022
4. **2023-04-24:** Ajustes topológicos
5. **2024-01-03:** Exportación versión 2023
6. **2024-05-10:** Versión 2024 final
7. **2024-08-30:** Merge con Antártica (v4)
8. **2025-07-23:** Merge con Quillota
9. **2025-09-16:** **Versión actual (Agosto 2025)**

## ⚠️ Datos NO Incluidos

Este shapefile **NO contiene** datos demográficos del Censo 2017:
- ❌ Población (PERSONAS)
- ❌ Hogares (HOGARES)
- ❌ Hombres/Mujeres
- ❌ Áreas verdes
- ❌ Equipamiento

**Nota:** Para tener datos demográficos, necesitarás hacer un merge con el Censo 2017 como se hizo anteriormente.

## 🎯 Recomendaciones de Uso

### Para Vecino Activo:

1. **Convertir a GeoJSON:**
   ```bash
   ogr2ogr -f GeoJSON -t_srs EPSG:4326 \
     public/data/geo/Shape_UV_ago2025.geojson \
     public/data/geo/Shape_UV_ago2025.shp
   ```

2. **Simplificar geometrías** (reducir tamaño):
   ```bash
   mapshaper public/data/geo/Shape_UV_ago2025.geojson \
     -simplify 10% \
     -o public/data/geo/unidades_vecinales_simple_ago2025.geojson
   ```

3. **Merge con datos del Censo 2017** (si los tienes):
   - Usar el script `scripts/merge-demographic-data.js`
   - Actualizar para usar el nuevo shapefile

4. **Actualizar el código** para usar los nuevos archivos:
   - Modificar `src/services/neighborhoodService.js`
   - Actualizar referencias en `src/pages/NeighborhoodMap/NeighborhoodMap.js`

## 🔍 Campos Clave para Vecino Activo

Los campos más importantes para tu aplicación son:

- **`t_id_uv_ca`**: ID único (usar como primary key)
- **`uv_carto`**: Código UV para mostrar (ej: "001", "002")
- **`t_uv_nom`**: Nombre de la UV
- **`t_com_nom`**: Comuna
- **`t_reg_nom`**: Región
- **`Shape_Area`**: Área (útil para estadísticas)

## ✅ Ventajas de esta Versión

1. ✨ **Más actualizada** (Septiembre 2025)
2. ✨ **4 UVs adicionales**
3. ✨ **Geometrías más precisas**
4. ✨ **Incluye Antártica**
5. ✨ **Misma estructura de campos** (fácil migración)

## 🚀 Próximos Pasos

1. Convertir el shapefile a GeoJSON
2. Simplificar geometrías para mejor rendimiento
3. Hacer merge con datos del Censo 2017 (si disponibles)
4. Actualizar la aplicación para usar el nuevo archivo
5. Probar en el mapa de Vecino Activo

---

**Conclusión:** Este es el shapefile oficial más reciente de Unidades Vecinales de Chile. Tiene 4 UVs más que la versión anterior y geometrías actualizadas. Es ideal para actualizar Vecino Activo, pero necesitarás hacer el merge con datos demográficos si los quieres mostrar.
