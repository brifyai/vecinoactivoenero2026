-- ============================================
-- CREAR USUARIO ADMIN SIMPLE - SUPABASE
-- ============================================

-- Crear tabla users básica si no existe
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE,
  avatar TEXT,
  phone VARCHAR(50),
  bio TEXT,
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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