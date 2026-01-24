-- =====================================================
-- FIX SIMPLE PARA TESTING REAL-TIME
-- =====================================================

-- 1. Crear conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id),
  participant2_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar columnas a messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;

-- 3. RLS básico
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_conversations" ON conversations FOR ALL USING (true);

-- 4. Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 5. Usuarios de prueba (solo email y name que seguro existen)
INSERT INTO users (email, name) VALUES 
('test1@test.com', 'Test User 1'),
('test2@test.com', 'Test User 2'),
('test3@test.com', 'Test User 3')
ON CONFLICT (email) DO NOTHING;

-- 6. Verificar
SELECT 'Setup completado' as status, COUNT(*) as usuarios_prueba 
FROM users WHERE email LIKE 'test%@test.com';