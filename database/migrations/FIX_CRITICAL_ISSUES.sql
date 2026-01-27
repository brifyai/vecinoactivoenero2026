-- =====================================================
-- CORREGIR PROBLEMAS CRÍTICOS DE LA APP
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CORREGIR TABLA DE AMIGOS
-- =====================================================

-- Verificar si existe friendships
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'friendships'
    ) THEN
        -- Renombrar friendships a friends
        ALTER TABLE IF EXISTS friendships RENAME TO friends;
        RAISE NOTICE '✅ Tabla friendships renombrada a friends';
    ELSE
        RAISE NOTICE 'ℹ️  Tabla friendships no existe';
    END IF;
END $$;

-- Verificar que la tabla friends existe ahora
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'friends'
        ) THEN '✅ Tabla friends existe'
        ELSE '❌ Tabla friends NO existe'
    END as status;

-- =====================================================
-- 2. HABILITAR REALTIME PARA TABLAS CRÍTICAS
-- =====================================================

-- Nota: ALTER PUBLICATION no soporta IF NOT EXISTS
-- Si la tabla ya está en la publicación, dará un error que podemos ignorar

-- Habilitar Realtime para usuarios
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
    RAISE NOTICE '✅ Realtime habilitado para users';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  users ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para posts
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    RAISE NOTICE '✅ Realtime habilitado para posts';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  posts ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para comentarios
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
    RAISE NOTICE '✅ Realtime habilitado para comments';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  comments ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para reacciones
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions;
    RAISE NOTICE '✅ Realtime habilitado para post_reactions';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  post_reactions ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para mensajes
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE '✅ Realtime habilitado para messages';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  messages ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para conversaciones
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    RAISE NOTICE '✅ Realtime habilitado para conversations';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  conversations ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para notificaciones
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    RAISE NOTICE '✅ Realtime habilitado para notifications';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  notifications ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para eventos
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
    RAISE NOTICE '✅ Realtime habilitado para events';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  events ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para grupos
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE groups;
    RAISE NOTICE '✅ Realtime habilitado para groups';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  groups ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para fotos
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE photos;
    RAISE NOTICE '✅ Realtime habilitado para photos';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  photos ya tiene Realtime habilitado';
END $$;

-- Habilitar Realtime para amigos
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE friends;
    RAISE NOTICE '✅ Realtime habilitado para friends';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️  friends ya tiene Realtime habilitado';
END $$;

-- Verificar tablas con Realtime habilitado
SELECT 
    '✅ Realtime habilitado para ' || COUNT(*) || ' tablas' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Listar tablas con Realtime
SELECT 
    tablename as tabla,
    '✅ Realtime habilitado' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =====================================================
-- 3. VERIFICAR Y CORREGIR RLS POLICIES
-- =====================================================

-- Política para que usuarios puedan ver otros usuarios
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can view other users'
    ) THEN
        CREATE POLICY "Users can view other users"
        ON users FOR SELECT
        TO authenticated
        USING (true);
        RAISE NOTICE '✅ Política de lectura de usuarios creada';
    ELSE
        RAISE NOTICE 'ℹ️  Política de lectura de usuarios ya existe';
    END IF;
END $$;

-- Política para que usuarios puedan actualizar su propio perfil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON users FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✅ Política de actualización de perfil creada';
    ELSE
        RAISE NOTICE 'ℹ️  Política de actualización de perfil ya existe';
    END IF;
END $$;

-- Política para que usuarios puedan ver posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can view posts'
    ) THEN
        CREATE POLICY "Users can view posts"
        ON posts FOR SELECT
        TO authenticated
        USING (true);
        RAISE NOTICE '✅ Política de lectura de posts creada';
    ELSE
        RAISE NOTICE 'ℹ️  Política de lectura de posts ya existe';
    END IF;
END $$;

-- Política para que usuarios puedan crear posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can create posts'
    ) THEN
        CREATE POLICY "Users can create posts"
        ON posts FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = author_id);
        RAISE NOTICE '✅ Política de creación de posts creada';
    ELSE
        RAISE NOTICE 'ℹ️  Política de creación de posts ya existe';
    END IF;
END $$;

-- Política para que usuarios puedan ver amigos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friends' 
        AND policyname = 'Users can view friends'
    ) THEN
        CREATE POLICY "Users can view friends"
        ON friends FOR SELECT
        TO authenticated
        USING (user_id = auth.uid() OR friend_id = auth.uid());
        RAISE NOTICE '✅ Política de lectura de amigos creada';
    ELSE
        RAISE NOTICE 'ℹ️  Política de lectura de amigos ya existe';
    END IF;
END $$;

-- Política para que usuarios puedan crear solicitudes de amistad
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friends' 
        AND policyname = 'Users can create friend requests'
    ) THEN
        CREATE POLICY "Users can create friend requests"
        ON friends FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid());
        RAISE NOTICE '✅ Política de creación de solicitudes de amistad creada';
    ELSE
        RAISE NOTICE 'ℹ️  Política de creación de solicitudes de amistad ya existe';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICACIÓN FINAL
-- =====================================================

-- Resumen de tablas
SELECT 
    '📊 RESUMEN DE TABLAS' as titulo,
    '' as detalle
UNION ALL
SELECT 
    '  - ' || table_name as titulo,
    '(' || 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') || 
    ' columnas)' as detalle
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY titulo;

-- Resumen de políticas RLS
SELECT 
    '🔒 POLÍTICAS RLS' as titulo,
    COUNT(*)::text || ' políticas activas' as detalle
FROM pg_policies
WHERE schemaname = 'public';

-- Resumen de Realtime
SELECT 
    '🔴 REALTIME' as titulo,
    COUNT(*)::text || ' tablas habilitadas' as detalle
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
✅ Tabla friends corregida
✅ Realtime habilitado para 11+ tablas
✅ Políticas RLS configuradas
✅ Sistema listo para usar

PRÓXIMOS PASOS:
1. Crear bucket 'photos' en Supabase Dashboard → Storage
2. Ejecutar CREATE_TEST_USERS_SIMPLE.sql para crear usuarios de prueba
3. Crear datos de prueba para posts, eventos, grupos, etc.
4. Verificar que todo funciona en la app
*/
