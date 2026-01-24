import { supabase } from '../config/supabase';

/**
 * Servicio de Real-time de Supabase
 * Gestiona las subscripciones a cambios en tiempo real
 */
class SupabaseRealtimeService {
  constructor() {
    this.subscriptions = new Map();
  }

  /**
   * Subscribirse a cambios en una tabla
   */
  subscribe(table, callback, filter = {}) {
    const channelName = `${table}-${Date.now()}`;
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
          ...filter
        },
        (payload) => {
          console.log(`📡 Real-time event on ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${table}:`, status);
      });

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribirse solo a inserts
   */
  subscribeToInserts(table, callback, filter = {}) {
    const channelName = `${table}-inserts-${Date.now()}`;
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          ...filter
        },
        (payload) => {
          console.log(`📡 New ${table}:`, payload.new);
          callback(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribirse solo a updates
   */
  subscribeToUpdates(table, callback, filter = {}) {
    const channelName = `${table}-updates-${Date.now()}`;
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          ...filter
        },
        (payload) => {
          console.log(`📡 Updated ${table}:`, payload.new);
          callback(payload.new, payload.old);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribirse solo a deletes
   */
  subscribeToDeletes(table, callback, filter = {}) {
    const channelName = `${table}-deletes-${Date.now()}`;
    
    let channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          ...filter
        },
        (payload) => {
          console.log(`📡 Deleted ${table}:`, payload.old);
          callback(payload.old);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return channelName;
  }

  /**
   * Cancelar subscripción
   */
  unsubscribe(channelName) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(channelName);
      console.log(`📡 Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Cancelar todas las subscripciones
   */
  unsubscribeAll() {
    this.subscriptions.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`📡 Unsubscribed from ${name}`);
    });
    this.subscriptions.clear();
  }

  /**
   * Obtener subscripciones activas
   */
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }
}

const realtimeService = new SupabaseRealtimeService();
export default realtimeService;
