#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 * Uso: node check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración de Supabase...\n');

// Verificar si existe .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: No se encontró el archivo .env');
  console.log('\n📝 Solución:');
  console.log('   1. Copia .env.example a .env');
  console.log('   2. Edita .env con tus credenciales de Supabase');
  console.log('   3. Reinicia el servidor\n');
  console.log('📖 Ver: CONFIGURAR_SUPABASE_CREDENCIALES.md\n');
  process.exit(1);
}

// Leer .env
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let hasUrl = false;
let hasKey = false;
let urlValue = '';
let keyValue = '';

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('REACT_APP_SUPABASE_URL=')) {
    hasUrl = true;
    urlValue = trimmed.split('=')[1] || '';
  }
  if (trimmed.startsWith('REACT_APP_SUPABASE_ANON_KEY=')) {
    hasKey = true;
    keyValue = trimmed.split('=')[1] || '';
  }
});

// Verificar URL
if (!hasUrl) {
  console.error('❌ Falta REACT_APP_SUPABASE_URL en .env');
} else if (urlValue.includes('tu-proyecto') || urlValue.includes('your_supabase')) {
  console.error('❌ REACT_APP_SUPABASE_URL no está configurada correctamente');
  console.log(`   Valor actual: ${urlValue}`);
  console.log('   Debe ser algo como: https://xyzcompany.supabase.co');
} else if (!urlValue.startsWith('https://')) {
  console.error('❌ REACT_APP_SUPABASE_URL debe empezar con https://');
  console.log(`   Valor actual: ${urlValue}`);
} else {
  console.log('✅ REACT_APP_SUPABASE_URL configurada');
  console.log(`   ${urlValue}`);
}

console.log('');

// Verificar Key
if (!hasKey) {
  console.error('❌ Falta REACT_APP_SUPABASE_ANON_KEY en .env');
} else if (keyValue.includes('tu_anon_key') || keyValue.includes('your_supabase')) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY no está configurada correctamente');
  console.log('   Debe ser un JWT que empieza con: eyJ...');
} else if (!keyValue.startsWith('eyJ')) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY no parece válida');
  console.log('   Debe empezar con: eyJ...');
} else if (keyValue.length < 100) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY parece incompleta');
  console.log(`   Longitud actual: ${keyValue.length} caracteres`);
  console.log('   Debe tener ~200+ caracteres');
} else {
  console.log('✅ REACT_APP_SUPABASE_ANON_KEY configurada');
  console.log(`   ${keyValue.substring(0, 50)}...`);
}

console.log('');

// Resultado final
if (hasUrl && hasKey && 
    !urlValue.includes('tu-proyecto') && 
    !keyValue.includes('tu_anon_key') &&
    urlValue.startsWith('https://') &&
    keyValue.startsWith('eyJ') &&
    keyValue.length > 100) {
  console.log('✅ ¡Configuración correcta!\n');
  console.log('🚀 Ahora puedes ejecutar:');
  console.log('   npm start\n');
  process.exit(0);
} else {
  console.log('❌ Configuración incompleta\n');
  console.log('📖 Sigue la guía: CONFIGURAR_SUPABASE_CREDENCIALES.md\n');
  console.log('🔑 Para obtener tus credenciales:');
  console.log('   1. Ve a https://app.supabase.com');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Settings → API');
  console.log('   4. Copia Project URL y anon public key\n');
  process.exit(1);
}
