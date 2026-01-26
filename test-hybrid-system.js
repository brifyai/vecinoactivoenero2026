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
