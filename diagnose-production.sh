#!/bin/bash

# Script de Diagnóstico de Producción - Vecino Activo
# Uso: ./diagnose-production.sh [URL]

URL=${1:-"http://localhost"}

echo "🔍 DIAGNÓSTICO DE PRODUCCIÓN - VECINO ACTIVO"
echo "============================================"
echo "URL objetivo: $URL"
echo

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar conectividad básica
echo "1. 🌐 CONECTIVIDAD BÁSICA"
echo "------------------------"

curl -s -o /dev/null -w "Status: %{http_code}\nTiempo: %{time_total}s\nTamaño: %{size_download} bytes\n" $URL
check "Conectividad HTTP"

# 2. Verificar archivos estáticos
echo
echo "2. 📁 ARCHIVOS ESTÁTICOS"
echo "------------------------"

# Verificar index.html
curl -s $URL | grep -q "<div id=\"root\">"
check "index.html contiene div root"

curl -s $URL | grep -q "static/js/"
check "Referencias a archivos JS"

curl -s $URL | grep -q "static/css/"
check "Referencias a archivos CSS"

# Verificar que los archivos JS/CSS cargan
JS_FILE=$(curl -s $URL | grep -o 'static/js/[^"]*\.js' | head -1)
if [ -n "$JS_FILE" ]; then
    curl -s -o /dev/null -w "%{http_code}" $URL/$JS_FILE | grep -q "200"
    check "Archivo JS principal carga ($JS_FILE)"
else
    echo -e "${RED}❌ No se encontró archivo JS principal${NC}"
fi

CSS_FILE=$(curl -s $URL | grep -o 'static/css/[^"]*\.css' | head -1)
if [ -n "$CSS_FILE" ]; then
    curl -s -o /dev/null -w "%{http_code}" $URL/$CSS_FILE | grep -q "200"
    check "Archivo CSS principal carga ($CSS_FILE)"
else
    echo -e "${RED}❌ No se encontró archivo CSS principal${NC}"
fi

# 3. Verificar configuración de runtime
echo
echo "3. ⚙️  CONFIGURACIÓN DE RUNTIME"
echo "------------------------------"

curl -s $URL/config.js | grep -q "window.ENV"
check "Archivo config.js existe y contiene window.ENV"

SUPABASE_URL=$(curl -s $URL/config.js | grep -o 'REACT_APP_SUPABASE_URL: [^,]*' | cut -d"'" -f2)
if [ -n "$SUPABASE_URL" ]; then
    echo -e "${GREEN}✅ SUPABASE_URL configurada: $SUPABASE_URL${NC}"
else
    echo -e "${RED}❌ SUPABASE_URL no encontrada en config.js${NC}"
fi

# 4. Verificar Supabase
echo
echo "4. 🗄️  CONEXIÓN SUPABASE"
echo "------------------------"

if [ -n "$SUPABASE_URL" ]; then
    # Test básico de conectividad a Supabase
    curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" | grep -q "200\|401"
    check "Supabase responde (esperado 200 o 401)"
    
    # Test con API key si está disponible
    SUPABASE_KEY=$(curl -s $URL/config.js | grep -o 'REACT_APP_SUPABASE_ANON_KEY: [^,]*' | cut -d"'" -f2)
    if [ -n "$SUPABASE_KEY" ]; then
        curl -s -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" \
             -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" | grep -q "200"
        check "Supabase acepta API key"
    fi
else
    warn "No se puede probar Supabase sin URL"
fi

# 5. Verificar Docker (si aplica)
echo
echo "5. 🐳 ESTADO DOCKER"
echo "-------------------"

if command -v docker &> /dev/null; then
    if docker ps | grep -q "vecino-activo"; then
        CONTAINER_ID=$(docker ps | grep "vecino-activo" | awk '{print $1}')
        echo -e "${GREEN}✅ Contenedor ejecutándose: $CONTAINER_ID${NC}"
        
        # Verificar logs del contenedor
        echo "Últimas líneas del log:"
        docker logs --tail=5 $CONTAINER_ID
        
        # Verificar health del contenedor
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_ID 2>/dev/null || echo "no-health")
        if [ "$HEALTH" = "healthy" ]; then
            echo -e "${GREEN}✅ Health check: $HEALTH${NC}"
        elif [ "$HEALTH" = "no-health" ]; then
            warn "Health check no configurado"
        else
            echo -e "${RED}❌ Health check: $HEALTH${NC}"
        fi
    else
        echo -e "${RED}❌ No hay contenedor de vecino-activo ejecutándose${NC}"
    fi
else
    warn "Docker no disponible para verificar"
fi

# 6. Test de funcionalidad JavaScript
echo
echo "6. 🧪 TEST DE FUNCIONALIDAD"
echo "---------------------------"

# Crear script de test temporal
cat > /tmp/test-vecino-activo.js << 'EOF'
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Capturar errores de consola
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(process.argv[2] || 'http://localhost');
    
    // Esperar a que React se cargue
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Verificar que el contenido se cargó
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    
    if (rootContent.length > 100) {
      console.log('✅ Contenido React cargado');
    } else {
      console.log('❌ Contenido React vacío o mínimo');
    }
    
    // Verificar errores de JavaScript
    if (errors.length === 0) {
      console.log('✅ Sin errores de JavaScript');
    } else {
      console.log('❌ Errores de JavaScript encontrados:');
      errors.forEach(error => console.log('  -', error));
    }
    
    await browser.close();
  } catch (error) {
    console.log('❌ Error en test:', error.message);
  }
})();
EOF

# Ejecutar test si puppeteer está disponible
if command -v node &> /dev/null && npm list puppeteer &> /dev/null; then
    node /tmp/test-vecino-activo.js $URL
else
    warn "Puppeteer no disponible para test de JavaScript"
fi

# Limpiar archivo temporal
rm -f /tmp/test-vecino-activo.js

# 7. Recomendaciones
echo
echo "7. 💡 RECOMENDACIONES"
echo "--------------------"

echo "Para diagnosticar problemas adicionales:"
echo "1. Abrir DevTools (F12) en $URL"
echo "2. Revisar Console para errores JavaScript"
echo "3. Revisar Network para requests fallidos"
echo "4. Ejecutar en Console:"
echo "   console.log('Root:', document.getElementById('root'));"
echo "   console.log('Config:', window.ENV);"
echo "   console.log('React:', typeof React !== 'undefined');"
echo
echo "Si la página sigue en blanco:"
echo "1. Verificar variables de entorno en el servidor"
echo "2. Revisar logs del contenedor Docker"
echo "3. Verificar configuración de nginx"
echo "4. Probar rebuild completo"

echo
echo "🎯 DIAGNÓSTICO COMPLETADO"