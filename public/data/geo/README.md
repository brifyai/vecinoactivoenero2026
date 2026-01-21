# Datos Geográficos

Este directorio contiene los archivos GeoJSON necesarios para el mapa de unidades vecinales.

## Archivo Requerido

- `unidades_vecinales_simple.geojson` (75 MB)

## ¿Por qué no está en el repositorio?

Este archivo es demasiado grande para GitHub (excede el límite de 50 MB recomendado).

## Cómo obtener el archivo

### Opción 1: Descargar desde Google Drive / Dropbox
[Agregar enlace aquí cuando esté disponible]

### Opción 2: Generar localmente
Si tienes los archivos shapefile originales, puedes generar el GeoJSON usando:

```bash
npm run update-geo-data
```

## Ubicación
El archivo debe estar en: `public/data/geo/unidades_vecinales_simple.geojson`

## Nota
La aplicación no funcionará correctamente sin este archivo.
