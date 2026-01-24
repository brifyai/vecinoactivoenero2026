-- =====================================================
-- ARREGLAR POLÍTICAS RLS PARA TABLA USERS
-- =====================================================

-- 1. Verificar estado actual de RLS en users
SELECT 'ESTADO ACTUAL RLS USERS:' as info;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- 2. Ver políticas existentes en users
SELECT 'POLÍTICAS EXISTENTES EN USERS:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Crear políticas permisivas para testing
-- (En producción deberías usar políticas más restrictivas)

-- Política para SELECT (leer usuarios)
DROP POLICY IF EXISTS "users_select_policy" ON users;
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);

-- Política para INSERT (crear usuarios)
DROP POLICY IF EXISTS "users_insert_policy" ON users;
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);

-- Política para UPDATE (actualizar usuarios)
DROP POLICY IF EXISTS "users_update_policy" ON users;
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- Política para DELETE (eliminar usuarios)
DROP POLICY IF EXISTS "users_delete_policy" ON users;
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);

-- 4. Crear usuarios de prueba directamente (bypass RLS como superuser)
INSERT INTO users (email, password, name) VALUES 
('test1@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 1'),
('test2@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 2'),
('test3@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- 5. Verificar que se crearon los usuarios
SELECT 'USUARIOS DE PRUEBA CREADOS:' as info;
SELECT id, email, name FROM users WHERE email LIKE 'test%@test.com';

-- 6. Verificar nuevas políticas
SELECT 'NUEVAS POLÍTICAS EN USERS:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

SELECT '🎉 POLÍTICAS RLS USERS ARREGLADAS' as status;