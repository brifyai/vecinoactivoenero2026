-- ============================================
-- INSERTAR USUARIO ADMIN - SOLO INSERTS
-- ============================================

-- Crear usuario admin
INSERT INTO users (
  email, 
  password, 
  name, 
  username, 
  neighborhood_name,
  verified,
  email_verified
) VALUES (
  'admin@vecinoactivo.cl',
  '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu', -- Password: 123456 (hash simulado)
  'Administrador',
  'admin',
  'Centro',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Crear usuario de prueba adicional
INSERT INTO users (
  email, 
  password, 
  name, 
  username, 
  neighborhood_name,
  verified,
  email_verified
) VALUES (
  'usuario@test.com',
  '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu', -- Password: 123456 (hash simulado)
  'Usuario Test',
  'usuario_test',
  'Las Condes',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Verificar usuarios creados
SELECT id, email, name, username, neighborhood_name, verified 
FROM users 
WHERE email IN ('admin@vecinoactivo.cl', 'usuario@test.com');