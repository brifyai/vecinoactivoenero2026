#!/bin/bash

# Script para convertir Shapefile a GeoJSON
# Requiere: ogr2ogr (parte de GDAL)

echo "🗺️  Convirtiendo Shapefile a GeoJSON..."

# Verificar si ogr2ogr está instalado
if ! command -v ogr2ogr &> /dev/null; then
    echo "❌ Error: ogr2ogr no está instalado"
    echo "📦 Instala GDAL:"
    echo "   macOS: brew install gdal"
    echo "   Ubuntu: sudo apt-get install gdal-bin"
    exit 1
fi

# Directorio de entrada (donde están los archivos .shp)
INPUT_DIR="$1"
if [ -z "$INPUT_DIR" ]; then
    echo "❌ Error: Debes proporcionar la ruta a los archivos Shapefile"
    echo "Uso: ./convert-shapefile.sh /ruta/a/unidades-vecinales_2024"
    exit 1
fi

# Archivo de entrada
INPUT_FILE="$INPUT_DIR/UnidadesVecinales_2024v4.shp"

# Verificar que existe
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo $INPUT_FILE"
    exit 1
fi

# Directorio de salida
OUTPUT_DIR="public/data/geo"
mkdir -p "$OUTPUT_DIR"

# Archivo de salida completo
OUTPUT_FULL="$OUTPUT_DIR/unidades_vecinales_2024.geojson"

# Archivo de salida simplificado
OUTPUT_SIMPLE="$OUTPUT_DIR/unidades_vecinales_simple.geojson"

echo "📍 Convirtiendo a GeoJSON completo..."
ogr2ogr -f GeoJSON \
    -t_srs EPSG:4326 \
    "$OUTPUT_FULL" \
    "$INPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ GeoJSON completo creado: $OUTPUT_FULL"
    SIZE=$(du -h "$OUTPUT_FULL" | cut -f1)
    echo "   Tamaño: $SIZE"
else
    echo "❌ Error al convertir"
    exit 1
fi

echo ""
echo "📍 Simplificando geometrías..."
ogr2ogr -f GeoJSON \
    -t_srs EPSG:4326 \
    -simplify 0.001 \
    "$OUTPUT_SIMPLE" \
    "$INPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ GeoJSON simplificado creado: $OUTPUT_SIMPLE"
    SIZE=$(du -h "$OUTPUT_SIMPLE" | cut -f1)
    echo "   Tamaño: $SIZE"
else
    echo "❌ Error al simplificar"
    exit 1
fi

echo ""
echo "🎉 ¡Conversión completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verifica los archivos en $OUTPUT_DIR"
echo "2. Reinicia el servidor backend (puerto 3001)"
echo "3. Reinicia el servidor frontend (puerto 3003)"
echo "4. Prueba el mapa en http://localhost:3003/map"
