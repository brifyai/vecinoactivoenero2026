import { createClient } from '@supabase/supabase-js';

// Función para obtener configuración desde múltiples fuentes
const getConfig = () => {
  // Prioridad de fuentes:
  // 1. Variables de entorno de build (process.env)
  // 2. Variables inyectadas en window.ENV
  // 3. Valores hardcodeados como fallback para producción
  
  let supabaseUrl = 
    process.env.REACT_APP_SUPABASE_URL || 
    (typeof window !== 'undefined' && window.ENV?.REACT_APP_SUPABASE_URL) ||
    'https://supabase.vecinoactivo.cl';
    
  let supabaseAnonKey = 
    process.env.REACT_APP_SUPABASE_ANON_KEY || 
    (typeof window !== 'undefined' && window.ENV?.REACT_APP_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

  // Limpiar posibles espacios o caracteres extraños
  supabaseUrl = supabaseUrl?.trim();
  supabaseAnonKey = supabaseAnonKey?.trim();

  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getConfig();

// Validación con logging apropiado para cada entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL o Anon Key no configurados');
  console.warn('Asegúrate de tener las variables de entorno:');
  console.warn('- REACT_APP_SUPABASE_URL');
  console.warn('- REACT_APP_SUPABASE_ANON_KEY');
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('Variables encontradas:', {
      URL: process.env.REACT_APP_SUPABASE_URL ? '✅' : '❌',
      KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅' : '❌',
      NODE_ENV: process.env.NODE_ENV
    });
  }
} else {
  console.log('✅ Supabase configurado correctamente');
}

// Crear cliente de Supabase con configuración robusta
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'vecino-activo-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'vecino-activo-web'
    }
  }
});

// Helper para verificar conexión con diagnóstico detallado
export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Verificando conexión a Supabase...');
    console.log('URL:', supabaseUrl);
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error.message);
    console.error('Detalles del error:', error);
    return false;
  }
};

// Helper para obtener usuario actual con manejo de errores
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    return null;
  }
};

// Helper para obtener sesión actual con manejo de errores
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error al obtener sesión:', error.message);
    return null;
  }
};

// Función de diagnóstico completo
export const diagnoseSupabase = async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE SUPABASE');
  console.log('=====================================');
  
  // 1. Verificar configuración
  console.log('1. Configuración:');
  console.log('   URL:', supabaseUrl);
  console.log('   Key:', supabaseAnonKey ? 'Configurada ✅' : 'Faltante ❌');
  console.log('   Fuente URL:', process.env.REACT_APP_SUPABASE_URL ? 'Build env' : 
    (typeof window !== 'undefined' && window.ENV?.REACT_APP_SUPABASE_URL ? 'Runtime env' : 'Default'));
  
  // 2. Test de conectividad
  console.log('2. Test de conectividad:');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('   Error de conectividad:', error.message);
  }
  
  // 3. Test de base de datos
  console.log('3. Test de base de datos:');
  const connectionResult = await checkSupabaseConnection();
  console.log('   Resultado:', connectionResult ? 'Exitoso ✅' : 'Fallido ❌');
  
  // 4. Test de autenticación
  console.log('4. Test de autenticación:');
  try {
    const session = await getCurrentSession();
    console.log('   Sesión actual:', session ? 'Activa ✅' : 'No activa ⚠️');
  } catch (error) {
    console.error('   Error de autenticación:', error.message);
  }
  
  console.log('=====================================');
  return connectionResult;
};

// Auto-diagnóstico solo si hay problemas de configuración
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  setTimeout(() => {
    console.warn('🔍 Ejecutando diagnóstico debido a problemas de configuración...');
    diagnoseSupabase();
  }, 1000);
}

export default supabase;
