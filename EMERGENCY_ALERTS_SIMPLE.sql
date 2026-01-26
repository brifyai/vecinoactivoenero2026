-- =====================================================
-- ESQUEMA SIMPLE DE ALERTAS DE EMERGENCIA
-- VERSIÓN MINIMALISTA GARANTIZADA PARA SUPABASE
-- =====================================================

-- Crear tabla de emergencias
CREATE TABLE emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT NOT NULL,
  neighborhood_id TEXT NOT NULL DEFAULT 'default',
  message TEXT,
  location JSONB,
  media_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'emergency',
  is_anonymous BOOLEAN DEFAULT FALSE,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices básicos
CREATE INDEX idx_emergency_neighborhood ON emergency_alerts(neighborhood_id);
CREATE INDEX idx_emergency_timestamp ON emergency_alerts(timestamp);
CREATE INDEX idx_emergency_status ON emergency_alerts(status);

-- Habilitar RLS
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Política básica: todos pueden ver y crear
CREATE POLICY "Allow all operations" ON emergency_alerts
  FOR ALL USING (true) WITH CHECK (true);

-- Función simple de estadísticas
CREATE OR REPLACE FUNCTION get_emergency_stats_simple(p_neighborhood_id TEXT)
RETURNS JSON AS $$
DECLARE
  total_count INTEGER;
  active_count INTEGER;
  resolved_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM emergency_alerts
  WHERE neighborhood_id = p_neighborhood_id;
  
  SELECT COUNT(*) INTO active_count
  FROM emergency_alerts
  WHERE neighborhood_id = p_neighborhood_id AND status = 'active';
  
  SELECT COUNT(*) INTO resolved_count
  FROM emergency_alerts
  WHERE neighborhood_id = p_neighborhood_id AND status = 'resolved';
  
  RETURN json_build_object(
    'total', total_count,
    'active', active_count,
    'resolved', resolved_count
  );
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de prueba
INSERT INTO emergency_alerts (user_name, neighborhood_id, message, type, is_anonymous) 
VALUES 
  ('Usuario Demo', 'default', 'Prueba de emergencia', 'emergency', false),
  ('Reporte Anónimo', 'default', 'Emergencia anónima', 'security', true);

-- Verificar instalación
SELECT 'Tabla emergency_alerts creada exitosamente' as resultado;
SELECT COUNT(*) as total_emergencias FROM emergency_alerts;
SELECT get_emergency_stats_simple('default') as estadisticas;