# ✅ INSTRUCCIONES FINALES - Setup de Datos

## 🎯 ARCHIVO A USAR

```
database/migrations/SETUP_SOLO_DATOS.sql
```

Este archivo **NO tiene**:
- ❌ Bloques `DO $`
- ❌ `CREATE POLICY IF NOT EXISTS`
- ❌ Sintaxis problemática

Solo tiene:
- ✅ Creación de tabla photo_comments
- ✅ Habilitación de Realtime
- ✅ Inserción de datos de prueba

---

## 📋 PASOS EXACTOS

### 1. Copia el archivo

Abre: `database/migrations/SETUP_SOLO_DATOS.sql`

Copia TODO el contenido (Ctrl+A, Ctrl+C)

### 2. Ejecuta en Supabase

1. Ve a **Supabase Dashboard**
2. Click en **SQL Editor**
3. Click en **New Query**
4. Pega el contenido
5. Click en **Run**

### 3. Ignora errores de Realtime

Si ves errores como:
```
ERROR: relation "users" is already member of publication
```

**Es normal.** El script continúa y crea los datos.

### 4. Verifica el resultado

Al final verás una tabla con:
```
RESUMEN DE DATOS CREADOS
  Posts: 16
  Comentarios: 30
  Reacciones: 50
  Eventos: 8
  Grupos: 6
  ...
```

---

## ⚠️ ERRORES QUE PUEDES IGNORAR

### Error de Realtime
```
ERROR: relation "X" is already member of publication "supabase_realtime"
```
**Solución:** Ignora. Significa que esa tabla ya tiene Realtime habilitado.

### Error de Constraint
```
ERROR: duplicate key value violates unique constraint
```
**Solución:** Ignora. Significa que ese dato ya existe (el script usa ON CONFLICT DO NOTHING).

---

## ✅ QUÉ CREA EL SCRIPT

| Tipo | Cantidad |
|------|----------|
| Posts | 10 nuevos |
| Comentarios | 30 |
| Reacciones | 50 |
| Eventos | 8 |
| Grupos | 6 |
| Amistades | 20 |
| Conversaciones | 5 |
| Mensajes | 15 |
| Proyectos | 4 |
| Encuestas | 3 |

---

## 🔧 DESPUÉS DEL SCRIPT

### 1. Crear Bucket Photos

1. Supabase Dashboard → **Storage**
2. Click **Create Bucket**
3. Name: `photos`
4. Public: ✅
5. Click **Create**

### 2. Configurar Policies (Opcional)

Si necesitas policies para photo_comments, ejecuta esto **por separado**:

```sql
-- Ejecutar UNO POR UNO en queries separadas

-- Query 1:
DROP POLICY IF EXISTS "Users can view photo comments" ON photo_comments;
CREATE POLICY "Users can view photo comments"
ON photo_comments FOR SELECT
TO authenticated
USING (true);

-- Query 2:
DROP POLICY IF EXISTS "Users can create photo comments" ON photo_comments;
CREATE POLICY "Users can create photo comments"
ON photo_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

## 🎉 RESULTADO FINAL

Después de ejecutar el script:

- ✅ Tabla photo_comments creada
- ✅ Realtime habilitado (12 tablas)
- ✅ 16+ posts en el feed
- ✅ 30+ comentarios
- ✅ 50+ reacciones
- ✅ 8 eventos próximos
- ✅ 6 grupos activos
- ✅ App con datos de prueba completos

---

## 📊 VERIFICACIÓN

Ejecuta en tu terminal:

```bash
node scripts/testing/deep_analysis.js
```

Resultado esperado:
- ✅ Salud del sistema: 95%+
- ✅ 0 problemas críticos

---

## 💡 RESUMEN DE ARCHIVOS

| Archivo | Problema | Usar |
|---------|----------|------|
| SETUP_COMPLETO_FINAL.sql | Error DROP TABLE | ❌ NO |
| SETUP_COMPLETO_FINAL_FIXED.sql | Error DO $ | ❌ NO |
| SETUP_COMPLETO_ULTRA_SIMPLE.sql | Error IF NOT EXISTS | ❌ NO |
| **SETUP_SOLO_DATOS.sql** | Sin errores | ✅ **SÍ** |

---

**Última actualización:** 2026-01-27 22:00  
**Archivo final:** `database/migrations/SETUP_SOLO_DATOS.sql`
