# FIX: Error CORS en Supabase Self-Hosted

## 🔴 PROBLEMA

```
Access to fetch at 'https://supabase.vecinoactivo.cl/rest/v1/users...' 
from origin 'https://vecinoactivo.cl' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa**: Tu Supabase self-hosted en `supabase.vecinoactivo.cl` no está permitiendo requests desde `vecinoactivo.cl`.

---

## ✅ SOLUCIONES

### Opción 1: Configurar CORS en Kong (RECOMENDADO)

Kong es el API Gateway de Supabase que maneja las peticiones. Necesitas configurar CORS ahí.

#### 1.1 Ubicar el archivo de configuración de Kong

En tu servidor donde está Supabase, busca:
```bash
# Ubicaciones comunes
/etc/kong/kong.yml
/opt/supabase/kong/kong.yml
~/supabase/docker/volumes/api/kong.yml
```

#### 1.2 Agregar configuración CORS

Editar el archivo `kong.yml` y agregar:

```yaml
_format_version: "1.1"

services:
  - name: rest-v1
    url: http://rest:3000
    routes:
      - name: rest-v1-all
        strip_path: true
        paths:
          - /rest/v1/
    plugins:
      - name: cors
        config:
          origins:
            - https://vecinoactivo.cl
            - https://www.vecinoactivo.cl
            - http://localhost:3000
          methods:
            - GET
            - POST
            - PUT
            - PATCH
            - DELETE
            - OPTIONS
          headers:
            - Accept
            - Authorization
            - Content-Type
            - X-Client-Info
            - apikey
            - x-client-info
          exposed_headers:
            - Content-Length
            - Content-Range
          credentials: true
          max_age: 3600
```

#### 1.3 Reiniciar Kong

```bash
# Si usas Docker
docker restart supabase-kong

# O reiniciar todo Supabase
docker-compose restart
```

---

### Opción 2: Configurar CORS en Nginx (si usas proxy reverso)

Si tienes Nginx delante de Supabase:

```nginx
# /etc/nginx/sites-available/supabase.vecinoactivo.cl

server {
    listen 443 ssl http2;
    server_name supabase.vecinoactivo.cl;

    # SSL config...

    location / {
        # CORS Headers
        add_header 'Access-Control-Allow-Origin' 'https://vecinoactivo.cl' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept, Authorization, Content-Type, X-Client-Info, apikey, x-client-info' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '3600' always;

        # Handle preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://vecinoactivo.cl' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Accept, Authorization, Content-Type, X-Client-Info, apikey, x-client-info' always;
            add_header 'Access-Control-Max-Age' '3600' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://localhost:8000;  # Puerto de Kong
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reiniciar Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Opción 3: Usar Supabase Cloud (TEMPORAL)

Si no tienes acceso al servidor de Supabase, puedes usar temporalmente Supabase Cloud:

1. **Crear proyecto en Supabase Cloud**
   - Ir a https://supabase.com
   - Crear nuevo proyecto

2. **Exportar datos actuales**
   ```bash
   # Desde tu Supabase self-hosted
   pg_dump -h supabase.vecinoactivo.cl -U postgres -d postgres > backup.sql
   ```

3. **Importar a Supabase Cloud**
   - En Supabase Dashboard → SQL Editor
   - Ejecutar el backup.sql

4. **Actualizar .env.production**
   ```env
   REACT_APP_SUPABASE_URL=https://[tu-proyecto].supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[tu-anon-key]
   ```

5. **Rebuild y deploy**
   ```bash
   npm run build
   # Deploy el nuevo build
   ```

---

### Opción 4: Configurar CORS en PostgREST (avanzado)

Si tienes acceso al archivo de configuración de PostgREST:

```conf
# postgrest.conf
db-uri = "postgres://..."
db-schema = "public"
db-anon-role = "anon"

# CORS
server-cors-allowed-origins = "https://vecinoactivo.cl,https://www.vecinoactivo.cl"
```

---

## 🔍 VERIFICAR LA SOLUCIÓN

### Test 1: Desde el navegador

Abrir consola en https://vecinoactivo.cl y ejecutar:

```javascript
fetch('https://supabase.vecinoactivo.cl/rest/v1/users?select=*&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Resultado esperado**: Datos de usuarios, NO error CORS.

### Test 2: Verificar headers CORS

```bash
curl -I -X OPTIONS \
  -H "Origin: https://vecinoactivo.cl" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: apikey,authorization" \
  https://supabase.vecinoactivo.cl/rest/v1/users
```

**Resultado esperado**:
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://vecinoactivo.cl
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: apikey, authorization, ...
```

---

## 🚨 IMPORTANTE

### Dominios a permitir

Asegúrate de incluir TODOS estos dominios en CORS:

```
https://vecinoactivo.cl
https://www.vecinoactivo.cl
http://localhost:3000  (para desarrollo)
```

### Headers requeridos

Supabase necesita estos headers:

```
Accept
Authorization
Content-Type
X-Client-Info
apikey
x-client-info
```

---

## 📞 CONTACTAR AL PROVEEDOR

Si no tienes acceso al servidor de Supabase, contacta a tu proveedor con esta información:

```
Asunto: Configurar CORS en Supabase Self-Hosted

Hola,

Necesito configurar CORS en mi instancia de Supabase (supabase.vecinoactivo.cl) 
para permitir requests desde mi aplicación (vecinoactivo.cl).

Por favor, agregar estos dominios a la configuración CORS de Kong:
- https://vecinoactivo.cl
- https://www.vecinoactivo.cl

Headers requeridos:
- Accept, Authorization, Content-Type, X-Client-Info, apikey, x-client-info

Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS

Gracias.
```

---

## 🔧 ALTERNATIVA RÁPIDA (NO RECOMENDADA)

Si necesitas una solución inmediata y temporal, puedes crear un proxy en tu backend:

```javascript
// server/proxy.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({
  origin: 'https://vecinoactivo.cl',
  credentials: true
}));

app.use('/supabase', createProxyMiddleware({
  target: 'https://supabase.vecinoactivo.cl',
  changeOrigin: true,
  pathRewrite: {
    '^/supabase': ''
  }
}));

app.listen(3001);
```

Luego cambiar en tu app:
```javascript
// src/config/supabase.js
const supabaseUrl = 'https://vecinoactivo.cl/supabase';  // Usar proxy
```

**⚠️ ADVERTENCIA**: Esto agrega latencia y un punto de falla. Solo para testing.

---

**Fecha**: 29 Enero 2026  
**Status**: ⏳ Pendiente configurar CORS en servidor Supabase
