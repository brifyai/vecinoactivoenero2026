/**
 * Índice de Servicios de Supabase
 * Exporta todos los servicios para fácil importación
 */

// Core Services
export { default as supabaseAuthService } from './supabaseAuthService';
export { default as supabasePostsService } from './supabasePostsService';
export { default as supabaseMessagesService } from './supabaseMessagesService';
export { default as supabaseEventsService } from './supabaseEventsService';
export { default as supabaseGroupsService } from './supabaseGroupsService';
export { default as supabaseFriendsService } from './supabaseFriendsService';
export { default as supabaseNotificationsService } from './supabaseNotificationsService';

// Community Services
export { default as supabaseProjectsService } from './supabaseProjectsService';
export { default as supabasePollsService } from './supabasePollsService';
export { default as supabaseBusinessService } from './supabaseBusinessService';
export { default as supabaseResourcesService } from './supabaseResourcesService';
export { default as supabaseHelpService } from './supabaseHelpService';
export { default as supabaseCalendarService } from './supabaseCalendarService';
export { default as supabasePhotosService } from './supabasePhotosService';

// Storage Service
export { default as supabaseStorageService } from './supabaseStorageService';

// Re-exportar cliente de Supabase
export { supabase } from '../config/supabase';
