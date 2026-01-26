-- =====================================================
-- SETUP DEFINITIVO PARA TESTING REAL-TIME
-- =====================================================

-- 1. Crear conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID,
  participant2_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar columnas a messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;

-- 3. RLS para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON conversations;
CREATE POLICY "allow_all" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- 4. Habilitar real-time
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 5. Crear usuarios de prueba CON PASSWORD
INSERT INTO users (email, password, name) VALUES 
('test1@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 1'),
('test2@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 2'),
('test3@test.com', '$2b$10$test.hash.for.testing.only', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- 6. Verificación final
SELECT 'SETUP COMPLETADO EXITOSAMENTE' as status;

SELECT 
    'conversations_existe' as check_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as result;

SELECT 
    'usuarios_prueba_creados' as check_name,
    COUNT(*) as result
FROM users 
WHERE email LIKE 'test%@test.com';

SELECT 
    'realtime_habilitado_para' as check_name,
    string_agg(tablename, ', ') as result
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('conversations', 'messages', 'posts', 'notifications');

SELECT '🎉 LISTO PARA TESTING REAL-TIME' as final_message;