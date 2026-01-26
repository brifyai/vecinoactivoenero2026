#!/usr/bin/env node

// Script para inyectar variables de entorno en el build de producción
const fs = require('fs');
const path = require('path');

console.log('🔧 INYECTANDO VARIABLES DE ENTORNO EN BUILD DE PRODUCCIÓN');
console.log('========================================================');

// Variables de entorno para producción
const envVars = {
  REACT_APP_SUPABASE_URL: 'https://supabase.vecinoactivo.cl',
  REACT_APP_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
  REACT_APP_GOOGLE_CLIENT_ID: '777409222994-f26h0j6v3vui8c3ha4ke5ada9699uvl2.apps.googleusercontent.com',
  REACT_APP_GEMINI_API_KEY: 'AIzaSyBK8AJWK61OAYjzLSyRz74LxFJRBlt1OFo',
  REACT_APP_ENVIRONMENT: 'production'
};

// Ruta del archivo index.html
const indexPath = path.join(__dirname, 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: build/index.html no encontrado');
  console.error('   Ejecuta "npm run build" primero');
  process.exit(1);
}

try {
  // Leer el archivo index.html
  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // Crear el script de variables de entorno
  const envScript = `
    <script>
      // Variables de entorno inyectadas en tiempo de build
      window.ENV = ${JSON.stringify(envVars, null, 2)};
      console.log('✅ Variables de entorno cargadas desde window.ENV');
    </script>
  `;
  
  // Inyectar el script antes del cierre de </head>
  htmlContent = htmlContent.replace('</head>', `${envScript}</head>`);
  
  // Escribir el archivo modificado
  fs.writeFileSync(indexPath, htmlContent, 'utf8');
  
  console.log('✅ Variables de entorno inyectadas exitosamente');
  console.log('📋 Variables inyectadas:');
  Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    const displayValue = key.includes('KEY') ? `${value.substring(0, 20)}...` : value;
    console.log(`   - ${key}: ${displayValue}`);
  });
  
  console.log('');
  console.log('🚀 El build está listo para despliegue con variables de entorno');
  console.log('   Puedes subir la carpeta build/ a tu servidor de producción');
  
} catch (error) {
  console.error('❌ Error al inyectar variables:', error.message);
  process.exit(1);
}