#!/bin/bash

# Script de deployment automático desde Git
# Ejecutar en el servidor de producción

set -e  # Exit on error

echo "🚀 DEPLOYMENT AUTOMÁTICO - VECINO ACTIVO"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
REPO_DIR="/var/www/vecino-activo"
NGINX_DIR="/usr/share/nginx/html"
BACKUP_DIR="/var/backups/vecino-activo"
BRANCH="main"

# Verificar que estamos en el servidor
if [ ! -d "$REPO_DIR" ]; then
    echo -e "${RED}❌ Error: Directorio del repositorio no existe: $REPO_DIR${NC}"
    echo "Este script debe ejecutarse en el servidor de producción"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "📦 Paso 1: Crear backup del sitio actual"
echo "----------------------------------------"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
cd "$NGINX_DIR"
tar -czf "$BACKUP_FILE" . 2>/dev/null || true
echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE${NC}"
echo ""

echo "📥 Paso 2: Actualizar código desde Git"
echo "---------------------------------------"
cd "$REPO_DIR"
git fetch origin
git reset --hard origin/$BRANCH
echo -e "${GREEN}✅ Código actualizado desde origin/$BRANCH${NC}"
echo ""

echo "🔍 Paso 3: Verificar archivos críticos"
echo "---------------------------------------"
if [ ! -f "public/manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ manifest.json encontrado${NC}"

if [ ! -f "public/data/geo/unidades_vecinales_simple.geojson" ]; then
    echo -e "${RED}❌ Error: GeoJSON no encontrado${NC}"
    exit 1
fi

GEOJSON_SIZE=$(stat -f%z "public/data/geo/unidades_vecinales_simple.geojson" 2>/dev/null || stat -c%s "public/data/geo/unidades_vecinales_simple.geojson")
if [ "$GEOJSON_SIZE" -lt 1000000 ]; then
    echo -e "${RED}❌ Error: GeoJSON es muy pequeño ($GEOJSON_SIZE bytes)${NC}"
    echo "Parece ser un puntero de Git LFS, no el archivo real"
    exit 1
fi
echo -e "${GREEN}✅ GeoJSON encontrado ($(numfmt --to=iec-i --suffix=B $GEOJSON_SIZE))${NC}"
echo ""

echo "🔨 Paso 4: Instalar dependencias y build"
echo "-----------------------------------------"
npm ci --production=false
npm run build
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

echo "📋 Paso 5: Copiar build a Nginx"
echo "--------------------------------"
cd "$NGINX_DIR"
rm -rf *
cp -r "$REPO_DIR/build/"* .
echo -e "${GREEN}✅ Archivos copiados a $NGINX_DIR${NC}"
echo ""

echo "🔐 Paso 6: Configurar permisos"
echo "-------------------------------"
chown -R nginx:nginx "$NGINX_DIR"
chmod -R 755 "$NGINX_DIR"
echo -e "${GREEN}✅ Permisos configurados${NC}"
echo ""

echo "🔄 Paso 7: Recargar Nginx"
echo "-------------------------"
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recargado${NC}"
else
    echo -e "${RED}❌ Error en configuración de Nginx${NC}"
    exit 1
fi
echo ""

echo "✅ Paso 8: Verificación final"
echo "-----------------------------"
if [ -f "$NGINX_DIR/manifest.json" ]; then
    echo -e "${GREEN}✅ manifest.json presente${NC}"
else
    echo -e "${RED}❌ manifest.json no encontrado${NC}"
fi

if [ -f "$NGINX_DIR/data/geo/unidades_vecinales_simple.geojson" ]; then
    SIZE=$(stat -f%z "$NGINX_DIR/data/geo/unidades_vecinales_simple.geojson" 2>/dev/null || stat -c%s "$NGINX_DIR/data/geo/unidades_vecinales_simple.geojson")
    echo -e "${GREEN}✅ GeoJSON presente ($(numfmt --to=iec-i --suffix=B $SIZE))${NC}"
else
    echo -e "${RED}❌ GeoJSON no encontrado${NC}"
fi
echo ""

echo "🎉 DEPLOYMENT COMPLETADO"
echo "========================"
echo ""
echo "Próximos pasos:"
echo "1. Purgar caché de Cloudflare"
echo "2. Verificar en el navegador: https://vecinoactivo.cl/"
echo "3. Verificar que no hay errores en la consola"
echo ""
echo "Backup guardado en: $BACKUP_FILE"
