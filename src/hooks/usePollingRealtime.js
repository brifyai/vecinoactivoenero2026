// =====================================================
// HOOK DE POLLING REAL-TIME
// Alternativa inmediata a WebSockets para self-hosted
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook que simula funcionalidad real-time usando polling
 * @param {string} table - Nombre de la tabla a monitorear
 * @param {Object} options - Opciones de configuración
 * @param {number} options.interval - Intervalo de polling en ms (default: 3000)
 * @param {string} options.select - Campos a seleccionar (default: '*')
 * @param {Object} options.filter - Filtro opcional {column, operator, value}
 * @param {Function} options.onInsert - Callback para nuevos registros
 * @param {Function} options.onUpdate - Callback para registros actualizados
 * @param {Function} options.onDelete - Callback para registros eliminados
 * @param {boolean} options.enabled - Si el polling está habilitado (default: true)
 */
export const usePollingRealtime = (table, options = {}) => {
  const {
    interval = 3000,
    select = '*',
    filter = null,
    onInsert = null,
    onUpdate = null,
    onDelete = null,
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastData, setLastData] = useState([]);

  // Función para comparar registros y detectar cambios
  const detectChanges = useCallback((newData, oldData) => {
    // Detectar INSERT (nuevos registros)
    const insertedRecords = newData.filter(record => 
      !oldData.some(prev => prev.id === record.id)
    );

    // Detectar UPDATE (registros modificados)
    const updatedRecords = newData.filter(record => {
      const prevRecord = oldData.find(prev => prev.id === record.id);
      return prevRecord && JSON.stringify(prevRecord) !== JSON.stringify(record);
    });

    // Detectar DELETE (registros eliminados)
    const deletedRecords = oldData.filter(prev => 
      !newData.some(record => record.id === prev.id)
    );

    return { insertedRecords, updatedRecords, deletedRecords };
  }, []);

  // Función de polling
  const poll = useCallback(async () => {
    try {
      let query = supabase.from(table).select(select);
      
      // Aplicar filtro si existe
      if (filter) {
        query = query.filter(filter.column, filter.operator, filter.value);
      }
      
      const { data: newData, error: queryError } = await query
        .order('created_at', { ascending: false });
        
      if (queryError) throw queryError;

      // Detectar cambios solo si no es la primera carga
      if (lastData.length > 0) {
        const { insertedRecords, updatedRecords, deletedRecords } = detectChanges(newData, lastData);

        // Ejecutar callbacks
        insertedRecords.forEach(record => {
          console.log(`🆕 INSERT detectado en ${table}:`, record.id);
          onInsert && onInsert(record);
        });

        updatedRecords.forEach(record => {
          const oldRecord = lastData.find(prev => prev.id === record.id);
          console.log(`📝 UPDATE detectado en ${table}:`, record.id);
          onUpdate && onUpdate(record, oldRecord);
        });

        deletedRecords.forEach(record => {
          console.log(`🗑️ DELETE detectado en ${table}:`, record.id);
          onDelete && onDelete(record);
        });
      }

      setData(newData);
      setLastData(newData);
      setError(null);
      setLoading(false);

    } catch (err) {
      console.error(`❌ Error en polling ${table}:`, err.message);
      setError(err.message);
      setLoading(false);
    }
  }, [table, select, filter, lastData, onInsert, onUpdate, onDelete, detectChanges]);

  // Efecto principal de polling
  useEffect(() => {
    if (!enabled) return;

    // Ejecutar inmediatamente
    poll();

    // Configurar intervalo
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }, [poll, interval, enabled]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    poll();
  }, [poll]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

/**
 * Hook específico para posts con eventos
 */
export const usePollingPosts = (options = {}) => {
  return usePollingRealtime('posts', {
    interval: 3000,
    onInsert: (post) => {
      console.log('🆕 Nuevo post:', post.content?.substring(0, 50) + '...');
    },
    onUpdate: (post) => {
      console.log('📝 Post actualizado:', post.id);
    },
    onDelete: (post) => {
      console.log('🗑️ Post eliminado:', post.id);
    },
    ...options
  });
};

/**
 * Hook específico para notificaciones con eventos
 */
export const usePollingNotifications = (userId, options = {}) => {
  return usePollingRealtime('notifications', {
    interval: 2000,
    filter: userId ? { column: 'user_id', operator: 'eq', value: userId } : null,
    onInsert: (notification) => {
      console.log('🔔 Nueva notificación:', notification.message?.substring(0, 50) + '...');
      // Aquí puedes mostrar toast, actualizar badge, etc.
    },
    onUpdate: (notification) => {
      console.log('📝 Notificación actualizada:', notification.id);
    },
    ...options
  });
};

/**
 * Hook específico para mensajes con eventos
 */
export const usePollingMessages = (conversationId, options = {}) => {
  return usePollingRealtime('messages', {
    interval: 1000, // Más frecuente para mensajes
    filter: conversationId ? { column: 'conversation_id', operator: 'eq', value: conversationId } : null,
    onInsert: (message) => {
      console.log('💬 Nuevo mensaje:', message.content?.substring(0, 50) + '...');
    },
    ...options
  });
};

export default usePollingRealtime;