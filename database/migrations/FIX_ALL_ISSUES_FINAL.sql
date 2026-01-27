-- =====================================================
-- SCRIPT DEFINITIVO: CORREGIR TODOS LOS PROBLEMAS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

\echo '🔧 INICIANDO CORRECCIÓN COMPLETA...'
\echo ''

-- =====================================================
-- 1. CREAR TABLA PHOTO_COMMENTS
-- =====================================================

\echo '📸 Creando tabla photo_comments...'

CREATE TABLE IF NOT EXISTS photo_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_photo_comments_photo_id ON photo_comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_comments_user_id ON photo_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_comments_created_at ON photo_comments(created_at DESC);

-- RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'photo_comments' 
        AND policyname = 'Users can view photo comments'
    ) THEN
        CREATE POLICY "Users can view photo comments"
        ON photo_comments FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'photo_comments' 
        AND policyname = 'Users can create photo comments'
    ) THEN
        CREATE POLICY "Users can create photo comments"
        ON photo_comments FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

\echo '✅ Tabla photo_comments creada'
\echo ''

-- =====================================================
-- 2. HABILITAR REALTIME PARA TODAS LAS TABLAS
-- =====================================================

\echo '🔴 Habilitando Realtime...'

-- Eliminar tablas primero (por si acaso)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS users;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS posts;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS comments;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS post_reactions;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS messages;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS conversations;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS notifications;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS events;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS groups;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS friends;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS photos;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS photo_comments;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignorar errores
END $$;

-- Agregar tablas
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE posts;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE groups;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE friends;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE photos;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE photo_comments;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

\echo '✅ Realtime habilitado'
\echo ''

-- =====================================================
-- 3. CREAR DATOS DE PRUEBA
-- =====================================================

\echo '📊 Creando datos de prueba...'

-- Posts de prueba
INSERT INTO posts (author_id, content, privacy, created_at)
SELECT 
  id,
  'Post de prueba #' || ROW_NUMBER() OVER () || ' de ' || name || '. Este es un post de ejemplo para probar la funcionalidad del feed.',
  'public',
  NOW() - (ROW_NUMBER() OVER () || ' hours')::INTERVAL
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 10
ON CONFLICT DO NOTHING;

\echo '   ✓ Posts creados'

-- Comentarios de prueba
INSERT INTO comments (post_id, author_id, content, created_at)
SELECT 
  p.id,
  u.id,
  'Comentario de prueba de ' || u.name || ' en este post',
  NOW() - (RANDOM() * 60 || ' minutes')::INTERVAL
FROM posts p
CROSS JOIN users u
WHERE u.email LIKE '%@vecinoactivo.cl'
AND p.author_id != u.id
LIMIT 25
ON CONFLICT DO NOTHING;

\echo '   ✓ Comentarios creados'

-- Reacciones de prueba
INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at)
SELECT 
  p.id,
  u.id,
  (ARRAY['like', 'love', 'haha', 'wow', 'sad', 'angry'])[FLOOR(RANDOM() * 6 + 1)],
  NOW() - (RANDOM() * 120 || ' minutes')::INTERVAL
FROM posts p
CROSS JOIN users u
WHERE u.email LIKE '%@vecinoactivo.cl'
AND p.author_id != u.id
LIMIT 40
ON CONFLICT (post_id, user_id) DO NOTHING;

\echo '   ✓ Reacciones creadas'

-- Eventos de prueba
INSERT INTO events (title, description, start_date, end_date, location, created_by, created_at)
SELECT 
  'Evento Comunitario #' || ROW_NUMBER() OVER (),
  'Descripción del evento comunitario para vecinos. Todos están invitados a participar.',
  NOW() + (ROW_NUMBER() OVER () || ' days')::INTERVAL,
  NOW() + (ROW_NUMBER() OVER () + 1 || ' days')::INTERVAL,
  'Plaza del Barrio',
  id,
  NOW()
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 5
ON CONFLICT DO NOTHING;

\echo '   ✓ Eventos creados'

-- Grupos de prueba
INSERT INTO groups (name, description, privacy, created_by, created_at)
SELECT * FROM (
  VALUES
    ('Vecinos Activos', 'Grupo principal de vecinos del barrio', 'public', (SELECT id FROM users WHERE email LIKE '%@vecinoactivo.cl' LIMIT 1), NOW()),
    ('Deportes y Recreación', 'Para organizar actividades deportivas', 'public', (SELECT id FROM users WHERE email LIKE '%@vecinoactivo.cl' LIMIT 1 OFFSET 1), NOW()),
    ('Seguridad Vecinal', 'Coordinación de seguridad del barrio', 'private', (SELECT id FROM users WHERE email LIKE '%@vecinoactivo.cl' LIMIT 1 OFFSET 2), NOW()),
    ('Jardinería Comunitaria', 'Cuidado de áreas verdes del barrio', 'public', (SELECT id FROM users WHERE email LIKE '%@vecinoactivo.cl' LIMIT 1 OFFSET 3), NOW()),
    ('Club de Lectura', 'Para amantes de los libros', 'public', (SELECT id FROM users WHERE email LIKE '%@vecinoactivo.cl' LIMIT 1 OFFSET 4), NOW())
) AS v(name, description, privacy, created_by, created_at)
ON CONFLICT DO NOTHING;

\echo '   ✓ Grupos creados'

-- Amistades de prueba
INSERT INTO friends (user_id, friend_id, status, created_at, accepted_at)
SELECT 
  u1.id,
  u2.id,
  'accepted',
  NOW() - (RANDOM() * 720 || ' hours')::INTERVAL,
  NOW() - (RANDOM() * 600 || ' hours')::INTERVAL
FROM users u1
CROSS JOIN users u2
WHERE u1.email LIKE '%@vecinoactivo.cl'
AND u2.email LIKE '%@vecinoactivo.cl'
AND u1.id < u2.id
LIMIT 15
ON CONFLICT DO NOTHING;

\echo '   ✓ Amistades creadas'

\echo '✅ Datos de prueba creados'
\echo ''

-- =====================================================
-- 4. VERIFICACIÓN FINAL
-- =====================================================

\echo '🔍 VERIFICACIÓN FINAL'
\echo ''

-- Contar registros
\echo '📊 Registros en tablas:'
SELECT 
  '   users: ' || COUNT(*)::text as info FROM users
UNION ALL
SELECT '   posts: ' || COUNT(*)::text FROM posts
UNION ALL
SELECT '   comments: ' || COUNT(*)::text FROM comments
UNION ALL
SELECT '   post_reactions: ' || COUNT(*)::text FROM post_reactions
UNION ALL
SELECT '   events: ' || COUNT(*)::text FROM events
UNION ALL
SELECT '   groups: ' || COUNT(*)::text FROM groups
UNION ALL
SELECT '   friends: ' || COUNT(*)::text FROM friends
UNION ALL
SELECT '   photo_comments: ' || COUNT(*)::text FROM photo_comments;

\echo ''

-- Verificar Realtime
\echo '🔴 Tablas con Realtime habilitado:'
SELECT '   ✓ ' || tablename as info
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

\echo ''
\echo '✅ CORRECCIÓN COMPLETADA'
\echo ''
\echo '⚠️  IMPORTANTE: Crear bucket "photos" manualmente'
\echo '   1. Ve a Supabase Dashboard → Storage'
\echo '   2. Click en "Create Bucket"'
\echo '   3. Name: photos'
\echo '   4. Public: ✅ (activar)'
\echo ''
\echo '🎉 ¡Todo listo! Ejecuta el diagnóstico para verificar:'
\echo '   node scripts/testing/deep_analysis.js'
\echo ''
