#!/bin/bash

# Script completo para integrar datos del Censo 2024
# Ejecuta todo el proceso automáticamente

echo "🚀 Integración Completa Censo 2024"
echo "===================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Paso 1: Verificar dependencias Python
echo -e "${YELLOW}📋 Paso 1: Verificando dependencias Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 no está instalado${NC}"
    exit 1
fi

# Verificar pandas
if ! python3 -c "import pandas" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  pandas no está instalado. Instalando...${NC}"
    pip3 install pandas pyarrow openpyxl
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al instalar pandas${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Dependencias Python OK${NC}"
echo ""

# Paso 2: Explorar estructura del Censo
echo -e "${YELLOW}📋 Paso 2: Explorando estructura del Censo 2024...${NC}"
python3 scripts/explorar-censo-2024.py
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al explorar el Censo 2024${NC}"
    exit 1
fi
echo ""

# Preguntar si continuar
echo -e "${YELLOW}¿Deseas continuar con la conversión y actualización? (s/n)${NC}"
read -r respuesta
if [ "$respuesta" != "s" ] && [ "$respuesta" != "S" ]; then
    echo "Proceso cancelado por el usuario"
    exit 0
fi
echo ""

# Paso 3: Convertir Parquet a JSON
echo -e "${YELLOW}📋 Paso 3: Convirtiendo Parquet a JSON...${NC}"
python3 scripts/convertir-parquet-a-json.py
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al convertir Parquet a JSON${NC}"
    exit 1
fi
echo ""

# Verificar que se creó el archivo JSON
if [ ! -f "public/data/geo/censo2024_comunal.json" ]; then
    echo -e "${RED}❌ No se generó el archivo JSON${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conversión completada${NC}"
echo ""

# Paso 4: Actualizar base de datos
echo -e "${YELLOW}📋 Paso 4: Actualizando base de datos...${NC}"
echo -e "${YELLOW}⚠️  Esto modificará los datos en Supabase${NC}"
echo -e "${YELLOW}¿Continuar? (s/n)${NC}"
read -r respuesta
if [ "$respuesta" != "s" ] && [ "$respuesta" != "S" ]; then
    echo "Actualización cancelada. El archivo JSON está listo en public/data/geo/censo2024_comunal.json"
    exit 0
fi
echo ""

node scripts/actualizar-datos-censo-2024.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al actualizar base de datos${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Integración completada exitosamente${NC}"
echo ""
echo "📊 Resumen:"
echo "  • Archivo Parquet analizado"
echo "  • JSON generado en public/data/geo/censo2024_comunal.json"
echo "  • Base de datos actualizada con datos del Censo 2024"
echo ""
echo "🎉 ¡Listo! Los datos del Censo 2024 están integrados"
