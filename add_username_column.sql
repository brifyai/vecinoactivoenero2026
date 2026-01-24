-- Script para agregar la columna username a la tabla users
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar si la columna username ya existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name = 'username';

-- PASO 2: Agregar la columna username si no existe
DO $$
BEGIN
    -- Verificar si la columna existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'username'
    ) THEN
        -- Agregar la columna username
        ALTER TABLE public.users 
        ADD COLUMN username VARCHAR(50) UNIQUE;
        
        RAISE NOTICE 'Columna username agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna username ya existe';
    END IF;
END $$;

-- PASO 3: Generar usernames para usuarios existentes que no los tengan
UPDATE public.users 
SET username = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
WHERE username IS NULL;

-- PASO 4: Crear índice para la columna username
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- PASO 5: Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- PASO 6: Mostrar usuarios con sus usernames
SELECT id, name, username, email, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;