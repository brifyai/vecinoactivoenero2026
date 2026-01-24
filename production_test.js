
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
