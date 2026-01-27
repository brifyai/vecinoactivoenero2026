-- =====================================================
-- VERIFICAR FOTOS EN POSTS DEL ADMINISTRADOR
-- =====================================================

-- Ver todos los posts del administrador con sus fotos
SELECT 
    p.id,
    p.content,
    p.media,
    array_length(p.media, 1) as num_fotos,
    p.created_at,
    u.email,
    u.name
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl'
ORDER BY p.created_at DESC;

-- Verificar si la columna media existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'media';
