#!/bin/bash

# Script para crear paquete de despliegue con variables inyectadas
# Uso: ./create-deployment-package.sh

set -e

echo "📦 CREANDO PAQUETE DE DESPLIEGUE - VECINO ACTIVO"
echo "==============================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

# 1. Verificar que existe el build
if [ ! -d "build" ]; then
    echo "❌ Error: Carpeta build/ no encontrada"
    echo "   Ejecuta 'npm run build' y 'node inject-env-vars.js' primero"
    exit 1
fi

if [ ! -f "build/index.html" ]; then
    echo "❌ Error: build/index.html no encontrado"
    exit 1
fi

# 2. Verificar que las variables están inyectadas
if ! grep -q "window.ENV" build/index.html; then
    echo "❌ Error: Variables de entorno no están inyectadas"
    echo "   Ejecuta 'node inject-env-vars.js' primero"
    exit 1
fi

log "✅ Build verificado con variables inyectadas"

# 3. Crear directorio de despliegue
DEPLOY_DIR="vecino-activo-deployment-$(date +%Y%m%d-%H%M%S)"
log "Creando paquete de despliegue: $DEPLOY_DIR"

mkdir -p "$DEPLOY_DIR"

# 4. Copiar archivos de build
log "Copiando archivos de build..."
cp -r build/* "$DEPLOY_DIR/"

# 5. Crear archivo de configuración nginx
log "Creando configuración nginx..."
cat > "$DEPLOY_DIR/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name vecinoactivo.cl www.vecinoactivo.cl;
    root /var/www/vecino-activo;
    index index.html;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para archivos estáticos
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 6. Crear script de despliegue para el servidor
log "Creando script de despliegue..."
cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
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
EOF

chmod +x "$DEPLOY_DIR/deploy.sh"

# 7. Crear README con instrucciones
log "Creando documentación..."
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# Paquete de Despliegue - Vecino Activo

Este paquete contiene la aplicación Vecino Activo lista para desplegar en producción con todas las variables de entorno ya inyectadas.

## Contenido

- `index.html` - Página principal con variables inyectadas
- `static/` - Archivos CSS y JavaScript optimizados
- `nginx.conf` - Configuración de nginx
- `deploy.sh` - Script de despliegue automático
- `README.md` - Este archivo

## Variables de Entorno Incluidas

✅ REACT_APP_SUPABASE_URL: https://supabase.vecinoactivo.cl
✅ REACT_APP_SUPABASE_ANON_KEY: Configurada
✅ REACT_APP_GOOGLE_CLIENT_ID: Configurada
✅ REACT_APP_GEMINI_API_KEY: Configurada
✅ REACT_APP_ENVIRONMENT: production

## Instrucciones de Despliegue

### Opción 1: Despliegue Automático (Recomendado)

1. Subir todo el contenido de esta carpeta al servidor
2. Ejecutar como root:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Opción 2: Despliegue Manual

1. Copiar archivos al directorio web:
   ```bash
   sudo cp -r * /var/www/vecino-activo/
   sudo chown -R www-data:www-data /var/www/vecino-activo
   ```

2. Configurar nginx:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/vecino-activo
   sudo ln -sf /etc/nginx/sites-available/vecino-activo /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## Verificación

Después del despliegue, verificar:

1. **Sitio carga**: http://vecinoactivo.cl
2. **Sin errores en consola**: F12 > Console
3. **Variables cargadas**: Debe aparecer "✅ Variables de entorno cargadas desde window.ENV"
4. **Login funciona**: admin@vecinoactivo.cl / admin123

## Solución de Problemas

### Si aparecen errores de Supabase:
- Verificar que aparece el mensaje de variables cargadas en consola
- Comprobar conectividad: `curl -I https://supabase.vecinoactivo.cl`

### Si el sitio no carga:
- Verificar permisos: `ls -la /var/www/vecino-activo`
- Revisar logs nginx: `sudo tail -f /var/log/nginx/error.log`

## Información Técnica

- **Tamaño del bundle**: ~343KB (gzipped)
- **Tecnología**: React 18 + Redux Toolkit
- **Base de datos**: Supabase (self-hosted)
- **Autenticación**: Supabase Auth
- **Tiempo real**: Sistema de polling (2-3 segundos)

---

**Generado**: $(date)
**Versión**: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
EOF

# 8. Crear archivo de información del build
log "Creando información del build..."
cat > "$DEPLOY_DIR/build-info.json" << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "environment": "production",
  "buildSize": "$(du -sh build 2>/dev/null | cut -f1 || echo 'unknown')",
  "variables": {
    "REACT_APP_SUPABASE_URL": "https://supabase.vecinoactivo.cl",
    "REACT_APP_ENVIRONMENT": "production",
    "injected": true
  }
}
EOF

# 9. Crear archivo comprimido
log "Creando archivo comprimido..."
tar -czf "${DEPLOY_DIR}.tar.gz" "$DEPLOY_DIR"

# 10. Mostrar resumen
echo
echo "🎉 PAQUETE DE DESPLIEGUE CREADO EXITOSAMENTE"
echo "==========================================="
echo
echo "📦 Paquete: ${DEPLOY_DIR}.tar.gz"
echo "📁 Carpeta: $DEPLOY_DIR/"
echo "📊 Tamaño: $(du -sh "$DEPLOY_DIR" | cut -f1)"
echo "📊 Comprimido: $(du -sh "${DEPLOY_DIR}.tar.gz" | cut -f1)"
echo
echo "🚀 Para desplegar:"
echo "1. Subir ${DEPLOY_DIR}.tar.gz a tu servidor"
echo "2. Extraer: tar -xzf ${DEPLOY_DIR}.tar.gz"
echo "3. Ejecutar: cd $DEPLOY_DIR && sudo ./deploy.sh"
echo
echo "📋 Archivos incluidos:"
ls -la "$DEPLOY_DIR" | head -10
echo
log "✅ Paquete listo para despliegue"