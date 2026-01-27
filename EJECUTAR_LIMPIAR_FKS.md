# ⚠️ EJECUTAR AHORA - LIMPIAR FOREIGN KEYS DUPLICADAS

## PROBLEMA IDENTIFICADO
Tienes **3 foreign keys** entre `posts` y `users`:
- `posts_author_id_fkey` ✅ (la correcta)
- `posts_new_author_id_fkey` ❌ (duplicada)
- `posts_user_id_fkey` ❌ (duplicada)

Esto causa el error PGRST201: "more than one relationship was found"

## SOLUCIÓN

### 1. Ir a Supabase SQL Editor
https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Ejecutar el script completo

Abre el archivo: `database/migrations/LIMPIAR_FOREIGN_KEYS_DUPLICADAS.sql`

O copia y pega este código:

```sql
-- Eliminar TODAS las foreign keys entre posts y users
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_new_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_user;

-- Eliminar columnas duplicadas si existen
ALTER TABLE posts DROP COLUMN IF EXISTS new_author_id;
ALTER TABLE posts DROP COLUMN IF EXISTS user_id CASCADE;

-- Crear UNA SOLA foreign key correcta
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Limpiar foreign keys de comments
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_author;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_user;

-- Crear UNA SOLA foreign key en comments
ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Verificación
SELECT 
    tc.table_name as tabla,
    tc.constraint_name as foreign_key,
    kcu.column_name as columna
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('posts', 'comments')
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

### 3. Resultado Esperado

Deberías ver solo 2 foreign keys:
```
tabla     | foreign_key              | columna
----------|--------------------------|----------
comments  | comments_author_id_fkey  | author_id
posts     | posts_author_id_fkey     | author_id
```

### 4. Refrescar la App

Después de ejecutar el script, refresca tu aplicación.

## ✅ VERIFICACIÓN

Los posts deberían cargar correctamente sin error PGRST201.

---

**Archivos actualizados**:
- `database/migrations/LIMPIAR_FOREIGN_KEYS_DUPLICADAS.sql` (script SQL)
- `src/services/supabasePostsService.js` (código actualizado con foreign keys correctas)
