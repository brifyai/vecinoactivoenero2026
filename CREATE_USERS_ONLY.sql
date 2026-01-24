-- =====================================================
-- CREAR SOLO USUARIOS DE PRUEBA
-- =====================================================

-- Crear usuarios de prueba
INSERT INTO users (email, password, name) VALUES 
('test1@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 1'),
('test2@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 2'),
('test3@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- Verificar
SELECT 'Usuarios creados:' as info, COUNT(*) as cantidad
FROM users WHERE email LIKE 'test%@test.com';

SELECT email, name FROM users WHERE email LIKE 'test%@test.com';