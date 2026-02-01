# 📊 Integración Datos Censo 2024

## 🎯 Objetivo

Actualizar los datos demográficos de las **6,891 unidades vecinales** en la base de datos con información actualizada del **Censo 2024** sin modificar las geometrías existentes.

---

## 📁 Archivos Disponibles

Ya tienes los archivos del Censo 2024 en `public/data/geo/`:

- ✅ `Cartografia_censo2024_Pais_Comunal.parquet` (125.8 MB) - **ESTE ES EL QUE USAREMOS**
- ✅ `unidades_vecinales_simple.geojson` (archivo actual con 6,891 UV)
- ✅ `Diccionario_variables_geograficas_CPV24.xlsx` (diccionario de campos)

---

## 🔑 Campo Clave para Match

El campo que conecta ambos datasets es:
- **GeoJSON actual**: `properties.t_id_uv_ca` (código de unidad vecinal)
- **Censo 2024**: `GEOCODIGO` o similar (verificar en diccionario)

---

## 🚀 Opción 1: Conversión con Python (RECOMENDADO)

### Paso 1: Instalar dependencias Python

```bash
# Instalar pandas y pyarrow
pip3 install pandas pyarrow openpyxl
```

### Paso 2: Convertir Parquet a JSON

```bash
# Ejecutar script de conversión
python3 scripts/convertir-parquet-a-json.py
```

Este script:
- ✅ Lee el archivo Parquet (125.8 MB)
- ✅ Muestra las columnas disponibles
- ✅ Convierte a JSON para fácil procesamiento
- ✅ Guarda en `public/data/geo/censo2024_comunal.json`

### Paso 3: Actualizar base de datos

```bash
# Ejecutar script de actualización
node scripts/actualizar-datos-censo-2024.js
```

Este script:
- ✅ Lee el JSON del Censo 2024
- ✅ Hace match por código de UV (`t_id_uv_ca`)
- ✅ Actualiza solo datos demográficos (personas, hogares, etc.)
- ✅ Mantiene las geometrías intactas
- ✅ Muestra resumen de actualizaciones

---

## 🚀 Opción 2: Conversión Manual con Pandas

Si prefieres hacerlo manualmente:

```python
import pandas as pd

# Leer Parquet
df = pd.read_parquet('public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet')

# Ver columnas disponibles
print(df.columns.tolist())

# Ver muestra de datos
print(df.head())

# Convertir a JSON
df.to_json('public/data/geo/censo2024_comunal.json', 
           orient='records', 
           force_ascii=False, 
           indent=2)
```

---

## 🚀 Opción 3: Usar DuckDB (Más Rápido)

Si tienes DuckDB instalado:

```bash
# Instalar DuckDB
pip3 install duckdb

# Convertir Parquet a JSON
duckdb -c "COPY (SELECT * FROM read_parquet('public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet')) TO 'public/data/geo/censo2024_comunal.json' (FORMAT JSON, ARRAY true);"
```

---

## 📊 Campos que se Actualizarán

Según el Censo 2024, se actualizarán estos campos en la tabla `neighborhoods`:

```sql
-- Campos demográficos
personas      INTEGER  -- Total de personas
hogares       INTEGER  -- Total de hogares
viviendas     INTEGER  -- Total de viviendas
hombres       INTEGER  -- Total hombres
mujeres       INTEGER  -- Total mujeres

-- Metadata
properties    JSONB    -- Se agrega sección "censo_2024" con datos completos
```

---

## 🔍 Verificar Nombres de Campos

Antes de ejecutar la actualización, verifica los nombres exactos de los campos en el Censo 2024:

```bash
# Ver primeras líneas del JSON generado
head -n 50 public/data/geo/censo2024_comunal.json

# O con Python
python3 -c "import pandas as pd; df = pd.read_parquet('public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet'); print(df.columns.tolist())"
```

Luego ajusta los nombres de campos en `scripts/actualizar-datos-censo-2024.js` líneas 70-80.

---

## 📋 Checklist de Ejecución

- [ ] 1. Instalar Python y pandas: `pip3 install pandas pyarrow`
- [ ] 2. Convertir Parquet a JSON: `python3 scripts/convertir-parquet-a-json.py`
- [ ] 3. Verificar columnas del Censo 2024 en el JSON generado
- [ ] 4. Ajustar nombres de campos en `actualizar-datos-censo-2024.js` si es necesario
- [ ] 5. Ejecutar actualización: `node scripts/actualizar-datos-censo-2024.js`
- [ ] 6. Verificar resultados en Supabase

---

## 🎯 Resultado Esperado

```
📊 RESUMEN DE ACTUALIZACIÓN
============================================================
✅ Actualizados exitosamente: 6,891
⚠️  No encontrados en Censo:  0
❌ Errores:                   0
📈 Total procesados:          6,891
============================================================
```

---

## 🔧 Troubleshooting

### Error: "No se encuentra el archivo censo2024_comunal.json"

**Solución**: Ejecuta primero el script de conversión Python:
```bash
python3 scripts/convertir-parquet-a-json.py
```

### Error: "ModuleNotFoundError: No module named 'pandas'"

**Solución**: Instala pandas:
```bash
pip3 install pandas pyarrow
```

### Muchos registros "No encontrados en Censo"

**Solución**: Verifica que el campo de código coincida:
1. Abre `public/data/geo/censo2024_comunal.json`
2. Busca el campo que contiene el código de UV
3. Actualiza línea 48 en `actualizar-datos-censo-2024.js`:
   ```javascript
   const codigo = registro.GEOCODIGO || registro.codigo || registro.COD_UV;
   ```

---

## 📚 Archivos Creados

1. **`scripts/convertir-parquet-a-json.py`**
   - Convierte Parquet del Censo 2024 a JSON
   - Muestra columnas y muestra de datos
   - Genera archivo JSON procesable

2. **`scripts/actualizar-datos-censo-2024.js`**
   - Lee JSON del Censo 2024
   - Hace match con unidades vecinales por código
   - Actualiza datos demográficos en Supabase
   - Mantiene geometrías intactas

3. **`scripts/actualizar-censo-directo.js`**
   - Script auxiliar para análisis
   - Extrae códigos de UV del GeoJSON
   - Genera lista de códigos para referencia

---

## 💡 Ventajas de este Enfoque

✅ **No descarga 780 MB**: Solo usa el archivo Comunal (125.8 MB)
✅ **Mantiene geometrías**: No toca las geometrías ya cargadas
✅ **Match preciso**: Usa código oficial de UV (`t_id_uv_ca`)
✅ **Datos completos**: Guarda todo el registro del Censo en `properties.censo_2024`
✅ **Reversible**: Los datos originales se mantienen en `properties`
✅ **Eficiente**: Procesa 6,891 registros en segundos

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que los archivos Parquet estén en `public/data/geo/`
2. Revisa el diccionario de variables en el Excel
3. Ajusta los nombres de campos según la estructura real del Censo 2024
4. Ejecuta `node scripts/actualizar-censo-directo.js` para análisis previo

---

**Fecha**: 1 Febrero 2026  
**Estado**: ✅ Scripts creados, listo para ejecutar
