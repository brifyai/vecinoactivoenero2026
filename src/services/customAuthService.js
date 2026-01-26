import { supabase } from '../config/supabase';

/**
 * Servicio de autenticación conectado a Supabase
 * Usa tabla public.users con validación de contraseña
 */
class CustomAuthService {
  
  async login(email, password, userType = 'user') {
    try {
      console.log('🔄 AUTH: Intentando login con:', email, 'tipo:', userType);
      
      // 1. Buscar usuario en la base de datos por email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.error('❌ Usuario no encontrado:', email);
        throw new Error('Credenciales inválidas');
      }
      
      console.log('✅ Usuario encontrado:', userData.email);
      
      // 2. Validar contraseña
      const storedPassword = userData.password;
      
      if (!storedPassword) {
        console.error('❌ Usuario sin contraseña configurada');
        throw new Error('Usuario sin contraseña configurada. Contacta al administrador.');
      }
      
      // Validación de contraseña (soporta bcrypt y texto plano)
      let passwordValid = false;
      
      // Si la contraseña almacenada es un hash bcrypt
      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
        // En producción, aquí usarías bcrypt.compare()
        // Por ahora, solo para desarrollo
        console.log('⚠️ Contraseña hasheada detectada - requiere bcrypt');
        throw new Error('Sistema de contraseñas hasheadas no implementado aún');
      } else {
        // Contraseña en texto plano (solo desarrollo)
        passwordValid = (storedPassword === password);
      }
      
      if (!passwordValid) {
        console.error('❌ Contraseña incorrecta');
        throw new Error('Credenciales inválidas');
      }
      
      console.log('✅ Contraseña correcta');
      
      // 3. Determinar rol del usuario
      // Los admins son identificados por email específico o campo verified especial
      const isAdmin = email === 'admin@vecinoactivo.cl' || 
                      email.includes('admin@') ||
                      userData.username === 'admin';
      
      const userRole = isAdmin ? 'admin' : 'user';
      
      // Si se solicita login de admin pero el usuario no es admin
      if (userType === 'admin' && !isAdmin) {
        console.error('❌ Usuario sin permisos de administrador');
        throw new Error('No tienes permisos de administrador');
      }
      
      console.log('✅ Validación de rol exitosa:', userRole);
      
      // 4. Actualizar última conexión
      try {
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id);
      } catch (updateError) {
        console.warn('⚠️ No se pudo actualizar last_login:', updateError);
      }
      
      // 5. Crear sesión
      const session = {
        user: {
          ...userData,
          role: userRole
        },
        access_token: `token_${userData.id}_${Date.now()}`,
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        created_at: Date.now()
      };
      
      // 6. Guardar sesión en localStorage
      localStorage.setItem('vecino-activo-auth', JSON.stringify(session));
      
      console.log('✅ LOGIN EXITOSO - Usuario:', userData.name, 'Role:', userRole);
      return { user: session.user, session };
      
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  }
  
  async getCurrentUser() {
    try {
      const sessionData = localStorage.getItem('vecino-activo-auth');
      
      if (!sessionData) {
        console.log('ℹ️ No hay sesión guardada en localStorage');
        return null;
      }
      
      const session = JSON.parse(sessionData);
      
      // Verificar que la sesión tenga los datos necesarios
      if (!session.user || !session.expires_at) {
        console.warn('⚠️ Sesión inválida, limpiando...');
        localStorage.removeItem('vecino-activo-auth');
        return null;
      }
      
      // Verificar expiración
      if (Date.now() > session.expires_at) {
        console.log('⏰ Sesión expirada, limpiando...');
        localStorage.removeItem('vecino-activo-auth');
        return null;
      }
      
      console.log('✅ Sesión válida encontrada:', session.user.email);
      return session.user;
      
    } catch (error) {
      console.error('❌ Error al obtener usuario actual:', error);
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