import { useEffect } from 'react';

const AppInitializer = () => {
  useEffect(() => {
    console.log('🚀 AppInitializer: Inicializando aplicación...');
    
    try {
      // OPTIMIZACIÓN: Solo verificar si existe el admin, no crear datos masivos
      const existingUsers = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
      const adminExists = existingUsers.find(u => u.id === 999 || u.username === 'administrador');
      
      if (!adminExists) {
        // Solo agregar el usuario administrador mínimo
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
        
        existingUsers.push(adminUser);
        localStorage.setItem('friendbook_users', JSON.stringify(existingUsers));
        console.log('✅ Usuario administrador agregado (modo optimizado)');
      } else {
        console.log('ℹ️ Datos de demostración ya existen');
      }

      console.log('✅ AppInitializer: Inicialización completada (optimizada)');
    } catch (error) {
      console.error('❌ Error en AppInitializer:', error);
    }
  }, []); // Dependencias vacías para ejecutar solo una vez

  return null;
};

export default AppInitializer;