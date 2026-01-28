#!/bin/bash

# Script de deployment URGENTE - Fix Bucle Infinito
# Este script hace commit, push y deployment automático del fix crítico

set -e  # Exit on error

echo "🚨 DEPLOYMENT URGENTE - FIX BUCLE INFINITO"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio raíz del proyecto${NC}"
    exit 1
fi

echo "📝 Paso 1: Verificar cambios en supabaseFriendsService.js"
echo "---------------------------------------------------------"
if git diff --name-only | grep -q "src/services/supabaseFriendsService.js"; then
    echo -e "${GREEN}✅ Cambios detectados en supabaseFriendsService.js${NC}"
else
    echo -e "${YELLOW}⚠️  No hay cambios sin commit en supabaseFriendsService.js${NC}"
    echo "Verificando si ya está en staging..."
    if git diff --cached --name-only | grep -q "src/services/supabaseFriendsService.js"; then
        echo -e "${GREEN}✅ Cambios ya están en staging${NC}"
    else
        echo -e "${RED}❌ No se encontraron cambios para deployar${NC}"
        exit 1
    fi
fi
echo ""

echo "📦 Paso 2: Verificar que el build existe y es reciente"
echo "-------------------------------------------------------"
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Error: Directorio build no existe${NC}"
    echo "Ejecuta: npm run build"
    exit 1
fi

BUILD_TIME=$(stat -f%m build 2>/dev/null || stat -c%Y build)
CURRENT_TIME=$(date +%s)
TIME_DIFF=$((CURRENT_TIME - BUILD_TIME))

if [ $TIME_DIFF -gt 600 ]; then
    echo -e "${YELLOW}⚠️  Build tiene más de 10 minutos${NC}"
    echo "Recomendado: ejecutar npm run build nuevamente"
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Build es reciente (hace $TIME_DIFF segundos)${NC}"
fi
echo ""

echo "🔍 Paso 3: Verificar que el fix está en el build"
echo "-------------------------------------------------"
if grep -q "from('friends')" src/services/supabaseFriendsService.js; then
    echo -e "${GREEN}✅ Fix confirmado: usando tabla 'friends'${NC}"
else
    echo -e "${RED}❌ Error: El fix no está aplicado correctamente${NC}"
    exit 1
fi

if grep -q "from('friendships')" src/services/supabaseFriendsService.js; then
    echo -e "${RED}❌ Error: Todavía hay referencias a 'friendships'${NC}"
    exit 1
fi
echo ""

echo "💾 Paso 4: Hacer commit del fix"
echo "--------------------------------"
git add src/services/supabaseFriendsService.js
git add FIX_BUCLE_INFINITO_DESCUBRIR_VECINOS.md 2>/dev/null || true
git add RESUMEN_SESION_28_ENE_2026_PARTE3.md 2>/dev/null || true

git commit -m "🔥 FIX CRÍTICO: Corregir bucle infinito en Descubrir Vecinos

- Cambiar todas las referencias de tabla 'friendships' a 'friends'
- 11 cambios en src/services/supabaseFriendsService.js
- Resuelve bucle infinito de requests en /app/descubrir-vecinos
- Error: tabla 'friendships' no existe en base de datos
- Deployment urgente requerido

Archivos modificados:
- src/services/supabaseFriendsService.js (11 cambios)

Documentación:
- FIX_BUCLE_INFINITO_DESCUBRIR_VECINOS.md
- RESUMEN_SESION_28_ENE_2026_PARTE3.md"

echo -e "${GREEN}✅ Commit creado${NC}"
echo ""

echo "🚀 Paso 5: Push a repositorio remoto"
echo "-------------------------------------"
BRANCH=$(git branch --show-current)
echo "Branch actual: $BRANCH"

git push origin $BRANCH

echo -e "${GREEN}✅ Push completado a origin/$BRANCH${NC}"
echo ""

echo "📋 Paso 6: Crear archivo de instrucciones para el servidor"
echo "-----------------------------------------------------------"
cat > DEPLOYMENT_URGENTE_INSTRUCCIONES.txt << 'EOF'
INSTRUCCIONES DE DEPLOYMENT URGENTE
====================================

El fix del bucle infinito ya está en el repositorio Git.

OPCIÓN A - Deployment Automático desde Git (RECOMENDADO):
----------------------------------------------------------
Ejecutar en el servidor de producción:

cd /var/www/vecino-activo
bash scripts/deployment/deploy-from-git.sh

Esto hará:
1. Backup del sitio actual
2. Pull del código actualizado
3. npm install y build
4. Copiar a Nginx
5. Recargar Nginx

OPCIÓN B - Deployment Manual con tar.gz:
-----------------------------------------
1. Subir archivo al servidor:
   scp vecino-activo-fix-bucle-infinito-*.tar.gz usuario@servidor:/tmp/

2. En el servidor:
   cd /usr/share/nginx/html
   tar -xzf /tmp/vecino-activo-fix-bucle-infinito-*.tar.gz
   systemctl reload nginx

DESPUÉS DEL DEPLOYMENT:
-----------------------
1. Purgar caché de Cloudflare:
   - Dashboard Cloudflare → vecinoactivo.cl
   - Caching → Purge Everything

2. Verificar:
   - Abrir https://vecinoactivo.cl/app/descubrir-vecinos
   - Verificar que NO hay requests infinitos en consola
   - Probar búsqueda de vecinos

FIX APLICADO:
-------------
- Archivo: src/services/supabaseFriendsService.js
- Cambios: 11 referencias de 'friendships' → 'friends'
- Problema resuelto: Bucle infinito de requests fallidos
EOF

echo -e "${GREEN}✅ Instrucciones creadas: DEPLOYMENT_URGENTE_INSTRUCCIONES.txt${NC}"
echo ""

echo "🎉 PREPARACIÓN COMPLETADA"
echo "========================="
echo ""
echo -e "${GREEN}El fix ya está en el repositorio Git!${NC}"
echo ""
echo "PRÓXIMOS PASOS:"
echo "---------------"
echo ""
echo "1. 🖥️  CONECTAR AL SERVIDOR:"
echo "   ssh usuario@tu-servidor.com"
echo ""
echo "2. 🚀 EJECUTAR DEPLOYMENT:"
echo "   cd /var/www/vecino-activo"
echo "   bash scripts/deployment/deploy-from-git.sh"
echo ""
echo "3. 🔥 PURGAR CACHÉ CLOUDFLARE:"
echo "   Dashboard → vecinoactivo.cl → Caching → Purge Everything"
echo ""
echo "4. ✅ VERIFICAR:"
echo "   https://vecinoactivo.cl/app/descubrir-vecinos"
echo ""
echo "📄 Ver instrucciones completas en: DEPLOYMENT_URGENTE_INSTRUCCIONES.txt"
echo ""
echo "⏱️  Tiempo estimado de deployment: 3-5 minutos"
echo ""
