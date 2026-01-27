-- =====================================================
-- AGREGAR FOTOS A POSTS DEL ADMINISTRADOR
-- Usuario: admin@vecinoactivo.cl
-- =====================================================

-- Paso 1: Verificar los posts del administrador
SELECT 
    p.id,
    p.content,
    p.created_at,
    p.media,
    u.email,
    u.name
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl'
ORDER BY p.created_at DESC;

-- Paso 2: Asegurar que la columna media existe
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media TEXT[];

-- Paso 3: Agregar fotos a los posts del administrador
-- Post 1: Imágenes de comunidad/vecindario
UPDATE posts 
SET media = ARRAY[
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80'
]
WHERE id = (
    SELECT p.id 
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE u.email = 'admin@vecinoactivo.cl'
    ORDER BY p.created_at ASC
    LIMIT 1
);

-- Post 2: Imágenes de actividades comunitarias
UPDATE posts 
SET media = ARRAY[
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80'
]
WHERE id = (
    SELECT p.id 
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE u.email = 'admin@vecinoactivo.cl'
    ORDER BY p.created_at DESC
    LIMIT 1
);

-- Paso 4: Verificar que las fotos se agregaron correctamente
SELECT 
    p.id,
    LEFT(p.content, 60) as contenido,
    array_length(p.media, 1) as num_fotos,
    p.media,
    u.email,
    u.name
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl'
ORDER BY p.created_at DESC;

-- Paso 5: Resumen
SELECT 
    '✅ Posts del administrador actualizados con fotos' as resultado,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN media IS NOT NULL AND array_length(media, 1) > 0 THEN 1 END) as posts_con_fotos
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl';

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Copia todo este script
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el script y ejecuta
-- 4. Verifica los resultados en las consultas SELECT
-- =====================================================
