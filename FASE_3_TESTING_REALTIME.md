# 🧪 Fase 3: Testing de Real-time

## 🎯 Objetivo
Verificar que las subscripciones de Real-time funcionan correctamente y que los datos se sincronizan en tiempo real.

---

## ✅ Pre-requisitos

1. ✅ Aplicación corriendo en `http://localhost:3000`
2. ✅ Usuario autenticado (admin@vecinoactivo.cl)
3. ✅ Acceso a Supabase SQL Editor
4. ✅ Permisos de notificaciones del navegador otorgados

---

## 🧪 Test 1: Posts en Tiempo Real

### Método A: Dos Navegadores (Recomendado)

**Paso 1:** Abre la app en Chrome
```
http://localhost:3000/app/feed
```
- Inicia sesión con: `admin@vecinoactivo.cl` / `Admin123!`

**Paso 2:** Abre la app en Firefox (o ventana incógnita)
```
http://localhost:3000/app/feed
```
- Crea otro usuario o usa el mismo

**Paso 3:** En el segundo navegador, crea un post
- Escribe algo en el campo de crear post
- Haz clic en "Publicar"

**Resultado esperado:**
- ✅ El post aparece inmediatamente en el primer navegador
- ✅ No necesitas recargar la página
- ✅ En consola ves: `📡 Nuevo post: {...}`

---

### Método B: SQL Directo

**Paso 1:** Abre Supabase SQL Editor
```
https://supabase.vecinoactivo.cl
```

**Paso 2:** Obtén tu user_id
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
```
Copia el `id` (será algo como: `cb2fa6e2-b927-47e6-92b4-eb40f64b4683`)

**Paso 3:** Inserta un post directamente
```sql
INSERT INTO posts (author_id, content, created_at, updated_at)
VALUES (
  'TU-USER-ID-AQUI',
  'Post de prueba desde SQL - Real-time funcionando! 🚀',
  NOW(),
  NOW()
);
```

**Resultado esperado:**
- ✅ El post aparece inmediatamente en la app
- ✅ No necesitas recargar
- ✅ En consola ves: `📡 Nuevo post: {...}`

---

## 🧪 Test 2: Notificaciones en Tiempo Real

**Paso 1:** Asegúrate de tener permisos de notificaciones
- La app debe haber pedido permiso al iniciar sesión
- Si no, ve a configuración del navegador y permite notificaciones

**Paso 2:** Obtén tu user_id (igual que en Test 1)

**Paso 3:** Inserta una notificación en SQL
```sql
INSERT INTO notifications (user_id, type, message, created_at, read)
VALUES (
  'TU-USER-ID-AQUI',
  'info',
  'Notificación de prueba - Real-time funcionando! 🔔',
  NOW(),
  false
);
```

**Resultado esperado:**
- ✅ Aparece notificación del navegador (popup)
- ✅ Aparece en el dropdown de notificaciones
- ✅ Contador de notificaciones se actualiza
- ✅ En consola ves: `📡 Nueva notificación: {...}`

---

## 🧪 Test 3: Mensajes en Tiempo Real

**Paso 1:** Necesitas 2 usuarios
- Usuario A: `admin@vecinoactivo.cl` (ya existe)
- Usuario B: Crea otro usuario o usa SQL

**Crear Usuario B con SQL:**
```sql
-- Primero crear en auth.users
DO $$
DECLARE
  new_user_id UUID;
  hashed_password TEXT;
BEGIN
  new_user_id := gen_random_uuid();
  hashed_password := crypt('Password123!', gen_salt('bf'));
  
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    aud, role
  ) VALUES (
    new_user_id,
    'usuario2@vecinoactivo.cl',
    hashed_password,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  );
  
  -- Luego crear en public.users
  INSERT INTO public.users (
    id, email, password, name, avatar,
    verified, email_verified, created_at, updated_at
  ) VALUES (
    new_user_id,
    'usuario2@vecinoactivo.cl',
    hashed_password,
    'Usuario 2',
    'https://ui-avatars.com/api/?name=Usuario2&background=667eea&color=fff',
    true,
    true,
    NOW(),
    NOW()
  );
END $$;
```

**Paso 2:** Obtén los IDs de ambos usuarios
```sql
SELECT id, email FROM auth.users 
WHERE email IN ('admin@vecinoactivo.cl', 'usuario2@vecinoactivo.cl');
```

**Paso 3:** Inserta un mensaje de Usuario B a Usuario A
```sql
INSERT INTO messages (sender_id, recipient_id, content, created_at, read)
VALUES (
  'ID-USUARIO-B',
  'ID-USUARIO-A',
  'Mensaje de prueba - Real-time funcionando! 💬',
  NOW(),
  false
);
```

**Resultado esperado (en navegador de Usuario A):**
- ✅ Aparece notificación del navegador
- ✅ Mensaje aparece en la lista de mensajes
- ✅ Contador de mensajes no leídos se actualiza
- ✅ En consola ves: `📡 Nuevo mensaje: {...}`

---

## 🧪 Test 4: Actualización de Posts

**Paso 1:** Obtén el ID de un post existente
```sql
SELECT id, content FROM posts LIMIT 1;
```

**Paso 2:** Actualiza el post
```sql
UPDATE posts 
SET content = 'Post actualizado - Real-time funcionando! ✏️',
    updated_at = NOW()
WHERE id = 'ID-DEL-POST';
```

**Resultado esperado:**
- ✅ El post se actualiza inmediatamente en la app
- ✅ En consola ves: `📡 Post actualizado: {...}`

---

## 🧪 Test 5: Eliminación de Posts

**Paso 1:** Obtén el ID de un post
```sql
SELECT id, content FROM posts LIMIT 1;
```

**Paso 2:** Elimina el post
```sql
DELETE FROM posts WHERE id = 'ID-DEL-POST';
```

**Resultado esperado:**
- ✅ El post desaparece inmediatamente de la app
- ✅ En consola ves: `📡 Post eliminado: {...}`

---

## 🧪 Test 6: Verificar Subscripciones Activas

**Paso 1:** Abre la consola del navegador

**Paso 2:** Verifica los logs de subscripción
```
📡 Real-time Provider activado
📡 Iniciando subscripción a posts...
📡 Iniciando subscripción a notificaciones...
📡 Iniciando subscripción a mensajes...
📡 Subscription status for posts: SUBSCRIBED
📡 Subscription status for notifications: SUBSCRIBED
📡 Subscription status for messages: SUBSCRIBED
```

**Paso 3:** Verifica que las subscripciones se limpian al hacer logout
- Haz logout
- Verifica en consola:
```
📡 Cancelando subscripción a posts...
📡 Cancelando subscripción a notificaciones...
📡 Cancelando subscripción a mensajes...
📡 Real-time Provider desactivado (usuario no autenticado)
```

---

## 🧪 Test 7: Notificaciones del Navegador

**Paso 1:** Verifica permisos
```javascript
// En consola del navegador
console.log('Permiso:', Notification.permission);
// Debe mostrar: "granted"
```

**Paso 2:** Si no tienes permiso, solicítalo
```javascript
Notification.requestPermission().then(permission => {
  console.log('Nuevo permiso:', permission);
});
```

**Paso 3:** Prueba notificación manual
```javascript
new Notification('Prueba', {
  body: 'Notificación de prueba',
  icon: '/logo192.png'
});
```

**Resultado esperado:**
- ✅ Aparece popup de notificación del sistema operativo

---

## 📊 Checklist de Testing

### Posts
- [ ] Nuevo post aparece en tiempo real (2 navegadores)
- [ ] Nuevo post aparece en tiempo real (SQL directo)
- [ ] Post actualizado se refleja en tiempo real
- [ ] Post eliminado desaparece en tiempo real
- [ ] Logs en consola correctos

### Notificaciones
- [ ] Nueva notificación aparece en tiempo real
- [ ] Notificación del navegador se muestra
- [ ] Contador se actualiza
- [ ] Notificación aparece en dropdown
- [ ] Logs en consola correctos

### Mensajes
- [ ] Nuevo mensaje aparece en tiempo real
- [ ] Notificación del navegador se muestra
- [ ] Mensaje aparece en lista
- [ ] Contador se actualiza
- [ ] Logs en consola correctos

### Subscripciones
- [ ] Subscripciones se crean al login
- [ ] Subscripciones se cancelan al logout
- [ ] No hay memory leaks
- [ ] Logs de status correctos

### Notificaciones del Navegador
- [ ] Permiso solicitado correctamente
- [ ] Notificaciones se muestran
- [ ] Icono correcto
- [ ] Mensaje correcto

---

## 🐛 Troubleshooting

### Problema: No aparecen los cambios en tiempo real

**Solución 1:** Verifica que estás autenticado
```javascript
// En consola
console.log('Autenticado:', localStorage.getItem('supabase.auth.token'));
```

**Solución 2:** Verifica las subscripciones
```javascript
// En consola
console.log('Subscripciones activas');
```

**Solución 3:** Recarga la página y verifica logs

---

### Problema: No aparecen notificaciones del navegador

**Solución 1:** Verifica permisos
```javascript
console.log(Notification.permission);
```

**Solución 2:** Solicita permisos manualmente
```javascript
Notification.requestPermission();
```

**Solución 3:** Verifica configuración del navegador
- Chrome: Configuración > Privacidad > Notificaciones
- Firefox: Preferencias > Privacidad > Permisos > Notificaciones

---

### Problema: Logs no aparecen en consola

**Solución:** Verifica que no estés filtrando logs
- Abre DevTools
- Ve a Console
- Asegúrate de que "All levels" esté seleccionado
- Busca el emoji 📡 para filtrar logs de Real-time

---

## 🎯 Criterios de Éxito

La Fase 3 se considera exitosa si:

1. ✅ Posts aparecen en tiempo real sin recargar
2. ✅ Notificaciones llegan instantáneamente
3. ✅ Mensajes se sincronizan en tiempo real
4. ✅ Notificaciones del navegador funcionan
5. ✅ Subscripciones se crean y limpian correctamente
6. ✅ No hay errores en consola
7. ✅ No hay memory leaks

---

## 📝 Reporte de Testing

Después de completar los tests, documenta los resultados:

```markdown
## Resultados de Testing - Fase 3

**Fecha:** [FECHA]
**Tester:** [NOMBRE]

### Posts en Tiempo Real
- [ ] ✅ Funcionando
- [ ] ⚠️ Con problemas: [DESCRIPCIÓN]
- [ ] ❌ No funciona: [DESCRIPCIÓN]

### Notificaciones en Tiempo Real
- [ ] ✅ Funcionando
- [ ] ⚠️ Con problemas: [DESCRIPCIÓN]
- [ ] ❌ No funciona: [DESCRIPCIÓN]

### Mensajes en Tiempo Real
- [ ] ✅ Funcionando
- [ ] ⚠️ Con problemas: [DESCRIPCIÓN]
- [ ] ❌ No funciona: [DESCRIPCIÓN]

### Notificaciones del Navegador
- [ ] ✅ Funcionando
- [ ] ⚠️ Con problemas: [DESCRIPCIÓN]
- [ ] ❌ No funciona: [DESCRIPCIÓN]

### Observaciones
[NOTAS ADICIONALES]
```

---

**Próximo paso:** Si todos los tests pasan, continuar con Fase 4 (Completar funcionalidades pendientes)

---

**Creado:** 2026-01-24  
**Autor:** Kiro AI Assistant
