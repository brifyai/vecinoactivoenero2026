-- =====================================================
-- SETUP COMPLETO FINAL - Vecino Activo (CORREGIDO)
-- Basado en verificación real del esquema
-- Tiempo estimado: 30 segundos
-- =====================================================

-- =====================================================
-- PASO 1: VERIFICAR Y CREAR TABLA PHOTO_COMMENTS
-- =====================================================

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

-- RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

DO $
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
END $;

DO $
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
END $;

-- =====================================================
-- PASO 2: HABILITAR REALTIME
-- =====================================================

-- Agregar tablas a Realtime (con manejo de duplicados)
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE users; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE posts; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE comments; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE conversations; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE events; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE groups; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friends; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE photos; EXCEPTION WHEN duplicate_object THEN NULL; END $;
DO $ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE photo_comments; EXCEPTION WHEN duplicate_object THEN NULL; END $;

-- =====================================================
-- PASO 3: CREAR DATOS DE PRUEBA
-- =====================================================

-- 3.1 Posts adicionales (10 nuevos)
INSERT INTO posts (author_id, content, privacy, category, created_at)
SELECT 
  id,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN '¡Hola vecinos! 👋 Me acabo de unir a la comunidad. Vivo en ' || neighborhood_name || ' y me encantaría conocer a más personas del barrio.'
    WHEN 2 THEN '🌳 ¿Alguien sabe cuándo es la próxima jornada de limpieza del parque? Me gustaría participar.'
    WHEN 3 THEN '🎉 Estoy organizando una reunión de vecinos este fin de semana. ¿Quién se anima?'
    WHEN 4 THEN '📚 Tengo varios libros que ya leí y me gustaría compartirlos con la comunidad. ¿Alguien interesado?'
    WHEN 5 THEN '🐕 Perdí a mi perro esta mañana cerca de la plaza. Es un golden retriever. Si alguien lo ve, por favor avísenme.'
    WHEN 6 THEN '🏃‍♂️ ¿Hay algún grupo de running en el barrio? Me gustaría unirme para hacer ejercicio en las mañanas.'
    WHEN 7 THEN '🍕 Recomiendo mucho la nueva pizzería que abrió en la esquina. ¡Excelente calidad y buen precio!'
    WHEN 8 THEN '⚠️ Ojo con los baches en la calle principal. Ya reporté al municipio pero mientras tanto hay que tener cuidado.'
    WHEN 9 THEN '🎨 Estoy dando clases de pintura gratuitas para niños los sábados. Si alguien está interesado, me avisa.'
    WHEN 10 THEN '🌟 Qué lindo es vivir en este barrio. Los vecinos son muy amables y siempre dispuestos a ayudar.'
  END,
  'public',
  CASE ROW_NUMBER() OVER () % 4
    WHEN 0 THEN 'general'
    WHEN 1 THEN 'ayuda'
    WHEN 2 THEN 'eventos'
    ELSE 'recomendaciones'
  END,
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '3 hours')
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 10
ON CONFLICT DO NOTHING;

-- 3.2 Comentarios (30 comentarios variados)
INSERT INTO comments (post_id, author_id, content, created_at)
SELECT 
  p.id,
  u.id,
  CASE (RANDOM() * 10)::INT
    WHEN 0 THEN '¡Excelente idea! Cuenta conmigo 👍'
    WHEN 1 THEN 'Yo también estoy interesado, ¿cuándo sería?'
    WHEN 2 THEN 'Gracias por compartir esta información'
    WHEN 3 THEN 'Me parece muy buena iniciativa'
    WHEN 4 THEN '¿Alguien más se anima? Sería genial'
    WHEN 5 THEN 'Yo puedo ayudar con eso'
    WHEN 6 THEN 'Qué bueno que lo compartes con la comunidad'
    WHEN 7 THEN 'Cuenta conmigo para lo que necesites'
    WHEN 8 THEN '¡Me encanta! ¿Cómo puedo participar?'
    ELSE 'Muy interesante, gracias por avisar'
  END,
  NOW() - (RANDOM() * INTERVAL '2 hours')
FROM posts p
CROSS JOIN users u
WHERE u.email LIKE '%@vecinoactivo.cl'
AND p.author_id != u.id
LIMIT 30
ON CONFLICT DO NOTHING;

-- 3.3 Reacciones (50 reacciones variadas)
INSERT INTO post_reactions (post_id, user_id, emoji, created_at)
SELECT 
  p.id,
  u.id,
  (ARRAY['❤️', '👍', '😊', '🎉', '👏', '🙌'])[FLOOR(RANDOM() * 6 + 1)],
  NOW() - (RANDOM() * INTERVAL '4 hours')
FROM posts p
CROSS JOIN users u
WHERE u.email LIKE '%@vecinoactivo.cl'
AND p.author_id != u.id
LIMIT 50
ON CONFLICT (post_id, user_id, emoji) DO NOTHING;

-- 3.4 Eventos (8 eventos variados)
INSERT INTO events (slug, title, description, date, time, location, category, created_by, created_at)
SELECT 
  'evento-' || ROW_NUMBER() OVER () || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Reunión de Vecinos - Enero'
    WHEN 2 THEN 'Limpieza Comunitaria del Parque'
    WHEN 3 THEN 'Feria de Emprendedores Locales'
    WHEN 4 THEN 'Taller de Reciclaje'
    WHEN 5 THEN 'Campeonato de Fútbol Vecinal'
    WHEN 6 THEN 'Cine al Aire Libre'
    WHEN 7 THEN 'Clase de Yoga en la Plaza'
    ELSE 'Fiesta de Fin de Mes'
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Reunión mensual para discutir temas importantes del barrio y planificar actividades.'
    WHEN 2 THEN 'Jornada de limpieza y mantenimiento de nuestro parque comunitario. Traigan guantes y bolsas.'
    WHEN 3 THEN 'Espacio para que emprendedores locales muestren y vendan sus productos.'
    WHEN 4 THEN 'Aprende técnicas de reciclaje y compostaje para el hogar.'
    WHEN 5 THEN 'Torneo amistoso de fútbol entre equipos del barrio. Todas las edades bienvenidas.'
    WHEN 6 THEN 'Proyección de película familiar en la plaza. Traigan mantas y snacks.'
    WHEN 7 THEN 'Clase gratuita de yoga para todos los niveles. Traigan su mat.'
    ELSE 'Celebración comunitaria con música, comida y actividades para toda la familia.'
  END,
  CURRENT_DATE + (ROW_NUMBER() OVER () * INTERVAL '1 week'),
  '18:00:00',
  CASE ROW_NUMBER() OVER () % 3
    WHEN 0 THEN 'Plaza del Barrio'
    WHEN 1 THEN 'Sede Vecinal'
    ELSE 'Parque Comunitario'
  END,
  CASE ROW_NUMBER() OVER () % 4
    WHEN 0 THEN 'reunion'
    WHEN 1 THEN 'deporte'
    WHEN 2 THEN 'cultura'
    ELSE 'social'
  END,
  id,
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '1 day')
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 8
ON CONFLICT (slug) DO NOTHING;

-- 3.5 Asistentes a eventos (20 asistencias)
INSERT INTO event_attendees (event_id, user_id, status, created_at)
SELECT 
  e.id,
  u.id,
  (ARRAY['going', 'interested'])[FLOOR(RANDOM() * 2 + 1)],
  NOW() - (RANDOM() * INTERVAL '2 days')
FROM events e
CROSS JOIN users u
WHERE u.email LIKE '%@vecinoactivo.cl'
LIMIT 20
ON CONFLICT (event_id, user_id) DO NOTHING;

-- 3.6 Grupos (6 grupos)
INSERT INTO groups (slug, name, description, privacy, created_by, created_at)
SELECT 
  'grupo-' || ROW_NUMBER() OVER () || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Vecinos Activos'
    WHEN 2 THEN 'Deportes y Recreación'
    WHEN 3 THEN 'Seguridad Vecinal'
    WHEN 4 THEN 'Jardinería Comunitaria'
    WHEN 5 THEN 'Club de Lectura'
    ELSE 'Mascotas del Barrio'
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Grupo principal para coordinar actividades y mantener comunicación entre vecinos.'
    WHEN 2 THEN 'Organización de actividades deportivas y recreativas para todas las edades.'
    WHEN 3 THEN 'Coordinación de temas de seguridad y vigilancia del barrio.'
    WHEN 4 THEN 'Cuidado y mantenimiento de áreas verdes comunitarias.'
    WHEN 5 THEN 'Para amantes de la lectura. Compartimos libros y organizamos tertulias.'
    ELSE 'Espacio para dueños de mascotas. Organizamos paseos y compartimos consejos.'
  END,
  CASE ROW_NUMBER() OVER () % 3
    WHEN 0 THEN 'public'
    WHEN 1 THEN 'public'
    ELSE 'private'
  END,
  id,
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '5 days')
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 6
ON CONFLICT (slug) DO NOTHING;

-- 3.7 Miembros de grupos (25 membresías)
INSERT INTO group_members (group_id, user_id, role, joined_at)
SELECT 
  g.id,
  u.id,
  CASE 
    WHEN g.created_by = u.id THEN 'admin'
    ELSE 'member'
  END,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM groups g
CROSS JOIN users u
WHERE u.email LIKE '%@vecinoactivo.cl'
LIMIT 25
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 3.8 Amistades (20 conexiones)
INSERT INTO friends (user_id, friend_id, status, created_at, accepted_at)
SELECT 
  u1.id,
  u2.id,
  'accepted',
  NOW() - (RANDOM() * INTERVAL '30 days'),
  NOW() - (RANDOM() * INTERVAL '25 days')
FROM users u1
CROSS JOIN users u2
WHERE u1.email LIKE '%@vecinoactivo.cl'
AND u2.email LIKE '%@vecinoactivo.cl'
AND u1.id < u2.id
LIMIT 20
ON CONFLICT DO NOTHING;

-- 3.9 Conversaciones (5 conversaciones)
INSERT INTO conversations (participant1_id, participant2_id, last_message_at, created_at)
SELECT 
  u1.id,
  u2.id,
  NOW() - (RANDOM() * INTERVAL '1 day'),
  NOW() - (RANDOM() * INTERVAL '5 days')
FROM users u1
CROSS JOIN users u2
WHERE u1.email LIKE '%@vecinoactivo.cl'
AND u2.email LIKE '%@vecinoactivo.cl'
AND u1.id < u2.id
LIMIT 5
ON CONFLICT DO NOTHING;

-- 3.10 Mensajes (15 mensajes)
INSERT INTO messages (sender_id, recipient_id, content, read, created_at)
SELECT 
  u1.id,
  u2.id,
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'Hola! ¿Cómo estás?'
    WHEN 1 THEN 'Vi tu publicación sobre el evento, me interesa participar'
    WHEN 2 THEN 'Gracias por la ayuda de ayer!'
    WHEN 3 THEN '¿Nos vemos en la reunión de mañana?'
    WHEN 4 THEN 'Te comparto la información que me pediste'
    ELSE 'Que tengas un excelente día!'
  END,
  RANDOM() > 0.5,
  NOW() - (RANDOM() * INTERVAL '2 days')
FROM users u1
CROSS JOIN users u2
WHERE u1.email LIKE '%@vecinoactivo.cl'
AND u2.email LIKE '%@vecinoactivo.cl'
AND u1.id != u2.id
LIMIT 15
ON CONFLICT DO NOTHING;

-- 3.11 Proyectos (4 proyectos)
INSERT INTO projects (slug, title, description, category, status, creator_id, budget, funding_goal, votes, start_date, created_at)
SELECT 
  'proyecto-' || ROW_NUMBER() OVER () || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Mejora de Iluminación en Plaza'
    WHEN 2 THEN 'Instalación de Juegos Infantiles'
    WHEN 3 THEN 'Mural Comunitario'
    ELSE 'Huerto Urbano Vecinal'
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Proyecto para mejorar la iluminación de la plaza principal, aumentando la seguridad nocturna.'
    WHEN 2 THEN 'Instalación de nuevos juegos infantiles en el parque para los niños del barrio.'
    WHEN 3 THEN 'Creación de un mural artístico en el muro de la sede vecinal.'
    ELSE 'Implementación de un huerto urbano comunitario para cultivar verduras y hierbas.'
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'infraestructura'
    WHEN 2 THEN 'recreacion'
    WHEN 3 THEN 'cultura'
    ELSE 'medioambiente'
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'en_progreso'
    WHEN 2 THEN 'propuesta'
    ELSE 'propuesta'
  END,
  id,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 500000
    WHEN 2 THEN 800000
    WHEN 3 THEN 300000
    ELSE 400000
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 500000
    WHEN 2 THEN 800000
    WHEN 3 THEN 300000
    ELSE 400000
  END,
  (RANDOM() * 50)::INT,
  CURRENT_DATE + INTERVAL '1 month',
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '3 days')
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 4
ON CONFLICT (slug) DO NOTHING;

-- 3.12 Encuestas (3 encuestas)
INSERT INTO polls (title, description, status, creator_id, total_votes, ends_at, created_at)
SELECT 
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN '¿Qué día prefieres para la reunión mensual?'
    WHEN 2 THEN '¿Qué tipo de eventos te gustaría ver más?'
    ELSE '¿Cuál es tu prioridad para el barrio?'
  END,
  CASE ROW_NUMBER() OVER ()
    WHEN 1 THEN 'Ayúdanos a elegir el mejor día para la reunión mensual de vecinos'
    WHEN 2 THEN 'Queremos saber qué tipo de eventos te interesan más'
    ELSE 'Vota por la prioridad que crees más importante para mejorar el barrio'
  END,
  'active',
  id,
  (RANDOM() * 30)::INT,
  CURRENT_DATE + INTERVAL '7 days',
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '2 days')
FROM users
WHERE email LIKE '%@vecinoactivo.cl'
LIMIT 3
ON CONFLICT DO NOTHING;

-- 3.13 Opciones de encuestas
INSERT INTO poll_options (poll_id, text, votes, created_at)
SELECT 
  p.id,
  CASE (ROW_NUMBER() OVER (PARTITION BY p.id))
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Miércoles'
    WHEN 3 THEN 'Viernes'
    ELSE 'Sábado'
  END,
  (RANDOM() * 10)::INT,
  NOW()
FROM polls p
CROSS JOIN generate_series(1, 4) AS s
LIMIT 12
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 4: ACTUALIZAR CONTADORES
-- =====================================================

-- Actualizar contador de comentarios en posts
UPDATE posts p
SET comments_count = (
  SELECT COUNT(*) 
  FROM comments c 
  WHERE c.post_id = p.id
);

-- Actualizar contador de likes en posts
UPDATE posts p
SET likes = (
  SELECT COUNT(*) 
  FROM post_reactions pr 
  WHERE pr.post_id = p.id
);

-- =====================================================
-- PASO 5: VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de datos creados
SELECT 
  'RESUMEN DE DATOS CREADOS' as titulo,
  '' as detalle
UNION ALL
SELECT '  Posts:', COUNT(*)::TEXT FROM posts
UNION ALL
SELECT '  Comentarios:', COUNT(*)::TEXT FROM comments
UNION ALL
SELECT '  Reacciones:', COUNT(*)::TEXT FROM post_reactions
UNION ALL
SELECT '  Eventos:', COUNT(*)::TEXT FROM events
UNION ALL
SELECT '  Grupos:', COUNT(*)::TEXT FROM groups
UNION ALL
SELECT '  Amistades:', COUNT(*)::TEXT FROM friends
UNION ALL
SELECT '  Conversaciones:', COUNT(*)::TEXT FROM conversations
UNION ALL
SELECT '  Mensajes:', COUNT(*)::TEXT FROM messages
UNION ALL
SELECT '  Proyectos:', COUNT(*)::TEXT FROM projects
UNION ALL
SELECT '  Encuestas:', COUNT(*)::TEXT FROM polls;

-- Verificar Realtime
SELECT 
  '' as separador,
  '' as detalle
UNION ALL
SELECT 
  'TABLAS CON REALTIME:' as separador,
  COUNT(*)::TEXT as detalle
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Mensaje final
DO $
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ SETUP COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Datos de prueba creados';
  RAISE NOTICE '🔴 Realtime habilitado';
  RAISE NOTICE '📸 Tabla photo_comments verificada';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Crear bucket "photos"';
  RAISE NOTICE '   1. Ve a Supabase Dashboard → Storage';
  RAISE NOTICE '   2. Click "Create Bucket"';
  RAISE NOTICE '   3. Name: photos';
  RAISE NOTICE '   4. Public: ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡Tu app está lista para usar!';
  RAISE NOTICE '';
END $;
