import { useEffect } from 'react';
import { initializeDemoData } from '../../utils/initializeDemoData';

const AppInitializer = () => {
  useEffect(() => {
    console.log('🚀 AppInitializer: Inicializando aplicación...');
    
    try {
      // Simplificar inicialización - solo datos básicos
      const demoInitialized = initializeDemoData();
      
      // Solo agregar el usuario administrador para evitar problemas de memoria
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
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Obtener usuarios existentes del localStorage
      const existingUsers = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
      
      // Solo agregar admin si no existe
      const adminExists = existingUsers.find(u => u.id === 999 || u.username === 'administrador');
      if (!adminExists) {
        existingUsers.push(adminUser);
        localStorage.setItem('friendbook_users', JSON.stringify(existingUsers));
        console.log('✅ Usuario administrador agregado');
      }
      
      if (demoInitialized) {
        console.log('✅ AppInitializer: Datos de demostración inicializados');
      } else {
        console.log('ℹ️ AppInitializer: Datos de demostración ya existían');
      }

      console.log('✅ AppInitializer: Inicialización completada');
    } catch (error) {
      console.error('❌ Error en AppInitializer:', error);
    }
  }, []);

  return null;
};

export default AppInitializer;