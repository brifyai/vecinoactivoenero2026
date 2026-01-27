-- Script para agregar 8 imágenes ÚNICAS a los 8 eventos
-- Cada evento tendrá una imagen diferente

-- Primero, limpiar las imágenes actuales
UPDATE events SET image = NULL;

-- Asignar una imagen única a cada evento usando ROW_NUMBER
WITH numbered_events AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM events
)
UPDATE events e
SET image = CASE ne.row_num
  WHEN 1 THEN 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop&sig=1'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&sig=2'
  WHEN 3 THEN 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&sig=3'
  WHEN 4 THEN 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=500&fit=crop&sig=4'
  WHEN 5 THEN 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop&sig=5'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=500&fit=crop&sig=6'
  WHEN 7 THEN 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop&sig=7'
  WHEN 8 THEN 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&sig=8'
  ELSE 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop&sig=9'
END
FROM numbered_events ne
WHERE e.id = ne.id;

-- Verificar que todas las imágenes son diferentes
SELECT 
  id, 
  title, 
  category,
  SUBSTRING(image FROM 1 FOR 70) || '...' as image_preview
FROM events 
ORDER BY created_at;

-- Verificar que hay 8 imágenes únicas
SELECT COUNT(*) as total_events, COUNT(DISTINCT image) as unique_images
FROM events;
