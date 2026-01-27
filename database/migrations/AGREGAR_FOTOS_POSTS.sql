-- =====================================================
-- AGREGAR FOTOS A POSTS - Vecino Activo
-- Primero crea la columna media, luego agrega imágenes
-- =====================================================

-- Paso 1: Agregar columna media si no existe
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media TEXT[];

-- Paso 2: Actualizar posts con imágenes de Unsplash
-- Cada post recibe 1-3 imágenes relacionadas con su contenido

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80'
]
WHERE content LIKE '%vecinos%' OR content LIKE '%comunidad%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80'
]
WHERE content LIKE '%parque%' OR content LIKE '%limpieza%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80'
]
WHERE content LIKE '%reunión%' OR content LIKE '%evento%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80'
]
WHERE content LIKE '%libros%' OR content LIKE '%lectura%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80'
]
WHERE content LIKE '%perro%' OR content LIKE '%mascota%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80'
]
WHERE content LIKE '%running%' OR content LIKE '%ejercicio%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80'
]
WHERE content LIKE '%pizzería%' OR content LIKE '%comida%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
]
WHERE content LIKE '%baches%' OR content LIKE '%calle%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80'
]
WHERE content LIKE '%pintura%' OR content LIKE '%clases%';

UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80'
]
WHERE content LIKE '%barrio%' AND content LIKE '%lindo%';

-- Para posts que aún no tienen imágenes, agregar imágenes genéricas de comunidad
UPDATE posts 
SET media = ARRAY[
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
]
WHERE media IS NULL OR array_length(media, 1) IS NULL;

-- Verificar resultados
SELECT 
  id,
  LEFT(content, 50) as contenido,
  array_length(media, 1) as num_fotos,
  media[1] as primera_foto
FROM posts
ORDER BY created_at DESC
LIMIT 20;

-- Resumen
SELECT 
  'Posts con fotos' as resultado,
  COUNT(*) as total
FROM posts
WHERE media IS NOT NULL AND array_length(media, 1) > 0;
