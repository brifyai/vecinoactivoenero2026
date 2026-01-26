#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://supabase.vecinoactivo.cl';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUsers() {
  console.log('🔍 Verificando usuarios de prueba...\n');
  
  const testEmails = [
    'admin@vecinoactivo.cl',
    'vecino@vecinoactivo.cl',
    'maria@vecinoactivo.cl',
    'carlos@vecinoactivo.cl'
  ];
  
  for (const email of testEmails) {
    const { data, error } = await supabase
      .from('users')
      .select('email, name, username, password, verified, email_verified')
      .eq('email', email)
      .single();
    
    if (error) {
      console.log(`❌ ${email}: NO ENCONTRADO`);
    } else {
      const passwordType = data.password?.startsWith('$2') ? 'HASHEADA (bcrypt)' : 'TEXTO PLANO';
      console.log(`✅ ${email}`);
      console.log(`   Nombre: ${data.name}`);
      console.log(`   Username: ${data.username}`);
      console.log(`   Password: ${passwordType}`);
      console.log(`   Verificado: ${data.verified ? 'Sí' : 'No'}`);
      console.log('');
    }
  }
}

verifyUsers();
