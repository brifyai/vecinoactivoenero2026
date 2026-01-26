-- =====================================================
-- SETUP ULTRA SIMPLE - SOLO LO ESENCIAL
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

-- 3. RLS permisivo
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all" ON conversations FOR ALL USING (true);

-- 4. Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 5. Usuarios de prueba
INSERT INTO users (email, name) VALUES 
('test1@test.com', 'Test User 1'),
('test2@test.com', 'Test User 2'),
('test3@test.com', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- 6. Verificar
SELECT 'Setup completado' as status, COUNT(*) as usuarios_prueba 
FROM users WHERE email LIKE 'test%@test.com';