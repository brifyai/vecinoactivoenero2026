-- SOLUCIÓN BÁSICA: Ejecutar comando por comando
-- Copiar y pegar cada línea por separado en Supabase SQL Editor

-- 1. Ver estructura actual
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

-- 2. Agregar columna username
ALTER TABLE public.users ADD COLUMN username VARCHAR(50);

-- 3. Verificar que se agregó
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username';

-- 4. Generar usernames para usuarios existentes
UPDATE public.users SET username = LOWER(REPLACE(name, ' ', '-')) WHERE username IS NULL;

-- 5. Ver usuarios con usernames
SELECT name, username FROM public.users LIMIT 3;

-- 6. Crear usuario administrador (con password)
INSERT INTO public.users (id, email, password, name, username, avatar, verified, email_verified, created_at, updated_at) 
VALUES (gen_random_uuid(), 'admin@vecinoactivo.cl', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'administrador', 'https://i.pravatar.cc/150?img=1', TRUE, TRUE, NOW(), NOW());

-- 7. Verificar que se creó
SELECT name, username, email FROM public.users WHERE username = 'administrador';

-- 8. Hacer columna única
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- 9. Crear índice
CREATE INDEX idx_users_username ON public.users(username);

-- 10. Verificación final
SELECT COUNT(*) as total_usuarios FROM public.users;
SELECT name, username FROM public.users WHERE username = 'administrador';