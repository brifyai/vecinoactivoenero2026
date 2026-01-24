#!/bin/bash

# Script de despliegue para macOS (desarrollo local)
# Para servidor de producción, usar deploy.sh

set -e

echo "🚀 DESPLEGANDO VECINO ACTIVO EN MACOS (LOCAL)"
echo "============================================="

# Variables para macOS
WEB_ROOT="/usr/local/var/www/vecino-activo"
BACKUP_DIR="$HOME/backups/vecino-activo"

# 1. Crear backup del sitio actual (si existe)
if [ -d "$WEB_ROOT" ]; then
    echo "📦 Creando backup..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$WEB_ROOT" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    echo "✅ Backup creado en $BACKUP_DIR"
fi

# 2. Crear directorio web
echo "📁 Preparando directorio web..."
sudo mkdir -p "$WEB_ROOT"
sudo rm -rf "$WEB_ROOT"/*

# 3. Copiar archivos (sin www-data en macOS)
echo "📋 Copiando archivos..."
sudo cp -r ./* "$WEB_ROOT/"
sudo chown -R $(whoami):staff "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# 4. Verificar despliegue local
echo "🔍 Verificando archivos..."
if [ -f "$WEB_ROOT/index.html" ]; then
    echo "✅ index.html copiado"
else
    echo "❌ Error: index.html no encontrado"
    exit 1
fi

if [ -f "$WEB_ROOT/static/css/main.5f76fd2b.css" ]; then
    echo "✅ CSS copiado"
else
    echo "❌ Error: CSS no encontrado"
    exit 1
fi

if [ -f "$WEB_ROOT/static/js/main.757a47d8.js" ]; then
    echo "✅ JavaScript copiado"
else
    echo "❌ Error: JavaScript no encontrado"
    exit 1
fi

echo "🎉 DESPLIEGUE LOCAL COMPLETADO"
echo "=============================="
echo "📁 Archivos en: $WEB_ROOT"
echo "🧪 Para probar localmente:"
echo "   cd $WEB_ROOT"
echo "   python3 -m http.server 8080"
echo "   Abrir: http://localhost:8080"
echo ""
echo "📤 Para subir al servidor de producción:"
echo "   Usar el archivo .tar.gz o copiar manualmente"