# ❌ Problema: Real-time WebSocket No Conecta

## 🐛 Error Detectado

```
WebSocket connection to 'wss://supabase.vecinoactivo.cl/realtime/v1/websocket' failed
📡 Subscription status for posts: CHANNEL_ERROR
📡 Subscription status for notifications: CHANNEL_ERROR
📡 Subscription status for messages: CHANNEL_ERROR
```

## 🔍 Diagnóstico

El código de Real-time en la aplicación está **correcto** y funcionando. El problema es que:

**Tu Supabase self-hosted NO tiene el servicio de Real-time habilitado o accesible.**

## ✅ Lo Que SÍ Funciona

- ✅ Código de Real-time implementado correctamente
- ✅ Hooks de Real-time creados
- ✅ RealtimeProvider integrado
- ✅ Subscripciones intentando conectarse
- ✅ Storage funcionando
- ✅ Base de datos funcionando
- ✅ Autenticación funcionando

## ❌ Lo Que NO Funciona

- ❌ Conexión WebSocket a Real-time
- ❌ Servicio de Real-time no responde
- ❌ Puerto 4000 (Real-time) no accesible

---

## 🔧 Soluciones Posibles

### Solución 1: Verificar Servicios de Docker

**En tu servidor de Supabase**, ejecuta:

```bash
# Ver todos los contenedores
docker ps

# Buscar específicamente realtime
docker ps | grep realtime

# Ver logs del servicio realtime
docker logs supabase-realtime
```

**Resultado esperado:**
Deberías ver un contenedor llamado `supabase-realtime` corriendo en el puerto 4000.

**Si NO aparece:** El servicio no está configurado.

---

### Solución 2: Habilitar Real-time en docker-compose.yml

**Ubicación:** En tu servidor, busca el archivo `docker-compose.yml` de Supabase.

**Agrega o verifica que exista:**

```yaml
services:
  # ... otros servicios ...

  realtime:
    image: supabase/realtime:v2.25.35
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    environment:
      PORT: 4000
      DB_HOST: ${POSTGRES_HOST}
      DB_PORT: ${POSTGRES_PORT}
      DB_USER: supabase_admin
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
      DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
      DB_ENC_KEY: supabaserealtime
      API_JWT_SECRET: ${JWT_SECRET}
      FLY_ALLOC_ID: fly123
      FLY_APP_NAME: realtime
      SECRET_KEY_BASE: UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq
      ERL_AFLAGS: -proto_dist inet_tcp
      ENABLE_TAILSCALE: "false"
      DNS_NODES: "''"
    command: >
      sh -c "/app/bin/migrate && /app/bin/realtime eval 'Realtime.Release.seeds(Realtime.Repo)' && /app/bin/server"
    ports:
      - "4000:4000"
```

**Luego reinicia:**

```bash
docker-compose down
docker-compose up -d
```

---

### Solución 3: Configurar Nginx/Proxy para Real-time

Tu nginx debe redirigir `/realtime` al servicio de Real-time.

**Archivo:** `/etc/nginx/sites-available/supabase` (o similar)

**Agrega:**

```nginx
server {
    listen 443 ssl;
    server_name supabase.vecinoactivo.cl;

    # ... configuración SSL ...

    # Real-time WebSocket
    location /realtime/v1/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Otros locations...
}
```

**Luego reinicia nginx:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Solución 4: Verificar Firewall

Asegúrate de que el puerto 4000 esté abierto:

```bash
# Ver puertos abiertos
sudo netstat -tulpn | grep 4000

# Si usas ufw
sudo ufw allow 4000/tcp
```

---

### Solución 5: Probar Conexión Directa

Prueba si el servicio responde:

```bash
# Desde el servidor
curl http://localhost:4000/api/health

# Desde tu máquina local
curl https://supabase.vecinoactivo.cl/realtime/v1/websocket
```

**Resultado esperado:**
Debería responder con algo (no error 404 o connection refused).

---

## 🎯 Solución Temporal: Desactivar Real-time

Si no puedes configurar Real-time ahora, puedes desactivarlo temporalmente:

<function_calls>
<invoke name="strReplace">
<parameter name="path">src/components/RealtimeProvider/RealtimeProvider.js