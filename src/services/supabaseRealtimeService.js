import { supabase } from '../config/supabase';

/**
 * ❌ SERVICIO DESHABILITADO
 * Supabase Realtime no está configurado en self-hosted
 * Usar Firebase para todas las funcionalidades en tiempo real
 */
class SupabaseRealtimeService {
  constructor() {
    console.warn('⚠️ SupabaseRealtimeService deshabilitado - Usar Firebase');
  }

  subscribe(table, callback, filter = {}) {
    console.warn('⚠️ Supabase Realtime deshabilitado - Usar Firebase');
    return null;
  }

  subscribeToInserts(table, callback, filter = {}) {
    console.warn('⚠️ Supabase Realtime deshabilitado - Usar Firebase');
    return null;
  }

  subscribeToUpdates(table, callback, filter = {}) {
    console.warn('⚠️ Supabase Realtime deshabilitado - Usar Firebase');
    return null;
  }

  subscribeToDeletes(table, callback, filter = {}) {
    console.warn('⚠️ Supabase Realtime deshabilitado - Usar Firebase');
    return null;
  }

  unsubscribe(channelName) {
    // No-op
  }

  unsubscribeAll() {
    // No-op
  }

  getActiveSubscriptions() {
    return [];
  }
}

const realtimeService = new SupabaseRealtimeService();
export default realtimeService;
