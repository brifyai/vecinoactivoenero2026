#!/usr/bin/env node

/**
 * Diagnóstico de Problemas de Producción - Vecino Activo
 * Identifica diferencias entre entorno local y producción
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE PRODUCCIÓN - VECINO ACTIVO');
console.log('='.repeat(50));

// 1. Verificar variables de entorno
console.log('\n📋 1. VARIABLES DE ENTORNO');
console.log('-'.repeat(30));

const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    lines.forEach(line => {
      const [key] = line.split('=');
      console.log(`   - ${key}`);
    });
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

// 2. Verificar configuración de build
console.log('\n🏗️  2. CONFIGURACIÓN DE BUILD');
console.log('-'.repeat(30));

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`✅ Nombre: ${packageJson.name}`);
console.log(`✅ Versión: ${packageJson.version}`);
console.log(`✅ Script build: ${packageJson.scripts.build}`);

// Verificar si existe build folder
if (fs.existsSync('build')) {
  console.log('✅ Carpeta build existe');
  const buildFiles = fs.readdirSync('build');
  console.log(`   - Archivos: ${buildFiles.length}`);
  
  // Verificar index.html
  if (fs.existsSync('build/index.html')) {
    console.log('✅ build/index.html existe');
    const indexContent = fs.readFileSync('build/index.html', 'utf8');
    
    // Verificar si contiene las referencias correctas
    if (indexContent.includes('static/js/')) {
      console.log('✅ Referencias a JS encontradas');
    } else {
      console.log('❌ No se encontraron referencias a JS');
    }
    
    if (indexContent.includes('static/css/')) {
      console.log('✅ Referencias a CSS encontradas');
    } else {
      console.log('❌ No se encontraron referencias a CSS');
    }
  } else {
    console.log('❌ build/index.html no existe');
  }
} else {
  console.log('❌ Carpeta build no existe');
}

// 3. Verificar configuración de Supabase
console.log('\n🗄️  3. CONFIGURACIÓN SUPABASE');
console.log('-'.repeat(30));

try {
  const supabaseConfig = fs.readFileSync('src/config/supabase.js', 'utf8');
  
  if (supabaseConfig.includes('process.env.REACT_APP_SUPABASE_URL')) {
    console.log('✅ URL de Supabase usa variable de entorno');
  } else {
    console.log('❌ URL de Supabase hardcodeada');
  }
  
  if (supabaseConfig.includes('process.env.REACT_APP_SUPABASE_ANON_KEY')) {
    console.log('✅ Anon Key usa variable de entorno');
  } else {
    console.log('❌ Anon Key hardcodeada');
  }
  
  // Verificar URL por defecto
  if (supabaseConfig.includes('https://supabase.vecinoactivo.cl')) {
    console.log('✅ URL por defecto configurada');
  } else {
    console.log('⚠️  URL por defecto no encontrada');
  }
  
} catch (error) {
  console.log('❌ Error leyendo configuración de Supabase:', error.message);
}

// 4. Verificar archivos críticos
console.log('\n📁 4. ARCHIVOS CRÍTICOS');
console.log('-'.repeat(30));

const criticalFiles = [
  'public/index.html',
  'src/index.js',
  'src/App.js',
  'src/components/AppInitializer/AppInitializer.js',
  'src/components/ReduxInitializer/ReduxInitializer.js',
  'src/store/index.js'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} FALTANTE`);
  }
});

// 5. Verificar public/index.html
console.log('\n🌐 5. ANÁLISIS DE public/index.html');
console.log('-'.repeat(30));

try {
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  
  if (indexHtml.includes('<div id="root">')) {
    console.log('✅ Div root encontrado');
  } else {
    console.log('❌ Div root NO encontrado');
  }
  
  if (indexHtml.includes('manifest.json')) {
    console.log('✅ Manifest referenciado');
  } else {
    console.log('⚠️  Manifest no referenciado');
  }
  
  // Verificar meta tags
  if (indexHtml.includes('viewport')) {
    console.log('✅ Meta viewport configurado');
  } else {
    console.log('❌ Meta viewport faltante');
  }
  
} catch (error) {
  console.log('❌ Error leyendo public/index.html:', error.message);
}

// 6. Verificar dependencias críticas
console.log('\n📦 6. DEPENDENCIAS CRÍTICAS');
console.log('-'.repeat(30));

const criticalDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  '@reduxjs/toolkit',
  'react-redux',
  '@supabase/supabase-js'
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} FALTANTE`);
  }
});

// 7. Generar recomendaciones
console.log('\n💡 7. RECOMENDACIONES PARA PRODUCCIÓN');
console.log('-'.repeat(30));

console.log('Para diagnosticar el problema en vecinoactivo.cl:');
console.log('');
console.log('1. 🔍 VERIFICAR CONSOLA DEL NAVEGADOR:');
console.log('   - Abrir DevTools (F12)');
console.log('   - Revisar errores en Console');
console.log('   - Revisar errores en Network');
console.log('');
console.log('2. 🌐 VERIFICAR VARIABLES DE ENTORNO EN PRODUCCIÓN:');
console.log('   - REACT_APP_SUPABASE_URL debe estar definida');
console.log('   - REACT_APP_SUPABASE_ANON_KEY debe estar definida');
console.log('');
console.log('3. 🏗️  VERIFICAR BUILD DE PRODUCCIÓN:');
console.log('   - Ejecutar: npm run build');
console.log('   - Verificar que no hay errores');
console.log('   - Verificar que build/index.html existe');
console.log('');
console.log('4. 🐳 VERIFICAR DOCKER (si aplica):');
console.log('   - Variables de entorno pasadas al contenedor');
console.log('   - Nginx sirviendo archivos correctamente');
console.log('   - Logs del contenedor');
console.log('');
console.log('5. 🔒 VERIFICAR CORS EN SUPABASE:');
console.log('   - Agregar vecinoactivo.cl a allowed origins');
console.log('   - Verificar configuración de autenticación');

// 8. Generar script de test de producción
console.log('\n🧪 8. GENERANDO SCRIPT DE TEST');
console.log('-'.repeat(30));

const testScript = `
// Test de producción - Ejecutar en consola del navegador
console.log('🔍 TEST DE PRODUCCIÓN - VECINO ACTIVO');

// 1. Verificar que React está cargado
if (typeof React !== 'undefined') {
  console.log('✅ React cargado');
} else {
  console.log('❌ React NO cargado');
}

// 2. Verificar que el div root existe
const root = document.getElementById('root');
if (root) {
  console.log('✅ Div root encontrado');
  console.log('Contenido del root:', root.innerHTML.length > 0 ? 'Tiene contenido' : 'VACÍO');
} else {
  console.log('❌ Div root NO encontrado');
}

// 3. Verificar variables de entorno
console.log('Variables de entorno:');
console.log('SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL || 'NO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NO DEFINIDA');

// 4. Verificar errores en consola
console.log('Revisar errores arriba en la consola');

// 5. Test de conexión a Supabase
if (window.supabase) {
  console.log('✅ Supabase client disponible');
} else {
  console.log('❌ Supabase client NO disponible');
}
`;

fs.writeFileSync('production_test.js', testScript);
console.log('✅ Script de test creado: production_test.js');

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. Ejecutar: npm run build');
console.log('2. Verificar logs del servidor de producción');
console.log('3. Abrir vecinoactivo.cl y revisar DevTools');
console.log('4. Ejecutar production_test.js en la consola del navegador');
console.log('5. Verificar variables de entorno en el servidor');

console.log('\n✅ Diagnóstico completado');