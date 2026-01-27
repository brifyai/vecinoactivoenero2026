# 📦 INSTRUCCIONES PARA DEPLOYMENT - VECINO ACTIVO

## PARA: Proveedor de Hosting / Administrador del Servidor

**Sitio**: https://vecinoactivo.cl/  
**Fecha**: 27 de enero de 2026  
**Urgencia**: Alta - El sitio actualmente no funciona

---

## 🎯 OBJETIVO

Reemplazar los archivos actuales del sitio web con el nuevo build que soluciona los errores.

---

## 📦 ARCHIVO A DESPLEGAR

**Nombre**: `vecino-activo-build-20260127-104730.tar.gz`  
**Tamaño**: 36 MB  
**Ubicación**: Se enviará por email/WeTransfer/Google Drive

---

## 🔧 PASOS PARA EL DEPLOYMENT

### Opción 1: Si el sitio usa Docker

```bash
# 1. Conectar al servidor
ssh usuario@vecinoactivo.cl

# 2. Ir al directorio del proyecto
cd /ruta/al/proyecto

# 3. Actualizar código desde Git
git pull origin main

# 4. Reconstruir contenedor
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar
docker-compose -f docker-compose.prod.yml logs -f
```

### Opción 2: Si el sitio usa Nginx directamente

```bash
# 1. Conectar al servidor
ssh usuario@vecinoactivo.cl

# 2. Backup del build anterior
cd /var/www/vecinoactivo  # o el directorio correspondiente
mv html html.backup-$(date +%Y%m%d-%H%M%S)

# 3. Subir el archivo tar.gz al servidor
# (usar scp, sftp, o panel de control)

# 4. Extraer el nuevo build
tar -xzf vecino-activo-build-20260127-104730.tar.gz
mv build html

# 5. Ajustar permisos
chown -R www-data:www-data html/
chmod -R 755 html/

# 6. Reiniciar Nginx
sudo systemctl reload nginx
```

### Opción 3: Si el sitio usa cPanel/Plesk

1. **Acceder al panel de control**
   - URL: https://vecinoactivo.cl:2083 (o similar)
   - Usuario: [proporcionado por el cliente]

2. **Ir a "Administrador de archivos"**
   - Navegar a `public_html/` o `www/`

3. **Hacer backup**
   - Seleccionar todos los archivos
   - Click derecho → "Comprimir" → Guardar como `backup-20260127.zip`

4. **Subir nuevo build**
   - Click en "Subir"
   - Seleccionar `vecino-activo-build-20260127-104730.tar.gz`
   - Esperar a que termine la subida

5. **Extraer archivos**
   - Click derecho en el archivo subido
   - Seleccionar "Extraer"
   - Se creará una carpeta `build/`

6. **Mover archivos**
   - Entrar a la carpeta `build/`
   - Seleccionar todos los archivos
   - Mover a `public_html/` (reemplazar existentes)

7. **Limpiar**
   - Eliminar la carpeta `build/` vacía
   - Eliminar el archivo `.tar.gz`

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar que los archivos se copiaron

```bash
# Verificar que existe el archivo principal
ls -la /ruta/al/sitio/index.html
ls -la /ruta/al/sitio/manifest.json
ls -la /ruta/al/sitio/static/js/main.6691ce72.js
```

**Importante**: El archivo JS debe ser `main.6691ce72.js` (NO `main.be85a1cf.js`)

### 2. Verificar en el navegador

1. Abrir: https://vecinoactivo.cl/
2. Presionar **Ctrl+Shift+R** (forzar recarga sin caché)
3. Abrir DevTools (F12) → Console
4. **NO debe haber errores de Firebase**
5. **NO debe haber error 404 de manifest.json**

### 3. Verificar archivos específicos

```bash
# Verificar que manifest.json existe
curl -I https://vecinoactivo.cl/manifest.json
# Debe responder: 200 OK

# Verificar que el nuevo JS existe
curl -I https://vecinoactivo.cl/static/js/main.6691ce72.js
# Debe responder: 200 OK
```

---

## 📋 ESTRUCTURA DE ARCHIVOS

El build contiene:

```
build/
├── index.html                    ← Archivo principal
├── manifest.json                 ← Configuración PWA
├── favicon.svg                   ← Icono del sitio
├── robots.txt                    ← SEO
├── sitemap.xml                   ← SEO
├── firebase-messaging-sw.js      ← Service Worker
└── static/
    ├── js/
    │   ├── main.6691ce72.js      ← JavaScript principal (CRÍTICO)
    │   ├── main.6691ce72.js.LICENSE.txt
    │   └── [otros archivos .js]
    └── css/
        ├── main.14be7c2a.css     ← CSS principal
        └── [otros archivos .css]
```

**Total de archivos**: ~50 archivos  
**Tamaño total**: ~36 MB comprimido, ~100 MB descomprimido

---

## ⚠️ IMPORTANTE

### Archivos Críticos

Estos archivos DEBEN estar presentes después del deployment:

1. ✅ `index.html`
2. ✅ `manifest.json`
3. ✅ `static/js/main.6691ce72.js`
4. ✅ `static/css/main.14be7c2a.css`

### Permisos Requeridos

```bash
# Archivos: 644 (rw-r--r--)
# Directorios: 755 (rwxr-xr-x)
```

### Variables de Entorno

**NO se requieren variables de entorno adicionales**. Todo está incluido en el build.

---

## 🆘 TROUBLESHOOTING

### Si después del deployment sigue el error:

1. **Verificar que el archivo correcto está en el servidor**
   ```bash
   ls -la /ruta/al/sitio/static/js/main.*.js
   # Debe mostrar: main.6691ce72.js
   ```

2. **Limpiar caché de Nginx (si aplica)**
   ```bash
   sudo nginx -s reload
   ```

3. **Verificar permisos**
   ```bash
   ls -la /ruta/al/sitio/
   # Todos los archivos deben ser legibles
   ```

4. **Verificar logs**
   ```bash
   # Nginx
   tail -f /var/log/nginx/error.log
   
   # Docker (si aplica)
   docker-compose logs -f
   ```

---

## 📞 CONTACTO

Si hay algún problema durante el deployment:

**Cliente**: Camilo Alegría  
**Email**: [tu email]  
**Teléfono**: [tu teléfono]

**Información del Servidor Necesaria**:
- Tipo de servidor (VPS, hosting compartido, cloud)
- Sistema operativo
- Ubicación del directorio público
- Usuario y permisos

---

## 📊 RESUMEN EJECUTIVO

**Problema Actual**: 
- Sitio muestra página en blanco
- Error: `Firebase: Error (auth/invalid-api-key)`
- Error: `manifest.json 404`

**Causa**: 
- Build antiguo sin configuración de Firebase

**Solución**: 
- Reemplazar archivos con el nuevo build

**Tiempo Estimado**: 
- 10-15 minutos

**Riesgo**: 
- Bajo (solo actualización de archivos estáticos)

**Resultado Esperado**: 
- Sitio funcional sin errores
- Firebase inicializado correctamente
- Todos los archivos cargando correctamente

---

**Preparado por**: Kiro AI  
**Fecha**: 27 de enero de 2026, 10:47  
**Versión del Build**: main.6691ce72.js
