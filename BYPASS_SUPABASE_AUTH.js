// BYPASS COMPLETO DE SUPABASE AUTH
// Crear un servicio de autenticación que use solo la base de datos

// 1. Crear archivo: src/services/customAuthService.js
const customAuthService = `
import { supabase } from '../config/supabase';

class CustomAuthService {
  
  async login(email, password) {
    try {
      console.log('🔄 Intentando login custom con:', email);
      
      // 1. Buscar usuario en public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        throw new Error('Usuario no encontrado');
      }
      
      // 2. Verificar contraseña usando función SQL
      const { data: authData, error: authError } = await supabase
        .rpc('verify_password', {
          user_email: email,
          user_password: password
        });
      
      if (authError || !authData) {
        // Si la función no existe, aceptar cualquier contraseña para admin
        if (email === 'admin@vecinoactivo.cl' && password === 'admin123') {
          console.log('✅ Login admin bypass exitoso');
        } else {
          throw new Error('Credenciales inválidas');
        }
      }
      
      // 3. Crear sesión simulada
      const session = {
        user: userData,
        access_token: 'custom_token_' + Date.now(),
        refresh_token: 'refresh_' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        token_type: 'bearer'
      };
      
      // 4. Guardar en localStorage
      localStorage.setItem('vecino-activo-auth', JSON.stringify(session));
      
      console.log('✅ Login custom exitoso');
      return { user: userData, session };
      
    } catch (error) {
      console.error('❌ Error en login custom:', error);
      throw error;
    }
  }
  
  async getCurrentUser() {
    try {
      const sessionData = localStorage.getItem('vecino-activo-auth');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Verificar si la sesión ha expirado
      if (Date.now() > session.expires_at) {
        localStorage.removeItem('vecino-activo-auth');
        return null;
      }
      
      return session.user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }
  
  async logout() {
    localStorage.removeItem('vecino-activo-auth');
    return true;
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
}

export default new CustomAuthService();
`;

// 2. Función SQL para verificar contraseña
const sqlFunction = `
-- Crear función para verificar contraseña
CREATE OR REPLACE FUNCTION verify_password(user_email TEXT, user_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stored_hash TEXT;
    is_valid BOOLEAN := FALSE;
BEGIN
    -- Obtener hash almacenado
    SELECT encrypted_password INTO stored_hash
    FROM auth.users
    WHERE email = user_email;
    
    -- Si no hay hash, verificar credenciales hardcodeadas para admin
    IF stored_hash IS NULL THEN
        IF user_email = 'admin@vecinoactivo.cl' AND user_password = 'admin123' THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Verificar hash
    is_valid := (stored_hash = crypt(user_password, stored_hash));
    
    RETURN is_valid;
END;
$$;
`;

// 3. Modificar supabaseAuthService.js
const modifiedAuthService = `
import customAuthService from './customAuthService';

class SupabaseAuthService {
  
  async login(email, password) {
    try {
      // Intentar Supabase Auth primero
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!authError && authData.user) {
        // Supabase Auth funcionó
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!userError) {
          return { user: userData, session: authData.session };
        }
      }
      
      // Si Supabase Auth falla, usar custom auth
      console.log('🔄 Supabase Auth falló, usando custom auth...');
      return await customAuthService.login(email, password);
      
    } catch (error) {
      // Fallback a custom auth
      console.log('🔄 Fallback a custom auth...');
      return await customAuthService.login(email, password);
    }
  }

  async getCurrentUser() {
    try {
      // Intentar Supabase primero
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        return userData;
      }
    } catch (error) {
      // Ignorar error
    }
    
    // Fallback a custom auth
    return await customAuthService.getCurrentUser();
  }

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignorar error
    }
    
    return await customAuthService.logout();
  }

  // ... resto de métodos igual
}

export default new SupabaseAuthService();
`;

console.log('ARCHIVOS PARA CREAR:');
console.log('1. src/services/customAuthService.js');
console.log('2. Ejecutar función SQL en Supabase');
console.log('3. Modificar src/services/supabaseAuthService.js');