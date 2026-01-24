import React, { useState, useEffect } from 'react';
import './DiagnosticPage.css';

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = () => {
    const results = {};

    // Verificar tamaño de localStorage
    let totalSize = 0;
    const sizes = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        sizes[key] = size;
        totalSize += size;
      }
    }

    results.localStorage = {
      totalSize: (totalSize / 1024).toFixed(2),
      items: Object.entries(sizes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([key, size]) => ({
          key,
          size: (size / 1024).toFixed(2)
        }))
    };

    // Verificar cantidad de datos
    const dataKeys = [
      'friendbook_posts',
      'friendbook_users', 
      'friendbook_notifications',
      'friendbook_messages'
    ];

    results.dataQuantity = {};
    dataKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const count = Array.isArray(data) ? data.length : Object.keys(data).length;
        results.dataQuantity[key] = count;
      } catch (error) {
        results.dataQuantity[key] = 'Error';
      }
    });

    // Verificar memoria
    if (performance.memory) {
      results.memory = {
        used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
        limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
      };
    }

    setDiagnostics(results);
  };

  const optimizeApp = async () => {
    setIsOptimizing(true);
    
    try {
      // Limpiar localStorage
      localStorage.clear();
      
      // Crear datos mínimos
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
      
      const welcomePost = {
        id: Date.now(),
        author: 'Administrador',
        authorId: 999,
        time: 'hace 1 hora',
        avatar: 'https://i.pravatar.cc/150?img=1',
        content: '¡Bienvenidos a Vecino Activo! 🏘️ Aplicación optimizada.',
        hashtags: ['#VecinoActivo'],
        likes: 1,
        comments: 0,
        shares: 0,
        reactions: ['🤝'],
        category: 'announcement'
      };
      
      localStorage.setItem('friendbook_users', JSON.stringify([adminUser]));
      localStorage.setItem('friendbook_posts', JSON.stringify([welcomePost]));
      localStorage.setItem('friendbook_notifications', JSON.stringify({}));
      localStorage.setItem('friendbook_messages', JSON.stringify([]));
      localStorage.setItem('vecino_activo_optimized', 'true');
      
      // Esperar un poco para mostrar el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Re-ejecutar diagnósticos
      runDiagnostics();
      
      alert('✅ Optimización completada! La aplicación debería cargar más rápido.');
      
    } catch (error) {
      console.error('Error en optimización:', error);
      alert('❌ Error durante la optimización');
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearStorage = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
      localStorage.clear();
      runDiagnostics();
      alert('✅ localStorage limpiado completamente');
    }
  };

  return (
    <div className="diagnostic-page">
      <div className="diagnostic-container">
        <h1>🔍 Diagnóstico de Rendimiento</h1>
        
        <div className="diagnostic-section">
          <h2>📊 localStorage</h2>
          <p><strong>Tamaño total:</strong> {diagnostics.localStorage?.totalSize} KB</p>
          <div className="items-list">
            {diagnostics.localStorage?.items.map(item => (
              <div key={item.key} className="item">
                <span>{item.key}:</span>
                <span>{item.size} KB</span>
              </div>
            ))}
          </div>
        </div>

        <div className="diagnostic-section">
          <h2>📈 Cantidad de Datos</h2>
          {Object.entries(diagnostics.dataQuantity || {}).map(([key, count]) => (
            <div key={key} className="item">
              <span>{key}:</span>
              <span>{count} elementos</span>
            </div>
          ))}
        </div>

        {diagnostics.memory && (
          <div className="diagnostic-section">
            <h2>💾 Memoria</h2>
            <div className="item">
              <span>Usada:</span>
              <span>{diagnostics.memory.used} MB</span>
            </div>
            <div className="item">
              <span>Total:</span>
              <span>{diagnostics.memory.total} MB</span>
            </div>
            <div className="item">
              <span>Límite:</span>
              <span>{diagnostics.memory.limit} MB</span>
            </div>
          </div>
        )}

        <div className="actions">
          <button 
            onClick={optimizeApp} 
            disabled={isOptimizing}
            className="optimize-btn"
          >
            {isOptimizing ? '⏳ Optimizando...' : '🚀 Optimizar Aplicación'}
          </button>
          
          <button onClick={clearStorage} className="clear-btn">
            🧹 Limpiar localStorage
          </button>
          
          <button onClick={runDiagnostics} className="refresh-btn">
            🔄 Actualizar Diagnóstico
          </button>
        </div>

        <div className="instructions">
          <h3>📋 Instrucciones</h3>
          <ol>
            <li>Si el localStorage es mayor a 50KB, optimiza la aplicación</li>
            <li>Si hay más de 100 posts, considera limpiar datos</li>
            <li>Si la memoria usada es mayor a 50MB, refresca la página</li>
            <li>Después de optimizar, refresca la página (F5)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;