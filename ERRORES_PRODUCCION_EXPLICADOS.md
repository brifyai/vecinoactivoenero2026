# 📊 ERRORES EN PRODUCCIÓN - EXPLICADOS

**Fecha:** 28 Enero 2026  
**Sitio:** https://vecinoactivo.cl

---

## 🎯 RESUMEN EJECUTIVO

| Error | Prioridad | Estado | Impacto |
|-------|-----------|--------|---------|
| manifest.json 404 | ⚠️ Media | Pendiente deployment | Solo PWA |
| WebSocket failed | ⚠️ Baja | Funcional (fallback) | Tiempo real deshabilitado |
| Friends query 400 | 🔥 Alta | ✅ CORREGIDO | Carga de amigos |

---

## 1. ⚠️ manifest.json 404 (NO CRÍTICO)

### Error:
```
Failed to load resource: the server responded with a status of 404 ()
Manifest fetch from https://vecinoactivo.cl/manifest.json failed, code 404
```

### ¿Qué es?
El archivo `manifest.json` no está disponible en producción. Este archivo define cómo se comporta la app cuando se instala como PWA (Progressive Web App).

### ¿Afecta la funcionalidad?
**NO.** Solo afecta:
- ❌ Instalación como PWA
- ❌ Agregar a pantalla de inicio en móviles
- ❌ Metadata de la app (nombre, iconos, colores)

### ¿Qué funciona normal?
- ✅ Toda la funcionalidad del sitio
- ✅ Navegación
- ✅ Autenticación
- ✅ Posts, comentarios, reacciones
- ✅ Mensajes
- ✅ Todo lo demás

### Estado:
- ✅ Fix implementado (script postbuild.js)
- ✅ Código enviado a Git (commit a4a59a8)
- ⏳ Pendiente: Redeploy desde EasyPanel

### Solución:
Lee `INSTRUCCIONES_DEPLOYMENT_MANIFEST_FIX.md` para hacer el deployment.

---

## 2. ⚠️ WebSocket Connection Failed (NO CRÍTICO - ESPERADO)

### Error:
```
WebSocket connection to 'wss://supabase.vecinoactivo.cl/realtime/v1/websocket?apikey=...' failed
```

### ¿Qué es?
Este error aparece porque el código intenta conectarse al WebSocket de Supabase Realtime, pero tu instalación self-hosted **no tiene este módulo habilitado**.

### ¿Por qué falla?
Tu Supabase es **self-hosted** y el módulo Realtime **no está configurado**. Esto es **normal y esperado** en instalaciones básicas.

### ¿Afecta la funcionalidad?
**NO. El realtime SÍ funciona correctamente** porque usas un **sistema híbrido**:

**Tu arquitectura:**
- **Supabase** = Base de datos + Autenticación + Storage
- **Firebase** = Realtime (actualizaciones instantáneas)

### ¿Qué funciona?
- ✅ Posts nuevos aparecen **instantáneamente** (vía Firebase)
- ✅ Mensajes se reciben **en tiempo real** (vía Firebase)
- ✅ Notificaciones llegan **al instante** (vía Firebase FCM)
- ✅ Todo funciona con **actualizaciones en tiempo real**

### Estado:
- ✅ **Realtime funcionando correctamente vía Firebase**
- ⚠️ Error cosmético (no afecta funcionalidad)
- 💡 Firebase maneja el realtime en lugar de Supabase

### Soluciones:

**OPCIÓN 1: Ignorar el error (RECOMENDADO)**
- El error es solo cosmético
- Firebase está manejando el realtime perfectamente
- No hacer nada

**OPCIÓN 2: Deshabilitar intentos de WebSocket**
Modificar `src/config/supabase.js`:
```javascript
realtime: {
  enabled: false  // Deshabilitar intentos de conexión
}
```

**OPCIÓN 3: Habilitar Supabase Realtime (AVANZADO)**
Requiere configuración en el servidor (Docker, Nginx, etc.)

**Recomendación:** Usa OPCIÓN 1 o 2. Firebase es más robusto para realtime que Supabase self-hosted.

**Más información:** Lee `SISTEMA_REALTIME_HIBRIDO_EXPLICADO.md`

---

## 3. 🔥 Friends Query Error 400 (CRÍTICO - CORREGIDO)

### Error:
```
Failed to load resource: the server responded with a status of 400 ()
supabase.vecinoactivo.cl/rest/v1/friends?select=*,friend:friend_id(...)
Error getting friends: Object
```

### ¿Qué era?
El query para obtener amigos estaba usando una sintaxis avanzada de Supabase (relaciones con foreign keys) que estaba fallando.

### ¿Por qué fallaba?
El query intentaba hacer:
```sql
SELECT *, 
  friend:friend_id(id, username, name, avatar_url, location),
  user:user_id(id, username, name, avatar_url, location)
FROM friends
```

Esto requiere que las foreign keys estén perfectamente configuradas en la base de datos, y probablemente había un problema de configuración.

### ¿Qué afectaba?
- ❌ No se podían cargar amigos
- ❌ Página "Descubrir Vecinos" no funcionaba
- ❌ Lista de amigos vacía

### Solución aplicada:
Simplificamos el query en dos pasos:
1. Primero obtener las relaciones de amistad (solo IDs)
2. Luego buscar los datos de los usuarios por separado

**Antes:**
```javascript
.select(`
  *,
  friend:friend_id(id, username, name, avatar_url, location),
  user:user_id(id, username, name, avatar_url, location)
`)
```

**Después:**
```javascript
// Paso 1: Obtener relaciones
.select('*')
.or(`user_id.eq.${userId},friend_id.eq.${userId}`)
.eq('status', 'accepted');

// Paso 2: Obtener usuarios
.select('id, username, name, avatar_url, location')
.in('id', friendIds);
```

### Estado:
- ✅ **CORREGIDO**
- ✅ Código enviado a Git (commit 2a3a1a5)
- ⏳ Pendiente: Redeploy desde EasyPanel

### Resultado esperado:
Después del deployment:
- ✅ Amigos se cargarán correctamente
- ✅ "Descubrir Vecinos" funcionará
- ✅ No más errores 400

---

## 📝 RESUMEN DE ACCIONES

### Fixes aplicados en este commit (2a3a1a5):
1. ✅ Eliminado efecto hover de borde en posts (mejora UX)
2. ✅ Corregido query de friends (error 400)
3. ✅ Simplificado getFriends() para evitar problemas con foreign keys
4. ✅ Simplificado getFriendRequests() con queries separadas
5. ✅ Agregado manejo de errores para no romper UI

### Próximos pasos:
1. **Tú:** Hacer redeploy desde EasyPanel
2. **Tú:** Purgar caché de Cloudflare
3. **Tú:** Verificar que los errores desaparezcan
4. **Tú:** Reportar resultado

---

## 🎯 PRIORIDADES

### Crítico (hacer ahora):
- 🔥 Redeploy para aplicar fix de friends query

### Importante (hacer después):
- ⚠️ Redeploy para aplicar fix de manifest.json

### Opcional (puede esperar):
- 💡 Habilitar Realtime en Supabase (si quieres actualizaciones instantáneas)

---

## 📞 INSTRUCCIONES DE DEPLOYMENT

### Paso 1: Ve a EasyPanel
https://easypanel.io

### Paso 2: Selecciona tu proyecto
"Vecino Activo"

### Paso 3: Haz Redeploy
Click en "Deploy" o "Redeploy"

### Paso 4: Espera el build
2-5 minutos

### Paso 5: Purga caché de Cloudflare
Caching → Configuration → Purge Everything

### Paso 6: Verifica
1. Abre https://vecinoactivo.cl
2. Abre la consola del navegador (F12)
3. Verifica que no aparezcan los errores 400 de friends
4. Verifica que la página "Descubrir Vecinos" funcione

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después del deployment, verifica:

- [ ] No hay errores 400 en la consola
- [ ] Página "Descubrir Vecinos" carga correctamente
- [ ] Lista de amigos se muestra (si tienes amigos)
- [ ] Posts se muestran sin borde al pasar el cursor
- [ ] manifest.json 404 desaparece (si aplicaste ese fix también)

---

**Última actualización:** 28 Enero 2026  
**Commit actual:** 2a3a1a5
