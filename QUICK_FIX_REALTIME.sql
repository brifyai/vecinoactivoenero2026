-- =====================================================
-- FIX RÁPIDO PARA TESTING REAL-TIME
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Crear tabla conversations (mínima)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar conversation_id a messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;

-- 3. Habilitar RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 4. Políticas básicas
CREATE POLICY IF NOT EXISTS "conversations_select" ON conversations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);

-- 5. Habilitar real-time
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 6. Crear usuarios de prueba
INSERT INTO users (email, password, name, username, neighborhood_id, verified, email_verified) VALUES 
('test1@test.com', 'hash', 'Test User 1', 'test1', '1', true, true),
('test2@test.com', 'hash', 'Test User 2', 'test2', '1', true, true),
('test3@test.com', 'hash', 'Test User 3', 'test3', '1', true, true)
ON CONFLICT (email) DO NOTHING;

-- 7. Verificar
SELECT 'Setup completado' as status, NOW() as timestamp;