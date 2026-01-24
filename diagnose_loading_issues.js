// =====================================================
// DIAGNÓSTICO DE PROBLEMAS DE CARGA
// Identifica qué está causando lentitud en la aplicación
// =====================================================

console.log('🔍 INICIANDO DIAGNÓSTICO DE PROBLEMAS DE CARGA...');

// 1. Verificar tamaño de localStorage
function checkLocalStorageSize() {
  console.log('\n📊 ANÁLISIS DE LOCALSTORAGE:');
  
  let totalSize = 0;
  const sizes = {};
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage[key].length;
      sizes[key] = size;
      totalSize += size;
    }
  }
  
  console.log(`📦 Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`);
  
  // Mostrar los 10 elementos más grandes
  const sortedSizes = Object.entries(sizes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  console.log('\n🔝 Top 10 elementos más grandes:');
  sortedSizes.forEach(([key, size]) => {
    console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB`);
  });
  
  // Alertar si hay elementos muy grandes
  sortedSizes.forEach(([key, size]) => {
    if (size > 100000) { // Más de 100KB
      console.warn(`⚠️ PROBLEMA: ${key} es muy grande (${(size / 1024).toFixed(2)} KB)`);
    }
  });
}

// 2. Verificar cantidad de datos
function checkDataQuantity() {
  console.log('\n📈 ANÁLISIS DE CANTIDAD DE DATOS:');
  
  const keys = [
    'friendbook_posts',
    'friendbook_users', 
    'friendbook_notifications',
    'friendbook_messages',
    'friendbook_comments',
    'friendbook_reactions'
  ];
  
  keys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const count = Array.isArray(data) ? data.length : Object.keys(data).length;
      console.log(`  ${key}: ${count} elementos`);
      
      if (count > 1000) {
        console.warn(`⚠️ PROBLEMA: ${key} tiene demasiados elementos (${count})`);
      }
    } catch (error) {
      console.error(`❌ Error leyendo ${key}:`, error);
    }
  });
}

// 3. Verificar estructura de datos problemática
function checkDataStructure() {
  console.log('\n🏗️ ANÁLISIS DE ESTRUCTURA DE DATOS:');
  
  try {
    // Verificar posts
    const posts = JSON.parse(localStorage.getItem('friendbook_posts') || '[]');
    console.log(`📝 Posts: ${posts.length}`);
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      const postSize = JSON.stringify(firstPost).length;
      console.log(`  Tamaño promedio por post: ${(postSize / 1024).toFixed(2)} KB`);
      
      // Verificar si hay imágenes muy grandes en posts
      posts.forEach((post, index) => {
        if (post.image && post.image.length > 1000) {
          console.warn(`⚠️ Post ${index} tiene imagen muy grande: ${post.image.length} chars`);
        }
        if (post.content && post.content.length > 5000) {
          console.warn(`⚠️ Post ${index} tiene contenido muy largo: ${post.content.length} chars`);
        }
      });
    }
    
    // Verificar usuarios
    const users = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
    console.log(`👥 Usuarios: ${users.length}`);
    
    if (users.length > 0) {
      const firstUser = users[0];
      const userSize = JSON.stringify(firstUser).length;
      console.log(`  Tamaño promedio por usuario: ${(userSize / 1024).toFixed(2)} KB`);
    }
    
  } catch (error) {
    console.error('❌ Error analizando estructura:', error);
  }
}

// 4. Verificar problemas de rendimiento específicos
function checkPerformanceIssues() {
  console.log('\n⚡ ANÁLISIS DE RENDIMIENTO:');
  
  // Verificar si hay bucles infinitos en useEffect
  console.log('🔄 Verificando posibles bucles infinitos...');
  
  // Verificar polling activo
  const pollingActive = window.location.href.includes('app/');
  if (pollingActive) {
    console.warn('⚠️ POSIBLE PROBLEMA: Polling puede estar activo en rutas de app');
  }
  
  // Verificar cantidad de re-renders
  console.log('🔄 Para verificar re-renders, abre React DevTools → Profiler');
  
  // Verificar memoria del navegador
  if (performance.memory) {
    const memory = performance.memory;
    console.log(`💾 Memoria usada: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Memoria total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Límite de memoria: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    
    if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // Más de 50MB
      console.warn('⚠️ PROBLEMA: Uso de memoria muy alto');
    }
  }
}

// 5. Verificar problemas de red
function checkNetworkIssues() {
  console.log('\n🌐 ANÁLISIS DE RED:');
  
  // Verificar conexión a Supabase
  const supabaseUrl = 'https://supabase.vecinoactivo.cl';
  
  console.log('🔗 Probando conexión a Supabase...');
  
  fetch(supabaseUrl + '/rest/v1/', {
    method: 'GET',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlY2lub2FjdGl2byIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3NzM5MjAwLCJleHAiOjIwNTMzMTUyMDB9.example'
    }
  })
  .then(response => {
    console.log(`✅ Supabase responde: ${response.status}`);
    if (response.status !== 200) {
      console.warn(`⚠️ PROBLEMA: Supabase responde con status ${response.status}`);
    }
  })
  .catch(error => {
    console.error('❌ PROBLEMA: Error conectando a Supabase:', error);
  });
}

// 6. Generar reporte de soluciones
function generateSolutions() {
  console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
  
  const solutions = [
    '1. Limpiar localStorage: localStorage.clear()',
    '2. Reducir datos de demostración',
    '3. Implementar paginación en posts',
    '4. Optimizar imágenes (usar thumbnails)',
    '5. Deshabilitar polling en desarrollo',
    '6. Usar React.memo para componentes pesados',
    '7. Implementar lazy loading',
    '8. Verificar bucles infinitos en useEffect'
  ];
  
  solutions.forEach(solution => console.log(`  ${solution}`));
}

// Ejecutar diagnóstico completo
function runFullDiagnosis() {
  checkLocalStorageSize();
  checkDataQuantity();
  checkDataStructure();
  checkPerformanceIssues();
  checkNetworkIssues();
  generateSolutions();
  
  console.log('\n✅ DIAGNÓSTICO COMPLETADO');
  console.log('📋 Revisa los warnings (⚠️) para identificar problemas específicos');
}

// Auto-ejecutar si se carga el script
if (typeof window !== 'undefined') {
  runFullDiagnosis();
}

// Exportar para uso manual
window.diagnoseLoding = runFullDiagnosis;

console.log('💡 TIP: Ejecuta diagnoseLoding() en la consola para repetir el diagnóstico');