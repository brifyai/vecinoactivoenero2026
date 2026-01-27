# ⚠️ EJECUTAR INMEDIATAMENTE - FIX FOREIGN KEYS

## PROBLEMA
Error 400 al cargar posts porque las foreign keys no existen:
```
posts_author_id_fkey
comments_author_id_fkey
```

## SOLUCIÓN

### 1. Ir a Supabase SQL Editor
https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Ejecutar este script completo

```sql
-- =====================================================
-- ARREGLAR FOREIGN KEYS DE POSTS Y COMMENTS
-- =====================================================

-- 1. Eliminar foreign keys si existen
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_author;

-- 2. Crear foreign key de posts.author_id -> users.id
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 3. Crear foreign key de comments.author_id -> users.id
ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 4. Verificar que se crearon correctamente
SELECT 
    tc.table_name as tabla,
    tc.constraint_name as foreign_key,
    kcu.column_name as columna,
    ccu.table_name AS referencia_tabla,
    ccu.column_name AS referencia_columna
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('posts', 'comments')
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%author_id_fkey'
ORDER BY tc.table_name;
```

### 3. Resultado Esperado

Deberías ver:
```
tabla     | foreign_key              | columna    | referencia_tabla | referencia_columna
----------|--------------------------|------------|------------------|-------------------
comments  | comments_author_id_fkey  | author_id  | users            | id
posts     | posts_author_id_fkey     | author_id  | users            | id
```

### 4. Refrescar la App

Después de ejecutar el script, refresca tu aplicación en el navegador.

## ✅ VERIFICACIÓN

Los posts deberían cargar correctamente sin error 400.

---

**Archivo del script**: `database/migrations/FIX_FOREIGN_KEYS.sql`
