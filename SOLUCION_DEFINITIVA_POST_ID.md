# 🔧 SOLUCIÓN DEFINITIVA - FOREIGN KEYS COMPLETAS

## PROBLEMA IDENTIFICADO

Hay **2 problemas** con las foreign keys:

### 1. Foreign keys duplicadas entre posts y users
- `posts_author_id_fkey` ✅ (correcta)
- `posts_new_author_id_fkey` ❌ (duplicada)
- `posts_user_id_fkey` ❌ (duplicada)

### 2. Falta foreign key entre comments y posts
- Error: "Could not find a relationship between 'posts' and 'comments'"
- Falta: `comments_post_id_fkey`

## SOLUCIÓN COMPLETA

### Ejecutar en Supabase SQL Editor

```sql
-- =====================================================
-- LIMPIAR Y CREAR TODAS LAS FOREIGN KEYS NECESARIAS
-- =====================================================

-- 1. LIMPIAR POSTS
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_new_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_user;

-- Eliminar columnas duplicadas
ALTER TABLE posts DROP COLUMN IF EXISTS new_author_id;
ALTER TABLE posts DROP COLUMN IF EXISTS user_id CASCADE;

-- Crear FK correcta en posts
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 2. LIMPIAR COMMENTS
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_author;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_user;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_posts_fkey;

-- Crear FKs correctas en comments
ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 3. VERIFICACIÓN
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
ORDER BY tc.table_name, tc.constraint_name;
```

## RESULTADO ESPERADO

Deberías ver exactamente **3 foreign keys**:

```
tabla     | foreign_key              | columna    | referencia_tabla | referencia_columna
----------|--------------------------|------------|------------------|-------------------
comments  | comments_author_id_fkey  | author_id  | users            | id
comments  | comments_post_id_fkey    | post_id    | posts            | id
posts     | posts_author_id_fkey     | author_id  | users            | id
```

## DESPUÉS DE EJECUTAR

1. Refresca tu aplicación (Ctrl+R o Cmd+R)
2. Los posts deberían cargar correctamente
3. Los comentarios deberían funcionar

## ARCHIVOS RELACIONADOS

- `database/migrations/LIMPIAR_FOREIGN_KEYS_DUPLICADAS.sql` - Script completo
- `database/migrations/AGREGAR_FK_COMMENTS_POSTS.sql` - Script específico para comments
- `src/services/supabasePostsService.js` - Código actualizado

---

**Nota**: Este script es seguro de ejecutar múltiples veces gracias a `IF EXISTS`.
