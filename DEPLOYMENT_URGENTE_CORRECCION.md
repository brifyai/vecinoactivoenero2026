# 🚨 DEPLOYMENT URGENTE - CORRECCIÓN

**Fecha:** 28 de enero de 2026  
**Problema:** Deployment incorrecto - archivos no se extrajeron correctamente

---

## ❌ PROBLEMA DETECTADO

El deployment actual tiene 2 problemas:

1. **`manifest.json` no existe** (404)
2. **Archivo GeoJSON es un puntero de Git LFS** (133 bytes en lugar de 48 MB)

**Causa:** Se usó `git pull` en lugar del archivo `.tar.gz` que preparamos.

---

## ✅ SOLUCIÓN CORRECTA

### PASO 1: Obtener el archivo correcto

**NO usar Git.** Usar el archivo `.tar.gz` que preparamos:

```
vecino-activo-fix-produccion-20260128-113447.tar.gz
```

Este archivo contiene:
- ✅ `manifest.json` real
- ✅ Archivos GeoJSON reales (48 MB, no punteros)
- ✅ Todo el código compilado

---

### PASO 2: Deployment Correcto

```bash
# 1. Conectar al servidor
ssh usuario@servidor

# 2. Ir al directorio del sitio
cd /usr/share/nginx/html

# 3. Crear backup (si no se hizo antes)
tar -czf ~/backup-vecino-activo-$(date +%Y%m%d-%H%M%S).tar.gz .

# 4. Eliminar archivos actuales
rm -rf *

# 5. Extraer el .tar.gz correcto
tar -xzf ~/vecino-activo-fix-produccion-20260128-113447.tar.gz --strip-components=1

# 6. Verificar que manifest.json existe
ls -lh manifest.json
# Debe mostrar: -rw-r--r-- 1 nginx nginx 733 Jan 28 11:00 manifest.json

# 7. Verificar que GeoJSON es real (no puntero)
ls -lh data/geo/unidades_vecinales_simple.geojson
# Debe mostrar: -rw-r--r-- 1 nginx nginx 48M Jan 28 11:00 unidades_vecinales_simple.geojson
# ❌ NO debe ser 133 bytes

# 8. Configurar permisos
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

# 9. Recargar Nginx
systemctl reload nginx
```

---

### PASO 3: Purgar Caché de Cloudflare

**IMPORTANTE:** El sitio está detrás de Cloudflare. Después del deployment, purgar el caché.

#### Opción A: Desde el Dashboard de Cloudflare

1. Ir a https://dash.cloudflare.com/
2. Seleccionar el dominio `vecinoactivo.cl`
3. Ir a **Caching** > **Configuration**
4. Click en **Purge Everything**
5. Confirmar

#### Opción B: Purgar archivos específicos

1. Ir a **Caching** > **Configuration**
2. Click en **Custom Purge**
3. Agregar URLs:
   ```
   https://vecinoactivo.cl/manifest.json
   https://vecinoactivo.cl/data/geo/unidades_vecinales_simple.geojson
   https://vecinoactivo.cl/
   ```
4. Click en **Purge**

#### Opción C: Usando API de Cloudflare

```bash
# Necesitas el API Token de Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

### PASO 4: Verificación

```bash
# Desde el servidor
curl -I http://localhost/manifest.json
# Debe retornar: HTTP/1.1 200 OK

curl -I http://localhost/data/geo/unidades_vecinales_simple.geojson
# Debe retornar: HTTP/1.1 200 OK
# Content-Length debe ser ~48000000 (48 MB), NO 133

# Verificar contenido
curl http://localhost/manifest.json
# Debe retornar JSON válido: {"short_name":"Vecino Activo",...

curl http://localhost/data/geo/unidades_vecinales_simple.geojson | head -c 100
# Debe retornar: {"type":"FeatureCollection",...
# ❌ NO debe retornar: version https://git-lfs...
```

**Desde el navegador (después de purgar caché):**

1. Abrir https://vecinoactivo.cl/ en modo incógnito
2. Abrir DevTools (F12) > Network
3. Recargar la página (Ctrl+Shift+R para forzar recarga)
4. Buscar `manifest.json`:
   - Status: 200 OK ✅
   - Size: ~733 bytes ✅
5. Buscar `unidades_vecinales_simple.geojson`:
   - Status: 200 OK ✅
   - Size: ~48 MB ✅

---

## 🔍 DIAGNÓSTICO ACTUAL

**Estado detectado:**

```bash
# manifest.json
curl -I https://vecinoactivo.cl/manifest.json
# Resultado: HTTP/2 404 ❌

# GeoJSON
curl -I https://vecinoactivo.cl/data/geo/unidades_vecinales_simple.geojson
# Resultado: HTTP/2 200 ✅
# Content-Length: 133 ❌ (debería ser ~48000000)
```

**Conclusión:**
- El deployment se hizo con `git pull` o similar
- Los archivos de Git LFS no se descargaron
- Necesita usar el `.tar.gz` que preparamos

---

## 📋 CHECKLIST DE CORRECCIÓN

- [ ] Obtener el archivo `.tar.gz` correcto
- [ ] Subir al servidor
- [ ] Crear backup del sitio actual
- [ ] Eliminar archivos actuales
- [ ] Extraer `.tar.gz`
- [ ] Verificar `manifest.json` existe (733 bytes)
- [ ] Verificar GeoJSON es real (48 MB, no 133 bytes)
- [ ] Configurar permisos
- [ ] Recargar Nginx
- [ ] Purgar caché de Cloudflare
- [ ] Verificar desde el servidor (curl)
- [ ] Verificar desde el navegador (modo incógnito)

---

## ⏱️ TIEMPO ESTIMADO

- Corrección del deployment: 15 minutos
- Purga de caché: 5 minutos
- Verificación: 5 minutos
- **Total: 25 minutos**

---

## 🆘 SI NECESITAS EL ARCHIVO .tar.gz

El archivo `.tar.gz` está en tu máquina local:

```bash
# Ubicación
./vecino-activo-fix-produccion-20260128-113447.tar.gz

# Tamaño
~36 MB comprimido
~130 MB descomprimido

# Contiene
- manifest.json (733 bytes)
- data/geo/unidades_vecinales_simple.geojson (48 MB)
- Todo el código compilado
```

**Enviar al servidor:**
```bash
scp vecino-activo-fix-produccion-20260128-113447.tar.gz usuario@servidor:~
```

---

## 📞 CONTACTO URGENTE

Si el proveedor necesita ayuda:
- Proporcionar acceso SSH temporal
- Compartir logs de Nginx
- Confirmar que tiene el archivo `.tar.gz`

---

**Creado:** 28 de enero de 2026  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** Esperando corrección del proveedor
