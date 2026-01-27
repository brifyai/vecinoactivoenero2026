-- Script para asignar categorías a los eventos existentes
-- Distribuye los 8 eventos entre las diferentes categorías

-- Ver eventos actuales
SELECT id, title, category FROM events ORDER BY created_at;

-- Asignar categorías a cada evento
WITH numbered_events AS (
  SELECT 
    id,
    title,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM events
)
UPDATE events e
SET category = CASE ne.row_num
  WHEN 1 THEN 'Música'
  WHEN 2 THEN 'Tecnología'
  WHEN 3 THEN 'Comida'
  WHEN 4 THEN 'Arte'
  WHEN 5 THEN 'Deportes'
  WHEN 6 THEN 'Música'
  WHEN 7 THEN 'Tecnología'
  WHEN 8 THEN 'Comida'
  ELSE 'General'
END
FROM numbered_events ne
WHERE e.id = ne.id;

-- Verificar resultados
SELECT id, title, category FROM events ORDER BY category, created_at;

-- Contar eventos por categoría
SELECT category, COUNT(*) as total
FROM events
GROUP BY category
ORDER BY category;
