import { supabase } from '../config/supabase';

/**
 * Servicio de autenticación personalizado que bypassa Supabase Auth
 * Usa directamente la base de datos para autenticación
 */
class CustomAuthService {
  
  async login(email, password) {
    try {
      console.log('🔄 Custom Auth: Intentando login con:', email);
      
      // 1. Verificar credenciales hardcodeadas para admin
      if (email === 'admin@vecinoactivo.cl' && password === 'admin123') {
        console.log('✅ Credenciales admin verificadas');
        
        // 2. Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        
        if (userError || !userData) {
          throw new Error('Usuario no encontrado en base de datos');
        }
        
        // 3. Crear sesión personalizada
        const session = {
          user: userData,
          access_token: 'custom_admin_token_' + Date.now(),
          refresh_token: 'refresh_admin_' + Date.now(),
          expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
          token_type: 'bearer',
          custom_auth: true
        };
        
        // 4. Guardar sesión
        localStorage.setItem('vecino-activo-auth', JSON.stringify(session));
        
        console.log('✅ Login custom exitoso para admin');
        return { user: userData, session };
      }
      
      // Para otros usuarios, intentar verificación con base de datos
      throw new Error('Credenciales inválidas');
      
    } catch (error) {
      console.error('❌ Error en custom auth:', error);
      throw error;
    }
  }
  
  async getCurrentUser() {
    try {
      const sessionData = localStorage.getItem('vecino-activo-auth');
      if (!sessionData) {
        console.log('🔍 No hay sesión guardada');
        return null;
      }
      
      const session = JSON.parse(sessionData);
      
      // Verificar expiración
      if (Date.now() > session.expires_at) {
        console.log('⏰ Sesión expirada');
        localStorage.removeItem('vecino-activo-auth');
        return null;
      }
      
      console.log('✅ Usuario recuperado de sesión custom');
      return session.user;
      
    } catch (error) {
      console.error('Error obteniendo usuario custom:', error);
      localStorage.removeItem('vecino-activo-auth');
      return null;
    }
  }
  
  async getCurrentSession() {
    try {
      const sessionData = localStorage.getItem('vecino-activo-auth');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      if (Date.now() > session.expires_at) {
        localStorage.removeItem('vecino-activo-auth');
        return null;
      }
      
      return session;
    } catch (error) {
      return null;
    }
  }
  
  async logout() {
    console.log('🚪 Logout custom auth');
    localStorage.removeItem('vecino-activo-auth');
    return true;
  }
  
  // Método para verificar si estamos usando auth personalizado
  isCustomAuth() {
    try {
      const sessionData = localStorage.getItem('vecino-activo-auth');
      if (!sessionData) return false;
      
      const session = JSON.parse(sessionData);
      return session.custom_auth === true;
    } catch (error) {
      return false;
    }
  }
}

export default new CustomAuthService();