# ⚡ EJECUTAR AHORA - Fix RLS Reacciones

## 🎯 PROBLEMA IDENTIFICADO

`auth.uid()` devuelve `NULL` en el SQL Editor porque **no hay sesión activa en Supabase Dashboard**.

Esto es NORMAL - el SQL Editor no comparte la sesión con tu aplicación web.

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Copiar el script SQL

Copia TODO el contenido del archivo:
```
database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql
```

O copia directamente este código:

```sql
-- =====================================================
-- ARREGLAR RLS DE POST_REACTIONS - SOLUCIÓN DEFINITIVA
-- =====================================================

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_reactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON post_reactions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON post_reactions;

-- 3. Habilitar RLS nuevamente
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas nuevas y correctas

-- Política SELECT: Todos pueden ver las reacciones
CREATE POLICY "post_reactions_select_policy"
ON post_reactions
FOR SELECT
USING (true);

-- Política INSERT: Usuarios autenticados pueden insertar reacciones
CREATE POLICY "post_reactions_insert_policy"
ON post_reactions
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Política DELETE: Usuarios pueden eliminar solo sus propias reacciones
CREATE POLICY "post_reactions_delete_policy"
ON post_reactions
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd, policyname;
```

### PASO 2: Ejecutar en Supabase

1. Ve a **Supabase Dashboard** → https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Abre **SQL Editor** (icono de base de datos en el menú lateral)
4. Haz clic en **"New query"**
5. **Pega** el código SQL completo
6. Haz clic en **"Run"** (o presiona Ctrl+Enter)
7. Espera 5 segundos

### PASO 3: Verificar resultado

Deberías ver al final:

```
policyname                      | cmd
--------------------------------|--------
post_reactions_delete_policy    | DELETE
post_reactions_insert_policy    | INSERT
post_reactions_select_policy    | SELECT
```

✅ Si ves estas 3 políticas → **¡Funcionó!**

---

## 🧪 PASO 4: Probar en la aplicación

1. **Recarga la aplicación** con caché limpio:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Abre la consola** del navegador (F12)

3. **Intenta agregar una reacción** a cualquier post

4. **Verifica en la consola** que veas:
   ```
   🎯 handleReaction iniciado
   👤 user: {id: "...", name: "Admin", ...}
   ✅ user.id: "tu-uuid-aqui"
   ✅ Reacción guardada exitosamente: 🤝
   ```

5. **Verifica visualmente** que la reacción aparece en el post

---

## ❌ SI VES ERRORES

### Error: "policy already exists"
```
ERROR: policy "post_reactions_select_policy" already exists
```

**Solución:** Las políticas ya existen. Ejecuta este script alternativo:

```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "post_reactions_select_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete_policy" ON post_reactions;

-- Crear políticas nuevas
CREATE POLICY "post_reactions_select_policy"
ON post_reactions FOR SELECT USING (true);

CREATE POLICY "post_reactions_insert_policy"
ON post_reactions FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "post_reactions_delete_policy"
ON post_reactions FOR DELETE
USING (auth.uid()::text = user_id::text);
```

### Error: "table post_reactions does not exist"
```
ERROR: relation "post_reactions" does not exist
```

**Solución:** La tabla no existe. Ejecuta primero:

```sql
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

Luego ejecuta el script de fix de nuevo.

---

## 📊 VERIFICACIÓN FINAL

Después de ejecutar el script, verifica en la aplicación:

- [ ] Puedo ver reacciones existentes en los posts
- [ ] Puedo agregar una reacción (hover sobre "Me Uno")
- [ ] La reacción aparece inmediatamente
- [ ] El contador aumenta
- [ ] Puedo cambiar mi reacción
- [ ] Puedo quitar mi reacción
- [ ] Al recargar la página, mi reacción sigue ahí

---

## 🎉 RESULTADO ESPERADO

Después de ejecutar el script:
- ✅ 3 políticas RLS activas
- ✅ Reacciones funcionando al 100%
- ✅ Sin errores en la consola
- ✅ Sistema listo para usar

---

**Tiempo estimado:** 3 minutos  
**Dificultad:** Fácil  
**Requiere:** Acceso a Supabase Dashboard

---

**Próximo paso:** Ejecuta el script SQL AHORA y luego prueba agregar una reacción en la aplicación.
