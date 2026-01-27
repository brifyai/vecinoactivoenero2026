-- Verificar cuántas reacciones hay
SELECT COUNT(*) as total_reacciones FROM post_reactions;

-- Ver las reacciones por post
SELECT 
    p.id as post_id,
    p.content,
    COUNT(pr.id) as num_reacciones,
    STRING_AGG(DISTINCT pr.emoji, ', ') as emojis
FROM posts p
LEFT JOIN post_reactions pr ON p.id = pr.post_id
GROUP BY p.id, p.content
ORDER BY num_reacciones DESC
LIMIT 10;

-- Ver detalles de algunas reacciones
SELECT 
    pr.id,
    pr.post_id,
    pr.user_id,
    pr.emoji,
    pr.created_at,
    u.name as user_name
FROM post_reactions pr
JOIN users u ON pr.user_id = u.id
LIMIT 20;
