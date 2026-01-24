-- ACTUALIZAR USUARIO ADMINISTRADOR EXISTENTE
-- El usuario ya existe, solo necesitamos agregar el username

-- PASO 1: Verificar que el usuario administrador existe
SELECT 
    id, name, email, username, created_at
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 2: Actualizar el usuario existente con username
UPDATE public.users 
SET 
    username = 'administrador',
    bio = 'Administrador del sistema Vecino Activo',
    neighborhood_name = 'Administración Central',
    neighborhood_code = 'ADM-001',
    verified = TRUE,
    updated_at = NOW()
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 3: Verificar que se actualizó correctamente
SELECT 
    name as "Nombre",
    username as "Username", 
    email as "Email",
    CASE WHEN verified THEN '✅ Verificado' ELSE '❌ No verificado' END as "Estado",
    bio as "Biografía"
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 4: Crear índice para username si no existe
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- PASO 5: Verificar que todo está funcionando
SELECT 
    'RESULTADO:' as titulo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE username = 'administrador')
        THEN '🎉 ÉXITO - Usuario administrador actualizado. Disponible en /administrador'
        ELSE '❌ ERROR - No se pudo actualizar el username'
    END as mensaje;