import { supabase } from '../config/supabase';

/**
 * Servicio de autenticación ULTRA-SIMPLE
 * Solo usa tabla public.users - ignora completamente Supabase Auth
 */
class CustomAuthService {
  
  async login(email, password) {
    try {
      console.log('🔄 ULTRA-SIMPLE AUTH: Login con:', email);
      
      // Solo verificar credenciales hardcodeadas para admin
      if (email === 'admin@vecinoactivo.cl' && password === '123456') {
        console.log('✅ Credenciales admin correctas');
        
        // Obtener datos del usuario de public.users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        
        if (userError || !userData) {
          throw new Error('Usuario no encontrado en base de datos');
        }
        
        // Crear sesión ultra-simple
        const session = {
          user: userData,
          access_token: 'simple_admin_token',
          expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
          simple_auth: true
        };
        
        // Guardar en localStorage
        localStorage.setItem('vecino-activo-auth', JSON.stringify(session));
        
        console.log('✅ LOGIN EXITOSO - ULTRA SIMPLE');
        return { user: userData, session };
      }
      
      throw new Error('Credenciales inválidas');
      
    } catch (error) {
      console.error('❌ Error en ultra-simple auth:', error);
      throw error;
    }
  }
  
  async getCurrentUser() {
    try {
      const sessionData = localStorage.getItem('vecino-activo-auth');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Verificar expiración
      if (Date.now() > session.expires_at) {
        localStorage.removeItem('vecino-activo-auth');
        return null;
      }
      
      return session.user;
      
    } catch (error) {
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
    console.log('🚪 Logout ultra-simple');
    localStorage.removeItem('vecino-activo-auth');
    return true;
  }
}

export default new CustomAuthService();