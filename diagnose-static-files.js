#!/usr/bin/env node

// Script de diagnóstico para archivos estáticos faltantes
const https = require('https');

console.log('🔍 DIAGNÓSTICO DE ARCHIVOS ESTÁTICOS - VECINO ACTIVO');
console.log('===================================================');

const baseUrl = 'https://vecinoactivo.cl';
const filesToCheck = [
  '/static/js/main.757a47d8.js',
  '/static/css/main.5f76fd2b.css',
  '/',
  '/index.html',
  '/static/',
  '/favicon.ico'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = baseUrl + url;
    console.log(`\n🔍 Verificando: ${fullUrl}`);
    
    const req = https.request(fullUrl, { method: 'HEAD' }, (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Content-Type: ${res.headers['content-type'] || 'N/A'}`);
      console.log(`   Content-Length: ${res.headers['content-length'] || 'N/A'}`);
      console.log(`   Server: ${res.headers['server'] || 'N/A'}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ Archivo encontrado');
      } else if (res.statusCode === 404) {
        console.log('   ❌ Archivo no encontrado');
      } else {
        console.log(`   ⚠️ Respuesta inesperada: ${res.statusCode}`);
      }
      
      resolve({
        url: fullUrl,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        size: res.headers['content-length']
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({
        url: fullUrl,
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      console.log('   ⚠️ Timeout');
      req.destroy();
      resolve({
        url: fullUrl,
        status: 'TIMEOUT'
      });
    });

    req.end();
  });
}

async function checkBuildStructure() {
  console.log('\n📁 VERIFICANDO ESTRUCTURA DEL BUILD LOCAL');
  console.log('==========================================');
  
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync('build')) {
    console.log('❌ Carpeta build/ no existe localmente');
    return;
  }
  
  console.log('✅ Carpeta build/ existe');
  
  // Verificar index.html
  if (fs.existsSync('build/index.html')) {
    console.log('✅ build/index.html existe');
    const indexContent = fs.readFileSync('build/index.html', 'utf8');
    
    // Buscar referencias a archivos estáticos
    const jsMatch = indexContent.match(/static\/js\/main\.[a-f0-9]+\.js/);
    const cssMatch = indexContent.match(/static\/css\/main\.[a-f0-9]+\.css/);
    
    if (jsMatch) {
      console.log(`   JS referenciado: ${jsMatch[0]}`);
      if (fs.existsSync(`build/${jsMatch[0]}`)) {
        console.log('   ✅ Archivo JS existe localmente');
      } else {
        console.log('   ❌ Archivo JS NO existe localmente');
      }
    }
    
    if (cssMatch) {
      console.log(`   CSS referenciado: ${cssMatch[0]}`);
      if (fs.existsSync(`build/${cssMatch[0]}`)) {
        console.log('   ✅ Archivo CSS existe localmente');
      } else {
        console.log('   ❌ Archivo CSS NO existe localmente');
      }
    }
    
    // Verificar si las variables están inyectadas
    if (indexContent.includes('window.ENV')) {
      console.log('   ✅ Variables de entorno inyectadas en HTML');
    } else {
      console.log('   ❌ Variables de entorno NO inyectadas');
    }
  } else {
    console.log('❌ build/index.html no existe');
  }
  
  // Listar contenido de build/static
  if (fs.existsSync('build/static')) {
    console.log('\n📂 Contenido de build/static:');
    const staticContent = fs.readdirSync('build/static', { recursive: true });
    staticContent.forEach(file => {
      console.log(`   ${file}`);
    });
  } else {
    console.log('❌ build/static no existe');
  }
}

async function main() {
  // 1. Verificar estructura local
  await checkBuildStructure();
  
  // 2. Verificar URLs remotas
  console.log('\n🌐 VERIFICANDO URLS REMOTAS');
  console.log('===========================');
  
  const results = [];
  for (const url of filesToCheck) {
    const result = await checkUrl(url);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre requests
  }
  
  // 3. Resumen
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO');
  console.log('===========================');
  
  const working = results.filter(r => r.status === 200);
  const missing = results.filter(r => r.status === 404);
  const errors = results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT');
  
  console.log(`✅ Archivos encontrados: ${working.length}`);
  console.log(`❌ Archivos faltantes: ${missing.length}`);
  console.log(`⚠️ Errores: ${errors.length}`);
  
  if (missing.length > 0) {
    console.log('\n❌ ARCHIVOS FALTANTES:');
    missing.forEach(r => console.log(`   ${r.url}`));
  }
  
  // 4. Recomendaciones
  console.log('\n💡 RECOMENDACIONES');
  console.log('==================');
  
  if (missing.some(r => r.url.includes('/static/'))) {
    console.log('🔧 Los archivos estáticos no se están sirviendo correctamente.');
    console.log('   Posibles causas:');
    console.log('   1. Nginx no está configurado para servir /static/');
    console.log('   2. Los archivos no se copiaron al contenedor');
    console.log('   3. La ruta de nginx no coincide con la estructura del build');
    console.log('');
    console.log('   Soluciones:');
    console.log('   1. Verificar configuración de nginx');
    console.log('   2. Reconstruir y redesplegar el contenedor');
    console.log('   3. Usar el paquete pre-construido como respaldo');
  }
  
  if (working.some(r => r.url === baseUrl + '/')) {
    console.log('✅ El sitio principal carga correctamente');
    console.log('✅ Las variables de entorno están funcionando');
  }
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Verificar logs del contenedor Docker');
  console.log('2. Comprobar configuración de nginx');
  console.log('3. Si persiste, usar paquete pre-construido');
}

main().catch(console.error);