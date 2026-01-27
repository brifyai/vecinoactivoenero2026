#!/bin/bash

# Script de Despliegue Forzado - Vecino Activo
# Este script fuerza la actualización completa sin caché
# Uso: ./deploy-force-update.sh

set -e

echo "🚀 DESPLIEGUE FORZADO - VECINO ACTIVO"
echo "======================================"
echo

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

# 1. Limpiar build anterior
log "1. Limpiando build anterior..."
rm -rf build/
log "✅ Build anterior eliminado"

# 2. Limpiar caché de npm
log "2. Limpiando caché de npm..."
npm cache clean --force
log "✅ Caché de npm limpiado"

# 3. Reinstalar dependencias
log "3. Reinstalando dependencias..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
log "✅ Dependencias reinstaladas"

# 4. Build de producción
log "4. Construyendo aplicación..."
npm run build
log "✅ Build completado"

# Verificar build
if [ ! -f "build/index.html" ]; then
    echo "❌ ERROR: Build no generó index.html"
    exit 1
fi

log "✅ Build verificado"

# 5. Detener contenedor
log "5. Deteniendo contenedor..."
docker-compose -f docker-compose.prod.yml down
log "✅ Contenedor detenido"

# 6. Limpiar imágenes Docker
log "6. Limpiando imágenes Docker..."
docker system prune -a -f
log "✅ Imágenes limpiadas"

# 7. Construir nueva imagen
log "7. Construyendo imagen Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache
log "✅ Imagen construida"

# 8. Iniciar contenedor
log "8. Iniciando contenedor..."
docker-compose -f docker-compose.prod.yml up -d
log "✅ Contenedor iniciado"

# 9. Esperar y verificar
log "9. Esperando inicio del contenedor..."
sleep 15

# 10. Health check
log "10. Verificando salud del contenedor..."
MAX_ATTEMPTS=20
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost/ > /dev/null; then
        log "✅ Contenedor funcionando (intento $ATTEMPT)"
        break
    else
        if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
            echo "❌ ERROR: Health check falló"
            docker-compose -f docker-compose.prod.yml logs --tail=50
            exit 1
        fi
        warn "Esperando... (intento $ATTEMPT/$MAX_ATTEMPTS)"
        sleep 3
        ((ATTEMPT++))
    fi
done

# 11. Verificar contenido
log "11. Verificando contenido del sitio..."
CONTENT=$(curl -s http://localhost/)
if echo "$CONTENT" | grep -q "Vecino Activo"; then
    log "✅ Contenido correcto"
else
    echo "❌ ERROR: Contenido no contiene 'Vecino Activo'"
    exit 1
fi

# 12. Verificar archivos JS/CSS
if echo "$CONTENT" | grep -q "static/js/main"; then
    log "✅ Archivos JavaScript presentes"
else
    echo "❌ ERROR: Archivos JavaScript no encontrados"
    exit 1
fi

# 13. Mostrar información
log "13. Información del deployment:"
CONTAINER_ID=$(docker-compose -f docker-compose.prod.yml ps -q vecino-activo)
if [ -n "$CONTAINER_ID" ]; then
    log "Contenedor ID: $CONTAINER_ID"
    log "Estado: $(docker inspect --format='{{.State.Status}}' $CONTAINER_ID)"
fi

echo
echo "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "====================================="
echo
echo "✅ Build nuevo generado"
echo "✅ Caché limpiado completamente"
echo "✅ Contenedor actualizado"
echo "✅ Sitio verificado y funcionando"
echo
echo "📋 Próximos pasos:"
echo "  1. Abre http://localhost en el navegador"
echo "  2. Presiona Ctrl+Shift+R para forzar recarga"
echo "  3. Verifica que todo funcione correctamente"
echo
echo "🔧 Comandos útiles:"
echo "  - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "  - Detener: docker-compose -f docker-compose.prod.yml down"
echo

log "✅ Deployment completado"
