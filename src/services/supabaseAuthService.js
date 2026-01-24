import { supabase } from '../config/supabase';

/**
 * Servicio de Autenticación con Supabase
 * Reemplaza el sistema de localStorage por base de datos real
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
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      // 1. Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // 2. Obtener datos completos del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      // 3. Actualizar last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      return {
        user: userData,
        session: authData.session
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  /**
   * Obtener sesión actual
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
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
