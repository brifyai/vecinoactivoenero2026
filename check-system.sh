#!/bin/bash

# Script rápido para verificar el estado completo del sistema

echo ""
echo "🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA"
echo "=================================="
echo ""

# Verificar configuración
echo "📋 Verificando configuración del código..."
node scripts/testing/test-full-system-status.js

echo ""
echo "=================================="
echo ""

# Verificar conexiones
echo "🔌 Verificando conexiones en vivo..."
node scripts/testing/test-live-connections.js

echo ""
echo "✅ Verificación completa"
echo ""
