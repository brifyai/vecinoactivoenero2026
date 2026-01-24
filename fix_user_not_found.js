// SOLUCIÓN RÁPIDA: Usuario "administrador" no encontrado
// Copiar y pegar este código completo en la consola del navegador (F12 > Console)

console.log('🔧 Solucionando problema de usuario no encontrado...');

// Verificar si el usuario administrador existe
const existingUsers = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
const adminExists = existingUsers.find(u => u.username === 'administrador' || u.id === 999);

if (adminExists) {
  console.log('✅ Usuario administrador ya existe:', adminExists);
} else {
  console.log('❌ Usuario administrador no encontrado. Creando...');
  
  // Crear usuario administrador
  const adminUser = {
    id: 999,
    username: 'administrador',
    name: 'Administrador',
    email: 'admin@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=1',
    cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    bio: 'Administrador del sistema Vecino Activo. Aquí para ayudar a la comunidad.',
    location: 'Santiago, Chile',
    verified: true,
    isVerifiedNeighbor: true,
    neighborhoodName: 'Administración Central',
    neighborhoodCode: 'ADM-001',
    following: 5,
    followers: 150,
    posts: 12,
    friends: 25,
    address: 'Oficina Central Vecino Activo',
    addressNumber: 'S/N',
    addressStreet: 'Oficina Central',
    city: 'Santiago',
    region: 'Region Metropolitana',
    latitude: -33.4489,
    longitude: -70.6693,
    neighborhood: 'Administración Central',
    likes: 0,
    password: 'admin123',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  };
  
  // Agregar a la lista de usuarios
  existingUsers.push(adminUser);
  localStorage.setItem('friendbook_users', JSON.stringify(existingUsers));
  
  console.log('✅ Usuario administrador creado exitosamente');
}

// Crear algunos usuarios adicionales si no existen
const additionalUsers = [
  {
    id: 1001,
    username: 'maria-gonzalez',
    name: 'María González',
    email: 'maria@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=5',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    bio: 'Vecina activa de Las Condes. Me encanta organizar eventos comunitarios.',
    location: 'Las Condes, Santiago',
    verified: false,
    isVerifiedNeighbor: true,
    neighborhoodName: 'Las Condes Centro',
    neighborhoodCode: 'LC-001',
    following: 12,
    followers: 45,
    posts: 8,
    friends: 15,
    password: '123456',
    createdAt: '2024-01-15T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 1002,
    username: 'carlos-rodriguez',
    name: 'Carlos Rodríguez',
    email: 'carlos@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=8',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
    bio: 'Ingeniero y padre de familia. Siempre dispuesto a ayudar a mis vecinos.',
    location: 'Providencia, Santiago',
    verified: false,
    isVerifiedNeighbor: true,
    neighborhoodName: 'Providencia Norte',
    neighborhoodCode: 'PR-002',
    following: 8,
    followers: 32,
    posts: 15,
    friends: 20,
    password: '123456',
    createdAt: '2024-02-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  }
];

// Agregar usuarios adicionales si no existen
additionalUsers.forEach(user => {
  const exists = existingUsers.find(u => u.id === user.id || u.username === user.username);
  if (!exists) {
    existingUsers.push(user);
    console.log(`✅ Usuario agregado: ${user.name} (@${user.username})`);
  }
});

// Guardar usuarios actualizados
localStorage.setItem('friendbook_users', JSON.stringify(existingUsers));

// Mostrar usuarios disponibles
console.log('\n📋 Usuarios disponibles:');
const allUsers = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
allUsers.slice(0, 10).forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (@${user.username}) - ${user.email}`);
});

console.log('\n🔗 URLs de perfil disponibles:');
allUsers.slice(0, 5).forEach(user => {
  console.log(`- vecinoactivo.cl/${user.username}`);
});

console.log('\n✅ ¡Problema solucionado! Ahora puedes navegar a cualquiera de estos perfiles.');
console.log('💡 Recarga la página si es necesario.');

// Verificar que el administrador existe
const finalCheck = JSON.parse(localStorage.getItem('friendbook_users') || '[]').find(u => u.username === 'administrador');
if (finalCheck) {
  console.log('\n🎉 ¡Perfecto! El usuario administrador está disponible.');
  console.log('🔗 Puedes acceder en: vecinoactivo.cl/administrador');
} else {
  console.log('\n❌ Algo salió mal. Intenta recargar la página.');
}