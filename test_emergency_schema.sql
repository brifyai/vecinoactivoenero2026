-- =====================================================
-- SCRIPT DE PRUEBA PARA ESQUEMA DE EMERGENCIAS
-- =====================================================

-- Verificar si la tabla existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'emergency_alerts') 
    THEN '✅ Tabla emergency_alerts existe'
    ELSE '❌ Tabla emergency_alerts NO existe'
  END AS tabla_status;

-- Verificar columnas de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'emergency_alerts'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
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

-- Verificar funciones
SELECT 
  proname as function_name,
  pronargs as num_args,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN ('get_emergency_stats', 'resolve_emergency');

-- Verificar bucket de storage
SELECT 
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'emergency-media';

-- Insertar datos de prueba (opcional)
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

-- Verificar datos insertados
SELECT 
  id,
  user_name,
  neighborhood_id,
  message,
  is_anonymous,
  status,
  created_at
FROM emergency_alerts
ORDER BY created_at DESC
LIMIT 5;

-- Probar función de estadísticas
SELECT get_emergency_stats('default') as estadisticas;

SELECT '🎉 PRUEBA DEL ESQUEMA DE EMERGENCIAS COMPLETADA' as resultado;