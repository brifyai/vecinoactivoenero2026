# 🔧 FIX: Admin sin Vecindarios Asignados

**Fecha**: 29 Enero 2026  
**Usuario**: admin@vecinoactivo.cl  
**Problema**: "No tienes vecindarios asignados"  
**Estado**: ⏳ PENDIENTE EJECUCIÓN SQL

---

## 🚨 PROBLEMA

Al iniciar sesión como admin en https://vecinoactivo.cl/admin/dashboard aparece:

```
No tienes vecindarios asignados
Volver al login
```

### Causa
El usuario `admin@vecinoactivo.cl` existe en la tabla `users` pero NO tiene registros en la tabla `neighborhood_admins`, por lo tanto el sistema no le permite acceder al dashboard.

---

## ✅ SOLUCIÓN

Ejecutar el script SQL que asigna TODOS los vecindarios al usuario admin.

### Pasos para Ejecutar

#### 1. Conectarse a la Base de Datos

**Opción A: Desde Supabase Dashboard**
```
1. Ir a https://supabase.vecinoactivo.cl
2. Login con credenciales de admin
3. Ir a SQL Editor
4. Copiar y pegar el script
5. Click en "Run"
```

**Opción B: Desde psql (línea de comandos)**
```bash
psql -h supabase.vecinoactivo.cl -U postgres -d postgres -f database/admin/ASIGNAR_VECINDARIOS_ADMIN.sql
```

#### 2. Ejecutar el Script

Archivo: `database/admin/ASIGNAR_VECINDARIOS_ADMIN.sql`

El script hace:
1. ✅ Verifica que el usuario admin existe
2. ✅ Obtiene el ID del usuario
3. ✅ Asigna TODOS los vecindarios con rol 'admin'
4. ✅ Otorga todos los permisos necesarios
5. ✅ Muestra resumen de asignaciones

#### 3. Verificar

Después de ejecutar el script, deberías ver:

```sql
-- Resultado esperado:
Admin user ID: [UUID del admin]
Asignado vecindario: Vecindario 1 (ID: ...)
Asignado vecindario: Vecindario 2 (ID: ...)
...
Vecindarios asignados exitosamente

-- Verificación:
total_vecindarios_asignados
---------------------------
              5  (o el número de vecindarios que tengas)
```

#### 4. Probar Login

1. Ir a https://vecinoactivo.cl/iniciar-sesion-admin
2. Login con:
   - Email: `admin@vecinoactivo.cl`
   - Password: `admin123`
3. Debería redirigir a `/admin/dashboard/overview`
4. Debería ver el dashboard con datos

---

## 📊 ESTRUCTURA DE TABLAS

### Tabla: `users`
```sql
id          | UUID (PK)
email       | admin@vecinoactivo.cl
name        | Admin
password    | [hash]
```

### Tabla: `neighborhoods`
```sql
id          | UUID (PK)
name        | Nombre del vecindario
code        | Código único
```

### Tabla: `neighborhood_admins`
```sql
id              | UUID (PK)
neighborhood_id | UUID (FK → neighborhoods.id)
user_id         | UUID (FK → users.id)
role            | 'admin' | 'moderator' | 'viewer'
permissions     | ARRAY de permisos
created_at      | TIMESTAMP
updated_at      | TIMESTAMP
```

---

## 🔍 DIAGNÓSTICO

### Verificar si el Admin Existe
```sql
SELECT id, email, name 
FROM users 
WHERE email = 'admin@vecinoactivo.cl';
```

**Resultado esperado:**
```
id                                   | email                    | name
-------------------------------------|--------------------------|------
[UUID]                               | admin@vecinoactivo.cl    | Admin
```

### Verificar Vecindarios Disponibles
```sql
SELECT id, name, code 
FROM neighborhoods 
ORDER BY name;
```

### Verificar Asignaciones Actuales
```sql
SELECT 
    u.email,
    n.name as neighborhood,
    na.role,
    na.permissions
FROM neighborhood_admins na
JOIN users u ON na.user_id = u.id
JOIN neighborhoods n ON na.neighborhood_id = n.id
WHERE u.email = 'admin@vecinoactivo.cl';
```

**Si retorna 0 filas** = El admin NO tiene vecindarios asignados (PROBLEMA)

---

## 🎯 PERMISOS ASIGNADOS

El script asigna estos permisos al admin:

```javascript
permissions: [
  'manage_users',      // Gestionar usuarios
  'manage_tickets',    // Gestionar tickets
  'manage_campaigns',  // Gestionar campañas
  'manage_settings',   // Gestionar configuración
  'view_analytics'     // Ver analíticas
]
```

---

## 🔐 SEGURIDAD

### Cambiar Password del Admin (Recomendado)

Después de asignar vecindarios, cambiar el password por seguridad:

```sql
-- Generar nuevo hash de password
-- Usar bcrypt con salt rounds = 10
-- Ejemplo con password 'NuevoPassword123!'

UPDATE users 
SET password = '[nuevo_hash_bcrypt]'
WHERE email = 'admin@vecinoactivo.cl';
```

**Nota**: El hash debe generarse con bcrypt. No guardar passwords en texto plano.

---

## 📝 NOTAS TÉCNICAS

### Por Qué Falla el Login

El código en `AdminDashboard.js` hace:

```javascript
// 1. Verifica autenticación
if (!isAuthenticated) {
  navigate('/iniciar-sesion-admin');
  return;
}

// 2. Carga vecindarios del usuario
const neighborhoodsResult = await dispatch(fetchUserNeighborhoods(user.id));

// 3. Si NO tiene vecindarios → ERROR
if (!neighborhoods || neighborhoods.length === 0) {
  setError('No tienes vecindarios asignados');
  setLoading(false);
  return;
}
```

### Solución Alternativa (Temporal)

Si no puedes ejecutar SQL inmediatamente, puedes comentar temporalmente la validación:

```javascript
// TEMPORAL - Solo para testing
// if (!neighborhoods || neighborhoods.length === 0) {
//   setError('No tienes vecindarios asignados');
//   setLoading(false);
//   return;
// }
```

**⚠️ NO RECOMENDADO para producción** - Solo para debugging.

---

## ✅ CHECKLIST

- [ ] Conectarse a la base de datos
- [ ] Ejecutar `ASIGNAR_VECINDARIOS_ADMIN.sql`
- [ ] Verificar que retorna vecindarios asignados
- [ ] Probar login en https://vecinoactivo.cl/iniciar-sesion-admin
- [ ] Verificar acceso al dashboard
- [ ] (Opcional) Cambiar password del admin
- [ ] (Opcional) Crear más usuarios admin si es necesario

---

## 🚀 DESPUÉS DE EJECUTAR

Una vez ejecutado el script:

1. ✅ Admin puede acceder al dashboard
2. ✅ Ve todos los vecindarios en el selector
3. ✅ Puede gestionar usuarios, tickets, campañas
4. ✅ Tiene acceso completo a todas las funcionalidades

---

## 📚 ARCHIVOS RELACIONADOS

- `database/admin/ASIGNAR_VECINDARIOS_ADMIN.sql` - Script de asignación
- `src/pages/AdminDashboard/AdminDashboard.js` - Validación de vecindarios
- `src/store/slices/adminDashboardSlice.js` - Redux slice
- `src/services/supabaseAdminService.js` - Servicio de admin

---

**Última actualización**: 29 Enero 2026  
**Prioridad**: 🔥 ALTA - Admin no puede acceder al dashboard  
**Acción requerida**: Ejecutar script SQL en base de datos
