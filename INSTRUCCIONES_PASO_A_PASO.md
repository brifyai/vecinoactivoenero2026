# Instrucciones Paso a Paso - Solución Usuario Administrador

## 🔍 Problema Confirmado
La columna `username` NO EXISTE en la tabla `users` de Supabase.

## ✅ Solución Paso a Paso

### PASO 1: Diagnóstico
Ejecutar en Supabase SQL Editor:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
```
**Resultado esperado**: No debería aparecer 'username' en la lista.

### PASO 2: Agregar Columna Username
```sql
ALTER TABLE public.users ADD COLUMN username VARCHAR(50);
```
**Resultado esperado**: "ALTER TABLE" (sin errores)

### PASO 3: Verificar que se Agregó
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username';
```
**Resultado esperado**: Debería mostrar 'username'

### PASO 4: Generar Usernames para Usuarios Existentes
```sql
UPDATE public.users SET username = LOWER(REPLACE(name, ' ', '-')) WHERE username IS NULL;
```
**Resultado esperado**: "UPDATE X" (donde X es el número de usuarios actualizados)

### PASO 5: Verificar Usernames Generados
```sql
SELECT name, username FROM public.users LIMIT 3;
```
**Resultado esperado**: Debería mostrar nombres y usernames generados

### PASO 6: Crear Usuario Administrador
```sql
INSERT INTO public.users (
    id, email, password, name, username, avatar, verified, email_verified, created_at, updated_at
) VALUES (
    gen_random_uuid(), 
    'admin@vecinoactivo.cl', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrador', 
    'administrador', 
    'https://i.pravatar.cc/150?img=1', 
    TRUE, 
    TRUE, 
    NOW(), 
    NOW()
);
```
**Resultado esperado**: "INSERT 0 1"
**Nota**: El password es el hash de "password" (contraseña de prueba)

### PASO 7: Verificar Usuario Administrador
```sql
SELECT name, username, email FROM public.users WHERE username = 'administrador';
```
**Resultado esperado**: Debería mostrar el usuario administrador

### PASO 8: Hacer Columna Única (Opcional)
```sql
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
```
**Resultado esperado**: "ALTER TABLE"

### PASO 9: Crear Índice (Opcional)
```sql
CREATE INDEX idx_users_username ON public.users(username);
```
**Resultado esperado**: "CREATE INDEX"

### PASO 10: Verificación Final
```sql
SELECT 
    name,
    username,
    email,
    CASE WHEN verified THEN 'Verificado' ELSE 'No verificado' END as estado
FROM public.users
WHERE username IN ('administrador')
ORDER BY created_at DESC;
```
**Resultado esperado**: Debería mostrar el usuario administrador creado

## 🎯 URLs Disponibles Después
- `vecinoactivo.cl/administrador`
- El error "Usuario no encontrado" debería desaparecer

## ⚠️ Si Algo Sale Mal

### Error en PASO 2:
- Verificar que tienes permisos de administrador en Supabase
- La tabla `users` debe existir

### Error en PASO 6:
- Puede ser que el usuario ya exista
- Verificar con: `SELECT * FROM public.users WHERE email = 'admin@vecinoactivo.cl';`

### Error en PASO 8:
- Puede haber usernames duplicados
- Verificar con: `SELECT username, COUNT(*) FROM public.users GROUP BY username HAVING COUNT(*) > 1;`

## 🔄 Alternativa Rápida
Si prefieres ejecutar todo de una vez, usar el archivo `solucion_basica.sql` completo.

## 📞 Verificación Final
Después de completar todos los pasos:
1. Ir a la aplicación web
2. Navegar a `/administrador`
3. Debería mostrar el perfil del administrador sin errores