-- =====================================================
-- CONFIGURACIÓN COMPLETA PARA TESTING REAL-TIME
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Crear tabla conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar conversaciones duplicadas
  UNIQUE(participant1_id, participant2_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- PASO 2: Modificar tabla messages
-- =====================================================

-- Agregar columna conversation_id a messages (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Agregar columnas adicionales a messages
DO $$ 
BEGIN
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

-- Índices adicionales para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- PASO 3: Funciones auxiliares
-- =====================================================

-- Función para crear o obtener conversación
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    participant1 UUID;
    participant2 UUID;
BEGIN
    -- Asegurar orden consistente (menor ID primero)
    IF user1_id < user2_id THEN
        participant1 := user1_id;
        participant2 := user2_id;
    ELSE
        participant1 := user2_id;
        participant2 := user1_id;
    END IF;
    
    -- Buscar conversación existente
    SELECT id INTO conversation_id
    FROM conversations
    WHERE participant1_id = participant1 AND participant2_id = participant2;
    
    -- Si no existe, crear nueva
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (participant1_id, participant2_id)
        VALUES (participant1, participant2)
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar timestamp de conversación
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- PASO 4: Configurar RLS
-- =====================================================

-- Habilitar RLS en conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

-- Actualizar políticas RLS para messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- PASO 5: Habilitar Real-time
-- =====================================================

-- Habilitar real-time para conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verificar que messages ya esté en real-time
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;

-- PASO 6: Crear usuarios de prueba
-- =====================================================

-- Crear usuarios de prueba (solo si no existen)
INSERT INTO users (
    email, 
    password, 
    name, 
    username, 
    neighborhood_id, 
    neighborhood_name,
    verified,
    email_verified
) VALUES 
(
    'test1@vecinoactivo.cl',
    '$2b$10$example.hash.for.testing.purposes.only',
    'Usuario Test 1',
    'test_user_1',
    '1',
    'Las Condes',
    true,
    true
),
(
    'test2@vecinoactivo.cl',
    '$2b$10$example.hash.for.testing.purposes.only',
    'Usuario Test 2', 
    'test_user_2',
    '1',
    'Las Condes',
    true,
    true
),
(
    'test3@vecinoactivo.cl',
    '$2b$10$example.hash.for.testing.purposes.only',
    'Usuario Test 3',
    'test_user_3', 
    '2',
    'Providencia',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Crear amistades de prueba
WITH test_users AS (
    SELECT id, email FROM users WHERE email LIKE '%test%@vecinoactivo.cl' ORDER BY email
)
INSERT INTO friendships (user_id, friend_id, status, accepted_at)
SELECT 
    u1.id,
    u2.id,
    'accepted',
    NOW()
FROM test_users u1
CROSS JOIN test_users u2
WHERE u1.id != u2.id
ON CONFLICT (user_id, friend_id) DO NOTHING;

-- Crear posts de prueba
INSERT INTO posts (
    user_id,
    content,
    type,
    neighborhood_id
)
SELECT 
    u.id,
    'Post de prueba desde ' || u.name || ' - ' || NOW(),
    'text',
    u.neighborhood_id::INTEGER
FROM users u
WHERE u.email LIKE '%test%@vecinoactivo.cl'
ON CONFLICT DO NOTHING;

-- PASO 7: Verificación final
-- =====================================================

-- Verificar tablas creadas
SELECT 
    'conversations' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as existe;

-- Verificar columnas agregadas
SELECT 
    'conversation_id en messages' as columna,
    EXISTS(SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'messages' AND column_name = 'conversation_id') as existe;

-- Verificar usuarios de prueba
SELECT 
    'Usuarios de prueba' as tipo,
    COUNT(*) as cantidad
FROM users 
WHERE email LIKE '%test%@vecinoactivo.cl';

-- Verificar real-time habilitado
SELECT 
    tablename,
    'Real-time habilitado' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('conversations', 'messages', 'posts', 'notifications');

-- Mensaje final
SELECT 
    '🎉 CONFIGURACIÓN COMPLETADA' as status,
    'Ahora puedes ejecutar: npm run test:realtime' as siguiente_paso;