# INSTRUCCIONES: Asignar Vecindarios al Admin

## ✅ COMPLETADO
- [x] Tabla `neighborhoods` cargada con 6891 vecindarios
- [x] Script de carga funcionando sin errores
- [x] Conversión de geometrías (Polygon → MultiPolygon, 3D → 2D)
- [x] Commit y push a Git

---

## 🎯 SIGUIENTE PASO: Asignar Vecindarios al Admin

### Opción 1: Ejecutar desde Supabase Dashboard (RECOMENDADO)

1. **Ir a Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Seleccionar tu proyecto

2. **Abrir SQL Editor**
   - En el menú lateral: `SQL Editor`
   - Click en `New query`

3. **Copiar y pegar el contenido del archivo**
   ```
   database/admin/CREAR_ADMIN_COMPLETO.sql
   ```

4. **Ejecutar el script**
   - Click en `Run` o presionar `Ctrl/Cmd + Enter`

5. **Verificar resultado**
   Deberías ver:
   ```
   ✅ Admin user ID: [UUID del admin]
   ✅ Asignado vecindario: [nombre] (ID: [id])
   ... (6891 veces)
   ✅ Total vecindarios asignados: 6891
   
   email                    | name  | total_vecindarios_asignados | roles
   -------------------------|-------|----------------------------|---------------
   admin@vecinoactivo.cl    | Admin | 6891                       | {super_admin}
   ```

---

### Opción 2: Ejecutar desde línea de comandos

Si tienes `psql` instalado y las credenciales de conexión:

```bash
# Conectar a Supabase
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/postgres"

# Ejecutar el script
\i database/admin/CREAR_ADMIN_COMPLETO.sql
```

---

## 🔍 VERIFICACIÓN

### 1. Verificar en la base de datos

Ejecutar en SQL Editor:

```sql
-- Ver total de vecindarios asignados al admin
SELECT 
    u.email,
    u.name,
    COUNT(ar.id) as total_vecindarios,
    array_agg(DISTINCT ar.role_type) as roles
FROM users u
LEFT JOIN admin_roles ar ON u.id = ar.user_id AND ar.is_active = true
WHERE u.email = 'admin@vecinoactivo.cl'
GROUP BY u.email, u.name;
```

**Resultado esperado**:
```
email                 | name  | total_vecindarios | roles
----------------------|-------|-------------------|---------------
admin@vecinoactivo.cl | Admin | 6891              | {super_admin}
```

### 2. Verificar en el Dashboard

1. **Ir a**: https://vecinoactivo.cl/iniciar-sesion-admin

2. **Login con**:
   - Email: `admin@vecinoactivo.cl`
   - Password: `admin123`

3. **Verificar que**:
   - ✅ El dashboard carga correctamente
   - ✅ NO aparece el mensaje "No tienes vecindarios asignados"
   - ✅ Se muestran estadísticas de los 6891 vecindarios
   - ✅ Puedes acceder a todas las secciones del admin

---

## 📊 QUÉ HACE EL SCRIPT

### Paso 1: Crear tabla admin_roles
- Crea la tabla si no existe
- Define estructura con permisos JSONB
- Crea índices para optimizar consultas

### Paso 2: Asignar vecindarios
- Busca el usuario admin por email
- Itera sobre TODOS los vecindarios (6891)
- Crea un registro en `admin_roles` por cada vecindario
- Asigna rol `super_admin` con todos los permisos
- Usa `ON CONFLICT` para evitar duplicados

### Paso 3: Verificar resultado
- Muestra resumen de vecindarios asignados
- Lista los primeros 10 vecindarios como ejemplo

---

## 🚨 POSIBLES ERRORES

### Error: "Usuario admin@vecinoactivo.cl no encontrado"

**Solución**: Crear el usuario admin primero

```sql
-- Verificar si existe
SELECT id, email, name FROM users WHERE email = 'admin@vecinoactivo.cl';

-- Si no existe, ejecutar:
-- database/admin/ASIGNAR_VECINDARIOS_ADMIN_SIMPLE.sql
```

### Error: "relation admin_roles does not exist"

**Solución**: El script ya crea la tabla automáticamente. Si persiste:

```sql
-- Verificar tablas existentes
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Error: "neighborhoods table is empty"

**Solución**: Ya resuelto. Ejecutaste `node scripts/cargar-vecindarios.js` exitosamente.

---

## 📝 PERMISOS ASIGNADOS

El admin tendrá estos permisos en TODOS los vecindarios:

```json
{
  "manage_users": true,
  "manage_tickets": true,
  "manage_campaigns": true,
  "manage_settings": true,
  "view_analytics": true
}
```

---

## 🎉 RESULTADO FINAL ESPERADO

Después de ejecutar el script:

1. ✅ Tabla `admin_roles` con 6891 registros
2. ✅ Admin con acceso a todos los vecindarios
3. ✅ Dashboard funcionando correctamente
4. ✅ Sin mensaje de error "No tienes vecindarios asignados"

---

## 📚 ARCHIVOS RELACIONADOS

- **Script SQL**: `database/admin/CREAR_ADMIN_COMPLETO.sql`
- **Verificación**: `database/admin/VERIFICAR_NEIGHBORHOODS.sql`
- **Script de carga**: `scripts/cargar-vecindarios.js`
- **Resumen sesión**: `RESUMEN_SESION_29_ENE_2026.md`

---

**Fecha**: 29 Enero 2026  
**Status**: ⏳ Pendiente ejecutar script SQL en Supabase
