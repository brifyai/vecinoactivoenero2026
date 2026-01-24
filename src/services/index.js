/**
 * Índice de Servicios de Supabase
 * Exporta todos los servicios para fácil importación
 */

export { default as supabaseAuthService } from './supabaseAuthService';
export { default as supabasePostsService } from './supabasePostsService';
export { default as supabaseMessagesService } from './supabaseMessagesService';
export { default as supabaseEventsService } from './supabaseEventsService';
export { default as supabaseGroupsService } from './supabaseGroupsService';
export { default as supabaseFriendsService } from './supabaseFriendsService';
export { default as supabaseNotificationsService } from './supabaseNotificationsService';

// Re-exportar cliente de Supabase
export { supabase } from '../config/supabase';
