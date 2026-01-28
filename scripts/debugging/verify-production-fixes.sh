#!/bin/bash

# Script de verificación post-deployment
# Verifica que todos los fixes de producción estén aplicados correctamente

echo "🔍 VERIFICACIÓN DE FIXES EN PRODUCCIÓN"
echo "======================================"
echo ""

SITE_URL="https://vecinoactivo.cl"
ERRORS=0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar HTTP status
check_http_status() {
    local url=$1
    local expected=$2
    local description=$3
    
    echo -n "Verificando $description... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" -eq "$expected" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $status)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $status, esperado $expected)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Función para verificar contenido
check_content() {
    local url=$1
    local pattern=$2
    local description=$3
    
    echo -n "Verificando $description... "
    
    content=$(curl -s "$url" | head -c 200)
    
    if echo "$content" | grep -q "$pattern"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Contenido recibido: ${content:0:100}..."
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Función para verificar Content-Type
check_content_type() {
    local url=$1
    local expected=$2
    local description=$3
    
    echo -n "Verificando $description... "
    
    content_type=$(curl -s -I "$url" | grep -i "content-type" | cut -d' ' -f2 | tr -d '\r\n')
    
    if echo "$content_type" | grep -q "$expected"; then
        echo -e "${GREEN}✅ OK${NC} ($content_type)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} ($content_type, esperado $expected)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "1️⃣  VERIFICANDO MANIFEST.JSON"
echo "----------------------------"
check_http_status "$SITE_URL/manifest.json" 200 "manifest.json existe"
check_content_type "$SITE_URL/manifest.json" "application/json" "Content-Type de manifest.json"
check_content "$SITE_URL/manifest.json" "Vecino Activo" "contenido de manifest.json"
echo ""

echo "2️⃣  VERIFICANDO ARCHIVOS GEOJSON"
echo "-------------------------------"
check_http_status "$SITE_URL/data/geo/unidades_vecinales_simple.geojson" 200 "GeoJSON existe"
check_content_type "$SITE_URL/data/geo/unidades_vecinales_simple.geojson" "application/json\|application/geo+json" "Content-Type de GeoJSON"
check_content "$SITE_URL/data/geo/unidades_vecinales_simple.geojson" '"type".*"FeatureCollection"' "contenido de GeoJSON"
echo ""

echo "3️⃣  VERIFICANDO PÁGINA PRINCIPAL"
echo "-------------------------------"
check_http_status "$SITE_URL/" 200 "página principal carga"
check_content "$SITE_URL/" "Vecino Activo" "contenido de página principal"
echo ""

echo "4️⃣  VERIFICANDO ARCHIVOS ESTÁTICOS"
echo "---------------------------------"
check_http_status "$SITE_URL/favicon.ico" 200 "favicon.ico"
check_http_status "$SITE_URL/logo192.png" 200 "logo192.png"
check_http_status "$SITE_URL/logo512.png" 200 "logo512.png"
echo ""

echo "5️⃣  VERIFICANDO HEADERS CORS"
echo "---------------------------"
echo -n "Verificando CORS en GeoJSON... "
cors_header=$(curl -s -I "$SITE_URL/data/geo/unidades_vecinales_simple.geojson" | grep -i "access-control-allow-origin")
if [ -n "$cors_header" ]; then
    echo -e "${GREEN}✅ OK${NC} ($cors_header)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (No CORS header found)"
fi
echo ""

echo "6️⃣  VERIFICANDO CACHE HEADERS"
echo "----------------------------"
echo -n "Verificando Cache-Control en GeoJSON... "
cache_header=$(curl -s -I "$SITE_URL/data/geo/unidades_vecinales_simple.geojson" | grep -i "cache-control")
if [ -n "$cache_header" ]; then
    echo -e "${GREEN}✅ OK${NC} ($cache_header)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (No Cache-Control header found)"
fi
echo ""

# Resumen
echo "======================================"
echo "RESUMEN DE VERIFICACIÓN"
echo "======================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
    echo ""
    echo "El sitio está funcionando correctamente."
    echo "Todos los fixes de producción están aplicados."
    exit 0
else
    echo -e "${RED}❌ $ERRORS TESTS FALLARON${NC}"
    echo ""
    echo "Hay problemas que necesitan ser resueltos:"
    echo ""
    echo "Posibles soluciones:"
    echo "1. Verificar que el build fue extraído correctamente"
    echo "2. Verificar permisos de archivos (nginx:nginx, 755)"
    echo "3. Verificar configuración de Nginx"
    echo "4. Recargar Nginx: systemctl reload nginx"
    echo ""
    echo "Para más detalles, revisar:"
    echo "- FIXES_PRODUCCION_APLICADOS.md"
    echo "- FIX_ERRORES_PRODUCCION_URGENTE.md"
    exit 1
fi
