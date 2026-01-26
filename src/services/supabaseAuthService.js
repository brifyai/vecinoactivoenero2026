import { supabase } from '../config/supabase';
import customAuthService from './customAuthService';

/**
 * Servicio de Autenticación con Supabase + Bypass Custom
 * Intenta Supabase Auth primero, fallback a custom auth
 */

class SupabaseAuthService {
  
  /**
   * Registrar nuevo usuario
   */
  async register({ email, password, name, phone, bio, neighborhoodId, neighborhoodName, neighborhoodCode }) {
    try {
      // 1. Crear usuario en Supabase Auth (sin confirmación de email para self-hosted)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // No redirigir
          data: {
            name,
            phone,
            bio,
            neighborhood_id: neighborhoodId,
            neighborhood_name: neighborhoodName,
            neighborhood_code: neighborhoodCode
          }
        }
      });

      if (authError) throw authError;

      // Si no hay usuario creado (puede pasar si el email ya existe)
      if (!authData.user) {
        throw new Error('No se pudo crear el usuario. El email puede estar ya registrado.');
      }

      // 2. Crear perfil en tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            phone,
            bio,
            neighborhood_id: neighborhoodId,
            neighborhood_name: neighborhoodName,
            neighborhood_code: neighborhoodCode,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`,
            verified: false,
            email_verified: true // Marcar como verificado para self-hosted sin SMTP
          }
        ])
        .select()
        .single();

      if (userError) throw userError;

      return {
        user: userData,
        session: authData.session
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión - DIRECTO A CUSTOM AUTH
   * Ignora completamente Supabase Auth (problemático)
   */
  async login(email, password, userType = 'user') {
    try {
      console.log('🚀 BYPASS COMPLETO - Usando solo custom auth');
      
      // Ir directo a custom auth (no intentar Supabase)
      return await customAuthService.login(email, password, userType);
      
    } catch (error) {
      console.error('❌ Error en login bypass:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión - SOLO CUSTOM AUTH
   */
  async logout() {
    // Usar solo custom auth
    return await customAuthService.logout();
  }

  /**
   * Obtener usuario actual - SOLO CUSTOM AUTH
   */
  async getCurrentUser() {
    // Usar solo custom auth (no intentar Supabase)
    return await customAuthService.getCurrentUser();
  }

  /**
   * Obtener sesión actual - SOLO CUSTOM AUTH
   */
  async getCurrentSession() {
    // Usar solo custom auth
    return await customAuthService.getCurrentSession();
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Actualizar avatar
   */
  async updateAvatar(userId, avatarUrl) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          avatar: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      throw error;
    }
  }

  /**
   * Verificar email
   */
  async verifyEmail(token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios de autenticación
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}

export default new SupabaseAuthService();
