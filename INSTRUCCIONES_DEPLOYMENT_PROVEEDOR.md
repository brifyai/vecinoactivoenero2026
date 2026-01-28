# 📦 INSTRUCCIONES DE DEPLOYMENT PARA PROVEEDOR

**Fecha:** 28 de enero de 2026  
**Versión:** Fix Errores Producción v1.0  
**Archivo:** `vecino-activo-fix-produccion-20260128-113447.tar.gz`

---

## 🎯 OBJETIVO

Corregir 3 errores críticos en producción:
1. ❌ manifest.json 404
2. ❌ FCM Token errors bloqueando la app
3. ❌ Neighborhoods JSON parsing error (mapa no funciona)

---

## 📦 ARCHIVOS A DESPLEGAR

### 1. Build de la aplicación
**Archivo:** `vecino-activo-fix-produccion-20260128-113447.tar.gz` (36 MB)

**Contenido:**
- Build completo de React optimizado
- manifest.json corregido
- Archivos GeoJSON para el mapa
- Assets estáticos (CSS, JS, imágenes)

### 2. Configuración de Nginx
**Archivo:** `nginx.conf`

**Cambios importantes:**
- Agregada configuración para servir archivos GeoJSON
- MIME types para `.json` y `.geojson`
- Headers CORS para archivos de datos
- Cache optimizado

---

## 🚀 PASOS DE DEPLOYMENT

### Paso 1: Backup del sitio actual
```bash
# Crear backup del sitio actual
cd /usr/share/nginx/html
tar -czf backup-vecinoactivo-$(date +%Y%m%d-%H%M%S).tar.gz .

# Mover backup a ubicación segura
mv backup-vecinoactivo-*.tar.gz /root/backups/
```

### Paso 2: Extraer nuevo build
```bash
# Limpiar directorio actual (excepto backups)
cd /usr/share/nginx/html
rm -rf static/ data/ *.html *.json *.txt *.ico *.png *.svg

# Extraer nuevo build
tar -xzf /path/to/vecino-activo-fix-produccion-20260128-113447.tar.gz --strip-components=1

# Verificar que los archivos se extrajeron correctamente
ls -la
ls -la data/geo/
```

### Paso 3: Actualizar configuración de Nginx
```bash
# Backup de configuración actual
cp /etc/nginx/conf.d/vecinoactivo.conf /etc/nginx/conf.d/vecinoactivo.conf.backup

# Copiar nueva configuración
cp /path/to/nginx.conf /etc/nginx/conf.d/vecinoactivo.conf

# Verificar sintaxis
nginx -t
```

**Salida esperada:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Paso 4: Aplicar cambios
```bash
# Recargar Nginx
systemctl reload nginx

# O si no funciona reload:
systemctl restart nginx

# Verificar que Nginx está corriendo
systemctl status nginx
```

### Paso 5: Verificar permisos
```bash
# Asegurar permisos correctos
cd /usr/share/nginx/html
chown -R nginx:nginx .
chmod -R 755 .
chmod 644 manifest.json
chmod -R 644 data/geo/*.geojson
```

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### Verificación desde el servidor

```bash
# 1. Verificar que manifest.json existe y es accesible
curl -I http://localhost/manifest.json
# Debe retornar: HTTP/1.1 200 OK

# 2. Verificar que GeoJSON existe y es accesible
curl -I http://localhost/data/geo/unidades_vecinales_simple.geojson
# Debe retornar: HTTP/1.1 200 OK

# 3. Verificar contenido de manifest.json
curl http://localhost/manifest.json
# Debe retornar JSON válido

# 4. Verificar primeros bytes de GeoJSON
curl http://localhost/data/geo/unidades_vecinales_simple.geojson | head -c 100
# Debe retornar JSON válido (empezar con "{")
```

### Verificación desde internet

```bash
# Ejecutar script de verificación (si está disponible)
bash scripts/debugging/verify-production-fixes.sh

# O verificar manualmente:
curl -I https://vecinoactivo.cl/manifest.json
curl -I https://vecinoactivo.cl/data/geo/unidades_vecinales_simple.geojson
```

### Verificación en el navegador

1. Abrir https://vecinoactivo.cl
2. Abrir DevTools (F12)
3. Ir a la pestaña "Console"
4. Verificar que NO hay errores de:
   - `manifest.json 404`
   - `FCM token errors` (solo logs informativos ℹ️)
   - `Neighborhoods JSON parsing errors`
5. Ir a la pestaña "Network"
6. Hacer click en el mapa
7. Verificar que se carga `unidades_vecinales_simple.geojson` con status 200

---

## 🔍 TROUBLESHOOTING

### Problema: manifest.json sigue dando 404

**Verificar:**
```bash
ls -la /usr/share/nginx/html/manifest.json
```

**Solución:**
```bash
# Si no existe, extraer solo ese archivo
tar -xzf vecino-activo-fix-produccion-20260128-113447.tar.gz build/manifest.json --strip-components=1
chmod 644 manifest.json
```

### Problema: GeoJSON sigue dando error de parsing

**Verificar:**
```bash
# Verificar que el archivo existe
ls -lh /usr/share/nginx/html/data/geo/unidades_vecinales_simple.geojson

# Verificar que es JSON válido
head -n 1 /usr/share/nginx/html/data/geo/unidades_vecinales_simple.geojson
```

**Debe empezar con:**
```json
{"type":"FeatureCollection","features":[...
```

**Si empieza con HTML:**
```html
<!DOCTYPE html>...
```

**Entonces Nginx no está sirviendo el archivo correctamente. Verificar:**
```bash
# Verificar configuración de Nginx
nginx -t

# Verificar que la configuración de /data/ está presente
grep -A 10 "location /data/" /etc/nginx/conf.d/vecinoactivo.conf
```

### Problema: Nginx no aplica la configuración

**Solución:**
```bash
# Verificar logs de error
tail -f /var/log/nginx/error.log

# Reiniciar Nginx (no solo reload)
systemctl restart nginx

# Verificar que no hay otros archivos de configuración conflictivos
ls -la /etc/nginx/conf.d/
ls -la /etc/nginx/sites-enabled/
```

### Problema: Permisos denegados

**Solución:**
```bash
# Verificar permisos
ls -la /usr/share/nginx/html/

# Corregir permisos
chown -R nginx:nginx /usr/share/nginx/html/
chmod -R 755 /usr/share/nginx/html/
find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
```

---

## 📊 CAMBIOS TÉCNICOS APLICADOS

### 1. Firebase FCM (src/config/firebase.js)
- Agregada verificación de soporte de notificaciones
- Detección de permisos denegados
- Retorno de `null` en lugar de `throw error`
- Logs informativos en lugar de errores

### 2. Nginx (nginx.conf)
- Agregado location block `/data/`
- MIME types para `.json` y `.geojson`
- Headers CORS
- Cache de 1 día para GeoJSON

### 3. Manifest (public/manifest.json)
- Corregido `theme_color` de `#000000` a `#667eea`
- Configuración PWA completa

---

## 📝 CHECKLIST DE DEPLOYMENT

- [ ] Backup del sitio actual creado
- [ ] Nuevo build extraído en `/usr/share/nginx/html/`
- [ ] Archivo `manifest.json` existe y es accesible
- [ ] Archivos GeoJSON existen en `data/geo/`
- [ ] Configuración de Nginx actualizada
- [ ] Sintaxis de Nginx verificada (`nginx -t`)
- [ ] Nginx recargado/reiniciado
- [ ] Permisos correctos aplicados
- [ ] Verificación desde servidor exitosa
- [ ] Verificación desde internet exitosa
- [ ] Verificación en navegador exitosa
- [ ] Mapa funciona correctamente
- [ ] No hay errores en la consola del navegador

---

## 🎯 RESULTADO ESPERADO

### Antes del deployment:
```
❌ manifest.json 404
❌ FCM Token Error: messaging/permission-blocked
❌ Error loading neighborhoods: SyntaxError
❌ Mapa no funciona
```

### Después del deployment:
```
✅ manifest.json carga correctamente
ℹ️ Permisos de notificaciones denegados (log informativo)
✅ Mapa carga correctamente
✅ Unidades vecinales cargadas: 346
✅ Click en el mapa funciona
```

---

## 📞 CONTACTO

Si hay problemas durante el deployment, contactar al equipo de desarrollo con:
- Logs de Nginx: `/var/log/nginx/error.log`
- Logs de acceso: `/var/log/nginx/access.log`
- Screenshots de errores en el navegador
- Output de los comandos de verificación

---

## 🔐 SEGURIDAD

Este deployment incluye:
- ✅ Headers de seguridad (X-Frame-Options, X-Content-Type-Options)
- ✅ Content Security Policy
- ✅ CORS configurado correctamente
- ✅ Cache optimizado
- ✅ Gzip compression

---

**Preparado por:** Kiro AI Assistant  
**Fecha:** 28 de enero de 2026  
**Versión:** 1.0
