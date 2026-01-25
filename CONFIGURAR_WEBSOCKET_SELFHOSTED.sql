-- =====================================================
-- CONFIGURACIÓN WEBSOCKET PARA SUPABASE SELF-HOSTED
-- Ejecutar en el SQL Editor de Supabase Studio
-- =====================================================

-- 1. Habilitar extensión realtime si no está habilitada
CREATE EXTENSION IF NOT EXISTS "supabase_realtime";

-- 2. Agregar tablas a la publicación de realtime
-- Esto permite que las tablas envíen eventos WebSocket

-- Verificar publicación existente
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Si no existe, crearla
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- 3. Agregar tablas específicas a la publicación
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- 4. Verificar que las tablas están en la publicación
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- 5. Habilitar Row Level Security para realtime (si no está habilitado)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas básicas para realtime (si no existen)

-- Política para posts: todos pueden leer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' AND policyname = 'posts_realtime_select'
    ) THEN
        CREATE POLICY posts_realtime_select ON posts FOR SELECT USING (true);
    END IF;
END $$;

-- Política para notificaciones: solo el usuario propietario
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'notifications_realtime_select'
    ) THEN
        CREATE POLICY notifications_realtime_select ON notifications 
        FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
END $$;

-- Política para mensajes: participantes de la conversación
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' AND policyname = 'messages_realtime_select'
    ) THEN
        CREATE POLICY messages_realtime_select ON messages 
        FOR SELECT USING (true); -- Simplificado por ahora
    END IF;
END $$;

-- 7. Verificar configuración
SELECT 
    'Tablas en publicación realtime:' as info,
    COUNT(*) as cantidad
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 8. Mostrar estado de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'notifications', 'messages', 'users')
ORDER BY tablename;

-- 9. Mostrar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'notifications', 'messages', 'users')
ORDER BY tablename, policyname;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================

/*
1. Abre Supabase Studio en tu navegador:
   https://supabase.vecinoactivo.cl/

2. Ve a SQL Editor

3. Copia y pega este script completo

4. Ejecuta el script (botón "Run")

5. Verifica que no hay errores en la consola

6. Los resultados mostrarán:
   - Tablas agregadas a la publicación
   - Estado de RLS
   - Políticas creadas

7. Si todo sale bien, WebSocket debería funcionar

NOTA: Si tu Supabase self-hosted no tiene el servicio 
realtime habilitado en Docker, WebSocket no funcionará
pero la app seguirá funcionando con carga manual.
*/