-- ============================================
-- SCRIPT DE TESTING REAL-TIME - LISTO PARA USAR
-- Tu User ID: 88671149-ff82-48c1-aea4-47f8a8cbb0cf
-- ============================================

-- TEST 1: Notificación de prueba
-- Deberías ver: Notificación del navegador + notificación en la app
INSERT INTO notifications (user_id, type, message, created_at, read)
VALUES (
  '88671149-ff82-48c1-aea4-47f8a8cbb0cf',
  'info',
  '🔔 Prueba Real-time - Notificación funcionando!',
  NOW(),
  false
);

-- Espera 2 segundos y ejecuta el siguiente...

-- TEST 2: Post de prueba
-- Deberías ver: Post aparece automáticamente en el feed
INSERT INTO posts (author_id, content, created_at, updated_at)
VALUES (
  '88671149-ff82-48c1-aea4-47f8a8cbb0cf',
  '🚀 Post de prueba desde SQL - Real-time funcionando perfectamente!',
  NOW(),
  NOW()
);

-- Espera 2 segundos y ejecuta el siguiente...

-- TEST 3: Otra notificación con tipo diferente
INSERT INTO notifications (user_id, type, message, created_at, read)
VALUES (
  '88671149-ff82-48c1-aea4-47f8a8cbb0cf',
  'success',
  '✅ Segunda notificación - Todo funciona!',
  NOW(),
  false
);

-- Espera 2 segundos y ejecuta el siguiente...

-- TEST 4: Post con más contenido
INSERT INTO posts (author_id, content, created_at, updated_at)
VALUES (
  '88671149-ff82-48c1-aea4-47f8a8cbb0cf',
  '🎉 Segundo post de prueba! Si ves esto sin recargar la página, significa que Real-time está funcionando perfectamente. ¡Felicidades!',
  NOW(),
  NOW()
);

-- ============================================
-- VERIFICACIÓN: Ver tus notificaciones
-- ============================================
SELECT id, type, message, created_at, read
FROM notifications 
WHERE user_id = '88671149-ff82-48c1-aea4-47f8a8cbb0cf'
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- VERIFICACIÓN: Ver tus posts
-- ============================================
SELECT id, content, created_at
FROM posts 
WHERE author_id = '88671149-ff82-48c1-aea4-47f8a8cbb0cf'
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- LIMPIEZA (OPCIONAL): Borrar datos de prueba
-- ============================================
-- Descomenta estas líneas si quieres limpiar las pruebas:

-- DELETE FROM notifications 
-- WHERE user_id = '88671149-ff82-48c1-aea4-47f8a8cbb0cf'
-- AND message LIKE '%Prueba%';

-- DELETE FROM posts 
-- WHERE author_id = '88671149-ff82-48c1-aea4-47f8a8cbb0cf'
-- AND content LIKE '%prueba%';
