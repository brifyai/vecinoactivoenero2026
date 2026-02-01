# 🚀 INSTRUCCIONES: Deployment con Fix CORS

## ✅ SOLUCIÓN IMPLEMENTADA

He creado un **proxy CORS integrado** que soluciona el problema sin necesidad de acceso SSH al servidor de Supabase.

---

## 📋 QUÉ SE HIZO

1. **Proxy Node.js** (`server/supabaseProxy.js`)
   - Escucha en puerto 3001
   - Reenvía requests a Supabase con headers CORS correctos
   - Agrega `Access-Control-Allow-Credentials: true`

2. **Dockerfile con Proxy** (`Dockerfile.with-proxy`)
   - Multi-stage build
   - Nginx + Node.js en un solo contenedor
   - Supervisor para manejar ambos servicios

3. **Script de Deployment** (`scripts/deployment/deploy-with-cors-fix.sh`)
   - Automatiza todo el proceso
   - Verifica que funcione correctamente

---

## 🎯 PASOS PARA DEPLOYMENT

### Opción A: Deployment Automático (RECOMENDADO)

```bash
# 1. Ir al directorio del proyecto
cd /ruta/a/vecino_activo_v2

# 2. Ejecutar script de deployment
./scripts/deployment/deploy-with-cors-fix.sh
```

**Eso es todo!** El script hace:
- ✅ Detiene contenedor anterior
- ✅ Construye imagen con proxy
- ✅ Inicia contenedor
- ✅ Verifica que funcione
- ✅ Muestra resumen

---

### Opción B: Deployment Manual

Si prefieres hacerlo paso a paso:

#### 1. Construir imagen

```bash
docker build -f Dockerfile.with-proxy -t vecino-activo:cors-fix \
  --build-arg REACT_APP_SUPABASE_URL="https://vecinoactivo.cl/api/supabase" \
  --build-arg REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE" \
  --build-arg REACT_APP_FIREBASE_API_KEY="AIzaSyBZQYW7aRY1o07IW3NwCXY-v6Q85mMCCNU" \
  --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN="stratega-ai-x.firebaseapp.com" \
  --build-arg REACT_APP_FIREBASE_DATABASE_URL="https://stratega-ai-x-default-rtdb.firebaseio.com" \
  --build-arg REACT_APP_FIREBASE_PROJECT_ID="stratega-ai-x" \
  --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET="stratega-ai-x.firebasestorage.app" \
  --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID="777409222994" \
  --build-arg REACT_APP_FIREBASE_APP_ID="1:777409222994:web:4b23f04e44e4a38aca428b" \
  --build-arg REACT_APP_FIREBASE_VAPID_KEY="BDlLK81WO-7eNQKen14UupcCbm9pObrlN2YJqtQAHLA_yRUi0rjLS2AS_AMdD_r8xnNIGJ_nHhfH5HrX2khoZBA" \
  .
```

#### 2. Detener contenedor anterior (si existe)

```bash
docker stop vecino-activo-cors 2>/dev/null || true
docker rm vecino-activo-cors 2>/dev/null || true
```

#### 3. Iniciar nuevo contenedor

```bash
docker run -d \
  --name vecino-activo-cors \
  -p 80:80 \
  -p 443:443 \
  --restart unless-stopped \
  vecino-activo:cors-fix
```

#### 4. Verificar que funciona

```bash
# Verificar que el contenedor está corriendo
docker ps | grep vecino-activo-cors

# Ver logs
docker logs vecino-activo-cors -f

# Deberías ver:
# - "🚀 Supabase CORS Proxy iniciado"
# - Nginx logs
```

---

## 🔍 VERIFICACIÓN

### 1. Verificar servicios

```bash
# Frontend
curl http://localhost/

# Proxy
curl http://localhost/api/supabase/rest/v1/
```

Ambos deberían responder sin errores.

### 2. Verificar CORS desde el navegador

1. Ir a https://vecinoactivo.cl
2. Abrir consola (F12)
3. Ejecutar:

```javascript
fetch('https://vecinoactivo.cl/api/supabase/rest/v1/users?select=id&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

**Resultado esperado**: `✅ Success: [...]` (sin error CORS)

### 3. Intentar login

1. Ir a https://vecinoactivo.cl/iniciar-sesion-admin
2. Ingresar:
   - Email: `admin@vecinoactivo.cl`
   - Password: `admin123`
3. Click "Iniciar Sesión"

**Resultado esperado**: Login exitoso, sin error CORS

---

## 📊 ARQUITECTURA

```
Usuario (vecinoactivo.cl)
    ↓
Nginx (puerto 80)
    ├─ / → React App
    └─ /api/supabase/* → Node.js Proxy (puerto 3001)
                              ↓
                    Supabase (supabase.vecinoactivo.cl)
```

**Flujo**:
1. Usuario hace request a `https://vecinoactivo.cl/api/supabase/rest/v1/users`
2. Nginx recibe el request y lo reenvía a `http://localhost:3001/supabase/rest/v1/users`
3. Proxy Node.js agrega headers CORS y reenvía a `https://supabase.vecinoactivo.cl/rest/v1/users`
4. Supabase responde al proxy
5. Proxy agrega headers CORS a la respuesta
6. Nginx devuelve la respuesta al usuario

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to Docker daemon"

```bash
# Iniciar Docker
sudo systemctl start docker

# O en Mac
open -a Docker
```

### Error: "Port 80 already in use"

```bash
# Ver qué está usando el puerto 80
sudo lsof -i :80

# Detener el servicio
sudo systemctl stop nginx  # O el servicio que esté corriendo
```

### Error: "Proxy no responde"

```bash
# Ver logs del contenedor
docker logs vecino-activo-cors --tail=50

# Reiniciar contenedor
docker restart vecino-activo-cors

# Si persiste, rebuild
docker build -f Dockerfile.with-proxy -t vecino-activo:cors-fix .
docker stop vecino-activo-cors
docker rm vecino-activo-cors
docker run -d --name vecino-activo-cors -p 80:80 vecino-activo:cors-fix
```

### Error: "Still getting CORS error"

```bash
# 1. Limpiar caché del navegador
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete

# 2. Verificar que la URL en el código es correcta
# Debe ser: https://vecinoactivo.cl/api/supabase
# NO: https://supabase.vecinoactivo.cl

# 3. Verificar logs del proxy
docker logs vecino-activo-cors -f | grep proxy
```

---

## 📝 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
docker logs vecino-activo-cors -f

# Ver logs solo del proxy
docker logs vecino-activo-cors -f | grep proxy

# Ver logs solo de Nginx
docker logs vecino-activo-cors -f | grep nginx

# Reiniciar contenedor
docker restart vecino-activo-cors

# Detener contenedor
docker stop vecino-activo-cors

# Eliminar contenedor
docker rm -f vecino-activo-cors

# Ver estado del contenedor
docker ps -a | grep vecino-activo-cors

# Entrar al contenedor
docker exec -it vecino-activo-cors sh

# Ver procesos dentro del contenedor
docker exec vecino-activo-cors ps aux
```

---

## 🎉 RESULTADO ESPERADO

Después del deployment:

1. ✅ La app carga en https://vecinoactivo.cl
2. ✅ No hay errores CORS en la consola
3. ✅ El login funciona correctamente
4. ✅ Las peticiones a Supabase funcionan
5. ✅ El proxy está manejando CORS automáticamente

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Solución completa**: `SOLUCION_CORS_SIN_SSH.md`
- **Proxy**: `server/supabaseProxy.js`
- **Dockerfile**: `Dockerfile.with-proxy`
- **Script**: `scripts/deployment/deploy-with-cors-fix.sh`

---

## ⏱️ TIEMPO ESTIMADO

- **Opción A (automático)**: 5-10 minutos
- **Opción B (manual)**: 10-15 minutos

---

## 🆘 AYUDA

Si tienes problemas:

1. Ver logs: `docker logs vecino-activo-cors -f`
2. Verificar servicios: `curl http://localhost/` y `curl http://localhost/api/supabase/rest/v1/`
3. Limpiar caché del navegador
4. Reiniciar contenedor: `docker restart vecino-activo-cors`

---

**Fecha**: 29 Enero 2026  
**Status**: ✅ Listo para deployment
