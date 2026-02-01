# 🚀 Inicio Rápido - Integración Censo 2024

## ⚡ Ejecución Rápida (1 comando)

```bash
bash scripts/integrar-censo-2024-completo.sh
```

Este comando ejecuta todo el proceso automáticamente:
1. ✅ Verifica dependencias
2. ✅ Explora estructura del Censo
3. ✅ Convierte Parquet a JSON
4. ✅ Actualiza base de datos

---

## 📋 Requisitos Previos

**El script automático maneja todo por ti** (crea entorno virtual en macOS):
```bash
bash scripts/integrar-censo-2024-completo.sh
```

**O instala manualmente** (si prefieres):

**En macOS**:
```bash
# Crear entorno virtual
python3 -m venv .venv-censo
source .venv-censo/bin/activate
pip install pandas pyarrow openpyxl
```

**En Linux/Windows**:
```bash
pip3 install pandas pyarrow openpyxl
```

---

## 🎯 ¿Qué hace este proceso?

- Lee el archivo **Cartografia_censo2024_Pais_Comunal.parquet** (125.8 MB)
- Hace match con tus **6,891 unidades vecinales** usando el código `t_id_uv_ca`
- Actualiza datos demográficos: personas, hogares, viviendas, etc.
- **NO modifica las geometrías** (se mantienen intactas)
- Guarda datos completos del Censo en `properties.censo_2024`

---

## 📊 Resultado Esperado

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

## 🔧 Si algo falla

### Error: "pandas no está instalado"
```bash
pip3 install pandas pyarrow
```

### Error: "No se encuentra el archivo Parquet"
Verifica que el archivo esté en:
```
public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet
```

### Quiero ver qué campos tiene el Censo primero
```bash
python3 scripts/explorar-censo-2024.py
```

---

## 📚 Documentación Completa

Ver: **`INTEGRACION_CENSO_2024.md`**

---

## ⏱️ Tiempo estimado

- Exploración: ~10 segundos
- Conversión: ~30 segundos
- Actualización: ~1-2 minutos

**Total: ~3 minutos**

---

¡Listo! 🎉
