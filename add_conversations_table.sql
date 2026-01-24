-- =====================================================
-- AGREGAR TABLA CONVERSATIONS Y MODIFICAR MESSAGES
-- =====================================================

-- 1. Crear tabla conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar conversaciones duplicadas
  UNIQUE(participant1_id, participant2_id)
);

-- 2. Agregar índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- 3. Agregar columna conversation_id a messages (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Agregar columnas adicionales a messages para mejor funcionalidad
DO $$ 
BEGIN
    -- Agregar message_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';
    END IF;
    
    -- Agregar edited si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'edited') THEN
        ALTER TABLE messages ADD COLUMN edited BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Agregar edited_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'edited_at') THEN
        ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 5. Crear índices adicionales para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 6. Función para crear o obtener conversación entre dos usuarios
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

-- 7. Función para actualizar updated_at en conversations cuando se envía un mensaje
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para actualizar timestamp de conversación
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- 9. Habilitar RLS en conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para conversations
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

-- 11. Actualizar políticas RLS para messages (incluir conversation_id)
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

-- 12. Habilitar real-time para conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 13. Migrar mensajes existentes a conversaciones (si existen)
DO $$
DECLARE
    msg_record RECORD;
    conv_id UUID;
BEGIN
    -- Solo si hay mensajes sin conversation_id
    IF EXISTS (SELECT 1 FROM messages WHERE conversation_id IS NULL) THEN
        FOR msg_record IN 
            SELECT DISTINCT sender_id, recipient_id 
            FROM messages 
            WHERE conversation_id IS NULL
        LOOP
            -- Crear o obtener conversación
            SELECT get_or_create_conversation(msg_record.sender_id, msg_record.recipient_id) INTO conv_id;
            
            -- Actualizar mensajes
            UPDATE messages 
            SET conversation_id = conv_id 
            WHERE (sender_id = msg_record.sender_id AND recipient_id = msg_record.recipient_id)
               OR (sender_id = msg_record.recipient_id AND recipient_id = msg_record.sender_id);
        END LOOP;
    END IF;
END $$;

-- 14. Verificar que todo se creó correctamente
SELECT 'Tabla conversations creada' as status, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as exists;

SELECT 'Columna conversation_id agregada a messages' as status,
       EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'messages' AND column_name = 'conversation_id') as exists;

SELECT 'Función get_or_create_conversation creada' as status,
       EXISTS(SELECT 1 FROM information_schema.routines 
              WHERE routine_name = 'get_or_create_conversation') as exists;