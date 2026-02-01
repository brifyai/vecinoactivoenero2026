# 🚨 ACCIÓN INMEDIATA: Resolver Error CORS

## TU SITUACIÓN ACTUAL

No puedes acceder a la app en https://vecinoactivo.cl porque hay un error CORS:
```
Access to fetch at 'https://supabase.vecinoactivo.cl/rest/v1/users...' 
from origin 'https://vecinoactivo.cl' has been blocked by CORS policy
```

---

## ✅ DIAGNÓSTICO COMPLETADO

Ejecuté el diagnóstico y encontré:

| Item | Estado |
|------|--------|
| CORS configurado | ✅ Sí |
| Allow-Origin | ✅ * (todos) |
| Allow-Methods | ✅ Correcto |
| Allow-Headers | ✅ Correcto |
| **Allow-Credentials** | ❌ **FALTA** |

**Conclusión**: Solo falta agregar `credentials: true` en Kong.

---

## 🎯 OPCIONES DE SOLUCIÓN

### Opción 1: Tienes acceso al servidor de Supabase ✅

Si tienes acceso SSH al servidor donde está Supabase:

1. **Conectar al servidor**:
   ```bash
   ssh usuario@servidor-supabase
   ```

2. **Buscar archivo de configuración de Kong**:
   ```bash
   # Ubicaciones comunes
   find / -name "kong.yml" 2>/dev/null
   # O
   ls /etc/kong/
   ls /opt/supabase/kong/
   ls ~/supabase/docker/volumes/api/
   ```

3. **Editar el archivo** (ejemplo: `/etc/kong/kong.yml`):
   ```bash
   sudo nano /etc/kong/kong.yml
   ```

4. **Agregar/modificar la sección CORS**:
   ```yaml
   plugins:
     - name: cors
       config:
         origins:
           - "*"
         methods:
           - GET
           - POST
           - PUT
           - PATCH
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

5. **Reiniciar Kong**:
   ```bash
   docker restart supabase-kong
   # O si usas docker-compose
   cd /ruta/a/supabase
   docker-compose restart kong
   ```

6. **Verificar**:
   ```bash
   ./scripts/debugging/diagnose-cors.sh
   ```

---

### Opción 2: NO tienes acceso al servidor ❌

Si NO tienes acceso, contacta a tu proveedor de hosting:

**Mensaje para enviar**:

```
Asunto: Configurar CORS Credentials en Supabase

Hola,

Necesito agregar el header Access-Control-Allow-Credentials en mi 
instancia de Supabase (supabase.vecinoactivo.cl).

Actualmente CORS está configurado pero falta:
  Access-Control-Allow-Credentials: true

Por favor, agregar esta línea en la configuración de Kong:

plugins:
  - name: cors
    config:
      credentials: true

Esto es necesario para que mi aplicación en vecinoactivo.cl pueda 
conectarse correctamente.

Gracias.
```

**Información adicional para el proveedor**:
- Archivo a modificar: `kong.yml` o configuración de Kong
- Servicio a reiniciar: `supabase-kong`
- Verificación: El header debe aparecer en las respuestas OPTIONS

---

### Opción 3: Solución temporal - Limpiar caché 🔄

Mientras esperas la configuración del servidor, prueba:

1. **Limpiar caché del navegador**:
   - Chrome/Edge: `Ctrl + Shift + Delete` → Borrar caché
   - Firefox: `Ctrl + Shift + Delete` → Limpiar caché
   - Safari: Menú Desarrollo → Vaciar cachés

2. **Probar en modo incógnito**:
   - Abre ventana de incógnito
   - Ve a https://vecinoactivo.cl
   - Intenta hacer login

3. **Probar desde otro navegador**:
   - Si usas Chrome, prueba Firefox
   - Si usas Firefox, prueba Chrome

---

### Opción 4: Usar Supabase Cloud (temporal) ☁️

Si necesitas que funcione YA y no puedes esperar:

1. **Crear proyecto en Supabase Cloud**:
   - Ir a https://supabase.com
   - Sign up / Login
   - Create new project

2. **Exportar datos actuales**:
   ```bash
   # Conectar a tu Supabase actual
   pg_dump -h supabase.vecinoactivo.cl -U postgres -d postgres > backup.sql
   ```

3. **Importar a Supabase Cloud**:
   - En Supabase Dashboard → SQL Editor
   - Pegar contenido de backup.sql
   - Run

4. **Actualizar .env.production**:
   ```env
   REACT_APP_SUPABASE_URL=https://[tu-proyecto].supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[tu-anon-key-de-supabase-cloud]
   ```

5. **Rebuild y deploy**:
   ```bash
   npm run build
   # Subir el nuevo build a tu servidor
   ```

**⚠️ NOTA**: Supabase Cloud tiene CORS configurado por defecto, funcionará inmediatamente.

---

## 🔍 VERIFICAR QUE FUNCIONÓ

Después de aplicar cualquier solución:

### Test 1: Ejecutar diagnóstico
```bash
./scripts/debugging/diagnose-cors.sh
```

Deberías ver:
```
5️⃣  Test: Credentials permitidos
   ✓ Credentials configurados
   Allow Credentials: true
```

### Test 2: Probar en el navegador

1. Ir a https://vecinoactivo.cl
2. Abrir consola (F12)
3. Ejecutar:
   ```javascript
   fetch('https://supabase.vecinoactivo.cl/rest/v1/users?select=id&limit=1', {
     headers: {
       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
     }
   })
   .then(r => r.json())
   .then(data => console.log('✅ Success:', data))
   .catch(err => console.error('❌ Error:', err));
   ```

**Resultado esperado**: `✅ Success: [...]` (sin error CORS)

### Test 3: Intentar login

1. Ir a https://vecinoactivo.cl/iniciar-sesion-admin
2. Ingresar credenciales:
   - Email: `admin@vecinoactivo.cl`
   - Password: `admin123`
3. Click en "Iniciar Sesión"

**Resultado esperado**: Login exitoso, sin error CORS

---

## 📞 ¿NECESITAS AYUDA?

### Si eres el administrador del servidor:
- Lee: `FIX_CORS_SUPABASE.md` (soluciones detalladas)
- Ejecuta: `./scripts/debugging/diagnose-cors.sh` (diagnóstico)

### Si NO tienes acceso al servidor:
- Copia el mensaje de arriba (Opción 2)
- Envíalo a tu proveedor de hosting
- Espera respuesta (usualmente 24-48 horas)

### Si necesitas que funcione YA:
- Usa Opción 4 (Supabase Cloud temporal)
- Toma 15-30 minutos configurar
- Funciona inmediatamente

---

## 📊 RESUMEN

| Problema | Causa | Solución |
|----------|-------|----------|
| Error CORS | Falta `credentials: true` en Kong | Agregar en configuración |
| No puedo entrar | CORS bloquea requests | Configurar servidor o usar Cloud |
| Tengo acceso SSH | Puedo modificar Kong | Opción 1 (5 minutos) |
| NO tengo acceso | Dependo del proveedor | Opción 2 (esperar) u Opción 4 (inmediato) |

---

## ⏱️ TIEMPO ESTIMADO

- **Opción 1** (con acceso): 5-10 minutos
- **Opción 2** (sin acceso): 24-48 horas (depende del proveedor)
- **Opción 3** (caché): 2 minutos (puede no funcionar)
- **Opción 4** (Cloud): 15-30 minutos

---

**Fecha**: 29 Enero 2026  
**Prioridad**: 🔴 ALTA - Bloquea acceso a la aplicación
