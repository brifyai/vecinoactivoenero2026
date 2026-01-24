#!/bin/bash

# SCRIPT DE DESPLIEGUE INMEDIATO - VECINO ACTIVO
# Solución para problema de archivos estáticos 404

set -e

echo "🚨 DESPLIEGUE INMEDIATO - VECINO ACTIVO"
echo "======================================"
echo ""
echo "Este script despliega el paquete pre-construido que"
echo "ya está probado y funcional."
echo ""

# Verificar que existe el paquete
PACKAGE_DIR="vecino-activo-deployment-20260124-171155"
if [ ! -d "$PACKAGE_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio $PACKAGE_DIR"
    echo "   Asegúrate de extraer el archivo .tar.gz primero:"
    echo "   tar -xzf vecino-activo-deployment-20260124-171155.tar.gz"
    exit 1
fi

echo "✅ Paquete encontrado: $PACKAGE_DIR"
echo ""

# Mostrar contenido del paquete
echo "📦 CONTENIDO DEL PAQUETE:"
echo "========================"
ls -la "$PACKAGE_DIR/"
echo ""

# Verificar archivos críticos
echo "🔍 VERIFICANDO ARCHIVOS CRÍTICOS:"
echo "================================="

if [ -f "$PACKAGE_DIR/index.html" ]; then
    echo "✅ index.html - OK"
else
    echo "❌ index.html - FALTANTE"
    exit 1
fi

if [ -f "$PACKAGE_DIR/static/css/main.5f76fd2b.css" ]; then
    SIZE=$(ls -lh "$PACKAGE_DIR/static/css/main.5f76fd2b.css" | awk '{print $5}')
    echo "✅ CSS - OK ($SIZE)"
else
    echo "❌ CSS - FALTANTE"
    exit 1
fi

if [ -f "$PACKAGE_DIR/static/js/main.757a47d8.js" ]; then
    SIZE=$(ls -lh "$PACKAGE_DIR/static/js/main.757a47d8.js" | awk '{print $5}')
    echo "✅ JavaScript - OK ($SIZE)"
else
    echo "❌ JavaScript - FALTANTE"
    exit 1
fi

if [ -f "$PACKAGE_DIR/deploy.sh" ]; then
    echo "✅ Script de despliegue - OK"
else
    echo "❌ Script de despliegue - FALTANTE"
    exit 1
fi

echo ""

# Verificar variables en HTML
echo "🔧 VERIFICANDO VARIABLES DE ENTORNO:"
echo "===================================="
if grep -q "window.ENV" "$PACKAGE_DIR/index.html"; then
    echo "✅ Variables inyectadas en HTML"
    if grep -q "supabase.vecinoactivo.cl" "$PACKAGE_DIR/index.html"; then
        echo "✅ URL de Supabase configurada"
    fi
    if grep -q "REACT_APP_SUPABASE_ANON_KEY" "$PACKAGE_DIR/index.html"; then
        echo "✅ Clave de Supabase configurada"
    fi
else
    echo "❌ Variables NO encontradas en HTML"
    exit 1
fi

echo ""
echo "🎯 OPCIONES DE DESPLIEGUE:"
echo "========================="
echo ""
echo "OPCIÓN 1: Despliegue Automático (Recomendado)"
echo "---------------------------------------------"
echo "cd $PACKAGE_DIR"
echo "sudo chmod +x deploy.sh"
echo "sudo ./deploy.sh"
echo ""
echo "OPCIÓN 2: Despliegue Manual"
echo "--------------------------"
echo "sudo mkdir -p /var/www/vecino-activo"
echo "sudo rm -rf /var/www/vecino-activo/*"
echo "sudo cp -r $PACKAGE_DIR/* /var/www/vecino-activo/"
echo "sudo chown -R www-data:www-data /var/www/vecino-activo"
echo "sudo chmod -R 755 /var/www/vecino-activo"
echo ""
echo "OPCIÓN 3: Test Local Primero"
echo "----------------------------"
echo "cd $PACKAGE_DIR"
echo "python3 -m http.server 8080"
echo "# Luego abrir: http://localhost:8080"
echo ""

# Preguntar al usuario qué quiere hacer
echo "¿Qué opción prefieres?"
echo "1) Despliegue automático (requiere sudo)"
echo "2) Mostrar comandos para despliegue manual"
echo "3) Test local primero"
echo "4) Salir"
echo ""
read -p "Selecciona una opción (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 EJECUTANDO DESPLIEGUE AUTOMÁTICO..."
        echo "====================================="
        cd "$PACKAGE_DIR"
        chmod +x deploy.sh
        echo "Ejecutando: sudo ./deploy.sh"
        sudo ./deploy.sh
        echo ""
        echo "🎉 ¡DESPLIEGUE COMPLETADO!"
        echo "========================"
        echo "✅ Sitio disponible en: https://vecinoactivo.cl"
        echo "✅ Verificar que no hay errores 404"
        echo "✅ Login de prueba: admin@vecinoactivo.cl / admin123"
        ;;
    2)
        echo ""
        echo "📋 COMANDOS PARA DESPLIEGUE MANUAL:"
        echo "=================================="
        echo "sudo mkdir -p /var/www/vecino-activo"
        echo "sudo rm -rf /var/www/vecino-activo/*"
        echo "sudo cp -r $PACKAGE_DIR/* /var/www/vecino-activo/"
        echo "sudo chown -R www-data:www-data /var/www/vecino-activo"
        echo "sudo chmod -R 755 /var/www/vecino-activo"
        echo "sudo cp $PACKAGE_DIR/nginx.conf /etc/nginx/sites-available/vecino-activo"
        echo "sudo ln -sf /etc/nginx/sites-available/vecino-activo /etc/nginx/sites-enabled/"
        echo "sudo nginx -t && sudo systemctl reload nginx"
        ;;
    3)
        echo ""
        echo "🧪 INICIANDO TEST LOCAL..."
        echo "========================="
        cd "$PACKAGE_DIR"
        echo "Servidor iniciado en: http://localhost:8080"
        echo "Presiona Ctrl+C para detener"
        python3 -m http.server 8080
        ;;
    4)
        echo "👋 Saliendo..."
        exit 0
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac