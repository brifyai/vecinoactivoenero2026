// =====================================================
// HOOK WEBSOCKET DESHABILITADO
// Supabase self-hosted no tiene realtime configurado
// Usar Firebase para realtime en su lugar
// =====================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook para cargar datos de Supabase (SIN realtime)
 * Para realtime, usar Firebase
 */
export const useSupabaseRealtime = (table, options = {}) => {
  const {
    enabled = true,
    filter = null
  } = options;

  const [isConnected] = useState(false); // Siempre false, no hay WebSocket
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const hasLoadedRef = useRef(false); // Flag para evitar loop infinito

  // Función para cargar datos
  const loadInitialData = useCallback(async () => {
    // Evitar cargar múltiples veces
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

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
      console.log(`✅ Datos cargados de ${table}:`, initialData?.length || 0);
      
    } catch (err) {
      console.error(`❌ Error cargando datos de ${table}:`, err);
      setError(err.message);
    }
  }, [table, filter]);

  // Cargar datos una sola vez
  useEffect(() => {
    if (!enabled) return;
    loadInitialData();
  }, [enabled, loadInitialData]);

  // Función para refrescar datos manualmente
  const refresh = useCallback(() => {
    hasLoadedRef.current = false; // Reset flag
    loadInitialData();
  }, [loadInitialData]);

  return {
    data,
    isConnected, // Siempre false
    error,
    refresh
  };
};

/**
 * Hook específico para posts - USA FIREBASE PARA REALTIME
 */
export const useRealtimePosts = (options = {}) => {
  console.log('ℹ️ useRealtimePosts: Usar Firebase para realtime, este hook solo carga datos iniciales');
  return useSupabaseRealtime('posts', options);
};

/**
 * Hook específico para notificaciones - USA FIREBASE PARA REALTIME
 */
export const useRealtimeNotifications = (userId, options = {}) => {
  console.log('ℹ️ useRealtimeNotifications: Usar Firebase para realtime, este hook solo carga datos iniciales');
  return useSupabaseRealtime('notifications', {
    filter: userId ? { column: 'user_id', operator: 'eq', value: userId } : null,
    ...options
  });
};

/**
 * Hook específico para mensajes - USA FIREBASE PARA REALTIME
 */
export const useRealtimeMessages = (conversationId, options = {}) => {
  console.log('ℹ️ useRealtimeMessages: Usar Firebase para realtime, este hook solo carga datos iniciales');
  return useSupabaseRealtime('messages', {
    filter: conversationId ? { column: 'conversation_id', operator: 'eq', value: conversationId } : null,
    ...options
  });
};

export default useSupabaseRealtime;