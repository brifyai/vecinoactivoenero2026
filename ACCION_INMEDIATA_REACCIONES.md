# ⚡ ACCIÓN INMEDIATA: Reacciones no se guardan

## 🎯 PASO 1: Verificar en la consola del navegador

1. Abre la aplicación
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Intenta agregar una reacción a un post
5. **Copia TODOS los mensajes que aparezcan** (especialmente los que empiezan con ❌)

---

## 🔍 PASO 2: Identificar el error

### ¿Qué ves en la consola?

#### Opción A: Error 42501
```
❌ Error code: 42501
❌ Error message: new row violates row-level security policy
```

**SOLUCIÓN:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta: `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql`
3. Recarga la app (Ctrl+Shift+R)

---

#### Opción B: Error 42703
```
❌ Error code: 42703
❌ Error message: column post_reactions.reaction_type does not exist
```

**SOLUCIÓN:**
1. Recarga la app con caché limpio: Ctrl+Shift+R
2. Si persiste, cierra el navegador completamente y vuelve a abrir

---

#### Opción C: Usuario no autenticado
```
❌ Usuario no autenticado
```

**SOLUCIÓN:**
1. Cierra sesión
2. Vuelve a iniciar sesión con:
   - Email: `admin@vecinoactivo.cl`
   - Password: `VecinoActivo2024!`

---

#### Opción D: No aparece ningún error
```
🎯 handleReaction iniciado
👤 user: {id: "...", ...}
📝 post.id: "..."
✅ reactionEmoji: "🤝"
✅ user.id: "..."
✅ Reacción guardada exitosamente: 🤝
```

**Si ves esto pero la reacción no aparece:**
- El guardado funciona, pero hay un problema de visualización
- Recarga la página (F5) y verifica si la reacción aparece

---

## 🔧 PASO 3: Ejecutar diagnóstico en Supabase

1. Ve a Supabase Dashboard
2. Abre SQL Editor
3. Ejecuta: `database/reactions/DIAGNOSTICO_RAPIDO_REACCIONES.sql`
4. Revisa los resultados:

### Resultados esperados:
```
1. Tabla post_reactions: ✅ EXISTE
2. RLS habilitado: ✅ SÍ
3. Políticas RLS: 3 políticas activas
4. Detalle de políticas: SELECT, INSERT, DELETE
5. Columna emoji: ✅ EXISTE
6. Reacciones totales: X reacciones en la BD
7. Autenticación: ✅ AUTENTICADO (UUID: ...)
```

### Si algo está en ❌:
- **Tabla NO EXISTE** → Problema grave, contactar soporte
- **RLS NO** → Ejecutar `FIX_REACTIONS_RLS_DEFINITIVO.sql`
- **Menos de 3 políticas** → Ejecutar `FIX_REACTIONS_RLS_DEFINITIVO.sql`
- **Columna emoji NO EXISTE** → Problema grave, contactar soporte
- **NO AUTENTICADO** → Iniciar sesión en la app primero

---

## 🧪 PASO 4: Prueba manual en Supabase

Si todo lo anterior está bien, prueba insertar manualmente:

```sql
-- 1. Obtén un post_id válido
SELECT id FROM posts LIMIT 1;

-- 2. Obtén tu user_id
SELECT auth.uid();

-- 3. Intenta insertar (reemplaza los UUIDs)
INSERT INTO post_reactions (post_id, user_id, emoji)
VALUES (
    'PEGA_AQUI_EL_POST_ID',
    'PEGA_AQUI_TU_USER_ID',
    '🤝'
);
```

### Resultado:
- **✅ Funciona** → El problema está en el código frontend
- **❌ Falla** → El problema está en las políticas RLS

---

## 📊 PASO 5: Verificar que se guardó

```sql
-- Ver las últimas 10 reacciones
SELECT 
    pr.emoji,
    pr.created_at,
    u.name as usuario,
    LEFT(p.content, 30) as post_preview
FROM post_reactions pr
JOIN users u ON pr.user_id = u.id
JOIN posts p ON pr.post_id = p.id
ORDER BY pr.created_at DESC
LIMIT 10;
```

Si ves tu reacción aquí, se guardó correctamente.

---

## 🎯 SOLUCIONES RÁPIDAS POR SÍNTOMA

### Síntoma 1: "Error 42501" en consola
→ **Ejecutar:** `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql`

### Síntoma 2: "Error 42703" en consola
→ **Acción:** Ctrl+Shift+R para limpiar caché

### Síntoma 3: No aparece ningún error pero no se guarda
→ **Verificar:** Ejecutar `DIAGNOSTICO_RAPIDO_REACCIONES.sql`

### Síntoma 4: "Usuario no autenticado"
→ **Acción:** Cerrar sesión y volver a iniciar

### Síntoma 5: Se guarda pero no se muestra
→ **Acción:** Recargar página (F5)

---

## 📝 INFORMACIÓN PARA REPORTAR

Si nada funciona, copia y pega esta información:

```
REPORTE DE ERROR - REACCIONES

1. Error en consola:
[Pega aquí el error completo de la consola]

2. Resultado del diagnóstico SQL:
[Pega aquí el resultado de DIAGNOSTICO_RAPIDO_REACCIONES.sql]

3. ¿Ejecutaste el script FIX_REACTIONS_RLS_DEFINITIVO.sql?
[ ] SÍ
[ ] NO

4. ¿Estás autenticado?
[ ] SÍ
[ ] NO

5. ¿Qué navegador usas?
[ ] Chrome
[ ] Firefox
[ ] Safari
[ ] Edge
[ ] Otro: _______

6. ¿Recargaste con Ctrl+Shift+R?
[ ] SÍ
[ ] NO
```

---

## ⏱️ TIEMPO ESTIMADO

- Verificar consola: 1 min
- Ejecutar diagnóstico: 2 min
- Aplicar solución: 3 min
- **Total: 6 minutos**

---

## 🆘 AYUDA ADICIONAL

- **Guía completa:** `DEBUG_REACCIONES_NO_GUARDAN.md`
- **Script SQL fix:** `database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql`
- **Script diagnóstico:** `database/reactions/DIAGNOSTICO_RAPIDO_REACCIONES.sql`

---

**Próximo paso:** Abre la consola (F12) e intenta agregar una reacción. Dime qué error ves.
