-- =====================================================
-- CONFIGURAR POLÍTICAS RLS PARA REAL-TIME
-- =====================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para POSTS (permisivas para testing)
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
CREATE POLICY "posts_select_policy" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
CREATE POLICY "posts_insert_policy" ON posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "posts_update_policy" ON posts;
CREATE POLICY "posts_update_policy" ON posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "posts_delete_policy" ON posts;
CREATE POLICY "posts_delete_policy" ON posts FOR DELETE USING (true);

-- 3. Políticas para NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;
CREATE POLICY "notifications_delete_policy" ON notifications FOR DELETE USING (true);

-- 4. Políticas para MESSAGES
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
CREATE POLICY "messages_select_policy" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
CREATE POLICY "messages_insert_policy" ON messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "messages_update_policy" ON messages;
CREATE POLICY "messages_update_policy" ON messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "messages_delete_policy" ON messages;
CREATE POLICY "messages_delete_policy" ON messages FOR DELETE USING (true);

-- 5. Políticas para CONVERSATIONS
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
CREATE POLICY "conversations_select_policy" ON conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
CREATE POLICY "conversations_insert_policy" ON conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
CREATE POLICY "conversations_update_policy" ON conversations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "conversations_delete_policy" ON conversations;
CREATE POLICY "conversations_delete_policy" ON conversations FOR DELETE USING (true);

-- 6. Verificar que las políticas se crearon
SELECT 'POLÍTICAS CREADAS:' as info;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('posts', 'notifications', 'messages', 'conversations')
ORDER BY tablename, policyname;

SELECT '🎉 POLÍTICAS RLS CONFIGURADAS' as status;