# 🛠️ Scripts de Desarrollo - Vecino Activo

Esta carpeta contiene todos los scripts de desarrollo organizados por categoría.

## 📁 Estructura

### `/testing`
Scripts para testing y validación de funcionalidades
- Archivos HTML de testing
- Scripts de testing de componentes
- Scripts de testing de funcionalidades específicas
- **`verify-firebase-status.js`** - Verificación rápida del estado de Firebase
- **`test-firebase-setup.js`** - Testing completo de Firebase (requiere service account)

### `/debugging`
Scripts para debugging y diagnóstico de problemas
- Scripts de diagnóstico de errores
- Scripts de debugging de componentes
- Scripts de corrección de problemas

### `/deployment`
Scripts para deployment y configuración de producción
- Scripts de despliegue
- Scripts de configuración
- Scripts de creación de paquetes

### `/utilities`
Scripts de utilidades y herramientas
- Scripts de optimización
- Scripts de inicialización
- Scripts de polling y alternativas
- Scripts de ejecución de procesos

---

## 📊 Scripts de Integración Censo 2024

### 1. Explorar estructura del Censo 2024
```bash
python3 scripts/explorar-censo-2024.py
```
**Propósito**: Analiza el archivo Parquet del Censo 2024 y muestra:
- Columnas disponibles y tipos de datos
- Campos de códigos/identificadores
- Campos demográficos
- Muestra de datos
- Sugerencias para actualización

**Cuándo usar**: PRIMERO, antes de cualquier conversión o actualización

---

### 2. Convertir Parquet a JSON
```bash
python3 scripts/convertir-parquet-a-json.py
```
**Propósito**: Convierte el archivo Parquet del Censo 2024 (125.8 MB) a JSON para fácil procesamiento

**Requisitos**: 
```bash
pip3 install pandas pyarrow
```

**Salida**: `public/data/geo/censo2024_comunal.json`

---

### 3. Actualizar datos en base de datos
```bash
node scripts/actualizar-datos-censo-2024.js
```
**Propósito**: Actualiza los datos demográficos de las 6,891 unidades vecinales con datos del Censo 2024

**Requisitos**: 
- Haber ejecutado el script de conversión primero
- Variables de entorno configuradas (.env)

**Qué hace**:
- ✅ Lee JSON del Censo 2024
- ✅ Hace match por código de UV (`t_id_uv_ca`)
- ✅ Actualiza personas, hogares, viviendas, etc.
- ✅ Mantiene geometrías intactas
- ✅ Guarda datos completos en `properties.censo_2024`

---

### 4. Análisis directo (opcional)
```bash
node scripts/actualizar-censo-directo.js
```
**Propósito**: Extrae códigos de UV del GeoJSON actual para análisis

---

### 📋 Flujo Completo de Integración Censo 2024

```bash
# Paso 1: Explorar estructura
python3 scripts/explorar-censo-2024.py

# Paso 2: Convertir a JSON
python3 scripts/convertir-parquet-a-json.py

# Paso 3: Actualizar base de datos
node scripts/actualizar-datos-censo-2024.js
```

**Ver documentación completa en**: `INTEGRACION_CENSO_2024.md`

## ⚠️ Importante

**Estos scripts son SOLO para desarrollo. NO ejecutar en producción.**

Para ejecutar cualquier script:
```bash
# Desde la raíz del proyecto
node scripts/[categoria]/[nombre-del-script].js
# o
bash scripts/[categoria]/[nombre-del-script].sh
```

## 📋 Uso Recomendado

1. **Testing**: Usar antes de hacer commits
2. **Debugging**: Usar cuando hay problemas específicos
3. **Deployment**: Usar solo para despliegues controlados
4. **Utilities**: Usar para tareas de mantenimiento

---

*Organizado para mantener el directorio raíz limpio y facilitar el mantenimiento.*