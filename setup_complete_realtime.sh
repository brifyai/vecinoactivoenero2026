#!/bin/bash

# =====================================================
# CONFIGURACIÓN COMPLETA PARA TESTING REAL-TIME
# =====================================================

echo "🚀 CONFIGURACIÓN COMPLETA DE TESTING REAL-TIME"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que existe el archivo .env
log_info "Verificando archivo .env..."
if [ ! -f ".env" ]; then
    log_error "Archivo .env no encontrado"
    exit 1
fi

# Extraer variables de Supabase del .env
SUPABASE_URL=$(grep "REACT_APP_SUPABASE_URL" .env | cut -d '=' -f2)
SUPABASE_KEY=$(grep "REACT_APP_SUPABASE_ANON_KEY" .env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    log_error "Variables de Supabase no encontradas en .env"
    exit 1
fi

log_success "Variables de entorno encontradas"

# 2. Verificar conexión a base de datos
log_info "Verificando conexión a base de datos..."

# Crear archivo temporal de conexión
cat > temp_db_test.sql << EOF
SELECT 'Conexión exitosa' as status, NOW() as timestamp;
EOF

# Intentar conectar (esto requiere que tengas configurado psql con las credenciales)
# Si no tienes psql configurado, este paso se saltará
if command -v psql &> /dev/null; then
    log_info "Intentando conectar con psql..."
    # Aquí necesitarías las credenciales de conexión directa a PostgreSQL
    # Por ahora solo verificamos que psql existe
    log_warning "psql encontrado, pero necesitas configurar las credenciales de conexión directa"
else
    log_warning "psql no encontrado, saltando verificación de conexión directa"
fi

# 3. Crear tabla conversations
log_info "Creando tabla conversations..."
if [ -f "add_conversations_table.sql" ]; then
    log_success "Script de conversations encontrado"
    # Aquí ejecutarías el script si tienes conexión directa
    # psql -f add_conversations_table.sql
    log_warning "Ejecuta manualmente: psql -f add_conversations_table.sql"
else
    log_error "Script add_conversations_table.sql no encontrado"
fi

# 4. Crear usuarios de prueba
log_info "Preparando usuarios de prueba..."
if [ -f "create_test_users.sql" ]; then
    log_success "Script de usuarios de prueba encontrado"
    log_warning "Ejecuta manualmente: psql -f create_test_users.sql"
else
    log_error "Script create_test_users.sql no encontrado"
fi

# 5. Verificar dependencias de Node.js
log_info "Verificando dependencias de Node.js..."
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias..."
    npm install
    if [ $? -eq 0 ]; then
        log_success "Dependencias instaladas"
    else
        log_error "Error instalando dependencias"
        exit 1
    fi
else
    log_success "Dependencias ya instaladas"
fi

# 6. Ejecutar configuración de testing
log_info "Ejecutando configuración de testing..."
node setup_realtime_tests.js

# 7. Mostrar instrucciones finales
echo ""
echo "📋 INSTRUCCIONES FINALES:"
echo "========================"
echo ""
echo "1. Si tienes acceso directo a PostgreSQL, ejecuta:"
echo "   psql -f add_conversations_table.sql"
echo "   psql -f create_test_users.sql"
echo ""
echo "2. O desde Supabase Dashboard, ejecuta estos scripts en el SQL Editor"
echo ""
echo "3. Una vez completado, ejecuta los tests:"
echo "   npm run test:realtime"
echo ""
echo "4. Para tests individuales:"
echo "   npm run test:realtime:posts"
echo "   npm run test:realtime:notifications"
echo "   npm run test:realtime:messages"
echo ""

# Limpiar archivos temporales
rm -f temp_db_test.sql

log_success "Configuración completada"