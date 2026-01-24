#!/bin/bash

# Script de Despliegue a Producción - Vecino Activo
# Uso: ./deploy-production.sh

set -e  # Salir si cualquier comando falla

echo "🚀 DESPLIEGUE A PRODUCCIÓN - VECINO ACTIVO"
echo "=========================================="

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

# 1. Verificar prerrequisitos
log "1. Verificando prerrequisitos..."

if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
    exit 1
fi

if ! command -v git &> /dev/null; then
    error "Git no está instalado"
    exit 1
fi

log "✅ Prerrequisitos verificados"

# 2. Verificar variables de entorno
log "2. Verificando variables de entorno..."

if [ -f ".env.production" ]; then
    log "✅ Archivo .env.production encontrado"
    source .env.production
else
    warn "Archivo .env.production no encontrado, usando valores por defecto"
fi

# Verificar variables críticas
if [ -z "$REACT_APP_SUPABASE_URL" ]; then
    warn "REACT_APP_SUPABASE_URL no definida, usando valor por defecto"
    export REACT_APP_SUPABASE_URL="https://supabase.vecinoactivo.cl"
fi

if [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
    warn "REACT_APP_SUPABASE_ANON_KEY no definida, usando valor por defecto"
    export REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
fi

log "Variables de entorno configuradas:"
log "  - SUPABASE_URL: $REACT_APP_SUPABASE_URL"
log "  - SUPABASE_KEY: ${REACT_APP_SUPABASE_ANON_KEY:0:20}..."

# 3. Verificar estado del repositorio
log "3. Verificando estado del repositorio..."

if [ -n "$(git status --porcelain)" ]; then
    warn "Hay cambios sin commitear en el repositorio"
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Despliegue cancelado"
        exit 1
    fi
fi

CURRENT_BRANCH=$(git branch --show-current)
log "Rama actual: $CURRENT_BRANCH"

# 4. Ejecutar tests (opcional)
log "4. Ejecutando tests..."

if [ "$1" != "--skip-tests" ]; then
    log "Ejecutando tests unitarios..."
    if npm test -- --watchAll=false --passWithNoTests; then
        log "✅ Tests pasaron exitosamente"
    else
        error "Tests fallaron"
        read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Despliegue cancelado"
            exit 1
        fi
    fi
else
    warn "Tests omitidos (--skip-tests)"
fi

# 5. Build de producción
log "5. Construyendo aplicación para producción..."

log "Limpiando build anterior..."
rm -rf build/

log "Ejecutando build de producción..."
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

# 6. Detener contenedor anterior (si existe)
log "6. Deteniendo contenedor anterior..."

if docker-compose -f docker-compose.prod.yml ps | grep -q "vecino-activo-prod"; then
    log "Deteniendo contenedor existente..."
    docker-compose -f docker-compose.prod.yml down
    log "✅ Contenedor anterior detenido"
else
    log "No hay contenedor anterior ejecutándose"
fi

# 7. Construir nueva imagen Docker
log "7. Construyendo imagen Docker..."

log "Construyendo imagen con variables de entorno..."
if docker-compose -f docker-compose.prod.yml build --no-cache; then
    log "✅ Imagen Docker construida exitosamente"
else
    error "Falló la construcción de la imagen Docker"
    exit 1
fi

# 8. Iniciar nuevo contenedor
log "8. Iniciando nuevo contenedor..."

if docker-compose -f docker-compose.prod.yml up -d; then
    log "✅ Contenedor iniciado exitosamente"
else
    error "Falló el inicio del contenedor"
    exit 1
fi

# 9. Verificar que el contenedor está ejecutándose
log "9. Verificando estado del contenedor..."

sleep 10  # Esperar a que el contenedor se inicie completamente

if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Contenedor ejecutándose correctamente"
else
    error "Contenedor no está ejecutándose"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# 10. Health check
log "10. Ejecutando health check..."

MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost/ > /dev/null; then
        log "✅ Health check exitoso (intento $ATTEMPT/$MAX_ATTEMPTS)"
        break
    else
        warn "Health check falló (intento $ATTEMPT/$MAX_ATTEMPTS)"
        if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
            error "Health check falló después de $MAX_ATTEMPTS intentos"
            log "Logs del contenedor:"
            docker-compose -f docker-compose.prod.yml logs --tail=50
            exit 1
        fi
        sleep 5
        ((ATTEMPT++))
    fi
done

# 11. Verificar logs
log "11. Verificando logs del contenedor..."

log "Últimas líneas del log:"
docker-compose -f docker-compose.prod.yml logs --tail=20

# 12. Limpiar imágenes antiguas
log "12. Limpiando imágenes Docker antiguas..."

if docker image prune -f; then
    log "✅ Imágenes antiguas limpiadas"
else
    warn "No se pudieron limpiar las imágenes antiguas"
fi

# 13. Resumen final
log "13. Resumen del despliegue:"

CONTAINER_ID=$(docker-compose -f docker-compose.prod.yml ps -q vecino-activo)
if [ -n "$CONTAINER_ID" ]; then
    log "✅ Contenedor ID: $CONTAINER_ID"
    log "✅ Estado: $(docker inspect --format='{{.State.Status}}' $CONTAINER_ID)"
    log "✅ Iniciado: $(docker inspect --format='{{.State.StartedAt}}' $CONTAINER_ID)"
fi

echo
echo "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "====================================="
echo
echo "📋 Información del despliegue:"
echo "  - Aplicación: Vecino Activo"
echo "  - Versión: $(git rev-parse --short HEAD)"
echo "  - Rama: $CURRENT_BRANCH"
echo "  - URL: http://localhost (o tu dominio configurado)"
echo "  - Contenedor: vecino-activo-prod"
echo
echo "🔧 Comandos útiles:"
echo "  - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "  - Detener: docker-compose -f docker-compose.prod.yml down"
echo "  - Estado: docker-compose -f docker-compose.prod.yml ps"
echo
echo "🌐 Para verificar que todo funciona:"
echo "  1. Abrir http://localhost en el navegador"
echo "  2. Verificar que la página carga correctamente"
echo "  3. Probar login con admin@vecinoactivo.cl / admin123"
echo "  4. Revisar consola del navegador para errores"
echo

log "✅ Despliegue completado exitosamente"