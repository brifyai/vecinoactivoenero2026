# ⚡ RESTAURAR BASE DE DATOS - ACCIÓN INMEDIATA

## 🎯 SITUACIÓN

Restauraste el código a un punto anterior, ahora necesitas sincronizar la base de datos.

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Ejecutar script SQL consolidado

1. **Ve a Supabase Dashboard** → https://supabase.com/dashboard
2. **Abre SQL Editor**
3. **Crea nueva query**
4. **Copia y pega** el contenido completo de:
   ```
   database/migrations/RESTAURAR_BASE_DATOS_COMPLETO.sql
   ```
5. **Haz clic en "Run"**
6. **Espera** a que termine (10-15 segundos)

### PASO 2: Verificar resultados

Deberías ver al final:

```
1. Columna media en posts: ✅ EXISTE
2. Posts con fotos: X posts con fotos
3. Políticas RLS de post_reactions: 3 políticas activas
4. Detalle de políticas:
   - post_reactions_delete_own (DELETE)
   - post_reactions_insert_all (INSERT)
   - post_reactions_select_all (SELECT)
5. RLS habilitado: ✅ SÍ
```

### PASO 3: Probar en la aplicación

1. **Recarga la aplicación** (Ctrl+Shift+R o Cmd+Shift+R)
2. **Verifica que:**
   - ✅ Los posts tienen fotos (1, 2 o 3+ imágenes)
   - ✅ El carrusel funciona (si hay 3+ fotos)
   - ✅ Puedes agregar reacciones
   - ✅ Las reacciones se guardan
   - ✅ Los posts tienen borde visible

---

## 📋 QUÉ HACE ESTE SCRIPT

### 1. Agrega columna `media` a posts
- Crea la columna si no existe
- Actualiza posts existentes con fotos de Unsplash
- Asigna 1-3 fotos según el contenido del post

### 2. Configura políticas RLS de reacciones
- Elimina políticas antiguas/conflictivas
- Crea 3 políticas permisivas que funcionan:
  - SELECT: Todos pueden ver reacciones
  - INSERT: Todos pueden agregar reacciones
  - DELETE: Todos pueden eliminar reacciones

### 3. Verifica que todo esté correcto
- Muestra estado de la columna media
- Cuenta posts con fotos
- Lista políticas RLS activas
- Confirma que RLS está habilitado

---

## 🐛 SI ALGO FALLA

### Error: "column media already exists"
✅ **Está bien**, significa que la columna ya existía. El script continúa.

### Error: "policy already exists"
✅ **Está bien**, el script las elimina primero con `DROP POLICY IF EXISTS`.

### Error: "table post_reactions does not exist"
❌ **Problema grave**. Ejecuta primero:
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

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de ejecutar el script:

- [ ] Script se ejecutó sin errores
- [ ] Veo "✅ EXISTE" para columna media
- [ ] Veo "X posts con fotos" (número mayor a 0)
- [ ] Veo "3 políticas activas"
- [ ] Veo "✅ SÍ" para RLS habilitado
- [ ] Recargué la aplicación (Ctrl+Shift+R)
- [ ] Los posts tienen fotos
- [ ] Puedo agregar reacciones
- [ ] Las reacciones se guardan
- [ ] Los posts tienen borde

---

## 🎉 RESULTADO ESPERADO

Después de ejecutar este script:

✅ **Base de datos sincronizada** con el código actual  
✅ **Posts con fotos** funcionando (carrusel incluido)  
✅ **Reacciones funcionando** al 100%  
✅ **Posts con borde** visible  
✅ **Sistema completo** operativo  

---

## ⏱️ TIEMPO ESTIMADO

- Ejecutar script: 2 minutos
- Verificar: 1 minuto
- Probar en app: 2 minutos
- **Total: 5 minutos**

---

**Próximo paso:** Ejecuta el script SQL AHORA en Supabase y luego recarga la aplicación.
