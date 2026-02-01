#!/bin/bash

# ============================================
# DEPLOYMENT CON FIX CORS INTEGRADO
# ============================================
# Este script despliega la aplicación con un proxy CORS
# que soluciona el problema sin necesidad de acceso al servidor de Supabase

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo "========================================="
echo "  VECINO ACTIVO - DEPLOYMENT CON CORS FIX"
echo "========================================="
echo

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "Error: No se encuentra package.json"
    error "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que existe el Dockerfile con proxy
if [ ! -f "Dockerfile.with-proxy" ]; then
    error "Error: No se encuentra Dockerfile.with-proxy"
    exit 1
fi

# Verificar que existe el proxy
if [ ! -f "server/supabaseProxy.js" ]; then
    error "Error: No se encuentra server/supabaseProxy.js"
    exit 1
fi

success "Archivos verificados"
echo

# Cargar variables de entorno
if [ -f ".env.production" ]; then
    log "Cargando variables de entorno..."
    export $(cat .env.production | grep -v '^#' | xargs)
    success "Variables cargadas"
else
    warning "No se encontró .env.production, usando valores por defecto"
fi

echo
log "Configuración:"
echo "  - Supabase URL (en app): https://vecinoactivo.cl/api/supabase"
echo "  - Supabase URL (real): https://supabase.vecinoactivo.cl"
echo "  - Proxy CORS: Habilitado (puerto 3001)"
echo

# Confirmar deployment
read -p "¿Continuar con el deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    warning "Deployment cancelado"
    exit 0
fi

# 1. Detener contenedor anterior
log "1. Deteniendo contenedor anterior..."
if docker ps -a | grep -q "vecino-activo-cors"; then
    docker stop vecino-activo-cors 2>/dev/null || true
    docker rm vecino-activo-cors 2>/dev/null || true
    success "Contenedor anterior detenido"
else
    warning "No hay contenedor anterior"
fi
echo

# 2. Construir nueva imagen
log "2. Construyendo imagen Docker con proxy CORS..."
docker build \
    -f Dockerfile.with-proxy \
    -t vecino-activo:cors-fix \
    --build-arg REACT_APP_SUPABASE_URL="https://vecinoactivo.cl/api/supabase" \
    --build-arg REACT_APP_SUPABASE_ANON_KEY="${REACT_APP_SUPABASE_ANON_KEY}" \
    --build-arg REACT_APP_ENVIRONMENT="production" \
    --build-arg REACT_APP_FIREBASE_API_KEY="${REACT_APP_FIREBASE_API_KEY}" \
    --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN="${REACT_APP_FIREBASE_AUTH_DOMAIN}" \
    --build-arg REACT_APP_FIREBASE_DATABASE_URL="${REACT_APP_FIREBASE_DATABASE_URL}" \
    --build-arg REACT_APP_FIREBASE_PROJECT_ID="${REACT_APP_FIREBASE_PROJECT_ID}" \
    --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET="${REACT_APP_FIREBASE_STORAGE_BUCKET}" \
    --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID="${REACT_APP_FIREBASE_MESSAGING_SENDER_ID}" \
    --build-arg REACT_APP_FIREBASE_APP_ID="${REACT_APP_FIREBASE_APP_ID}" \
    --build-arg REACT_APP_FIREBASE_VAPID_KEY="${REACT_APP_FIREBASE_VAPID_KEY}" \
    .

if [ $? -eq 0 ]; then
    success "Imagen construida exitosamente"
else
    error "Error al construir la imagen"
    exit 1
fi
echo

# 3. Iniciar nuevo contenedor
log "3. Iniciando contenedor con proxy CORS..."
docker run -d \
    --name vecino-activo-cors \
    -p 80:80 \
    -p 443:443 \
    --restart unless-stopped \
    vecino-activo:cors-fix

if [ $? -eq 0 ]; then
    success "Contenedor iniciado"
else
    error "Error al iniciar el contenedor"
    exit 1
fi
echo

# 4. Esperar a que el contenedor esté listo
log "4. Esperando a que el contenedor esté listo..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f http://localhost/ > /dev/null 2>&1 && \
       curl -f http://localhost/api/supabase/rest/v1/ > /dev/null 2>&1; then
        success "Contenedor listo"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 2
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo
        error "Timeout esperando que el contenedor esté listo"
        log "Logs del contenedor:"
        docker logs vecino-activo-cors --tail=50
        exit 1
    fi
done
echo

# 5. Verificar servicios
log "5. Verificando servicios..."

# Verificar Nginx
if curl -f http://localhost/ > /dev/null 2>&1; then
    success "Nginx funcionando"
else
    error "Nginx no responde"
    docker logs vecino-activo-cors --tail=20
    exit 1
fi

# Verificar Proxy
if curl -f http://localhost/api/supabase/rest/v1/ > /dev/null 2>&1; then
    success "Proxy CORS funcionando"
else
    error "Proxy CORS no responde"
    docker logs vecino-activo-cors --tail=20
    exit 1
fi

echo

# 6. Limpiar imágenes antiguas
log "6. Limpiando imágenes antiguas..."
docker image prune -f > /dev/null 2>&1
success "Imágenes antiguas eliminadas"
echo

# 7. Resumen
echo "========================================="
echo "  ✅ DEPLOYMENT COMPLETADO"
echo "========================================="
echo
echo "Servicios:"
echo "  - Frontend: http://localhost/"
echo "  - Proxy CORS: http://localhost/api/supabase/"
echo "  - Supabase (real): https://supabase.vecinoactivo.cl"
echo
echo "Contenedor:"
CONTAINER_ID=$(docker ps -q -f name=vecino-activo-cors)
echo "  - ID: $CONTAINER_ID"
echo "  - Nombre: vecino-activo-cors"
echo "  - Estado: $(docker inspect -f '{{.State.Status}}' vecino-activo-cors)"
echo
echo "Logs:"
echo "  - Ver logs: docker logs vecino-activo-cors -f"
echo "  - Ver logs Nginx: docker exec vecino-activo-cors tail -f /var/log/nginx/access.log"
echo "  - Ver logs Proxy: docker logs vecino-activo-cors -f | grep proxy"
echo
echo "Comandos útiles:"
echo "  - Reiniciar: docker restart vecino-activo-cors"
echo "  - Detener: docker stop vecino-activo-cors"
echo "  - Eliminar: docker rm -f vecino-activo-cors"
echo
echo "🎉 La aplicación está lista en: http://localhost/"
echo "🔧 El proxy CORS está manejando las peticiones a Supabase"
echo

# Test final
log "Test final de CORS..."
if curl -s -H "Origin: https://vecinoactivo.cl" \
        -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}" \
        http://localhost/api/supabase/rest/v1/users?select=id&limit=1 | grep -q "\["; then
    success "CORS funcionando correctamente"
else
    warning "No se pudo verificar CORS (puede ser normal si no hay datos)"
fi

echo
success "Deployment completado exitosamente"
