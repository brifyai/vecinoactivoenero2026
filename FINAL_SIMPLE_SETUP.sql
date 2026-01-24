-- =====================================================
-- SETUP FINAL SIMPLE - SIN ERRORES DE SINTAXIS
-- =====================================================

-- 1. Crear conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID,
  participant2_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar conversation_id a messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;

-- 3. RLS para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar política si existe y crear nueva
DROP POLICY IF EXISTS "allow_all" ON conversations;
CREATE POLICY "allow_all" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- 5. Habilitar real-time (con manejo de errores)
DO $$
BEGIN
    -- conversations
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Ya existe, continuar
            NULL;
    END;
    
    -- messages
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    -- posts
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    -- notifications
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
END $$;

-- 6. Crear usuarios de prueba
INSERT INTO users (email, name) VALUES 
('test1@test.com', 'Test User 1'),
('test2@test.com', 'Test User 2'),
('test3@test.com', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- 7. Verificación final
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

SELECT '🎉 LISTO PARA TESTING' as final_message;