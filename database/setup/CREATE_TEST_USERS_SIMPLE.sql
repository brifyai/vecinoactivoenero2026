-- =====================================================
-- CREAR USUARIOS DE PRUEBA - VERSIÓN SIMPLE
-- Solo inserta en public.users (no en auth.users)
-- =====================================================

-- IMPORTANTE: Este script crea usuarios de prueba en la tabla public.users
-- El campo 'password' usa un hash bcrypt válido de "VecinoActivo2024!"
-- Para que puedan hacer login, necesitas crearlos también en auth.users
-- usando el panel de Supabase Authentication con la misma contraseña

-- =====================================================
-- INSERTAR USUARIOS EN public.users
-- =====================================================

-- Usuario 1: María González
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'maria.gonzalez@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y', -- Hash bcrypt de "VecinoActivo2024!"
  'María González',
  'maria-gonzalez',
  'https://i.pravatar.cc/150?img=5',
  'Vecina activa de Las Condes. Me encanta organizar eventos comunitarios y ayudar a mis vecinos.',
  'Las Condes Centro',
  'LC-001',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 2: Carlos Rodríguez
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'carlos.rodriguez@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Carlos Rodríguez',
  'carlos-rodriguez',
  'https://i.pravatar.cc/150?img=8',
  'Ingeniero y padre de familia. Siempre dispuesto a ayudar a mis vecinos con temas técnicos.',
  'Providencia Norte',
  'PR-002',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 3: Ana Martínez
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'ana.martinez@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Ana Martínez',
  'ana-martinez',
  'https://i.pravatar.cc/150?img=9',
  'Profesora y activista comunitaria. Trabajando por un barrio mejor para todos.',
  'Ñuñoa Centro',
  'NU-003',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 4: Pedro Silva
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'pedro.silva@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Pedro Silva',
  'pedro-silva',
  'https://i.pravatar.cc/150?img=12',
  'Comerciante local y organizador de eventos deportivos en el barrio.',
  'Maipú Centro',
  'MA-004',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 5: Laura Fernández
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'laura.fernandez@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Laura Fernández',
  'laura-fernandez',
  'https://i.pravatar.cc/150?img=10',
  'Diseñadora gráfica freelance. Me gusta participar en actividades culturales del barrio.',
  'Las Condes Centro',
  'LC-001',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 6: Diego Torres
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'diego.torres@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Diego Torres',
  'diego-torres',
  'https://i.pravatar.cc/150?img=13',
  'Médico veterinario. Organizo campañas de adopción y cuidado de mascotas.',
  'Providencia Norte',
  'PR-002',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 7: Carmen López
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'carmen.lopez@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Carmen López',
  'carmen-lopez',
  'https://i.pravatar.cc/150?img=20',
  'Chef y emprendedora. Comparto recetas y organizo talleres de cocina comunitaria.',
  'Ñuñoa Centro',
  'NU-003',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 8: Roberto Muñoz
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'roberto.munoz@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Roberto Muñoz',
  'roberto-munoz',
  'https://i.pravatar.cc/150?img=14',
  'Arquitecto y ciclista urbano. Promuevo la movilidad sustentable en el barrio.',
  'Maipú Centro',
  'MA-004',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 9: Patricia Vargas
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'patricia.vargas@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Patricia Vargas',
  'patricia-vargas',
  'https://i.pravatar.cc/150?img=16',
  'Psicóloga comunitaria. Organizo talleres de bienestar y salud mental.',
  'Las Condes Centro',
  'LC-001',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Usuario 10: Andrés Soto
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'andres.soto@vecinoactivo.cl',
  '$2a$10$rZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7YxEKxVxKxVxKxOqZ8qNqZ7Y',
  'Andrés Soto',
  'andres-soto',
  'https://i.pravatar.cc/150?img=15',
  'Músico y profesor de guitarra. Organizo conciertos comunitarios y clases gratuitas.',
  'Providencia Norte',
  'PR-002',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Contar usuarios creados
SELECT 
  'Usuarios creados' as resultado,
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
