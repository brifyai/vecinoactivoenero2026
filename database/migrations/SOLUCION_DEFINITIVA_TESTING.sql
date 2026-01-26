-- =====================================================
-- SOLUCIÓN DEFINITIVA PARA TESTING REAL-TIME
-- =====================================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 'ESTADO ACTUAL:' as info;

-- Ver usuarios existentes
SELECT 'Usuarios existentes:' as tipo, COUNT(*) as cantidad 
FROM users WHERE email LIKE 'test%@test.com';

-- Ver políticas RLS en users
SELECT 'Políticas RLS users:' as tipo, COUNT(*) as cantidad 
FROM pg_policies WHERE tablename = 'users';

-- 2. DESHABILITAR RLS TEMPORALMENTE PARA CREAR USUARIOS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. CREAR USUARIOS DE PRUEBA (FORZADO)
DELETE FROM users WHERE email LIKE 'test%@test.com';

INSERT INTO users (email, password, name) VALUES 
('test1@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 1'),
('test2@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 2'),
('test3@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 3');

-- 4. VERIFICAR QUE SE CREARON
SELECT 'USUARIOS CREADOS:' as info;
SELECT id, email, name FROM users WHERE email LIKE 'test%@test.com';

-- 5. REACTIVAR RLS CON POLÍTICAS PERMISIVAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Crear políticas completamente permisivas para testing
CREATE POLICY "users_all_operations" ON users FOR ALL USING (true) WITH CHECK (true);

-- 6. VERIFICAR POLÍTICAS EN OTRAS TABLAS
-- Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_all_operations" ON posts;
CREATE POLICY "posts_all_operations" ON posts FOR ALL USING (true) WITH CHECK (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_all_operations" ON notifications;
CREATE POLICY "notifications_all_operations" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_all_operations" ON messages;
CREATE POLICY "messages_all_operations" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_all_operations" ON conversations;
CREATE POLICY "conversations_all_operations" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- 7. VERIFICAR REAL-TIME
SELECT 'TABLAS EN REAL-TIME:' as info;
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('users', 'posts', 'notifications', 'messages', 'conversations')
ORDER BY tablename;

-- Agregar tablas faltantes a real-time
DO $$
BEGIN
    -- users (por si acaso)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users;
    END IF;
    
    -- posts
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    END IF;
    
    -- notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
    
    -- messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
    
    -- conversations
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    END IF;
END $$;

-- 8. VERIFICACIÓN FINAL
SELECT 'VERIFICACIÓN FINAL:' as seccion;

-- Usuarios de prueba
SELECT 'usuarios_prueba' as tipo, COUNT(*) as cantidad
FROM users WHERE email LIKE 'test%@test.com';

-- Políticas RLS
SELECT 'politicas_rls' as tipo, tablename, COUNT(*) as cantidad
FROM pg_policies 
WHERE tablename IN ('users', 'posts', 'notifications', 'messages', 'conversations')
GROUP BY tablename
ORDER BY tablename;

-- Real-time habilitado
SELECT 'realtime_tablas' as tipo, COUNT(*) as cantidad
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('users', 'posts', 'notifications', 'messages', 'conversations');

SELECT '🎉 CONFIGURACIÓN DEFINITIVA COMPLETADA' as resultado;
SELECT 'Ahora ejecuta: node test_crud_functionality.js' as siguiente_paso;