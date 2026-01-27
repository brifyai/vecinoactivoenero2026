# 🚨 FIX URGENTE - TIPOS DE DATOS INCOMPATIBLES

## PROBLEMA CRÍTICO

**Error**: `foreign key constraint "comments_post_id_fkey" cannot be implemented`

**Causa**: Tipos de datos incompatibles:
- `comments.post_id` es **UUID** 
- `posts.id` es **INTEGER**

No se pueden crear foreign keys entre tipos diferentes.

## SOLUCIÓN INMEDIATA

### Opción 1: Ejecutar script completo actualizado

Ejecuta el script actualizado: `database/migrations/LIMPIAR_FOREIGN_KEYS_DUPLICADAS.sql`

Este script ahora incluye la corrección automática de tipos de datos.

### Opción 2: Ejecutar solo la corrección de tipos

```sql
-- =====================================================
-- CORREGIR TIPO DE DATO DE comments.post_id
-- =====================================================

-- 1. Ver tipos actuales
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name = 'id')
   OR (table_name = 'comments' AND column_name = 'post_id');

-- 2. Eliminar foreign key si existe
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

-- 3. Cambiar tipo de dato
ALTER TABLE comments 
ALTER COLUMN post_id TYPE INTEGER USING post_id::text::integer;

-- 4. Crear foreign key
ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 5. Verificar
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name = 'id')
   OR (table_name = 'comments' AND column_name = 'post_id');
```

## RESULTADO ESPERADO

Después de ejecutar, deberías ver:

```
table_name | column_name | data_type
-----------|-------------|----------
comments   | post_id     | integer
posts      | id          | integer
```

## DESPUÉS DE EJECUTAR

1. Ejecuta el script completo de limpieza: `LIMPIAR_FOREIGN_KEYS_DUPLICADAS.sql`
2. Refresca la aplicación
3. Los posts deberían cargar correctamente

## ARCHIVOS

- `database/migrations/FIX_TIPOS_DATOS_POSTS.sql` - Script específico
- `database/migrations/LIMPIAR_FOREIGN_KEYS_DUPLICADAS.sql` - Script completo actualizado

---

**Nota**: Si tienes datos en `comments` con UUIDs, se perderán al convertir a INTEGER. Si es importante, haz backup primero.
