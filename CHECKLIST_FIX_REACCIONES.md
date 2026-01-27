# ✅ CHECKLIST: Fix de Reacciones

## 📋 ANTES DE EMPEZAR

- [ ] Tengo acceso al Dashboard de Supabase
- [ ] Tengo acceso al SQL Editor de Supabase
- [ ] Tengo la aplicación abierta en el navegador
- [ ] Tengo las credenciales de prueba:
  - Usuario: `admin@vecinoactivo.cl`
  - Contraseña: `VecinoActivo2024!`

---

## 🔧 PASO 1: EJECUTAR FIX SQL

### Acciones:
- [ ] Abrir Supabase Dashboard
- [ ] Ir a SQL Editor
- [ ] Crear nueva query
- [ ] Copiar contenido de `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql`
- [ ] Pegar en el editor
- [ ] Hacer clic en "Run" o presionar Ctrl+Enter

### Verificar resultados:
- [ ] Se ejecutó sin errores
- [ ] Veo tabla con 3 políticas:
  - [ ] `post_reactions_delete_policy`
  - [ ] `post_reactions_insert_policy`
  - [ ] `post_reactions_select_policy`
- [ ] Veo `rls_enabled = true`
- [ ] Veo número de reacciones totales
- [ ] Veo 5 reacciones de ejemplo

**Si algo falló:** Revisar errores en rojo y ejecutar de nuevo

---

## 🧪 PASO 2: VERIFICAR FIX

### Acciones:
- [ ] En SQL Editor, crear nueva query
- [ ] Copiar contenido de `database/reactions/TEST_REACTIONS_AFTER_FIX.sql`
- [ ] Ejecutar el script

### Verificar resultados:
- [ ] RLS está habilitado (`rls_enabled = true`)
- [ ] Hay 3 políticas activas
- [ ] Puedo ver reacciones existentes
- [ ] Los posts tienen reacciones asociadas
- [ ] La distribución de emojis se muestra correctamente

**Si algo falló:** Volver al Paso 1 y ejecutar de nuevo el fix

---

## 🎨 PASO 3: PROBAR EN LA APLICACIÓN

### 3.1 Recargar aplicación:
- [ ] Presionar Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac)
- [ ] La página se recargó completamente

### 3.2 Iniciar sesión:
- [ ] Ir a la página de login
- [ ] Ingresar: `admin@vecinoactivo.cl`
- [ ] Ingresar: `VecinoActivo2024!`
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Estoy en el feed de posts

### 3.3 Verificar visualización de reacciones:
- [ ] Veo emojis debajo de los posts
- [ ] Veo contadores de reacciones (números)
- [ ] Los emojis son visibles y claros
- [ ] Máximo 3 emojis únicos por post

### 3.4 Probar agregar reacción:
- [ ] Paso el mouse sobre "Me Uno"
- [ ] Aparece el picker con 5 emojis:
  - [ ] 🤝 Apoyo
  - [ ] ❤️ Me importa
  - [ ] 👏 Bien hecho
  - [ ] 💡 Buena idea
  - [ ] 🙌 Cuenta conmigo
- [ ] Hago clic en un emoji
- [ ] El emoji aparece inmediatamente en el post
- [ ] El contador aumenta en 1
- [ ] El botón "Me Uno" ahora muestra mi emoji

### 3.5 Probar cambiar reacción:
- [ ] Paso el mouse sobre "Me Uno" de nuevo
- [ ] Aparece el picker
- [ ] Selecciono un emoji diferente
- [ ] Mi reacción anterior desaparece
- [ ] La nueva reacción aparece
- [ ] El contador no cambia (solo reemplazo)

### 3.6 Probar quitar reacción:
- [ ] Hago clic en el botón "Me Uno" (con mi emoji)
- [ ] Mi reacción desaparece
- [ ] El contador disminuye en 1
- [ ] El botón vuelve a mostrar "Me Uno" sin emoji

### 3.7 Verificar persistencia:
- [ ] Agrego una reacción a un post
- [ ] Recargo la página (F5)
- [ ] Mi reacción sigue ahí
- [ ] El contador es el mismo

### 3.8 Probar en múltiples posts:
- [ ] Agrego reacciones a 3 posts diferentes
- [ ] Todas las reacciones se guardan
- [ ] Todas las reacciones se muestran
- [ ] Los contadores son correctos

---

## 🎉 PASO 4: VERIFICACIÓN FINAL

### Funcionalidades del carrusel de fotos:
- [ ] Posts con 1 foto: imagen grande única
- [ ] Posts con 2 fotos: grid de 2 columnas
- [ ] Posts con 3+ fotos: carrusel con:
  - [ ] Botones de navegación (< >)
  - [ ] Indicadores de posición (puntos)
  - [ ] Contador de imágenes (1/3, 2/3, etc.)
  - [ ] Puedo navegar entre imágenes

### Funcionalidades de reacciones:
- [ ] ✅ Veo reacciones existentes
- [ ] ✅ Veo contadores correctos
- [ ] ✅ Puedo agregar reacciones
- [ ] ✅ Puedo cambiar reacciones
- [ ] ✅ Puedo quitar reacciones
- [ ] ✅ Las reacciones persisten

### Otros elementos corregidos:
- [ ] Los nombres de autor se muestran correctamente (no [object Object])
- [ ] Los contadores de comentarios son números (no [object Object])
- [ ] Los contadores de shares son números (no [object Object])

---

## 🐛 TROUBLESHOOTING

### ❌ No veo las reacciones existentes

**Solución:**
1. [ ] Abrir consola del navegador (F12)
2. [ ] Buscar errores en rojo
3. [ ] Si veo error 406 o 401, volver al Paso 1
4. [ ] Ejecutar de nuevo el fix SQL

### ❌ No puedo agregar reacciones

**Solución:**
1. [ ] Verificar que estoy autenticado:
   - [ ] Abrir consola (F12)
   - [ ] Ejecutar: `localStorage.getItem('supabase.auth.token')`
   - [ ] Debe mostrar un token (no null)
2. [ ] Si no hay token:
   - [ ] Cerrar sesión
   - [ ] Volver a iniciar sesión
3. [ ] Si persiste:
   - [ ] Ir a Supabase SQL Editor
   - [ ] Ejecutar: `SELECT auth.uid();`
   - [ ] Debe devolver mi UUID (no NULL)

### ❌ Las reacciones desaparecen al recargar

**Solución:**
1. [ ] Volver al Paso 2
2. [ ] Ejecutar script de verificación
3. [ ] Verificar que las 3 políticas están activas
4. [ ] Si no están, volver al Paso 1

### ❌ Error "violates row-level security policy"

**Solución:**
1. [ ] Volver al Paso 1
2. [ ] Ejecutar de nuevo el fix SQL
3. [ ] Asegurarse de que se ejecutó completamente
4. [ ] Verificar que las 3 políticas se crearon

---

## 📊 RESUMEN DE ESTADO

### ✅ COMPLETADO (marcar cuando termine):
- [ ] Paso 1: Fix SQL ejecutado
- [ ] Paso 2: Verificación exitosa
- [ ] Paso 3: Pruebas en aplicación exitosas
- [ ] Paso 4: Verificación final exitosa

### 🎯 RESULTADO ESPERADO:
Cuando todos los checkboxes estén marcados, el sistema de reacciones estará funcionando al 100%.

---

## 📞 AYUDA ADICIONAL

Si después de completar todos los pasos algo no funciona:

1. **Revisar documentación detallada:**
   - `EJECUTAR_FIX_REACCIONES.md` - Guía paso a paso
   - `SOLUCION_REACCIONES_RLS.md` - Documentación técnica

2. **Verificar archivos:**
   - `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql` - Script de fix
   - `database/reactions/TEST_REACTIONS_AFTER_FIX.sql` - Script de verificación

3. **Revisar código:**
   - `src/services/supabaseReactionsService.js` - Servicio de reacciones
   - `src/components/Post/Post.js` - Componente de post

---

**Tiempo estimado total:** 10-15 minutos  
**Última actualización:** 27 de enero de 2026
