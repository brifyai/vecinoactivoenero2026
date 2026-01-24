// =====================================================
// OPTIMIZACIÓN INMEDIATA DE RENDIMIENTO
// Script para limpiar y optimizar la aplicación
// =====================================================

console.log('🚀 INICIANDO OPTIMIZACIÓN DE RENDIMIENTO...');

// 1. Limpiar localStorage completamente
function clearAllStorage() {
  console.log('🧹 Limpiando localStorage...');
  
  const beforeSize = JSON.stringify(localStorage).length;
  localStorage.clear();
  
  console.log(`✅ localStorage limpiado (liberados ${(beforeSize / 1024).toFixed(2)} KB)`);
}

// 2. Crear datos mínimos esenciales
function createMinimalData() {
  console.log('📦 Creando datos mínimos esenciales...');
  
  // Solo el usuario administrador
  const adminUser = {
    id: 999,
    username: 'administrador',
    name: 'Administrador',
    email: 'admin@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Administrador del sistema',
    verified: true,
    neighborhoodName: 'Administración Central',
    createdAt: new Date().toISOString()
  };
  
  // Solo un post de bienvenida
  const welcomePost = {
    id: Date.now(),
    author: 'Administrador',
    authorId: 999,
    time: 'hace 1 hora',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: '¡Bienvenidos a Vecino Activo! 🏘️ Plataforma optimizada para conectar vecinos.',
    hashtags: ['#VecinoActivo', '#Bienvenida'],
    likes: 5,
    comments: 1,
    shares: 0,
    reactions: ['🤝', '❤️'],
    category: 'announcement'
  };
  
  // Guardar datos mínimos
  localStorage.setItem('friendbook_users', JSON.stringify([adminUser]));
  localStorage.setItem('friendbook_posts', JSON.stringify([welcomePost]));
  localStorage.setItem('friendbook_notifications', JSON.stringify({}));
  localStorage.setItem('friendbook_messages', JSON.stringify([]));
  localStorage.setItem('friendbook_friends', JSON.stringify({}));
  
  console.log('✅ Datos mínimos creados');
}

// 3. Verificar optimización
function verifyOptimization() {
  console.log('🔍 Verificando optimización...');
  
  const totalSize = JSON.stringify(localStorage).length;
  console.log(`📊 Tamaño total de localStorage: ${(totalSize / 1024).toFixed(2)} KB`);
  
  const users = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
  const posts = JSON.parse(localStorage.getItem('friendbook_posts') || '[]');
  
  console.log(`👥 Usuarios: ${users.length}`);
  console.log(`📝 Posts: ${posts.length}`);
  
  if (totalSize < 10000) { // Menos de 10KB
    console.log('✅ Optimización exitosa - localStorage ligero');
  } else {
    console.warn('⚠️ localStorage aún pesado, revisar datos');
  }
}

// 4. Configurar modo de desarrollo optimizado
function setupOptimizedMode() {
  console.log('⚙️ Configurando modo optimizado...');
  
  // Marcar que la app está en modo optimizado
  localStorage.setItem('vecino_activo_optimized', 'true');
  localStorage.setItem('vecino_activo_last_optimization', new Date().toISOString());
  
  console.log('✅ Modo optimizado configurado');
}

// 5. Mostrar instrucciones para el usuario
function showInstructions() {
  console.log('\n📋 INSTRUCCIONES PARA EL USUARIO:');
  console.log('1. Refresca la página (F5 o Ctrl+R)');
  console.log('2. Ve a https://vecinoactivo.cl/iniciar-sesion');
  console.log('3. Login con: admin@vecinoactivo.cl / admin123');
  console.log('4. La aplicación debería cargar mucho más rápido');
  console.log('\n💡 Si sigue lento, ejecuta: optimizeApp() nuevamente');
}

// Función principal de optimización
function optimizeApp() {
  console.log('🎯 EJECUTANDO OPTIMIZACIÓN COMPLETA...\n');
  
  clearAllStorage();
  createMinimalData();
  setupOptimizedMode();
  verifyOptimization();
  showInstructions();
  
  console.log('\n✅ OPTIMIZACIÓN COMPLETADA');
  console.log('🚀 La aplicación debería cargar significativamente más rápido');
}

// Auto-ejecutar optimización
optimizeApp();

// Hacer disponible globalmente para uso manual
window.optimizeApp = optimizeApp;
window.clearAllStorage = clearAllStorage;

console.log('\n💡 COMANDOS DISPONIBLES:');
console.log('- optimizeApp() - Optimización completa');
console.log('- clearAllStorage() - Solo limpiar localStorage');