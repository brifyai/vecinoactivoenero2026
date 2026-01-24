#!/bin/bash

# Script de despliegue para servidor de producción
# Ejecutar como root o con sudo

set -e

echo "🚀 DESPLEGANDO VECINO ACTIVO EN SERVIDOR"
echo "========================================"

# Variables
WEB_ROOT="/var/www/vecino-activo"
BACKUP_DIR="/var/backups/vecino-activo"
NGINX_CONF="/etc/nginx/sites-available/vecino-activo"

# 1. Crear backup del sitio actual (si existe)
if [ -d "$WEB_ROOT" ]; then
    echo "📦 Creando backup..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$WEB_ROOT" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    echo "✅ Backup creado"
fi

# 2. Crear directorio web
echo "📁 Preparando directorio web..."
mkdir -p "$WEB_ROOT"
rm -rf "$WEB_ROOT"/*

# 3. Copiar archivos
echo "📋 Copiando archivos..."
cp -r ./* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# 4. Configurar nginx (si no existe)
if [ ! -f "$NGINX_CONF" ]; then
    echo "⚙️ Configurando nginx..."
    cp nginx.conf "$NGINX_CONF"
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    echo "✅ Nginx configurado"
else
    echo "ℹ️ Configuración nginx ya existe"
fi

# 5. Verificar despliegue
echo "🔍 Verificando despliegue..."
if curl -f -s http://localhost/ > /dev/null; then
    echo "✅ Despliegue exitoso"
    echo "🌐 Sitio disponible en: http://vecinoactivo.cl"
else
    echo "❌ Error en el despliegue"
    exit 1
fi

echo "🎉 DESPLIEGUE COMPLETADO"
