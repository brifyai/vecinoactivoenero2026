-- ============================================
-- FUNCIONES SQL PARA VECINO ACTIVO
-- ============================================

-- Función para incrementar contador de comentarios en posts
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar contador de comentarios en posts
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar likes en comentarios
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments
  SET likes = likes + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar votos en proyectos
CREATE OR REPLACE FUNCTION increment_project_votes(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET votes = votes + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar votos en proyectos
CREATE OR REPLACE FUNCTION decrement_project_votes(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET votes = GREATEST(votes - 1, 0)
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar votos totales en polls
CREATE OR REPLACE FUNCTION increment_poll_votes(poll_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE polls
  SET total_votes = total_votes + 1
  WHERE id = poll_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar votos en opciones de poll
CREATE OR REPLACE FUNCTION increment_poll_option_votes(option_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE poll_options
  SET votes = votes + 1
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar rating de negocios
CREATE OR REPLACE FUNCTION update_business_rating(business_id UUID)
RETURNS void AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  review_count INTEGER;
BEGIN
  SELECT 
    ROUND(AVG(rating)::numeric, 1),
    COUNT(*)
  INTO avg_rating, review_count
  FROM business_reviews
  WHERE business_reviews.business_id = update_business_rating.business_id;
  
  UPDATE local_businesses
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = review_count
  WHERE id = update_business_rating.business_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar rating automáticamente al agregar reseña
CREATE OR REPLACE FUNCTION trigger_update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_business_rating(NEW.business_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_business_review_insert
AFTER INSERT ON business_reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_business_rating();

CREATE TRIGGER after_business_review_update
AFTER UPDATE ON business_reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_business_rating();

CREATE TRIGGER after_business_review_delete
AFTER DELETE ON business_reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_business_rating();

-- Función para buscar vecindarios por coordenadas (PostGIS)
CREATE OR REPLACE FUNCTION find_neighborhood_by_point(
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION
)
RETURNS TABLE (
  id VARCHAR(100),
  codigo VARCHAR(50),
  nombre VARCHAR(255),
  comuna VARCHAR(100),
  region VARCHAR(100),
  personas INTEGER,
  hogares INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.codigo,
    n.nombre,
    n.comuna,
    n.region,
    n.personas,
    n.hogares
  FROM neighborhoods n
  WHERE ST_Contains(
    n.geometry,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener vecindarios cercanos
CREATE OR REPLACE FUNCTION find_nearby_neighborhoods(
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id VARCHAR(100),
  codigo VARCHAR(50),
  nombre VARCHAR(255),
  comuna VARCHAR(100),
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.codigo,
    n.nombre,
    n.comuna,
    ST_Distance(
      n.geometry::geography,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) as distance_meters
  FROM neighborhoods n
  WHERE ST_DWithin(
    n.geometry::geography,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de un vecindario
CREATE OR REPLACE FUNCTION get_neighborhood_stats(neighborhood_id_param VARCHAR(100))
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users WHERE neighborhood_id = neighborhood_id_param),
    'total_posts', (SELECT COUNT(*) FROM posts p JOIN users u ON p.author_id = u.id WHERE u.neighborhood_id = neighborhood_id_param),
    'total_events', (SELECT COUNT(*) FROM events e JOIN users u ON e.created_by = u.id WHERE u.neighborhood_id = neighborhood_id_param),
    'total_projects', (SELECT COUNT(*) FROM projects WHERE neighborhood_id = neighborhood_id_param),
    'total_businesses', (SELECT COUNT(*) FROM local_businesses WHERE neighborhood_id = neighborhood_id_param),
    'active_help_requests', (SELECT COUNT(*) FROM help_requests WHERE neighborhood_id = neighborhood_id_param AND status = 'abierta')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_notifications_read(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = user_id_param AND read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener conversaciones de mensajes
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param UUID)
RETURNS TABLE (
  conversation_id TEXT,
  other_user_id UUID,
  other_user_name VARCHAR(255),
  other_user_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH conversations AS (
    SELECT DISTINCT
      CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id || '-' || m.recipient_id
        ELSE m.recipient_id || '-' || m.sender_id
      END as conv_id,
      CASE 
        WHEN m.sender_id = user_id_param THEN m.recipient_id
        ELSE m.sender_id
      END as other_id
    FROM messages m
    WHERE m.sender_id = user_id_param OR m.recipient_id = user_id_param
  ),
  last_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id || '-' || m.recipient_id
        ELSE m.recipient_id || '-' || m.sender_id
      END
    )
      CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id || '-' || m.recipient_id
        ELSE m.recipient_id || '-' || m.sender_id
      END as conv_id,
      m.content,
      m.created_at
    FROM messages m
    WHERE m.sender_id = user_id_param OR m.recipient_id = user_id_param
    ORDER BY 
      CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id || '-' || m.recipient_id
        ELSE m.recipient_id || '-' || m.sender_id
      END,
      m.created_at DESC
  )
  SELECT 
    c.conv_id,
    c.other_id,
    u.name,
    u.avatar,
    lm.content,
    lm.created_at,
    (
      SELECT COUNT(*)
      FROM messages m2
      WHERE m2.sender_id = c.other_id 
        AND m2.recipient_id = user_id_param 
        AND m2.read = FALSE
    ) as unread_count
  FROM conversations c
  JOIN users u ON u.id = c.other_id
  JOIN last_messages lm ON lm.conv_id = c.conv_id
  ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN DE FUNCIONES
-- ============================================
