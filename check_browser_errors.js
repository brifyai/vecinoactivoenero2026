// =====================================================
// CHECK BROWSER ERRORS
// Script para verificar errores comunes en el navegador
// =====================================================

console.log('🔍 INICIANDO VERIFICACIÓN DE ERRORES...\n');

// 1. Verificar si React está cargado
if (typeof React !== 'undefined') {
  console.log('✅ React está cargado');
} else {
  console.log('❌ React NO está cargado');
}

// 2. Verificar si Redux está cargado
if (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') {
  console.log('✅ Redux DevTools disponible');
} else {
  console.log('⚠️ Redux DevTools no disponible (normal en producción)');
}

// 3. Verificar localStorage
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage funciona');
} catch (e) {
  console.log('❌ localStorage error:', e.message);
}

// 4. Verificar si hay errores en consola
const originalError = console.error;
const originalWarn = console.warn;
let errorCount = 0;
let warnCount = 0;

console.error = function(...args) {
  errorCount++;
  console.log(`🔴 ERROR #${errorCount}:`, ...args);
  originalError.apply(console, args);
};

console.warn = function(...args) {
  warnCount++;
  console.log(`🟡 WARNING #${warnCount}:`, ...args);
  originalWarn.apply(console, args);
};

// 5. Verificar elementos del DOM
setTimeout(() => {
  console.log('\n📋 VERIFICACIÓN DEL DOM:');
  
  const loginButton = document.querySelector('button[type="submit"]');
  if (loginButton) {
    console.log('✅ Botón de login encontrado:', loginButton.textContent);
    
    // Verificar event listeners
    const events = getEventListeners ? getEventListeners(loginButton) : 'No disponible';
    console.log('🎯 Event listeners:', events);
    
    // Test click manual
    console.log('🖱️ Probando click manual...');
    try {
      loginButton.click();
      console.log('✅ Click manual ejecutado');
    } catch (e) {
      console.log('❌ Error en click manual:', e.message);
    }
  } else {
    console.log('❌ Botón de login NO encontrado');
  }
  
  const emailInput = document.querySelector('input[type="email"]');
  if (emailInput) {
    console.log('✅ Input de email encontrado');
  } else {
    console.log('❌ Input de email NO encontrado');
  }
  
  const passwordInput = document.querySelector('input[type="password"]');
  if (passwordInput) {
    console.log('✅ Input de password encontrado');
  } else {
    console.log('❌ Input de password NO encontrado');
  }
  
  console.log(`\n📊 RESUMEN: ${errorCount} errores, ${warnCount} warnings`);
}, 2000);

// 6. Verificar variables de entorno
setTimeout(() => {
  console.log('\n🌍 VARIABLES DE ENTORNO:');
  
  if (typeof process !== 'undefined' && process.env) {
    console.log('✅ process.env disponible');
    console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Definida' : '❌ No definida');
    console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ No definida');
  } else {
    console.log('⚠️ process.env no disponible (normal en producción)');
  }
}, 3000);

// 7. Test de funciones críticas
setTimeout(() => {
  console.log('\n🧪 TEST DE FUNCIONES CRÍTICAS:');
  
  // Test fetch
  fetch('/')
    .then(response => console.log('✅ Fetch funciona - Status:', response.status))
    .catch(error => console.log('❌ Fetch error:', error.message));
  
  // Test async/await
  (async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('✅ Async/await funciona');
    } catch (e) {
      console.log('❌ Async/await error:', e.message);
    }
  })();
  
}, 4000);

console.log('🏁 Verificación iniciada. Revisa los resultados en los próximos segundos...');