#!/bin/bash

# Script para verificar y solucionar el problema del favicon

echo "🔍 Verificando archivos de favicon..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar archivos necesarios
echo "📋 Estado de archivos en public/:"
echo ""

check_file() {
    if [ -f "public/$1" ]; then
        echo -e "${GREEN}✓${NC} $1 - Existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - FALTA"
        return 1
    fi
}

# Verificar cada archivo
missing=0

check_file "favicon.ico" || ((missing++))
check_file "favicon.svg" || ((missing++))
check_file "logo192.png" || ((missing++))
check_file "logo512.png" || ((missing++))
check_file "manifest.json" || ((missing++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $missing -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los archivos necesarios están presentes!${NC}"
    echo ""
    echo "Puedes proceder con el build:"
    echo "  npm run build"
    echo ""
    echo "Y luego crear el paquete para deployment:"
    echo "  tar -czf vecino-activo-favicon-fix.tar.gz build/"
else
    echo -e "${RED}❌ Faltan $missing archivo(s)${NC}"
    echo ""
    echo "Para generar los archivos faltantes:"
    echo ""
    echo "1. Abre el generador en tu navegador:"
    echo -e "   ${YELLOW}open public/generate-favicon.html${NC}"
    echo ""
    echo "2. Haz clic en 'Descargar Todos los Favicons'"
    echo ""
    echo "3. Guarda los archivos en la carpeta public/"
    echo ""
    echo "4. Ejecuta este script de nuevo para verificar"
    echo ""
    echo "O usa una herramienta online:"
    echo "   https://realfavicongenerator.net/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si ImageMagick está instalado
if command -v convert &> /dev/null; then
    echo -e "${GREEN}ℹ️  ImageMagick detectado${NC}"
    echo ""
    echo "Puedes generar los archivos automáticamente con:"
    echo ""
    echo "  cd public"
    echo "  convert favicon.svg -resize 32x32 favicon.ico"
    echo "  convert favicon.svg -resize 192x192 logo192.png"
    echo "  convert favicon.svg -resize 512x512 logo512.png"
    echo ""
fi

# Mostrar tamaños de archivos si existen
if [ $missing -lt 4 ]; then
    echo ""
    echo "📊 Tamaños de archivos existentes:"
    echo ""
    ls -lh public/ | grep -E "(favicon|logo)" | awk '{print "  " $9 " - " $5}'
    echo ""
fi

echo "📖 Para más información, consulta: SOLUCION_FAVICON.md"
echo ""
