-- ============================================
-- SCRIPT DE TESTING POLLING - LISTO PARA USAR
-- Tu User ID: 88671149-ff82-48c1-aea4-47f8a8cbb0cf
-- ============================================

-- TEST POLLING: Insertar post de prueba
-- Deberías ver el post aparecer en 0-10 segundos (sin recargar)

INSERT INTO posts (author_id, content, created_at, updated_at)
VALUES (
  '88671149-ff82-48c1-aea4-47f8a8cbb0cf',
  '🔄 TEST POLLING - ' || to_char(NOW(), 'HH24:MI:SS') || ' - Si ves esto sin recargar, ¡funciona!',
  NOW(),
  NOW()
);

-- Espera 10 segundos máximo y el post debería aparecer automáticamente

-- ============================================
-- VERIFICAR: Ver tus posts recientes
-- ============================================
SELECT id, content, created_at
FROM posts 
WHERE author_id = '88671149-ff82-48c1-aea4-47f8a8cbb0cf'
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- LIMPIEZA: Borrar posts de prueba
-- ============================================
-- Descomenta para limpiar:
-- DELETE FROM posts 
-- WHERE author_id = '88671149-ff82-48c1-aea4-47f8a8cbb0cf'
-- AND content LIKE '%TEST POLLING%';
