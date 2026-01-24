#!/bin/bash
# Script de testing real-time generado automáticamente

echo "🚀 Iniciando tests de funcionalidad real-time..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Ejecutar tests
echo "🧪 Ejecutando tests real-time..."
node run_realtime_tests.js

echo "✅ Tests completados"
