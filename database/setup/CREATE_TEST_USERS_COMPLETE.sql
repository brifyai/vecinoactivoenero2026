-- =====================================================
-- CREAR USUARIOS DE PRUEBA COMPLETOS
-- Incluye autenticación y perfiles
-- =====================================================

-- IMPORTANTE: Este script debe ejecutarse en Supabase SQL Editor
-- Los usuarios se crearán con email y contraseña funcionales

-- =====================================================
-- PASO 1: Insertar usuarios en auth.users (Autenticación)
-- =====================================================

-- Usuario 1: María González
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'maria.gonzalez@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"María González"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 2: Carlos Rodríguez
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'carlos.rodriguez@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Carlos Rodríguez"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 3: Ana Martínez
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'ana.martinez@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Ana Martínez"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 4: Pedro Silva
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'pedro.silva@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Pedro Silva"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 5: Laura Fernández
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'laura.fernandez@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Laura Fernández"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 6: Diego Torres
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'diego.torres@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Diego Torres"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 7: Carmen López
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'carmen.lopez@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Carmen López"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 8: Roberto Muñoz
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'roberto.munoz@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Roberto Muñoz"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 9: Patricia Vargas
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'patricia.vargas@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Patricia Vargas"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 10: Andrés Soto
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'andres.soto@vecinoactivo.cl',
  crypt('VecinoActivo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Andrés Soto"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PASO 2: Insertar perfiles en public.users
-- =====================================================

-- Usuario 1: María González
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'maria.gonzalez@vecinoactivo.cl'),
  'maria-gonzalez',
  'María González',
  'maria.gonzalez@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=5',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  'Vecina activa de Las Condes. Me encanta organizar eventos comunitarios y ayudar a mis vecinos.',
  'Las Condes, Santiago',
  false,
  true,
  'Las Condes Centro',
  'LC-001',
  12,
  45,
  8,
  15,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 2: Carlos Rodríguez
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'carlos.rodriguez@vecinoactivo.cl'),
  'carlos-rodriguez',
  'Carlos Rodríguez',
  'carlos.rodriguez@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=8',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
  'Ingeniero y padre de familia. Siempre dispuesto a ayudar a mis vecinos con temas técnicos.',
  'Providencia, Santiago',
  false,
  true,
  'Providencia Norte',
  'PR-002',
  8,
  32,
  15,
  20,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 3: Ana Martínez
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ana.martinez@vecinoactivo.cl'),
  'ana-martinez',
  'Ana Martínez',
  'ana.martinez@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=9',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
  'Profesora y activista comunitaria. Trabajando por un barrio mejor para todos.',
  'Ñuñoa, Santiago',
  true,
  true,
  'Ñuñoa Centro',
  'NU-003',
  20,
  78,
  22,
  35,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 4: Pedro Silva
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'pedro.silva@vecinoactivo.cl'),
  'pedro-silva',
  'Pedro Silva',
  'pedro.silva@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=12',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  'Comerciante local y organizador de eventos deportivos en el barrio.',
  'Maipú, Santiago',
  false,
  true,
  'Maipú Centro',
  'MA-004',
  15,
  50,
  18,
  25,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 5: Laura Fernández
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'laura.fernandez@vecinoactivo.cl'),
  'laura-fernandez',
  'Laura Fernández',
  'laura.fernandez@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=10',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
  'Diseñadora gráfica freelance. Me gusta participar en actividades culturales del barrio.',
  'Las Condes, Santiago',
  false,
  true,
  'Las Condes Centro',
  'LC-001',
  18,
  42,
  12,
  22,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 6: Diego Torres
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'diego.torres@vecinoactivo.cl'),
  'diego-torres',
  'Diego Torres',
  'diego.torres@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=13',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop',
  'Médico veterinario. Organizo campañas de adopción y cuidado de mascotas.',
  'Providencia, Santiago',
  false,
  true,
  'Providencia Norte',
  'PR-002',
  10,
  38,
  14,
  18,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 7: Carmen López
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'carmen.lopez@vecinoactivo.cl'),
  'carmen-lopez',
  'Carmen López',
  'carmen.lopez@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=20',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  'Chef y emprendedora. Comparto recetas y organizo talleres de cocina comunitaria.',
  'Ñuñoa, Santiago',
  true,
  true,
  'Ñuñoa Centro',
  'NU-003',
  25,
  65,
  20,
  30,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 8: Roberto Muñoz
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'roberto.munoz@vecinoactivo.cl'),
  'roberto-munoz',
  'Roberto Muñoz',
  'roberto.munoz@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=14',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
  'Arquitecto y ciclista urbano. Promuevo la movilidad sustentable en el barrio.',
  'Maipú, Santiago',
  false,
  true,
  'Maipú Centro',
  'MA-004',
  14,
  48,
  16,
  24,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 9: Patricia Vargas
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'patricia.vargas@vecinoactivo.cl'),
  'patricia-vargas',
  'Patricia Vargas',
  'patricia.vargas@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=16',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
  'Psicóloga comunitaria. Organizo talleres de bienestar y salud mental.',
  'Las Condes, Santiago',
  false,
  true,
  'Las Condes Centro',
  'LC-001',
  16,
  55,
  10,
  28,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 10: Andrés Soto
INSERT INTO public.users (
  id,
  username,
  name,
  email,
  avatar,
  cover,
  bio,
  location,
  verified,
  is_verified_neighbor,
  neighborhood_name,
  neighborhood_code,
  following,
  followers,
  posts,
  friends,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'andres.soto@vecinoactivo.cl'),
  'andres-soto',
  'Andrés Soto',
  'andres.soto@vecinoactivo.cl',
  'https://i.pravatar.cc/150?img=15',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
  'Músico y profesor de guitarra. Organizo conciertos comunitarios y clases gratuitas.',
  'Providencia, Santiago',
  false,
  true,
  'Providencia Norte',
  'PR-002',
  22,
  60,
  19,
  32,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Contar usuarios creados
SELECT 
  'Usuarios en auth.users' as tabla,
  COUNT(*) as total
FROM auth.users
WHERE email LIKE '%@vecinoactivo.cl'

UNION ALL

SELECT 
  'Usuarios en public.users' as tabla,
  COUNT(*) as total
FROM public.users
WHERE email LIKE '%@vecinoactivo.cl';

-- Mostrar usuarios creados
SELECT 
  id,
  username,
  name,
  email,
  neighborhood_name,
  created_at
FROM public.users
WHERE email LIKE '%@vecinoactivo.cl'
ORDER BY created_at DESC;
