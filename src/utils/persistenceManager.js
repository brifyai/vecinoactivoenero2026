// Sistema de persistencia mejorado con backup y recuperación

const BACKUP_KEY = 'friendbook_backup';
const LAST_BACKUP_KEY = 'friendbook_last_backup';
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

class PersistenceManager {
  constructor() {
    this.initBackupSystem();
  }

  // Inicializar sistema de backup automático
  initBackupSystem() {
    // Crear backup al cargar
    this.createBackup();
    
    // Backup automático cada 5 minutos
    setInterval(() => {
      this.createBackup();
    }, BACKUP_INTERVAL);

    // Backup antes de cerrar/recargar página
    window.addEventListener('beforeunload', () => {
      this.createBackup();
    });

    // Intentar recuperar si hay datos perdidos
    this.checkAndRecover();
  }

  // Crear backup de todos los datos
  createBackup() {
    try {
      const allData = {};
      const keys = [
        'users',
        'currentUser',
        'posts',
        'friends',
        'groups',
        'events',
        'conversations',
        'stories',
        'photos',
        'notifications',
        'messages'
      ];

      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          allData[key] = data;
        }
      });

      const backup = {
        timestamp: Date.now(),
        data: allData,
        version: '1.0.0'
      };

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
      
      console.log('✅ Backup creado exitosamente');
    } catch (error) {
      console.error('❌ Error al crear backup:', error);
    }
  }

  // Verificar y recuperar datos si es necesario
  checkAndRecover() {
    try {
      // NO recuperar NUNCA después de logout
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        console.log('🚪 No hay currentUser - probablemente logout, NO recuperar');
        return;
      }

      const users = localStorage.getItem('users');

      // Si no hay datos pero hay backup, recuperar
      if ((!currentUser || !users) && this.hasBackup()) {
        console.log('🔄 Datos perdidos detectados, recuperando backup...');
        this.restoreBackup();
      }
    } catch (error) {
      console.error('❌ Error al verificar datos:', error);
    }
  }

  // Verificar si existe backup
  hasBackup() {
    const backup = localStorage.getItem(BACKUP_KEY);
    return backup !== null;
  }

  // Restaurar desde backup
  restoreBackup() {
    try {
      const backupStr = localStorage.getItem(BACKUP_KEY);
      if (!backupStr) {
        console.log('⚠️ No hay backup disponible');
        return false;
      }

      const backup = JSON.parse(backupStr);
      
      // Restaurar todos los datos
      Object.keys(backup.data).forEach(key => {
        localStorage.setItem(key, backup.data[key]);
      });

      console.log('✅ Datos restaurados desde backup');
      return true;
    } catch (error) {
      console.error('❌ Error al restaurar backup:', error);
      return false;
    }
  }

  // Exportar datos para descarga
  exportData() {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (!backup) {
        this.createBackup();
      }

      const data = localStorage.getItem(BACKUP_KEY);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `friendbook_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('✅ Datos exportados exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar datos:', error);
    }
  }

  // Importar datos desde archivo
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Validar estructura
          if (!backup.data || !backup.timestamp) {
            reject(new Error('Formato de backup inválido'));
            return;
          }

          // Restaurar datos
          Object.keys(backup.data).forEach(key => {
            localStorage.setItem(key, backup.data[key]);
          });

          console.log('✅ Datos importados exitosamente');
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsText(file);
    });
  }

  // Limpiar backups antiguos (mantener solo el último)
  cleanOldBackups() {
    // En localStorage solo mantenemos uno, pero esto es útil si expandimos a IndexedDB
    console.log('🧹 Limpieza de backups completada');
  }

  // Limpiar datos para logout
  clearForLogout() {
    console.log('🚪 Limpiando datos para logout...');
    localStorage.setItem('friendbook_intentional_logout', 'true');
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(LAST_BACKUP_KEY);
    console.log('✅ Backups eliminados - logout preparado');
  }

  // Obtener información del backup
  getBackupInfo() {
    try {
      const backupStr = localStorage.getItem(BACKUP_KEY);
      const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);

      if (!backupStr) {
        return null;
      }

      const backup = JSON.parse(backupStr);
      return {
        timestamp: backup.timestamp,
        lastBackup: lastBackup ? parseInt(lastBackup) : null,
        version: backup.version,
        size: new Blob([backupStr]).size,
        keys: Object.keys(backup.data)
      };
    } catch (error) {
      console.error('❌ Error al obtener info del backup:', error);
      return null;
    }
  }
}

// Instancia singleton
const persistenceManager = new PersistenceManager();

export default persistenceManager;
