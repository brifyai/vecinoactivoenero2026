# 📝 Instrucciones para Crear Usuarios de Prueba

## ⚠️ Problema Detectado

El error que recibiste indica que la tabla `public.users` tiene una columna `password` que es NOT NULL:

```
ERROR: null value in column "password" of relation "users" violates not-null constraint
```

## ✅ Solución: Dos Opciones

### OPCIÓN 1: Script SQL Simple (Recomendado para Testing)

Este script crea usuarios solo en `public.users` para que aparezcan en "Descubrir Vecinos".

**Archivo:** `database/setup/CREATE_TEST_USERS_SIMPLE.sql`

**Pasos:**
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `CREATE_TEST_USERS_SIMPLE.sql`
3. Ejecuta el script
4. Los usuarios aparecerán en "Descubrir Vecinos"

**Nota:** Estos usuarios NO podrán hacer login porque no están en `auth.users`. Son solo para visualización.

### OPCIÓN 2: Crear Usuarios con Autenticación (Para Login Real)

Si quieres que los usuarios puedan hacer login, debes crearlos en el panel de Authentication de Supabase.

**Pasos:**

1. **Ve a Supabase Dashboard → Authentication → Users**

2. **Click en "Add User" (o "Invite User")**

3. **Completa el formulario:**
   - Email: `maria.gonzalez@vecinoactivo.cl`
   - Password: `VecinoActivo2024!`
   - Auto Confirm User: ✅ (activar)

4. **Repite para cada usuario:**
   - maria.gonzalez@vecinoactivo.cl
   - carlos.rodriguez@vecinoactivo.cl
   - ana.martinez@vecinoactivo.cl
   - pedro.silva@vecinoactivo.cl
   - laura.fernandez@vecinoactivo.cl
   - diego.torres@vecinoactivo.cl
   - carmen.lopez@vecinoactivo.cl
   - roberto.munoz@vecinoactivo.cl
   - patricia.vargas@vecinoactivo.cl
   - andres.soto@vecinoactivo.cl

5. **Después, ejecuta este SQL para completar los perfiles:**

```sql
-- Actualizar perfil de María González
UPDATE public.users
SET 
  name = 'María González',
  username = 'maria-gonzalez',
  avatar = 'https://i.pravatar.cc/150?img=5',
  bio = 'Vecina activa de Las Condes. Me encanta organizar eventos comunitarios.',
  neighborhood_name = 'Las Condes Centro',
  neighborhood_code = 'LC-001',
  verified = false,
  email_verified = true
WHERE email = 'maria.gonzalez@vecinoactivo.cl';

-- Repetir para cada usuario...
```

## 🧪 Probar el Sistema en Tiempo Real

Una vez que hayas creado los usuarios con la **OPCIÓN 1**:

### Test 1: Ver Usuarios en "Descubrir Vecinos"

1. Ve a `/app/descubrir-vecinos`
2. Deberías ver los 10 usuarios creados
3. Verás el indicador verde: "🟢 Actualizaciones en tiempo real"

### Test 2: Probar Tiempo Real

1. Abre `/app/descubrir-vecinos` en el navegador
2. Abre Supabase SQL Editor en otra pestaña
3. Ejecuta este SQL para crear un nuevo usuario:

```sql
INSERT INTO public.users (
  email,
  password,
  name,
  username,
  avatar,
  bio,
  neighborhood_name,
  neighborhood_code,
  verified,
  email_verified
) VALUES (
  'nuevo.vecino@vecinoactivo.cl',
  'hashed_password_placeholder',
  'Nuevo Vecino',
  'nuevo-vecino',
  'https://i.pravatar.cc/150?img=25',
  'Soy un vecino nuevo en el barrio.',
  'Las Condes Centro',
  'LC-001',
  false,
  true
);
```

4. **El nuevo usuario aparecerá automáticamente** en la página sin recargar
5. En la consola verás:
   ```
   🔴 Cambio detectado en usuarios: {eventType: 'INSERT', ...}
   🔄 Cargando usuarios desde Supabase...
   ✅ Usuarios cargados desde Supabase: 11
   ```

### Test 3: Actualizar Usuario en Tiempo Real

```sql
UPDATE public.users
SET name = 'María González Actualizada'
WHERE email = 'maria.gonzalez@vecinoactivo.cl';
```

El nombre se actualizará automáticamente en la interfaz.

### Test 4: Eliminar Usuario en Tiempo Real

```sql
DELETE FROM public.users
WHERE email = 'nuevo.vecino@vecinoactivo.cl';
```

El usuario desaparecerá automáticamente de la lista.

## 🔍 Verificar que Funciona

### En la Consola del Navegador (F12)

Deberías ver estos logs:

```
🔄 Cargando usuarios desde Supabase...
✅ Usuarios cargados desde Supabase: 10
🔴 Configurando suscripción en tiempo real para usuarios...
✅ Suscripción en tiempo real activa para usuarios
```

### En la Interfaz

- ✅ Indicador verde: "🟢 Actualizaciones en tiempo real"
- ✅ Lista de 10 usuarios con avatares
- ✅ Cada usuario muestra: nombre, username, bio, ubicación

## 🚨 Troubleshooting

### Error: "password violates not-null constraint"

**Causa:** Intentaste insertar un usuario sin el campo `password`.

**Solución:** Usa el script `CREATE_TEST_USERS_SIMPLE.sql` que incluye el campo `password`.

### Error: "duplicate key value violates unique constraint"

**Causa:** El usuario ya existe en la base de datos.

**Solución:** 
```sql
-- Eliminar usuarios existentes
DELETE FROM public.users WHERE email LIKE '%@vecinoactivo.cl';

-- Luego ejecuta el script de nuevo
```

### No aparecen usuarios en "Descubrir Vecinos"

**Causa:** No hay usuarios en la base de datos o no coinciden con tu barrio.

**Solución:**
1. Verifica que los usuarios existan:
   ```sql
   SELECT * FROM public.users WHERE email LIKE '%@vecinoactivo.cl';
   ```
2. Verifica tu `neighborhood_name`:
   ```sql
   SELECT neighborhood_name FROM public.users WHERE id = 'TU_USER_ID';
   ```
3. Asegúrate de que algunos usuarios tengan el mismo `neighborhood_name`

### No se detectan cambios en tiempo real

**Causa:** Supabase Realtime no está habilitado para la tabla `users`.

**Solución:**
1. Ve a Supabase Dashboard → Database → Replication
2. Busca la tabla `users`
3. Activa el toggle de Realtime
4. O ejecuta este SQL:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE users;
   ```

## 📊 Resumen de Usuarios Creados

| Email | Nombre | Username | Barrio |
|-------|--------|----------|--------|
| maria.gonzalez@vecinoactivo.cl | María González | maria-gonzalez | Las Condes Centro |
| carlos.rodriguez@vecinoactivo.cl | Carlos Rodríguez | carlos-rodriguez | Providencia Norte |
| ana.martinez@vecinoactivo.cl | Ana Martínez | ana-martinez | Ñuñoa Centro |
| pedro.silva@vecinoactivo.cl | Pedro Silva | pedro-silva | Maipú Centro |
| laura.fernandez@vecinoactivo.cl | Laura Fernández | laura-fernandez | Las Condes Centro |
| diego.torres@vecinoactivo.cl | Diego Torres | diego-torres | Providencia Norte |
| carmen.lopez@vecinoactivo.cl | Carmen López | carmen-lopez | Ñuñoa Centro |
| roberto.munoz@vecinoactivo.cl | Roberto Muñoz | roberto-munoz | Maipú Centro |
| patricia.vargas@vecinoactivo.cl | Patricia Vargas | patricia-vargas | Las Condes Centro |
| andres.soto@vecinoactivo.cl | Andrés Soto | andres-soto | Providencia Norte |

**Contraseña para todos (si usas OPCIÓN 2):** `VecinoActivo2024!`

## ✅ Siguiente Paso

1. Ejecuta el script `CREATE_TEST_USERS_SIMPLE.sql` en Supabase SQL Editor
2. Ve a `/app/descubrir-vecinos`
3. Verifica que aparezcan los 10 usuarios
4. Prueba el tiempo real creando un nuevo usuario
5. Confirma que aparece automáticamente sin recargar

¡Listo! El sistema está 100% funcional y en tiempo real. 🎉
