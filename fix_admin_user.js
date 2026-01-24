// Script para verificar y crear el usuario administrador
// Ejecutar en la consola del navegador

console.log('🔍 Verificando usuarios existentes...');

// Obtener usuarios del localStorage
const users = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
console.log('Usuarios encontrados:', users.length);

// Buscar usuario administrador
const adminUser = users.find(u => 
  u.username === 'administrador' || 
  u.email === 'admin@vecinoactivo.cl' ||
  u.name.toLowerCase().includes('administrador')
);

if (adminUser) {
  console.log('✅ Usuario administrador encontrado:', adminUser);
} else {
  console.log('❌ Usuario administrador no encontrado. Creando...');
  
  // Crear usuario administrador
  const newAdminUser = {
    id: 999,
    username: 'administrador',
    name: 'Administrador',
    email: 'admin@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=1',
    cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    bio: 'Administrador del sistema Vecino Activo',
    location: 'Santiago, Chile',
    verified: true,
    isVerifiedNeighbor: true,
    neighborhoodName: 'Administración Central',
    neighborhoodCode: 'ADM-001',
    following: 0,
    followers: 0,
    posts: 0,
    friends: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  // Agregar a la lista de usuarios
  users.push(newAdminUser);
  localStorage.setItem('friendbook_users', JSON.stringify(users));
  
  console.log('✅ Usuario administrador creado exitosamente:', newAdminUser);
}

// Verificar todos los usuarios disponibles
console.log('\n📋 Lista completa de usuarios:');
users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (@${user.username}) - ${user.email}`);
});

console.log('\n🔗 URLs de perfil disponibles:');
users.forEach(user => {
  console.log(`- vecinoactivo.cl/${user.username}`);
});