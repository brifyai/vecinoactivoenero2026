// =====================================================
// DEBUG LOGIN SIMPLE
// Script para probar login directamente
// =====================================================

const { supabase } = require('./src/config/supabase');

async function testLogin() {
  console.log('🔍 TESTING LOGIN DIRECTO...\n');
  
  try {
    // 1. Verificar conexión a Supabase
    console.log('1. Verificando conexión a Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('email, name')
      .eq('email', 'admin@vecinoactivo.cl')
      .single();
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message);
      return;
    }
    
    if (!data) {
      console.error('❌ Usuario admin no encontrado en base de datos');
      return;
    }
    
    console.log('✅ Usuario encontrado:', data);
    
    // 2. Probar custom auth service
    console.log('\n2. Probando custom auth service...');
    const customAuthService = require('./src/services/customAuthService').default;
    
    const result = await customAuthService.login('admin@vecinoactivo.cl', 'admin123');
    
    if (result.user) {
      console.log('✅ Login exitoso:', result.user.name);
      console.log('✅ Sesión creada correctamente');
    } else {
      console.error('❌ Login falló');
    }
    
  } catch (error) {
    console.error('💥 ERROR:', error.message);
  }
}

testLogin();