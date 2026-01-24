#!/bin/bash

# Script de build robusto para producción
set -e

echo "🔧 BUILD ROBUSTO PARA PRODUCCIÓN - VECINO ACTIVO"
echo "==============================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}"
}

# 1. Verificar Node.js
log "1. Verificando versión de Node.js..."
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v20" ]]; then
    warn "Node.js $NODE_VERSION detectado. Supabase recomienda Node 20+"
    warn "El build continuará pero puede haber warnings"
fi

# 2. Limpiar instalación anterior
log "2. Limpiando instalación anterior..."
rm -rf node_modules package-lock.json build

# 3. Instalar dependencias
log "3. Instalando dependencias..."
npm install

# 4. Configurar variables de entorno
log "4. Configurando variables de entorno..."
export NODE_ENV=production
export REACT_APP_ENVIRONMENT=production
export REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
export REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
export REACT_APP_GOOGLE_CLIENT_ID=777409222994-f26h0j6v3vui8c3ha4ke5ada9699uvl2.apps.googleusercontent.com
export REACT_APP_GEMINI_API_KEY=AIzaSyBK8AJWK61OAYjzLSyRz74LxFJRBlt1OFo
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

log "Variables configuradas:"
log "  - NODE_ENV: $NODE_ENV"
log "  - SUPABASE_URL: $REACT_APP_SUPABASE_URL"
log "  - ENVIRONMENT: $REACT_APP_ENVIRONMENT"

# 5. Build de producción
log "5. Ejecutando build de producción..."
if npm run build; then
    log "✅ Build exitoso"
else
    error "Build falló"
    exit 1
fi

# 6. Inyectar variables como fallback
log "6. Inyectando variables de entorno como fallback..."
if node inject-env-vars.js; then
    log "✅ Variables inyectadas exitosamente"
else
    warn "No se pudieron inyectar variables (archivo inject-env-vars.js no encontrado)"
fi

# 7. Verificar build
log "7. Verificando build generado..."
if [ ! -f "build/index.html" ]; then
    error "build/index.html no encontrado"
    exit 1
fi

if [ ! -d "build/static" ]; then
    error "build/static no encontrado"
    exit 1
fi

BUILD_SIZE=$(du -sh build | cut -f1)
log "✅ Build verificado - Tamaño: $BUILD_SIZE"

# 8. Verificar variables inyectadas
log "8. Verificando variables inyectadas..."
if grep -q "window.ENV" build/index.html; then
    log "✅ Variables encontradas en build/index.html"
else
    warn "Variables no encontradas en HTML, pero pueden estar en el bundle JS"
fi

# 9. Crear información del build
log "9. Creando información del build..."
cat > build/build-info.json << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$NODE_VERSION",
  "version": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "environment": "production",
  "buildSize": "$BUILD_SIZE",
  "variables": {
    "REACT_APP_SUPABASE_URL": "$REACT_APP_SUPABASE_URL",
    "REACT_APP_ENVIRONMENT": "$REACT_APP_ENVIRONMENT",
    "injected": true
  }
}
EOF

echo
echo "🎉 BUILD COMPLETADO EXITOSAMENTE"
echo "================================"
echo
echo "📊 Información del build:"
echo "  - Tamaño: $BUILD_SIZE"
echo "  - Node.js: $NODE_VERSION"
echo "  - Variables: Configuradas ✅"
echo "  - Archivos: $(find build -type f | wc -l) archivos generados"
echo
echo "📁 Archivos principales:"
ls -la build/ | head -10
echo
echo "🚀 El build está listo para despliegue"
echo "   Carpeta: build/"
echo "   Usar: serve -s build -l 3005"
echo

log "✅ Build robusto completado exitosamente"