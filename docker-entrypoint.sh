#!/bin/sh
# docker-entrypoint.sh - Script de entrada para inyección de variables de entorno en runtime

echo "🚀 Iniciando Vecino Activo..."

# Verificar si las variables de entorno están disponibles
if [ ! -z "$REACT_APP_SUPABASE_URL" ] && [ ! -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
    echo "✅ Variables de entorno detectadas, configurando runtime..."
    
    # Crear archivo de configuración JavaScript para runtime
    cat > /usr/share/nginx/html/config.js << EOF
// Configuración de runtime para Vecino Activo
window.ENV = {
    REACT_APP_SUPABASE_URL: '$REACT_APP_SUPABASE_URL',
    REACT_APP_SUPABASE_ANON_KEY: '$REACT_APP_SUPABASE_ANON_KEY',
    REACT_APP_ENVIRONMENT: '${REACT_APP_ENVIRONMENT:-production}',
    REACT_APP_VERSION: '${REACT_APP_VERSION:-1.0.0}'
};

console.log('🔧 Configuración de runtime cargada:', window.ENV);
EOF

    # Inyectar script de configuración en index.html
    if [ -f "/usr/share/nginx/html/index.html" ]; then
        # Buscar la etiqueta <head> e inyectar el script
        sed -i 's|<head>|<head><script src="/config.js"></script>|' /usr/share/nginx/html/index.html
        echo "✅ Script de configuración inyectado en index.html"
    else
        echo "❌ index.html no encontrado"
    fi
    
    echo "✅ Configuración de runtime completada"
    echo "   - SUPABASE_URL: $REACT_APP_SUPABASE_URL"
    echo "   - ENVIRONMENT: ${REACT_APP_ENVIRONMENT:-production}"
else
    echo "⚠️  Variables de entorno no detectadas, usando configuración por defecto"
    
    # Crear configuración por defecto
    cat > /usr/share/nginx/html/config.js << EOF
// Configuración por defecto para Vecino Activo
window.ENV = {
    REACT_APP_SUPABASE_URL: 'https://supabase.vecinoactivo.cl',
    REACT_APP_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
    REACT_APP_ENVIRONMENT: 'production',
    REACT_APP_VERSION: '1.0.0'
};

console.log('🔧 Configuración por defecto cargada:', window.ENV);
EOF

    # Inyectar script en index.html
    if [ -f "/usr/share/nginx/html/index.html" ]; then
        sed -i 's|<head>|<head><script src="/config.js"></script>|' /usr/share/nginx/html/index.html
        echo "✅ Script de configuración por defecto inyectado"
    fi
fi

# Verificar que los archivos estáticos existen
if [ -d "/usr/share/nginx/html/static" ]; then
    echo "✅ Archivos estáticos encontrados"
    ls -la /usr/share/nginx/html/static/
else
    echo "❌ Archivos estáticos no encontrados"
fi

# Verificar configuración de nginx
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Configuración de nginx válida"
else
    echo "❌ Error en configuración de nginx"
    exit 1
fi

echo "🎯 Iniciando servidor nginx..."

# Ejecutar el comando pasado como argumentos (nginx)
exec "$@"