# FIX: CORS Credentials - Supabase

## 🔍 DIAGNÓSTICO

El servidor Supabase **SÍ tiene CORS configurado**, pero falta:
```
Access-Control-Allow-Credentials: true
```

Esto causa que el navegador bloquee las peticiones cuando se envían cookies o headers de autenticación.

---

## ✅ SOLUCIÓN 1: Agregar Credentials en Kong

Editar la configuración de Kong en el servidor:

```yaml
# kong.yml o similar
plugins:
  - name: cors
    config:
      origins:
        - "*"  # O específicamente: https://vecinoactivo.cl
      methods:
        - GET
        - HEAD
        - PUT
        - PATCH
        - POST
        - DELETE
        - OPTIONS
      headers:
        - apikey
        - authorization
        - content-type
        - x-client-info
      credentials: true  # ← AGREGAR ESTA LÍNEA
      max_age: 3600
```

Reiniciar Kong:
```bash
docker restart supabase-kong
# O
docker-compose restart kong
```

---

## ✅ SOLUCIÓN 2: Limpiar Caché del Navegador

A veces el navegador cachea las respuestas CORS. Prueba:

1. **Chrome/Edge**:
   - Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
   - Selecciona "Imágenes y archivos en caché"
   - Click en "Borrar datos"

2. **Firefox**:
   - Presiona `Ctrl + Shift + Delete`
   - Selecciona "Caché"
   - Click en "Limpiar ahora"

3. **Safari**:
   - Menú Safari → Preferencias → Avanzado
   - Marcar "Mostrar menú Desarrollo"
   - Menú Desarrollo → Vaciar cachés

4. **Modo Incógnito**:
   - Abre una ventana de incógnito/privada
   - Intenta acceder a https://vecinoactivo.cl

---

## ✅ SOLUCIÓN 3: Verificar en Producción

Abre la consola del navegador en https://vecinoactivo.cl y ejecuta:

```javascript
// Test 1: Verificar headers CORS
fetch('https://supabase.vecinoactivo.cl/rest/v1/users?select=id&limit=1', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://vecinoactivo.cl',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'apikey,authorization'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:');
  for (let [key, value] of response.headers.entries()) {
    if (key.includes('access-control')) {
      console.log(`  ${key}: ${value}`);
    }
  }
})
.catch(console.error);

// Test 2: Request real
fetch('https://supabase.vecinoactivo.cl/rest/v1/users?select=id&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

---

## ✅ SOLUCIÓN 4: Contactar Proveedor

Si no tienes acceso al servidor, envía este mensaje a tu proveedor:

```
Asunto: Agregar Access-Control-Allow-Credentials en Supabase

Hola,

Mi aplicación en vecinoactivo.cl está recibiendo errores CORS al 
conectarse a supabase.vecinoactivo.cl.

El diagnóstico muestra que CORS está configurado, pero falta el header:
  Access-Control-Allow-Credentials: true

Por favor, agregar esta configuración en Kong (API Gateway de Supabase).

Configuración actual:
  ✓ Access-Control-Allow-Origin: *
  ✓ Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  ✓ Access-Control-Allow-Headers: apikey, authorization, content-type
  ✗ Access-Control-Allow-Credentials: (falta)

Gracias.
```

---

## 🔍 VERIFICAR SI FUNCIONÓ

Después de aplicar el fix, ejecuta:

```bash
./scripts/debugging/diagnose-cors.sh
```

Deberías ver:
```
5️⃣  Test: Credentials permitidos
   ✓ Credentials configurados
   Allow Credentials: true
```

---

## 📊 ESTADO ACTUAL

Según el diagnóstico:

| Item | Estado | Valor |
|------|--------|-------|
| CORS configurado | ✅ | Sí |
| Allow Origin | ✅ | * (todos) |
| Allow Methods | ✅ | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Allow Headers | ✅ | apikey, authorization, content-type |
| Allow Credentials | ❌ | **NO configurado** |
| Request funciona | ✅ | HTTP 200 |

**Conclusión**: Solo falta agregar `credentials: true` en la configuración de Kong.

---

**Fecha**: 29 Enero 2026  
**Status**: ⏳ Pendiente agregar credentials en Kong
