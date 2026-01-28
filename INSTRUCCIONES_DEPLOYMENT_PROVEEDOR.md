# 📦 INSTRUCCIONES DE DEPLOYMENT - VECINO ACTIVO

**Fecha:** 28 de enero de 2026  
**Sitio:** https://vecinoactivo.cl/  
**Prioridad:** 🔴 ALTA - Mapa no funciona en producción

---

## 🎯 OBJETIVO

Corregir 3 errores críticos en producción:
1. ❌ `manifest.json` 404
2. ⚠️ FCM Token errors
3. ❌ Mapa no funciona (JSON parsing error)

---

## 📦 ARCHIVOS RECIBIDOS

Deberías haber recibido:
1. `vecino-activo-fix-produccion-20260128-113447.tar.gz` (~36 MB)
2. `nginx.conf` (2.2 KB)
3. Este archivo de instrucciones

---

## ⏱️ TIEMPO ESTIMADO

**Total:** 40 minutos
- Backup: 5 min
- Deployment: 10 min
- Configuración Nginx: 10 min
- Verificación: 15 min

---

## 🚨 PASO 0: CREAR BACKUP (OBLIGATORIO)

**IMPORTANTE:** Crear backup ANTES de hacer cualquier cambio.

```bash
# Conectar al servidor
ssh usuario@servidor

# Ir al directorio del sitio
cd /usr/share/nginx/html

# Crear backup con fecha
tar -czf ~/backup-vecino-activo-$(date +%Y%m%d-%H%M%S).tar.gz .

# Verificar que el backup se creó
ls -lh ~/backup-vecino-activo-*.tar.gz
```

**Resultado esperado:**
```
-rw-r--r-- 1 usuario usuario 120M Jan 28 11:00 backup-vecino-activo-20260128-110000.tar.gz
```

---

## 📥 PASO 1: SUBIR ARCHIVOS AL SERVIDOR

### Opción A: Usando SCP

```bash
# Desde tu máquina local
scp vecino-activo-fix-produccion-20260128-113447.tar.gz usuario@servidor:~
scp nginx.conf usuario@servidor:~
```

### Opción B: Usando SFTP

```bash
sftp usuario@servidor
put vecino-activo-fix-produccion-20260128-113447.tar.gz
put nginx.conf
exit
```

### Opción C: Usando Panel de Control

Si tu proveedor tiene panel de control (cPanel, Plesk, etc.):
1. Acceder al File Manager
2. Subir el archivo .tar.gz
3. Subir nginx.conf

---

## 🗂️ PASO 2: EXTRAER NUEVO BUILD

```bash
# Conectar al servidor
ssh usuario@servidor

# Ir al directorio del sitio
cd /usr/share/nginx/html

# Eliminar archivos antiguos (el backup ya está hecho)
rm -rf *

# Extraer nuevo build
tar -xzf ~/vecino-activo-fix-produccion-20260128-113447.tar.gz --strip-components=1

# Verificar que los archivos se extrajeron
ls -la
```

**Resultado esperado:**
```
drwxr-xr-x  5 nginx nginx    4096 Jan 28 11:00 .
drwxr-xr-x  3 root  root     4096 Jan 28 11:00 ..
-rw-r--r--  1 nginx nginx     733 Jan 28 11:00 manifest.json
drwxr-xr-x  3 nginx nginx    4096 Jan 28 11:00 data
drwxr-xr-x  3 nginx nginx    4096 Jan 28 11:00 static
-rw-r--r--  1 nginx nginx    3456 Jan 28 11:00 index.html
-rw-r--r--  1 nginx nginx   15406 Jan 28 11:00 favicon.ico
...
```

**Verificar archivos críticos:**
```bash
# Verificar manifest.json
ls -lh manifest.json

# Verificar archivos GeoJSON
ls -lh data/geo/

# Resultado esperado:
# -rw-r--r-- 1 nginx nginx  48M Jan 28 11:00 unidades_vecinales_simple.geojson
```

---

## 🔧 PASO 3: CONFIGURAR PERMISOS

```bash
# Asegurar que Nginx puede leer los archivos
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

# Verificar permisos
ls -la /usr/share/nginx/html
```

**Resultado esperado:**
```
drwxr-xr-x  5 nginx nginx    4096 Jan 28 11:00 .
-rw-r--r--  1 nginx nginx     733 Jan 28 11:00 manifest.json
drwxr-xr-x  3 nginx nginx    4096 Jan 28 11:00 data
```

---

## ⚙️ PASO 4: ACTUALIZAR CONFIGURACIÓN DE NGINX

### Ubicación del archivo de configuración

El archivo puede estar en una de estas ubicaciones:
- `/etc/nginx/conf.d/default.conf`
- `/etc/nginx/sites-available/default`
- `/etc/nginx/nginx.conf`

```bash
# Buscar el archivo de configuración
find /etc/nginx -name "*.conf" -type f | grep -E "(default|vecino)"

# O verificar la configuración actual
nginx -T | grep -A 20 "server {"
```

### Verificar si ya existe la configuración

```bash
# Buscar configuración de /data/
nginx -T | grep -A 10 "location /data/"

# Buscar configuración de manifest.json
nginx -T | grep -A 5 "location /manifest.json"
```

### Si NO existe la configuración, agregarla

**Editar el archivo de configuración:**
```bash
# Usar el editor que prefieras
nano /etc/nginx/conf.d/default.conf
# o
vim /etc/nginx/conf.d/default.conf
```

**Agregar estas secciones dentro del bloque `server { }`:**

```nginx
server {
    listen 80;
    server_name vecinoactivo.cl www.vecinoactivo.cl;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Configuración para React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # ✅ AGREGAR: Configuración para archivos GeoJSON
    location /data/ {
        alias /usr/share/nginx/html/data/;
        
        # Configurar MIME types para GeoJSON
        types {
            application/json json;
            application/geo+json geojson;
        }
        
        # Headers CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, OPTIONS';
        add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept';
        
        # Cache largo para archivos GeoJSON
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # ✅ AGREGAR: Configuración para manifest.json
    location /manifest.json {
        add_header Content-Type application/json;
        add_header Cache-Control "no-cache";
    }

    # Configuración para archivos estáticos con caché largo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

**Guardar y cerrar el editor:**
- Nano: `Ctrl+X`, luego `Y`, luego `Enter`
- Vim: `Esc`, luego `:wq`, luego `Enter`

---

## ✅ PASO 5: VERIFICAR Y RECARGAR NGINX

```bash
# Verificar sintaxis de la configuración
nginx -t
```

**Resultado esperado:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Si hay errores:**
- Revisar la configuración
- Verificar que las llaves `{ }` estén balanceadas
- Verificar que no falten `;` al final de las líneas

**Si todo está OK, recargar Nginx:**
```bash
# Opción 1: Reload (recomendado)
systemctl reload nginx

# Opción 2: Restart (si reload no funciona)
systemctl restart nginx

# Verificar que Nginx está corriendo
systemctl status nginx
```

**Resultado esperado:**
```
● nginx.service - A high performance web server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
   Active: active (running) since Tue 2026-01-28 11:00:00 UTC
```

---

## 🔍 PASO 6: VERIFICACIÓN POST-DEPLOYMENT

### Verificación desde el servidor

```bash
# 1. Verificar manifest.json
curl -I http://localhost/manifest.json

# Resultado esperado: HTTP/1.1 200 OK

# 2. Verificar contenido de manifest.json
curl http://localhost/manifest.json | head -c 100

# Resultado esperado: {"short_name":"Vecino Activo",...

# 3. Verificar archivo GeoJSON
curl -I http://localhost/data/geo/unidades_vecinales_simple.geojson

# Resultado esperado: HTTP/1.1 200 OK

# 4. Verificar que es JSON válido (no HTML)
curl http://localhost/data/geo/unidades_vecinales_simple.geojson | head -c 100

# Resultado esperado: {"type":"FeatureCollection",...
# ❌ NO debe retornar: <html> o version https://git-lfs...
```

### Verificación desde el navegador

1. **Abrir el sitio:**
   - Ir a https://vecinoactivo.cl/
   - Abrir DevTools (F12)
   - Ir a la pestaña Console

2. **Verificar que NO hay estos errores:**
   ```
   ❌ Failed to load resource: 404 (manifest.json)
   ❌ Error loading neighborhoods: SyntaxError
   ❌ Unexpected token 'v', "version ht"...
   ```

3. **Verificar que SÍ hay estos mensajes (normales):**
   ```
   ℹ️ Permisos de notificaciones denegados por el usuario
   ℹ️ No se pudo obtener FCM token (no crítico)
   ```

4. **Probar el mapa:**
   - Hacer click en el mapa de la página principal
   - El mapa debe cargar correctamente
   - Las unidades vecinales deben mostrarse
   - No debe haber errores en la consola

5. **Verificar en Network tab:**
   - Abrir DevTools (F12)
   - Ir a la pestaña Network
   - Recargar la página (F5)
   - Buscar `manifest.json`:
     - Status: 200 OK ✅
     - Type: application/json ✅
   - Buscar `unidades_vecinales_simple.geojson`:
     - Status: 200 OK ✅
     - Type: application/json o application/geo+json ✅
     - Size: ~48 MB ✅

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marcar cada item después de verificar:

### En el servidor:
- [ ] Backup creado exitosamente
- [ ] Archivos extraídos correctamente
- [ ] Permisos configurados (nginx:nginx, 755)
- [ ] `manifest.json` existe en `/usr/share/nginx/html/`
- [ ] Archivos GeoJSON existen en `/usr/share/nginx/html/data/geo/`
- [ ] Configuración de Nginx actualizada
- [ ] `nginx -t` pasa sin errores
- [ ] Nginx recargado exitosamente
- [ ] `curl http://localhost/manifest.json` retorna 200 OK
- [ ] `curl http://localhost/data/geo/unidades_vecinales_simple.geojson` retorna 200 OK

### En el navegador:
- [ ] Sitio carga correctamente
- [ ] No hay error de manifest.json 404
- [ ] No hay error de JSON parsing
- [ ] Mapa carga correctamente
- [ ] Click en el mapa funciona
- [ ] Unidades vecinales se muestran
- [ ] No hay errores críticos en consola

---

## 🐛 TROUBLESHOOTING

### Problema 1: manifest.json sigue dando 404

**Causa:** El archivo no existe o Nginx no lo encuentra

**Solución:**
```bash
# Verificar que el archivo existe
ls -la /usr/share/nginx/html/manifest.json

# Si no existe, extraer de nuevo el .tar.gz
cd /usr/share/nginx/html
tar -xzf ~/vecino-activo-fix-produccion-20260128-113447.tar.gz --strip-components=1

# Verificar permisos
chmod 644 /usr/share/nginx/html/manifest.json
chown nginx:nginx /usr/share/nginx/html/manifest.json
```

### Problema 2: GeoJSON sigue dando error de JSON

**Causa:** Nginx está devolviendo HTML en lugar de JSON

**Diagnóstico:**
```bash
# Verificar qué está devolviendo Nginx
curl http://localhost/data/geo/unidades_vecinales_simple.geojson | head -c 200

# Si retorna HTML o "version https://git-lfs...", hay un problema
```

**Solución A: Verificar configuración de Nginx**
```bash
# Verificar que existe la configuración de /data/
nginx -T | grep -A 10 "location /data/"

# Si no existe, agregar la configuración (ver PASO 4)
```

**Solución B: Verificar que el archivo es válido**
```bash
# Verificar tamaño del archivo
ls -lh /usr/share/nginx/html/data/geo/unidades_vecinales_simple.geojson

# Debe ser ~48 MB, NO 200 bytes

# Si es muy pequeño, es un puntero de Git LFS, no el archivo real
# Extraer de nuevo el .tar.gz
```

**Solución C: Recargar Nginx**
```bash
# Recargar configuración
systemctl reload nginx

# Si no funciona, reiniciar
systemctl restart nginx
```

### Problema 3: Nginx no recarga

**Causa:** Error en la configuración

**Solución:**
```bash
# Ver el error específico
nginx -t

# Ver logs de error
tail -f /var/log/nginx/error.log

# Corregir el error en la configuración
# Luego intentar de nuevo
nginx -t
systemctl reload nginx
```

### Problema 4: Permisos denegados

**Causa:** Nginx no puede leer los archivos

**Solución:**
```bash
# Verificar permisos actuales
ls -la /usr/share/nginx/html

# Corregir permisos
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html
chmod 644 /usr/share/nginx/html/manifest.json
chmod 644 /usr/share/nginx/html/data/geo/*.geojson

# Reiniciar Nginx
systemctl restart nginx
```

### Problema 5: Archivo GeoJSON muy grande (timeout)

**Causa:** El archivo es de 48 MB y puede tardar en cargar

**Solución:**
```nginx
# Agregar en nginx.conf (dentro del bloque http o server)
client_max_body_size 100M;
client_body_timeout 300s;
send_timeout 300s;
proxy_read_timeout 300s;

# Recargar Nginx
nginx -t
systemctl reload nginx
```

---

## 📞 CONTACTO Y SOPORTE

### Si necesitas ayuda:

**Información a proporcionar:**

1. **Logs de Nginx:**
   ```bash
   tail -100 /var/log/nginx/error.log
   tail -100 /var/log/nginx/access.log
   ```

2. **Output de comandos:**
   ```bash
   nginx -t
   systemctl status nginx
   ls -la /usr/share/nginx/html
   curl -I http://localhost/manifest.json
   curl -I http://localhost/data/geo/unidades_vecinales_simple.geojson
   ```

3. **Screenshots:**
   - Errores en la consola del navegador (F12 > Console)
   - Network tab mostrando los requests fallidos

### Contacto:

- **Email:** [tu-email@ejemplo.com]
- **Teléfono:** [tu-teléfono]
- **Horario:** Lunes a Viernes, 9:00 - 18:00

---

## 📊 CRITERIOS DE ÉXITO

El deployment se considera exitoso cuando:

1. ✅ `https://vecinoactivo.cl/manifest.json` retorna 200 OK
2. ✅ `https://vecinoactivo.cl/data/geo/unidades_vecinales_simple.geojson` retorna 200 OK
3. ✅ El mapa carga y muestra las unidades vecinales
4. ✅ Click en el mapa funciona sin errores
5. ✅ No hay errores críticos en la consola del navegador
6. ✅ La aplicación funciona normalmente

---

## 🎉 CONFIRMACIÓN

Una vez completado el deployment, por favor confirmar:

1. **Fecha y hora del deployment:**
2. **Todos los checks pasaron:** Sí / No
3. **Problemas encontrados:** (si los hubo)
4. **Tiempo total invertido:**

**Enviar confirmación a:** [tu-email@ejemplo.com]

---

**Preparado por:** Equipo de Desarrollo Vecino Activo  
**Fecha:** 28 de enero de 2026  
**Versión:** 1.0  
**Prioridad:** 🔴 ALTA
