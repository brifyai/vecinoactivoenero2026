-- SOLUCIÓN PARA USUARIO ADMINISTRADOR EXISTENTE
-- Ejecutar cuando el usuario ya existe pero no tiene username

-- PASO 1: Agregar columna username si no existe
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- PASO 2: Generar usernames para TODOS los usuarios que no los tengan
UPDATE public.users 
SET username = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
WHERE username IS NULL;

-- PASO 3: Verificar que el administrador ahora tiene username
SELECT 
    name, username, email 
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 4: Si el administrador no tiene el username correcto, actualizarlo
UPDATE public.users 
SET username = 'administrador'
WHERE email = 'admin@vecinoactivo.cl' 
AND (username IS NULL OR username != 'administrador');

-- PASO 5: Hacer la columna username única (después de resolver duplicados)
-- Primero verificar si hay duplicados
SELECT username, COUNT(*) as cantidad
FROM public.users 
WHERE username IS NOT NULL
GROUP BY username 
HAVING COUNT(*) > 1;

-- PASO 6: Si no hay duplicados, agregar constraint único
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- PASO 7: Crear índice
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- PASO 8: Verificación final
SELECT 
    name as "Nombre",
    username as "Username",
    email as "Email",
    CASE WHEN verified THEN '✅ Verificado' ELSE '❌ No verificado' END as "Estado"
FROM public.users
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 9: Mostrar todos los usuarios con username
SELECT 
    name,
    username,
    email
FROM public.users
WHERE username IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;