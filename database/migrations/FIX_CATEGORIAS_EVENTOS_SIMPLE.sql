-- Script simple para asignar categorías a TODOS los eventos
-- Actualiza todos los eventos sin importar su estado actual

-- Ver estado actual
SELECT id, title, category FROM events ORDER BY created_at;

-- Actualizar TODOS los eventos con categorías
WITH eventos_ordenados AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as num
  FROM events
)
UPDATE events
SET category = CASE 
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 1) THEN 'Música'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 2) THEN 'Tecnología'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 3) THEN 'Comida'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 4) THEN 'Arte'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 5) THEN 'Deportes'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 6) THEN 'Música'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 7) THEN 'Tecnología'
  WHEN id IN (SELECT id FROM eventos_ordenados WHERE num = 8) THEN 'Comida'
  ELSE 'General'
END;

-- Verificar resultados
SELECT id, title, category FROM events ORDER BY category, created_at;

-- Contar por categoría
SELECT category, COUNT(*) as total FROM events GROUP BY category ORDER BY category;
