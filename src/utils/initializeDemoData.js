// Utilidad para inicializar datos de demostración automáticamente
import storageService from '../services/storageService';

// Función para generar ID único
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Usuarios de demostración
const demoUsers = [
  {
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
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
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
    createdAt: '2024-02-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 1003,
    username: 'ana-martinez',
    name: 'Ana Martínez',
    email: 'ana@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=9',
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
    bio: 'Profesora y activista comunitaria. Trabajando por un barrio mejor.',
    location: 'Ñuñoa, Santiago',
    verified: true,
    isVerifiedNeighbor: true,
    neighborhoodName: 'Ñuñoa Centro',
    neighborhoodCode: 'NU-003',
    following: 20,
    followers: 78,
    posts: 22,
    friends: 35,
    createdAt: '2024-01-20T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 1004,
    username: 'pedro-silva',
    name: 'Pedro Silva',
    email: 'pedro@vecinoactivo.cl',
    avatar: 'https://i.pravatar.cc/150?img=12',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    bio: 'Comerciante local y organizador de eventos deportivos.',
    location: 'Maipú, Santiago',
    verified: false,
    isVerifiedNeighbor: true,
    neighborhoodName: 'Maipú Centro',
    neighborhoodCode: 'MP-001',
    following: 15,
    followers: 28,
    posts: 6,
    friends: 18,
    createdAt: '2024-02-10T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  }
];

// Posts de demostración
const demoPosts = [
  {
    id: generateId(),
    author: {
      id: 999,
      name: 'Administrador',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: true
    },
    authorId: 999,
    time: 'hace 2 horas',
    avatar: 'https://i.pravatar.cc/150?img=1', // Keep for backward compatibility
    content: '¡Bienvenidos a Vecino Activo! 🏘️ Esta plataforma está diseñada para conectar a los vecinos y fortalecer nuestras comunidades. Compartan sus ideas, organicen eventos y ayúdense mutuamente. ¡Juntos construimos un mejor barrio!',
    hashtags: ['#VecinoActivo', '#Comunidad', '#Bienvenida'],
    likes: 45,
    comments: 12,
    shares: 8,
    reactions: ['🤝', '❤️', '👏', '💡'],
    category: 'announcement'
  },
  {
    id: generateId(),
    author: {
      id: 1001,
      name: 'María González',
      avatar: 'https://i.pravatar.cc/150?img=5',
      verified: false
    },
    authorId: 1001,
    time: 'hace 4 horas',
    avatar: 'https://i.pravatar.cc/150?img=5', // Keep for backward compatibility
    content: 'Organizando una junta de vecinos para el próximo sábado a las 10:00 AM en la plaza del barrio. Vamos a discutir temas importantes como la seguridad y el mantenimiento de áreas verdes. ¡Los esperamos! 🌳',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop',
    hashtags: ['#JuntaVecinos', '#Comunidad', '#LasCondes'],
    likes: 23,
    comments: 7,
    shares: 5,
    reactions: ['🤝', '👏', '💡'],
    category: 'community'
  },
  {
    id: generateId(),
    author: {
      id: 1002,
      name: 'Carlos Rodríguez',
      avatar: 'https://i.pravatar.cc/150?img=8',
      verified: false
    },
    authorId: 1002,
    time: 'hace 6 horas',
    avatar: 'https://i.pravatar.cc/150?img=8', // Keep for backward compatibility
    content: 'Encontré este gatito perdido cerca del metro Providencia. Parece estar bien cuidado, seguramente tiene dueño. Si alguien lo reconoce o sabe de alguien que haya perdido un gato, por favor avísenme. 🐱',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=500&fit=crop',
    hashtags: ['#MascotaPerdida', '#Providencia', '#Ayuda'],
    likes: 67,
    comments: 15,
    shares: 12,
    reactions: ['❤️', '🤝', '🙌'],
    category: 'help'
  }
];

/**
 * Inicializa los datos de demostración si no existen
 */
export function initializeDemoData() {
  try {
    console.log('🔄 Verificando datos de demostración...');
    
    // Obtener usuarios existentes
    const existingUsers = storageService.getUsers();
    
    // Verificar si el usuario administrador existe
    const adminExists = existingUsers.find(u => u.username === 'administrador' || u.id === 999);
    
    if (!adminExists) {
      console.log('⚠️ Usuario administrador no encontrado. Inicializando datos...');
      
      // Agregar usuarios de demostración
      demoUsers.forEach(user => {
        const exists = existingUsers.find(u => u.id === user.id || u.username === user.username);
        if (!exists) {
          existingUsers.push(user);
          console.log(`✅ Usuario agregado: ${user.name} (@${user.username})`);
        }
      });
      
      // Guardar usuarios
      storageService.saveUsers(existingUsers);
      
      // Agregar posts de demostración
      const existingPosts = storageService.getPosts();
      demoPosts.forEach(post => {
        const exists = existingPosts.find(p => p.content === post.content);
        if (!exists) {
          existingPosts.unshift(post);
        }
      });
      storageService.savePosts(existingPosts);
      
      // Crear amistades de ejemplo
      const friendships = JSON.parse(localStorage.getItem('friendbook_friends') || '{}');
      if (!friendships[999]) {
        friendships[999] = [1001, 1002, 1003, 1004];
        friendships[1001] = [999, 1002];
        friendships[1002] = [999, 1001, 1003];
        friendships[1003] = [999, 1002];
        friendships[1004] = [999];
        localStorage.setItem('friendbook_friends', JSON.stringify(friendships));
      }
      
      console.log('✅ Datos de demostración inicializados correctamente');
      return true;
    } else {
      console.log('ℹ️ Datos de demostración ya existen');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al inicializar datos de demostración:', error);
    return false;
  }
}

/**
 * Obtiene una lista de usuarios sugeridos para mostrar cuando no se encuentra un usuario
 */
export function getSuggestedUsers() {
  const users = storageService.getUsers();
  return users.slice(0, 5);
}

/**
 * Verifica si un usuario existe por username
 */
export function userExists(username) {
  const users = storageService.getUsers();
  return users.some(u => u.username === username);
}

export default {
  initializeDemoData,
  getSuggestedUsers,
  userExists
};