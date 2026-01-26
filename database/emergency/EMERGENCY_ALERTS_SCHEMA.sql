-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA ALERTAS DE EMERGENCIA
-- =====================================================

-- Tabla para alertas de emergencia
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL para reportes anónimos
  user_name TEXT NOT NULL,
  neighborhood_id TEXT NOT NULL,
  message TEXT,
  location JSONB, -- {latitude, longitude, accuracy}
  media_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  type TEXT DEFAULT 'emergency' CHECK (type IN ('emergency', 'security', 'medical', 'fire', 'other')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_neighborhood ON emergency_alerts(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_timestamp ON emergency_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_type ON emergency_alerts(type);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_emergency_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_emergency_alerts_updated_at ON emergency_alerts;
CREATE TRIGGER trigger_emergency_alerts_updated_at
  BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_emergency_alerts_updated_at();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver emergencias de su vecindario
CREATE POLICY "Users can view neighborhood emergencies" ON emergency_alerts
  FOR SELECT USING (
    neighborhood_id IN (
      SELECT neighborhood_id FROM users WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden crear emergencias
CREATE POLICY "Users can create emergencies" ON emergency_alerts
  FOR INSERT WITH CHECK (
    -- Permitir si el usuario está autenticado (para reportes identificados)
    -- O si es un reporte anónimo (user_id es NULL)
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (is_anonymous = TRUE AND user_id IS NULL)
  );

-- Política: Solo admins pueden actualizar emergencias
CREATE POLICY "Admins can update emergencies" ON emergency_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND neighborhood_id = emergency_alerts.neighborhood_id
      AND is_active = true
    )
  );

-- Política: Solo admins pueden eliminar emergencias (casos excepcionales)
CREATE POLICY "Admins can delete emergencies" ON emergency_alerts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND neighborhood_id = emergency_alerts.neighborhood_id
      AND is_active = true
    )
  );

-- =====================================================
-- ALMACENAMIENTO DE ARCHIVOS MULTIMEDIA
-- =====================================================

-- Crear bucket para archivos de emergencia si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('emergency-media', 'emergency-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de almacenamiento para archivos de emergencia
CREATE POLICY "Emergency media upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'emergency-media' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Emergency media access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'emergency-media'
  );

-- Política para eliminar archivos (solo admins)
CREATE POLICY "Admins can delete emergency media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'emergency-media' AND
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener estadísticas de emergencias por vecindario
CREATE OR REPLACE FUNCTION get_emergency_stats(p_neighborhood_id TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'false_alarm', COUNT(*) FILTER (WHERE status = 'false_alarm'),
    'last_24h', COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '24 hours'),
    'avg_response_time_minutes', 
      COALESCE(
        EXTRACT(EPOCH FROM AVG(resolved_at - timestamp)) / 60,
        0
      ) FILTER (WHERE status = 'resolved' AND resolved_at IS NOT NULL)
  ) INTO result
  FROM emergency_alerts
  WHERE neighborhood_id = p_neighborhood_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar emergencia como resuelta
CREATE OR REPLACE FUNCTION resolve_emergency(
  p_emergency_id UUID,
  p_resolution_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  emergency_neighborhood TEXT;
  is_admin BOOLEAN;
BEGIN
  -- Obtener ID del usuario actual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener vecindario de la emergencia
  SELECT neighborhood_id INTO emergency_neighborhood
  FROM emergency_alerts
  WHERE id = p_emergency_id;
  
  IF emergency_neighborhood IS NULL THEN
    RAISE EXCEPTION 'Emergencia no encontrada';
  END IF;
  
  -- Verificar si el usuario es admin del vecindario
  SELECT EXISTS(
    SELECT 1 FROM admin_roles
    WHERE user_id = current_user_id
    AND neighborhood_id = emergency_neighborhood
    AND is_active = true
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'No tienes permisos para resolver esta emergencia';
  END IF;
  
  -- Actualizar la emergencia
  UPDATE emergency_alerts
  SET 
    status = 'resolved',
    resolved_by = current_user_id,
    resolved_at = NOW(),
    resolution_notes = p_resolution_notes,
    updated_at = NOW()
  WHERE id = p_emergency_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL - SOLO DESARROLLO)
-- =====================================================

-- Insertar algunas emergencias de prueba (comentar en producción)
/*
INSERT INTO emergency_alerts (
  user_name, 
  neighborhood_id, 
  message, 
  location, 
  type,
  is_anonymous
) VALUES 
(
  'Usuario Demo',
  'default',
  'Prueba de sistema de emergencias',
  '{"latitude": -33.4489, "longitude": -70.6693, "accuracy": 10}',
  'emergency',
  false
),
(
  'Reporte Anónimo',
  'default',
  'Emergencia anónima de prueba',
  '{"latitude": -33.4500, "longitude": -70.6700, "accuracy": 15}',
  'security',
  true
);
*/

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE emergency_alerts IS 'Tabla para almacenar alertas de emergencia de la comunidad';
COMMENT ON COLUMN emergency_alerts.user_id IS 'ID del usuario que reporta (NULL para reportes anónimos)';
COMMENT ON COLUMN emergency_alerts.user_name IS 'Nombre del usuario o "Reporte Anónimo"';
COMMENT ON COLUMN emergency_alerts.neighborhood_id IS 'ID del vecindario donde ocurre la emergencia';
COMMENT ON COLUMN emergency_alerts.location IS 'Ubicación GPS en formato JSON {latitude, longitude, accuracy}';
COMMENT ON COLUMN emergency_alerts.media_url IS 'URL del archivo multimedia adjunto (imagen/video)';
COMMENT ON COLUMN emergency_alerts.is_anonymous IS 'Indica si el reporte es anónimo';
COMMENT ON COLUMN emergency_alerts.status IS 'Estado: active, resolved, false_alarm';
COMMENT ON COLUMN emergency_alerts.type IS 'Tipo: emergency, security, medical, fire, other';

COMMENT ON FUNCTION get_emergency_stats(TEXT) IS 'Obtiene estadísticas de emergencias para un vecindario';
COMMENT ON FUNCTION resolve_emergency(UUID, TEXT) IS 'Marca una emergencia como resuelta (solo admins)';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'emergency_alerts'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'emergency_alerts';

-- Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'emergency_alerts';

-- ✅ Esquema de alertas de emergencia creado exitosamente
SELECT '✅ Esquema de alertas de emergencia creado exitosamente' AS resultado;