#!/usr/bin/env node

/**
 * Script para configurar usuarios de autenticación en Supabase
 * Ejecutar: node scripts/setup-auth-users.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://supabase.vecinoactivo.cl';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuthUsers() {
  console.log('🚀 Configurando usuarios de autenticación...\n');
  
  const users = [
    {
      email: 'admin@vecinoactivo.cl',
      password: 'admin123',
      name: 'Administrador Principal',
      username: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff',
      verified: true,
      email_verified: true
    },
    {
      email: 'vecino@vecinoactivo.cl',
      password: 'vecino123',
      name: 'Juan Pérez',
      username: 'juanperez',
      avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=10b981&color=fff',
      bio: 'Vecino activo de la comunidad',
      verified: true,
      email_verified: true
    },
    {
      email: 'maria@vecinoactivo.cl',
      password: 'maria123',
      name: 'María González',
      username: 'mariagonzalez',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=f59e0b&color=fff',
      bio: 'Me encanta participar en actividades comunitarias',
      verified: true,
      email_verified: true
    },
    {
      email: 'carlos@vecinoactivo.cl',
      password: 'carlos123',
      name: 'Carlos Rodríguez',
      username: 'carlosrodriguez',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=3b82f6&color=fff',
      bio: 'Organizador de eventos vecinales',
      verified: true,
      email_verified: true
    }
  ];

  for (const user of users) {
    try {
      console.log(`📝 Procesando: ${user.email}...`);
      
      // Verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        // Actualizar usuario existente
        const { error: updateError } = await supabase
          .from('users')
          .update({
            password: user.password,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio || null,
            verified: user.verified,
            email_verified: user.email_verified,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);

        if (updateError) {
          console.error(`   ❌ Error actualizando ${user.email}:`, updateError.message);
        } else {
          console.log(`   ✅ Usuario actualizado: ${user.email}`);
        }
      } else {
        // Crear nuevo usuario
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            email: user.email,
            password: user.password,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio || null,
            verified: user.verified,
            email_verified: user.email_verified,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error(`   ❌ Error creando ${user.email}:`, insertError.message);
        } else {
          console.log(`   ✅ Usuario creado: ${user.email}`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error procesando ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Configuración completada!\n');
  console.log('🔐 CREDENCIALES DISPONIBLES:\n');
  console.log('👑 ADMINISTRADOR (Unidad Vecinal):');
  console.log('   Email: admin@vecinoactivo.cl');
  console.log('   Password: admin123\n');
  console.log('👤 VECINOS:');
  console.log('   Email: vecino@vecinoactivo.cl | Password: vecino123');
  console.log('   Email: maria@vecinoactivo.cl | Password: maria123');
  console.log('   Email: carlos@vecinoactivo.cl | Password: carlos123\n');
  console.log('📋 Accede a: http://localhost:3000/iniciar-sesion\n');
}

// Ejecutar
setupAuthUsers()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });
