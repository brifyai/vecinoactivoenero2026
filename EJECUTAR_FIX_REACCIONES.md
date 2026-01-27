# 🚀 EJECUTAR FIX DE REACCIONES - PASOS EXACTOS

## ⚠️ PROBLEMA
Las reacciones no se muestran en los posts y al intentar agregar una reacción aparece el error:
```
Error: new row violates row-level security policy for table "post_reactions"
```

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Ejecutar el script SQL de corrección

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor** (icono de base de datos en el menú lateral)
3. Crea una nueva query
4. Copia y pega el contenido completo del archivo:
   ```
   database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql
   ```
5. Haz clic en **Run** (o presiona Ctrl+Enter / Cmd+Enter)
6. Espera a que termine (debería tomar menos de 5 segundos)

**Resultado esperado:**
- Verás una tabla con 3 políticas creadas:
  - `post_reactions_delete_policy`
  - `post_reactions_insert_policy`
  - `post_reactions_select_policy`
- Verás `rls_enabled = true`
- Verás el total de reacciones existentes
- Verás 5 reacciones de ejemplo

### PASO 2: Verificar que el fix funcionó

1. En el mismo SQL Editor, crea una nueva query
2. Copia y pega el contenido de:
   ```
   database/reactions/TEST_REACTIONS_AFTER_FIX.sql
   ```
3. Ejecuta el script
4. Verifica que:
   - ✅ RLS está habilitado
   - ✅ Hay 3 políticas activas
   - ✅ Puedes ver las reacciones existentes
   - ✅ Los posts tienen reacciones asociadas

### PASO 3: Probar en la aplicación

1. **Recarga la aplicación** en el navegador:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Inicia sesión** si no lo has hecho:
   - Usuario: `admin@vecinoactivo.cl`
   - Contraseña: `VecinoActivo2024!`

3. **Ve al feed de posts** (página principal)

4. **Verifica que las reacciones se muestran:**
   - Deberías ver emojis debajo de cada post
   - Deberías ver el contador de reacciones

5. **Prueba agregar una reacción:**
   - Pasa el mouse sobre el botón "Me Uno"
   - Debería aparecer un picker con 5 emojis:
     - 🤝 Apoyo
     - ❤️ Me importa
     - 👏 Bien hecho
     - 💡 Buena idea
     - 🙌 Cuenta conmigo
   - Haz clic en uno de los emojis
   - La reacción debería aparecer inmediatamente en el post

6. **Prueba cambiar tu reacción:**
   - Pasa el mouse sobre "Me Uno" de nuevo
   - Selecciona un emoji diferente
   - Tu reacción anterior debería reemplazarse

7. **Prueba quitar tu reacción:**
   - Haz clic en el botón "Me Uno" (que ahora muestra tu emoji)
   - Tu reacción debería desaparecer

## 🔍 SI ALGO NO FUNCIONA

### Error: "No se pueden ver las reacciones"

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si ves errores de tipo `406` o `401`, ejecuta de nuevo el script SQL del Paso 1

### Error: "No puedo agregar reacciones"

**Solución:**
1. Verifica que estás autenticado:
   - Abre la consola del navegador (F12)
   - Ejecuta: `localStorage.getItem('supabase.auth.token')`
   - Debe mostrar un token (no `null`)
2. Si no hay token, cierra sesión y vuelve a iniciar sesión
3. Si el problema persiste, ejecuta en Supabase SQL Editor:
   ```sql
   SELECT auth.uid();
   ```
   - Debe devolver tu UUID (no NULL)
   - Si devuelve NULL, hay un problema con la autenticación

### Error: "Las reacciones desaparecen al recargar"

**Solución:**
1. Verifica que el script SQL se ejecutó correctamente
2. Ejecuta el script de verificación del Paso 2
3. Verifica que las políticas INSERT y SELECT están activas

## 📊 VERIFICACIÓN FINAL

Después de completar los 3 pasos, deberías poder:

- ✅ Ver las reacciones existentes en todos los posts
- ✅ Ver el contador de reacciones actualizado
- ✅ Ver hasta 3 emojis únicos por post
- ✅ Agregar una reacción a cualquier post
- ✅ Cambiar tu reacción
- ✅ Quitar tu reacción
- ✅ Ver las reacciones de otros usuarios
- ✅ Las reacciones persisten al recargar la página

## 📝 ARCHIVOS MODIFICADOS

### Scripts SQL creados:
- `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql` - Script de corrección
- `database/reactions/TEST_REACTIONS_AFTER_FIX.sql` - Script de verificación

### Código ya corregido (no requiere cambios):
- `src/services/supabaseReactionsService.js` - Servicio de reacciones
- `src/services/supabasePostsService.js` - Transformación de datos
- `src/components/Post/Post.js` - Componente de post con reacciones

### Documentación:
- `SOLUCION_REACCIONES_RLS.md` - Documentación detallada del problema y solución

## 🎉 RESULTADO ESPERADO

Una vez completados los pasos, las reacciones funcionarán completamente:

![Reacciones funcionando](https://via.placeholder.com/600x200/4CAF50/FFFFFF?text=Reacciones+Funcionando+✓)

- Los posts mostrarán las reacciones existentes
- Podrás agregar, cambiar y quitar reacciones
- El contador se actualizará en tiempo real
- Las reacciones persistirán en la base de datos

---

**Tiempo estimado:** 5-10 minutos
**Dificultad:** Fácil
**Requiere:** Acceso a Supabase Dashboard
