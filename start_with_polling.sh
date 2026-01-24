#!/bin/bash

# =====================================================
# SCRIPT DE INICIO CON POLLING REAL-TIME
# Inicia la aplicación con verificación previa
# =====================================================

echo "🚀 INICIANDO VECINO ACTIVO CON POLLING REAL-TIME"
echo "================================================"

# Verificar que Node.js está disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que npm está disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible"
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado"
    echo "💡 Asegúrate de tener las credenciales de Supabase configuradas"
    exit 1
fi

echo "✅ Verificaciones iniciales completadas"

# Ejecutar test de integración rápido
echo ""
echo "🧪 Ejecutando test de integración..."
if node test_polling_integration.js; then
    echo ""
    echo "✅ Test de integración exitoso"
else
    echo ""
    echo "⚠️ Test de integración falló, pero continuando..."
fi

echo ""
echo "🎯 CARACTERÍSTICAS IMPLEMENTADAS:"
echo "  ✅ Posts real-time (polling cada 3s)"
echo "  ✅ Notificaciones real-time (polling cada 2s)"
echo "  ✅ Notificaciones del navegador"
echo "  ✅ Indicador de estado en header"
echo "  ✅ Panel de pruebas integrado"
echo ""

echo "📋 CÓMO PROBAR:"
echo "  1. Observa el indicador real-time en el header"
echo "  2. Haz click en 'Test' para abrir panel de pruebas"
echo "  3. Crea posts/notificaciones de prueba"
echo "  4. Verifica que aparecen automáticamente"
echo "  5. Revisa la consola del navegador para logs"
echo ""

echo "🚀 Iniciando aplicación..."
echo "================================================"

# Iniciar la aplicación
npm start