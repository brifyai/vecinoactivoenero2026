# 🚀 DEPLOYMENT AUTOMÁTICO

**Fecha:** 28 de enero de 2026  
**Método:** Script automatizado desde Git

---

## ✅ TODO LISTO EN GIT

El código está actualizado en GitHub con:
- ✅ Archivo GeoJSON real (75 MB, no puntero)
- ✅ manifest.json incluido
- ✅ Todos los fixes aplicados

---

## 📋 INSTRUCCIONES PARA EL PROVEEDOR

### Opción 1: Script Automático (RECOMENDADO)

**Ejecutar en el servidor:**

```bash
# 1. Clonar o actualizar el repositorio (solo primera vez)
cd /var/www
git clone https://github.com/brifyai/vecinoactivoenero2026.git vecino-activo
cd vecino-activo

# 2. Ejecutar script de deployment
sudo bash scripts/deployment/deploy-from-git.sh
```

**El script hace automáticamente:**
1. ✅ Crea backup del sitio actual
2. ✅ Actualiza código desde Git
3. ✅ Verifica archivos críticos (manifest.json, GeoJSON)
4. ✅ Instala dependencias
5. ✅ Hace build
6. ✅ Copia a /usr/share/nginx/html
7. ✅ Configura permisos
8. ✅ Recarga Nginx
9. ✅ Verifica deployment

**Tiempo:** ~5 minutos

---

### Opción 2: Manual (Si no tienen el repo clonado)

```bash
# 1. Ir al directorio del sitio
cd /usr/share/nginx/html

# 2. Crear backup
sudo tar -czf ~/backup-vecino-activo-$(date +%Y%m%d-%H%M%S).tar.gz .

# 3. Descargar y extraer el código
cd /tmp
git clone https://github.com/brifyai/vecinoactivoenero2026.git
cd vecinoactivoenero2026

# 4. Instalar y build
npm ci
npm run build

# 5. Copiar a Nginx
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r build/* /usr/share/nginx/html/

# 6. Permisos
sudo chown -R nginx:nginx /usr/share/nginx/html
sudo chmod -R 755 /usr/share/nginx/html

# 7. Recargar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔍 VERIFICACIÓN

### En el servidor:

```bash
# Verificar manifest.json
ls -lh /usr/share/nginx/html/manifest.json
# Debe mostrar: 733 bytes

# Verificar GeoJSON
ls -lh /usr/share/nginx/html/data/geo/unidades_vecinales_simple.geojson
# Debe mostrar: 75M (NO 133 bytes)

# Verificar con curl
curl -I http://localhost/manifest.json
# Debe retornar: HTTP/1.1 200 OK

curl -I http://localhost/data/geo/unidades_vecinales_simple.geojson | grep Content-Length
# Debe mostrar: Content-Length: ~75000000 (NO 133)
```

---

## 🌐 PURGAR CACHÉ DE CLOUDFLARE

**IMPORTANTE:** Después del deployment, purgar el caché.

### Método 1: Dashboard

1. Ir a https://dash.cloudflare.com/
2. Seleccionar `vecinoactivo.cl`
3. Caching > Configuration
4. Click "Purge Everything"
5. Confirmar

### Método 2: URLs específicas

Purgar solo estos archivos:
```
https://vecinoactivo.cl/
https://vecinoactivo.cl/manifest.json
https://vecinoactivo.cl/data/geo/unidades_vecinales_simple.geojson
```

---

## ✅ RESULTADO ESPERADO

Después del deployment y purga de caché:

1. ✅ https://vecinoactivo.cl/ carga correctamente
2. ✅ https://vecinoactivo.cl/manifest.json retorna 200 OK
3. ✅ Archivo GeoJSON es 75 MB (no 133 bytes)
4. ✅ Mapa funciona correctamente
5. ✅ No hay errores en consola del navegador

---

## 🆘 SI HAY PROBLEMAS

### Problema: GeoJSON sigue siendo 133 bytes

**Causa:** Git LFS no está configurado o el archivo no se descargó

**Solución:**
```bash
# Verificar en el repositorio local
cd /var/www/vecino-activo
ls -lh public/data/geo/unidades_vecinales_simple.geojson

# Si es 133 bytes, el problema está en Git
# Usar el .tar.gz en su lugar (ver SOLUCION_FINAL_GEOJSON.md)
```

### Problema: manifest.json 404

**Causa:** Archivo no se copió correctamente

**Solución:**
```bash
# Verificar en el build
ls -lh /var/www/vecino-activo/build/manifest.json

# Si existe, copiar manualmente
sudo cp /var/www/vecino-activo/build/manifest.json /usr/share/nginx/html/
```

### Problema: Caché de Cloudflare

**Causa:** Cloudflare sigue sirviendo archivos antiguos

**Solución:**
- Purgar caché (ver arriba)
- Esperar 5 minutos
- Probar en modo incógnito

---

## 📞 CONTACTO

Si necesitan ayuda:
- Proporcionar output del script
- Compartir logs de Nginx: `tail -100 /var/log/nginx/error.log`
- Screenshots de errores en el navegador

---

## 📦 ARCHIVOS DISPONIBLES

Si el deployment desde Git no funciona, tenemos backup:

**Archivo .tar.gz:**
- `vecino-activo-geojson-fix-20260128-142401.tar.gz` (50 MB)
- Contiene build completo con archivos reales
- Listo para extraer en /usr/share/nginx/html/

---

**Creado:** 28 de enero de 2026  
**Estado:** ✅ Listo para deployment  
**Método recomendado:** Script automático
