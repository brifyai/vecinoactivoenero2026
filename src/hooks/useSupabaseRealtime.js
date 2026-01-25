// =====================================================
// HOOK WEBSOCKET PARA SUPABASE SELF-HOSTED
// Intenta conectar WebSocket, fallback a carga manual
// =====================================================

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook para WebSocket real-time con Supabase self-hosted
 * @param {string} table - Nombre de la tabla a escuchar
 * @param {Object} options - Opciones de configuración
 */
export const useSupabaseRealtime = (table, options = {}) => {
  const {
    onInsert = null,
    onUpdate = null,
    onDelete = null,
    enabled = true,
    filter = null
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  // Función para cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      let query = supabase.from(table).select('*');
      
      if (filter) {
        query = query.filter(filter.column, filter.operator, filter.value);
      }
      
      const { data: initialData, error: queryError } = await query
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (queryError) throw queryError;
      
      setData(initialData || []);
      console.log(`✅ Datos iniciales cargados para ${table}:`, initialData?.length || 0);
      
    } catch (err) {
      console.error(`❌ Error cargando datos iniciales de ${table}:`, err);
      setError(err.message);
    }
  }, [table, filter]);

  // Intentar conexión WebSocket
  useEffect(() => {
    if (!enabled) return;

    console.log(`🔌 Intentando conexión WebSocket para tabla: ${table}`);
    
    try {
      // Crear canal de Supabase Realtime
      let channel = supabase.channel(`realtime:${table}`);
      
      // Configurar filtros si existen
      if (filter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `${filter.column}=${filter.operator}.${filter.value}`
          },
          handleRealtimeEvent
        );
      } else {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          handleRealtimeEvent
        );
      }

      // Suscribirse al canal
      channel.subscribe((status) => {
        console.log(`📡 Estado de conexión ${table}:`, status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
          console.log(`✅ WebSocket conectado para ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Error de conexión WebSocket');
          console.warn(`⚠️ Error de WebSocket para ${table}, usando carga manual`);
          
          // Fallback: cargar datos iniciales
          loadInitialData();
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError('Timeout de conexión WebSocket');
          console.warn(`⏰ Timeout de WebSocket para ${table}, usando carga manual`);
          
          // Fallback: cargar datos iniciales
          loadInitialData();
        }
      });

      // Cargar datos iniciales independientemente de WebSocket
      loadInitialData();

      // Cleanup
      return () => {
        console.log(`🔌 Desconectando WebSocket para ${table}`);
        supabase.removeChannel(channel);
      };

    } catch (err) {
      console.error(`❌ Error configurando WebSocket para ${table}:`, err);
      setError(err.message);
      setIsConnected(false);
      
      // Fallback: cargar datos iniciales
      loadInitialData();
    }
  }, [enabled, table, filter, loadInitialData]);

  // Manejar eventos de tiempo real
  const handleRealtimeEvent = useCallback((payload) => {
    console.log(`🔄 Evento real-time en ${table}:`, payload.eventType, payload.new?.id);
    
    try {
      switch (payload.eventType) {
        case 'INSERT':
          if (onInsert) onInsert(payload.new);
          setData(prevData => [payload.new, ...prevData]);
          break;
          
        case 'UPDATE':
          if (onUpdate) onUpdate(payload.new, payload.old);
          setData(prevData => 
            prevData.map(item => 
              item.id === payload.new.id ? payload.new : item
            )
          );
          break;
          
        case 'DELETE':
          if (onDelete) onDelete(payload.old);
          setData(prevData => 
            prevData.filter(item => item.id !== payload.old.id)
          );
          break;
          
        default:
          console.log(`🤷 Evento desconocido: ${payload.eventType}`);
      }
    } catch (err) {
      console.error(`❌ Error procesando evento real-time:`, err);
    }
  }, [onInsert, onUpdate, onDelete]);

  // Función para refrescar datos manualmente
  const refresh = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    data,
    isConnected,
    error,
    refresh
  };
};

/**
 * Hook específico para posts
 */
export const useRealtimePosts = (options = {}) => {
  return useSupabaseRealtime('posts', {
    onInsert: (post) => {
      console.log('🆕 Nuevo post:', post.content?.substring(0, 50) + '...');
      
      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nuevo post en tu vecindario', {
          body: post.content?.substring(0, 100) + '...',
          icon: '/favicon.ico',
          tag: `post-${post.id}`
        });
      }
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
 * Hook específico para notificaciones
 */
export const useRealtimeNotifications = (userId, options = {}) => {
  return useSupabaseRealtime('notifications', {
    filter: userId ? { column: 'user_id', operator: 'eq', value: userId } : null,
    onInsert: (notification) => {
      console.log('🔔 Nueva notificación:', notification.message?.substring(0, 50) + '...');
      
      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nueva notificación', {
          body: notification.message,
          icon: '/favicon.ico',
          tag: `notification-${notification.id}`
        });
      }
    },
    onUpdate: (notification) => {
      console.log('📝 Notificación actualizada:', notification.id);
    },
    ...options
  });
};

/**
 * Hook específico para mensajes
 */
export const useRealtimeMessages = (conversationId, options = {}) => {
  return useSupabaseRealtime('messages', {
    filter: conversationId ? { column: 'conversation_id', operator: 'eq', value: conversationId } : null,
    onInsert: (message) => {
      console.log('💬 Nuevo mensaje:', message.content?.substring(0, 50) + '...');
    },
    onUpdate: (message) => {
      console.log('📝 Mensaje actualizado:', message.id);
    },
    ...options
  });
};

export default useSupabaseRealtime;