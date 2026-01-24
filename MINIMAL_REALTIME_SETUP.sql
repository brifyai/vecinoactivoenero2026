-- =====================================================
-- CONFIGURACIÓN MÍNIMA PARA TESTING REAL-TIME
-- Solo lo esencial, sin asumir estructura de columnas
-- =====================================================

-- PASO 1: Crear tabla conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id),
  participant2_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: Agregar columnas básicas a messages
-- =====================================================
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;

-- PASO 3: RLS básico (permisivo para testing)
-- =====================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_conversations" ON conversations;
CREATE POLICY "allow_all_conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- PASO 4: Habilitar Real-time
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- PASO 5: Crear usuarios de prueba (solo columnas básicas)
-- =====================================================
INSERT INTO users (email, name) VALUES 
('test1@test.com', 'Test User 1'),
('test2@test.com', 'Test User 2'),
('test3@test.com', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- PASO 6: Crear posts de prueba (adaptativo)
-- =====================================================
DO $$
DECLARE
    user_col TEXT;
    post_query TEXT;
BEGIN
    -- Detectar qué columna de usuario usar
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        user_col := 'user_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
        user_col := 'author_id';
    ELSE
        RAISE NOTICE 'No se encontró columna de usuario en posts';
        RETURN;
    END IF;
    
    -- Construir query básica solo con columnas que seguro existen
    post_query := format('
        INSERT INTO posts (%I, content, created_at)
        SELECT u.id, ''Post de prueba - '' || u.name, NOW()
        FROM users u
        WHERE u.email LIKE ''test%%@test.com''
        LIMIT 3
    ', user_col);
    
    -- Ejecutar
    EXECUTE post_query;
    
    RAISE NOTICE 'Posts creados usando columna: %', user_col;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creando posts: %. Continuando sin posts de prueba.', SQLERRM;
END $$;

-- PASO 7: Verificación final
-- =====================================================
SELECT 'CONFIGURACIÓN COMPLETADA' as status;

-- Verificar conversations
SELECT 
    'conversations_creada' as check_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as result;

-- Verificar usuarios de prueba
SELECT 
    'usuarios_prueba' as check_name,
    COUNT(*) as result
FROM users 
WHERE email LIKE 'test%@test.com';

-- Verificar real-time habilitado
SELECT 
    'realtime_' || tablename as check_name,
    'enabled' as result
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('conversations', 'messages', 'posts', 'notifications')
ORDER BY tablename;

-- Mostrar estructura real de posts para referencia
SELECT 'ESTRUCTURA_POSTS:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

SELECT '🎉 SETUP MÍNIMO COMPLETADO' as final_status;