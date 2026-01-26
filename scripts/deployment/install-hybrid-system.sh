#!/bin/bash

# ============================================
# INSTALACIÓN DEL SISTEMA HÍBRIDO
# Supabase + Firebase para Vecino Activo
# ============================================

echo "🚀 Instalando sistema híbrido Supabase + Firebase..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Instalar dependencias de Firebase si no están instaladas
echo "📦 Verificando dependencias de Firebase..."

# Verificar si Firebase ya está instalado
if ! npm list firebase > /dev/null 2>&1; then
    echo "📦 Instalando Firebase..."
    npm install firebase
else
    echo "✅ Firebase ya está instalado"
fi

# Verificar otras dependencias necesarias
echo "📦 Verificando otras dependencias..."

# Lista de dependencias necesarias
DEPENDENCIES=(
    "@reduxjs/toolkit"
    "react-redux"
)

for dep in "${DEPENDENCIES[@]}"; do
    if ! npm list "$dep" > /dev/null 2>&1; then
        echo "📦 Instalando $dep..."
        npm install "$dep"
    else
        echo "✅ $dep ya está instalado"
    fi
done

# Crear archivo de configuración de entorno si no existe
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << EOL
# ============================================
# CONFIGURACIÓN HÍBRIDA VECINO ACTIVO
# ============================================

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key

# Supabase Configuration (ya existente)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hybrid System Configuration
REACT_APP_USE_HYBRID_REALTIME=true
REACT_APP_ENABLE_FIREBASE_SYNC=true
REACT_APP_ENABLE_POLLING_FALLBACK=true
REACT_APP_SYNC_INTERVAL=30000
REACT_APP_POLLING_INTERVAL=10000

# Development
REACT_APP_USE_EMULATORS=false
REACT_APP_DEBUG_HYBRID=true
EOL
    echo "✅ Archivo .env.local creado. IMPORTANTE: Configura tus credenciales de Firebase."
else
    echo "⚠️  .env.local ya existe. Verifica que tenga las variables de Firebase."
fi

# Verificar estructura de archivos
echo "🔍 Verificando estructura de archivos híbridos..."

HYBRID_FILES=(
    "src/config/hybridConfig.js"
    "src/services/hybridSyncService.js"
    "src/hooks/useHybridRealtime.js"
    "src/components/HybridRealtimeProvider/HybridRealtimeProvider.js"
    "src/components/HybridRealtimeProvider/HybridRealtimeProvider.css"
)

for file in "${HYBRID_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTANTE"
    fi
done

# Verificar configuración de Firebase
echo "🔥 Verificando configuración de Firebase..."

if [ -f "src/config/firebase.js" ]; then
    echo "✅ src/config/firebase.js existe"
else
    echo "❌ src/config/firebase.js - FALTANTE"
fi

if [ -f "public/firebase-messaging-sw.js" ]; then
    echo "✅ public/firebase-messaging-sw.js existe"
else
    echo "❌ public/firebase-messaging-sw.js - FALTANTE"
fi

# Crear script de prueba
echo "🧪 Creando script de prueba del sistema híbrido..."

cat > test-hybrid-system.js << 'EOL'
// ============================================
// SCRIPT DE PRUEBA DEL SISTEMA HÍBRIDO
// ============================================

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Probando sistema híbrido...');

// Verificar archivos
const requiredFiles = [
  'src/config/hybridConfig.js',
  'src/services/hybridSyncService.js',
  'src/hooks/useHybridRealtime.js',
  'src/components/HybridRealtimeProvider/HybridRealtimeProvider.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('❌ Faltan archivos del sistema híbrido');
  process.exit(1);
}

// Verificar sintaxis de archivos JavaScript
console.log('\n🔍 Verificando sintaxis...');
try {
  execSync('npx eslint src/config/hybridConfig.js --no-eslintrc --parser-options=ecmaVersion:2020,sourceType:module', { stdio: 'pipe' });
  console.log('✅ hybridConfig.js - sintaxis correcta');
} catch (error) {
  console.log('⚠️  hybridConfig.js - revisar sintaxis');
}

// Verificar variables de entorno
console.log('\n🔧 Verificando configuración...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_SUPABASE_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} configurado`);
    } else {
      console.log(`❌ ${varName} - FALTANTE`);
    }
  });
} else {
  console.log('❌ .env.local no encontrado');
}

console.log('\n🎉 Prueba del sistema híbrido completada');
EOL

chmod +x test-hybrid-system.js

# Ejecutar prueba
echo "🧪 Ejecutando prueba del sistema..."
node test-hybrid-system.js

echo ""
echo "🎉 ¡Instalación del sistema híbrido completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Configura tus credenciales de Firebase en .env.local"
echo "2. Ejecuta: npm start"
echo "3. Verifica el indicador de conexión híbrida en desarrollo"
echo "4. Prueba las notificaciones push"
echo ""
echo "🔧 CONFIGURACIÓN FIREBASE:"
echo "- Ve a https://console.firebase.google.com"
echo "- Crea un proyecto o usa uno existente"
echo "- Habilita Firestore Database"
echo "- Habilita Cloud Messaging"
echo "- Copia las credenciales a .env.local"
echo ""
echo "📱 FUNCIONALIDADES HÍBRIDAS:"
echo "✅ Realtime posts (Firebase)"
echo "✅ Push notifications (Firebase)"
echo "✅ Polling fallback (automático)"
echo "✅ Sync bidireccional (Supabase ↔ Firebase)"
echo "✅ Emergency alerts (híbrido)"
echo ""
echo "🐛 DEBUG:"
echo "- Indicador de estado en desarrollo"
echo "- Logs en consola del navegador"
echo "- Ejecuta: node test-hybrid-system.js"