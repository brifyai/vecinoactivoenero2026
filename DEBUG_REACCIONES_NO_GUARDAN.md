# 🔍 DEBUG: Reacciones no se guardan

## ❓ PREGUNTA IMPORTANTE

**¿Ya ejecutaste el script SQL en Supabase?**
- [ ] SÍ → Continúa con el debugging
- [ ] NO → **EJECUTA PRIMERO:** `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql`

---

## 🐛 PASOS DE DEBUGGING

### 1. Verificar en la consola del navegador

Abre la consola (F12) y busca estos errores:

#### Error A: RLS Policy Violation
```
Error: new row violates row-level security policy for table "post_reactions"
Code: 42501
```
**Causa:** No ejecutaste el script SQL  
**Solución:** Ejecuta `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql`

#### Error B: Column does not exist
```
Error: column post_reactions.reaction_type does not exist
Code: 42703
```
**Causa:** Código desactualizado  
**Solución:** Recarga la aplicación (Ctrl+Shift+R)

#### Error C: Not authenticated
```
Error: JWT expired
Code: 401
```
**Causa:** Sesión expirada  
**Solución:** Cierra sesión y vuelve a iniciar

---

## 🔧 SOLUCIONES RÁPIDAS

### Solución 1: Ejecutar el script SQL (SI NO LO HICISTE)

1. Ve a Supabase Dashboard
2. Abre SQL Editor
3. Copia y pega el contenido de:
   ```
   database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql
   ```
4. Haz clic en "Run"
5. Espera a que termine
6. Recarga la aplicación

### Solución 2: Verificar que el script se ejecutó correctamente

Ejecuta este query en Supabase SQL Editor:

```sql
-- Verificar políticas RLS
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd;
```

**Resultado esperado:**
```
policyname                      | cmd
--------------------------------|--------
post_reactions_delete_policy    | DELETE
post_reactions_insert_policy    | INSERT
post_reactions_select_policy    | SELECT
```

Si no ves estas 3 políticas, ejecuta de nuevo el script SQL.

### Solución 3: Verificar autenticación

En la consola del navegador, ejecuta:

```javascript
localStorage.getItem('supabase.auth.token')
```

- Si devuelve `null` → No estás autenticado, inicia sesión
- Si devuelve un token → Estás autenticado correctamente

### Solución 4: Limpiar caché y recargar

1. Abre DevTools (F12)
2. Haz clic derecho en el botón de recargar
3. Selecciona "Vaciar caché y recargar forzadamente"
4. O presiona: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

---

## 📊 VERIFICACIÓN EN BASE DE DATOS

### Verificar que la tabla existe y tiene la estructura correcta

```sql
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'post_reactions'
ORDER BY ordinal_position;
```

**Resultado esperado:**
```
column_name  | data_type
-------------|----------
id           | uuid
post_id      | uuid
user_id      | uuid
emoji        | text
created_at   | timestamp
```

### Intentar insertar una reacción manualmente

```sql
-- Reemplaza los UUIDs con valores reales de tu base de datos
INSERT INTO post_reactions (post_id, user_id, emoji)
VALUES (
    'TU_POST_ID',
    'TU_USER_ID',
    '🤝'
);
```

- Si funciona → El problema es en el código frontend
- Si falla → El problema es en las políticas RLS

---

## 🔍 DEBUGGING AVANZADO

### Ver qué está pasando en el código

Agrega estos console.logs temporalmente en `src/components/Post/Post.js`:

```javascript
const handleReaction = async (reaction) => {
  console.log('🎯 handleReaction llamado');
  console.log('👤 user:', user);
  console.log('📝 post.id:', post.id);
  console.log('😀 reaction:', reaction);
  
  if (!user) {
    console.error('❌ Usuario no autenticado');
    return;
  }

  const reactionEmoji = typeof reaction === 'string' ? reaction : reaction.emoji;
  console.log('✅ reactionEmoji:', reactionEmoji);
  
  try {
    // ... resto del código
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
  }
};
```

Luego intenta agregar una reacción y revisa la consola.

---

## 📝 CHECKLIST DE VERIFICACIÓN

- [ ] Ejecuté el script SQL `FIX_REACTIONS_RLS_DEFINITIVO.sql`
- [ ] Vi que se crearon 3 políticas (SELECT, INSERT, DELETE)
- [ ] Recargué la aplicación (Ctrl+Shift+R)
- [ ] Estoy autenticado (tengo token en localStorage)
- [ ] La consola no muestra errores 42501 o 42703
- [ ] La tabla post_reactions tiene la columna `emoji`
- [ ] Las políticas RLS están activas

---

## 🆘 SI NADA FUNCIONA

Ejecuta este script de diagnóstico completo en Supabase:

```sql
-- DIAGNÓSTICO COMPLETO DE REACCIONES

-- 1. Verificar tabla
SELECT 'Tabla post_reactions existe' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'post_reactions'
       ) THEN '✅ SÍ' ELSE '❌ NO' END as result;

-- 2. Verificar RLS
SELECT 'RLS habilitado' as check_name,
       CASE WHEN rowsecurity THEN '✅ SÍ' ELSE '❌ NO' END as result
FROM pg_tables
WHERE tablename = 'post_reactions';

-- 3. Contar políticas
SELECT 'Número de políticas' as check_name,
       COUNT(*)::text || ' políticas' as result
FROM pg_policies
WHERE tablename = 'post_reactions';

-- 4. Verificar columna emoji
SELECT 'Columna emoji existe' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'post_reactions' AND column_name = 'emoji'
       ) THEN '✅ SÍ' ELSE '❌ NO' END as result;

-- 5. Contar reacciones
SELECT 'Total de reacciones' as check_name,
       COUNT(*)::text || ' reacciones' as result
FROM post_reactions;

-- 6. Verificar auth.uid()
SELECT 'Usuario autenticado' as check_name,
       CASE WHEN auth.uid() IS NOT NULL 
            THEN '✅ SÍ (' || auth.uid()::text || ')' 
            ELSE '❌ NO' END as result;
```

Copia los resultados y compártelos para más ayuda.

---

## 💡 CAUSA MÁS PROBABLE

**Si no ejecutaste el script SQL:** Ese es el problema. Las políticas RLS están bloqueando las inserciones.

**Si ya ejecutaste el script SQL:** Puede ser un problema de caché. Recarga con Ctrl+Shift+R.

**Si recargaste y sigue sin funcionar:** Verifica que estés autenticado correctamente.

---

**Próximo paso:** Dime qué errores ves en la consola del navegador (F12 → Console)
