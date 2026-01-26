-- Script de Testing para Real-time
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Obtener tu user_id
SELECT id, email, name 
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- Resultado esperado: Verás una fila con tu ID
-- Ejemplo: cb2fa6e2-b927-47e6-92b4-eb40f64b4683

-- ============================================
-- PASO 2: REEMPLAZA 'TU-USER-ID-AQUI' con el ID del paso 1
-- ============================================

-- Test 1: Notificación de prueba
INSERT INTO notifications (user_id, type, message, created_at, read)
VALUES (
  'TU-USER-ID-AQUI',
  'info',
  'Prueba Real-time 🔔 - Notificación de prueba',
  NOW(),
  false
);

-- Test 2: Post de prueba
INSERT INTO posts (author_id, content, created_at, updated_at)
VALUES (
  'TU-USER-ID-AQUI',
  'Post de prueba desde SQL - Real-time funcionando! 🚀',
  NOW(),
  NOW()
);

-- Test 3: Verificar notificaciones insertadas
SELECT * FROM notifications 
WHERE user_id = 'TU-USER-ID-AQUI'
ORDER BY created_at DESC 
LIMIT 5;

-- Test 4: Verificar posts insertados
SELECT * FROM posts 
WHERE author_id = 'TU-USER-ID-AQUI'
ORDER BY created_at DESC 
LIMIT 5;
