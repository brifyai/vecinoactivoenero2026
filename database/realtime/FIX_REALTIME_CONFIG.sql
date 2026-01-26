-- =====================================================
-- ARREGLAR CONFIGURACIÓN REAL-TIME
-- =====================================================

-- 1. Verificar qué tablas están en real-time
SELECT 'Tablas en real-time:' as info;
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 2. Agregar tablas a real-time (una por una para evitar errores)
DO $$
BEGIN
    -- Agregar conversations
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        RAISE NOTICE 'Agregada conversations a real-time';
    ELSE
        RAISE NOTICE 'conversations ya está en real-time';
    END IF;
    
    -- Agregar messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE NOTICE 'Agregada messages a real-time';
    ELSE
        RAISE NOTICE 'messages ya está en real-time';
    END IF;
    
    -- Agregar posts
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
        RAISE NOTICE 'Agregada posts a real-time';
    ELSE
        RAISE NOTICE 'posts ya está en real-time';
    END IF;
    
    -- Agregar notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
        RAISE NOTICE 'Agregada notifications a real-time';
    ELSE
        RAISE NOTICE 'notifications ya está en real-time';
    END IF;
END $$;

-- 3. Verificar configuración final
SELECT 'Real-time configurado para:' as info;
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('conversations', 'messages', 'posts', 'notifications')
ORDER BY tablename;

-- 4. Verificar RLS en conversations
SELECT 'RLS en conversations:' as info, 
       CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as status
FROM pg_tables WHERE tablename = 'conversations';

-- 5. Verificar políticas
SELECT 'Políticas en conversations:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'conversations';