#!/bin/bash

# Script de Despliegue Simple a Producción - Vecino Activo
# Uso: ./deploy-simple-production.sh

set -e  # Salir si cualquier comando falla

echo "🚀 DESPLIEGUE SIMPLE A PRODUCCIÓN - VECINO ACTIVO"
echo "================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# 1. Verificar Node.js
log "1. Verificando Node.js..."

if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "✅ Node.js $NODE_VERSION y npm $NPM_VERSION encontrados"

# 2. Verificar variables de entorno para producción
log "2. Configurando variables de entorno para producción..."

# Exportar variables de producción
export NODE_ENV=production
export REACT_APP_ENVIRONMENT=production
export REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
export REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
export REACT_APP_GOOGLE_CLIENT_ID=777409222994-f26h0j6v3vui8c3ha4ke5ada9699uvl2.apps.googleusercontent.com
export REACT_APP_GEMINI_API_KEY=AIzaSyBK8AJWK61OAYjzLSyRz74LxFJRBlt1OFo
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

log "Variables de entorno configuradas:"
log "  - NODE_ENV: $NODE_ENV"
log "  - SUPABASE_URL: $REACT_APP_SUPABASE_URL"
log "  - SUPABASE_KEY: ${REACT_APP_SUPABASE_ANON_KEY:0:20}..."

# 3. Limpiar build anterior
log "3. Limpiando build anterior..."
rm -rf build/
log "✅ Build anterior eliminado"

# 4. Instalar dependencias (por si acaso)
log "4. Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    log "Instalando dependencias..."
    npm install
else
    log "✅ Dependencias ya instaladas"
fi

# 5. Build de producción
log "5. Construyendo aplicación para producción..."

if npm run build; then
    log "✅ Build exitoso"
else
    error "Build falló"
    exit 1
fi

# Verificar que el build se generó correctamente
if [ ! -f "build/index.html" ]; then
    error "Build no generó index.html"
    exit 1
fi

if [ ! -d "build/static" ]; then
    error "Build no generó archivos estáticos"
    exit 1
fi

log "✅ Build verificado correctamente"

# 6. Verificar tamaño del build
BUILD_SIZE=$(du -sh build | cut -f1)
log "Tamaño del build: $BUILD_SIZE"

# 7. Detener servidor de producción anterior (si existe)
log "6. Verificando servidor de producción anterior..."

if lsof -ti:3005 > /dev/null 2>&1; then
    log "Deteniendo servidor en puerto 3005..."
    kill -9 $(lsof -ti:3005) || true
    sleep 2
    log "✅ Servidor anterior detenido"
else
    log "No hay servidor anterior ejecutándose en puerto 3005"
fi

# 8. Iniciar servidor de producción
log "7. Iniciando servidor de producción..."

# Instalar serve si no está instalado
if ! command -v serve &> /dev/null; then
    log "Instalando serve globalmente..."
    npm install -g serve
fi

# Iniciar servidor en background
log "Iniciando servidor en puerto 3005..."
nohup serve -s build -l 3005 > production.log 2>&1 &
SERVER_PID=$!

# Esperar a que el servidor se inicie
sleep 5

# 9. Verificar que el servidor está ejecutándose
log "8. Verificando servidor..."

if lsof -ti:3005 > /dev/null 2>&1; then
    log "✅ Servidor ejecutándose en puerto 3005 (PID: $SERVER_PID)"
else
    error "Servidor no se pudo iniciar"
    cat production.log
    exit 1
fi

# 10. Health check
log "9. Ejecutando health check..."

MAX_ATTEMPTS=10
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:3005/ > /dev/null; then
        log "✅ Health check exitoso (intento $ATTEMPT/$MAX_ATTEMPTS)"
        break
    else
        warn "Health check falló (intento $ATTEMPT/$MAX_ATTEMPTS)"
        if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
            error "Health check falló después de $MAX_ATTEMPTS intentos"
            log "Logs del servidor:"
            tail -20 production.log
            exit 1
        fi
        sleep 3
        ((ATTEMPT++))
    fi
done

# 11. Verificar logs
log "10. Verificando logs del servidor..."

if [ -f "production.log" ]; then
    log "Últimas líneas del log:"
    tail -10 production.log
fi

# 12. Información del proceso
log "11. Información del servidor:"

PROCESS_INFO=$(ps -p $SERVER_PID -o pid,ppid,cmd 2>/dev/null || echo "Proceso no encontrado")
log "Proceso: $PROCESS_INFO"

# 13. Test de conectividad a Supabase desde producción
log "12. Verificando conectividad a Supabase..."

SUPABASE_TEST=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $REACT_APP_SUPABASE_ANON_KEY" "$REACT_APP_SUPABASE_URL/rest/v1/")
if [ "$SUPABASE_TEST" = "200" ]; then
    log "✅ Conectividad a Supabase exitosa (HTTP $SUPABASE_TEST)"
else
    warn "Conectividad a Supabase: HTTP $SUPABASE_TEST"
fi

# 14. Resumen final
echo
echo "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "====================================="
echo
echo "📋 Información del despliegue:"
echo "  - Aplicación: Vecino Activo"
echo "  - Versión: $(git rev-parse --short HEAD)"
echo "  - Rama: $(git branch --show-current)"
echo "  - URL: http://localhost:3005"
echo "  - PID del servidor: $SERVER_PID"
echo "  - Tamaño del build: $BUILD_SIZE"
echo
echo "🔧 Comandos útiles:"
echo "  - Ver logs: tail -f production.log"
echo "  - Detener servidor: kill $SERVER_PID"
echo "  - Reiniciar: kill $SERVER_PID && serve -s build -l 3005 &"
echo "  - Estado del puerto: lsof -ti:3005"
echo
echo "🌐 Para verificar que todo funciona:"
echo "  1. Abrir http://localhost:3005 en el navegador"
echo "  2. Verificar que la página carga correctamente"
echo "  3. Probar login con admin@vecinoactivo.cl / admin123"
echo "  4. Revisar consola del navegador para errores"
echo "  5. Verificar que las funciones en tiempo real funcionan"
echo

log "✅ Despliegue completado exitosamente"
log "🚀 Aplicación disponible en: http://localhost:3005"