import { supabase } from '../config/supabase';

/**
 * Servicio de autenticación ULTRA-SIMPLE
 * Solo usa tabla public.users - ignora completamente Supabase Auth
 */
class CustomAuthService {
  
  async login(email, password, userType = 'user') {
    try {
      console.log('🔄 ULTRA-SIMPLE AUTH: Login con:', email, 'tipo:', userType);
      
      // Verificar credenciales hardcodeadas
      const validCredentials = [
        // Admin credentials
        { email: 'admin@vecinoactivo.cl', password: '123456', role: 'admin' },
        // Regular user credentials (demo)
        { email: 'usuario@vecinoactivo.cl', password: '123456', role: 'user' },
        { email: 'vecino@vecinoactivo.cl', password: '123456', role: 'user' }
      ];
      
      const credential = validCredentials.find(cred => 
        cred.email === email && cred.password === password
      );
      
      if (!credential) {
        throw new Error('Credenciales inválidas');
      }
      
      // Si se solicita login de admin pero el usuario no es admin
      if (userType === 'admin' && credential.role !== 'admin') {
        throw new Error('No tienes permisos de administrador');
      }
      
      console.log('✅ Credenciales correctas para:', credential.role);
      
      // Obtener datos del usuario de public.users
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        // Si no existe el usuario en la BD, crear uno básico
        const newUser = {
          id: `user_${Date.now()}`,
          email: email,
          name: credential.role === 'admin' ? 'Administrador' : 'Usuario Demo',
          role: credential.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credential.role === 'admin' ? 'Admin' : 'Usuario')}&background=667eea&color=fff`,
          verified: true,
          email_verified: true,
          created_at: new Date().toISOString()
        };
        
        // Intentar insertar el usuario
        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        if (!insertError && insertedUser) {
          userData = insertedUser;
        } else {
          // Si falla la inserción, usar datos mock
          userData = newUser;
        }
      }
      
      // Asegurar que el rol esté correcto
      userData.role = credential.role;
      
      // Crear sesión ultra-simple
      const session = {
        user: userData,
        access_token: `simple_${credential.role}_token`,
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        simple_auth: true
      };
      
      // Guardar en localStorage
      localStorage.setItem('vecino-activo-auth', JSON.stringify(session));
      
      console.log('✅ LOGIN EXITOSO - ULTRA SIMPLE');
      return { user: userData, session };
      
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