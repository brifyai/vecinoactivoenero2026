-- =====================================================
-- CONFIGURACIÓN ADAPTATIVA PARA TESTING REAL-TIME
-- Se adapta a la estructura existente de la base de datos
-- =====================================================

-- PASO 1: Crear tabla conversations (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);

-- PASO 2: Agregar columnas a messages (si no existen)
-- =====================================================
DO $$ 
BEGIN
    -- conversation_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id);
    END IF;
    
    -- message_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';
    END IF;
    
    -- edited
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'edited') THEN
        ALTER TABLE messages ADD COLUMN edited BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- edited_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'edited_at') THEN
        ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- PASO 3: Configurar RLS para conversations
-- =====================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permisivas para testing)
DROP POLICY IF EXISTS "conversations_all" ON conversations;
CREATE POLICY "conversations_all" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- PASO 4: Habilitar Real-time
-- =====================================================
DO $$
BEGIN
    -- Agregar conversations a real-time
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    END IF;
    
    -- Agregar messages a real-time (si no está)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
    
    -- Agregar posts a real-time (si no está)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    END IF;
    
    -- Agregar notifications a real-time (si no está)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;

-- PASO 5: Crear usuarios de prueba (adaptativo)
-- =====================================================
DO $$
DECLARE
    user_columns TEXT[];
    insert_query TEXT;
BEGIN
    -- Obtener columnas de la tabla users
    SELECT array_agg(column_name) INTO user_columns
    FROM information_schema.columns 
    WHERE table_name = 'users' 
      AND column_name IN ('email', 'password', 'name', 'username', 'neighborhood_id', 'neighborhood_name', 'verified', 'email_verified');
    
    -- Construir query de inserción dinámicamente
    insert_query := 'INSERT INTO users (';
    
    -- Agregar columnas que existen
    IF 'email' = ANY(user_columns) THEN
        insert_query := insert_query || 'email, ';
    END IF;
    
    IF 'password' = ANY(user_columns) THEN
        insert_query := insert_query || 'password, ';
    END IF;
    
    IF 'name' = ANY(user_columns) THEN
        insert_query := insert_query || 'name, ';
    END IF;
    
    IF 'username' = ANY(user_columns) THEN
        insert_query := insert_query || 'username, ';
    END IF;
    
    IF 'neighborhood_id' = ANY(user_columns) THEN
        insert_query := insert_query || 'neighborhood_id, ';
    END IF;
    
    IF 'neighborhood_name' = ANY(user_columns) THEN
        insert_query := insert_query || 'neighborhood_name, ';
    END IF;
    
    IF 'verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'verified, ';
    END IF;
    
    IF 'email_verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'email_verified, ';
    END IF;
    
    -- Remover última coma
    insert_query := rtrim(insert_query, ', ') || ') VALUES ';
    
    -- Agregar valores
    insert_query := insert_query || '(';
    
    IF 'email' = ANY(user_columns) THEN
        insert_query := insert_query || '''test1@test.com'', ';
    END IF;
    
    IF 'password' = ANY(user_columns) THEN
        insert_query := insert_query || '''$2b$10$test.hash'', ';
    END IF;
    
    IF 'name' = ANY(user_columns) THEN
        insert_query := insert_query || '''Test User 1'', ';
    END IF;
    
    IF 'username' = ANY(user_columns) THEN
        insert_query := insert_query || '''test1'', ';
    END IF;
    
    IF 'neighborhood_id' = ANY(user_columns) THEN
        insert_query := insert_query || '''1'', ';
    END IF;
    
    IF 'neighborhood_name' = ANY(user_columns) THEN
        insert_query := insert_query || '''Test Neighborhood'', ';
    END IF;
    
    IF 'verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'true, ';
    END IF;
    
    IF 'email_verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'true, ';
    END IF;
    
    -- Remover última coma y cerrar
    insert_query := rtrim(insert_query, ', ') || '), ';
    
    -- Repetir para usuario 2
    insert_query := insert_query || '(';
    
    IF 'email' = ANY(user_columns) THEN
        insert_query := insert_query || '''test2@test.com'', ';
    END IF;
    
    IF 'password' = ANY(user_columns) THEN
        insert_query := insert_query || '''$2b$10$test.hash'', ';
    END IF;
    
    IF 'name' = ANY(user_columns) THEN
        insert_query := insert_query || '''Test User 2'', ';
    END IF;
    
    IF 'username' = ANY(user_columns) THEN
        insert_query := insert_query || '''test2'', ';
    END IF;
    
    IF 'neighborhood_id' = ANY(user_columns) THEN
        insert_query := insert_query || '''1'', ';
    END IF;
    
    IF 'neighborhood_name' = ANY(user_columns) THEN
        insert_query := insert_query || '''Test Neighborhood'', ';
    END IF;
    
    IF 'verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'true, ';
    END IF;
    
    IF 'email_verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'true, ';
    END IF;
    
    -- Remover última coma y cerrar
    insert_query := rtrim(insert_query, ', ') || '), ';
    
    -- Repetir para usuario 3
    insert_query := insert_query || '(';
    
    IF 'email' = ANY(user_columns) THEN
        insert_query := insert_query || '''test3@test.com'', ';
    END IF;
    
    IF 'password' = ANY(user_columns) THEN
        insert_query := insert_query || '''$2b$10$test.hash'', ';
    END IF;
    
    IF 'name' = ANY(user_columns) THEN
        insert_query := insert_query || '''Test User 3'', ';
    END IF;
    
    IF 'username' = ANY(user_columns) THEN
        insert_query := insert_query || '''test3'', ';
    END IF;
    
    IF 'neighborhood_id' = ANY(user_columns) THEN
        insert_query := insert_query || '''1'', ';
    END IF;
    
    IF 'neighborhood_name' = ANY(user_columns) THEN
        insert_query := insert_query || '''Test Neighborhood'', ';
    END IF;
    
    IF 'verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'true, ';
    END IF;
    
    IF 'email_verified' = ANY(user_columns) THEN
        insert_query := insert_query || 'true, ';
    END IF;
    
    -- Remover última coma y cerrar
    insert_query := rtrim(insert_query, ', ') || ') ON CONFLICT (email) DO NOTHING';
    
    -- Ejecutar la query
    EXECUTE insert_query;
    
    RAISE NOTICE 'Usuarios de prueba creados con query: %', insert_query;
END $$;

-- PASO 6: Crear posts de prueba (adaptativo)
-- =====================================================
DO $$
DECLARE
    post_columns TEXT[];
    has_user_id BOOLEAN := false;
    has_author_id BOOLEAN := false;
    user_column TEXT;
BEGIN
    -- Verificar qué columna de usuario tiene la tabla posts
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') INTO has_user_id;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') INTO has_author_id;
    
    IF has_user_id THEN
        user_column := 'user_id';
    ELSIF has_author_id THEN
        user_column := 'author_id';
    ELSE
        RAISE NOTICE 'No se encontró columna de usuario en posts (user_id o author_id)';
        RETURN;
    END IF;
    
    -- Crear posts de prueba
    EXECUTE format('
        INSERT INTO posts (%I, content, type, created_at)
        SELECT u.id, ''Post de prueba desde '' || COALESCE(u.name, u.email) || '' - '' || NOW(), ''text'', NOW()
        FROM users u
        WHERE u.email LIKE ''test%%@test.com''
        LIMIT 3
        ON CONFLICT DO NOTHING
    ', user_column);
    
    RAISE NOTICE 'Posts de prueba creados usando columna: %', user_column;
END $$;

-- PASO 7: Verificación final
-- =====================================================
SELECT 'VERIFICACIÓN FINAL:' as section;

-- Verificar conversations
SELECT 
    'conversations' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as existe;

-- Verificar usuarios de prueba
SELECT 
    'usuarios_prueba' as tipo,
    COUNT(*) as cantidad
FROM users 
WHERE email LIKE 'test%@test.com';

-- Verificar posts de prueba
SELECT 
    'posts_prueba' as tipo,
    COUNT(*) as cantidad
FROM posts;

-- Verificar real-time
SELECT 
    'realtime_' || tablename as configuracion,
    'habilitado' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('conversations', 'messages', 'posts', 'notifications');

SELECT '🎉 CONFIGURACIÓN ADAPTATIVA COMPLETADA' as resultado;