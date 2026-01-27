-- Script para verificar y asignar categorías a los eventos
-- Paso 1: Ver estado actual de los eventos

SELECT 
  id, 
  title, 
  category,
  CASE 
    WHEN category IS NULL THEN 'NULL'
    WHEN category = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END as category_status,
  created_at
FROM events 
ORDER BY created_at;

-- Paso 2: Contar eventos por categoría actual
SELECT 
  COALESCE(category, 'NULL') as category,
  COUNT(*) as total
FROM events
GROUP BY category
ORDER BY category;

-- Paso 3: Asignar categorías a los eventos (distribuir entre las 5 categorías)
UPDATE events
SET category = CASE 
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Música'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Tecnología'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Comida'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 3) THEN 'Arte'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 4) THEN 'Deportes'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 5) THEN 'Música'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 6) THEN 'Tecnología'
  WHEN id = (SELECT id FROM events ORDER BY created_at LIMIT 1 OFFSET 7) THEN 'Comida'
  ELSE 'General'
END
WHERE category IS NULL OR category = '';

-- Paso 4: Verificar resultados después de la actualización
SELECT 
  id, 
  title, 
  category,
  created_at
FROM events 
ORDER BY category, created_at;

-- Paso 5: Contar eventos por categoría después de la actualización
SELECT 
  category,
  COUNT(*) as total
FROM events
GROUP BY category
ORDER BY category;
