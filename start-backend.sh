#!/bin/bash

echo "🚀 Iniciando Vecino Activo Backend..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Ir a la carpeta del servidor
cd server

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar el servidor
echo "✅ Iniciando servidor en http://localhost:3001"
npm start
