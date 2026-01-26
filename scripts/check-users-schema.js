#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://supabase.vecinoactivo.cl';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Verificando esquema de tabla users...\n');
  
  // Intentar obtener un usuario para ver las columnas
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Columnas disponibles en la tabla users:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\n📋 Ejemplo de registro:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️ La tabla users está vacía');
  }
}

checkSchema();
