# 🚨 DEPLOYMENT INMEDIATO REQUERIDO

## SITUACIÓN ACTUAL

El servidor en producción (https://vecinoactivo.cl/) tiene un **build antiguo**:

- **Build en producción**: `main.be85a1cf.js` (ANTIGUO - sin Firebase)
- **Build local listo**: `main.6691ce72.js` (NUEVO - con Firebase)

**Errores actuales en producción**:
1. ❌ `Firebase: Error (auth/invalid-api-key)` - Build sin variables de Firebase
2. ❌ `manifest.json 404` - Archivo faltante en el servidor

## ✅ SOLUCIÓN: DESPLEGAR BUILD NUEVO

El build local está **completo y funcional**. Solo necesitas copiarlo al servidor.

---

## OPCIÓN 1: Deployment Automático (SI TIENES ACCESO SSH)

```bash
# 1. Conectar al servidor
ssh usuario@vecinoactivo.cl

# 2. Ir al directorio del proyecto
cd /ruta/al/proyecto

# 3. Actualizar código
git pull origin main

# 4. Deployment automático
./scripts/deployment/deploy-force-update.sh
```

---

## OPCIÓN 2: Deployment con Docker Compose (SI TIENES ACCESO SSH)

```bash
# 1. Conectar al servidor
ssh usuario@vecinoactivo.cl

# 2. Ir al directorio del proyecto
cd /ruta/al/proyecto

# 3. Actualizar código
git pull origin main

# 4. Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar
docker-compose -f docker-compose.prod.yml logs -f
```

---

## OPCIÓN 3: Deployment Manual (SI NO TIENES ACCESO DIRECTO)

### Paso 1: Comprimir el build local

```bash
# En tu máquina local
cd /Users/camiloalegria/Desktop/AIntelligence/Vecino\ Activo/vecino_activo_v2

# Comprimir build
tar -czf vecino-activo-build-$(date +%Y%m%d-%H%M%S).tar.gz build/

# Verificar que se creó
ls -lh vecino-activo-build-*.tar.gz
```

### Paso 2: Enviar al servidor

**Si tienes acceso SSH:**
```bash
# Copiar al servidor
scp vecino-activo-build-*.tar.gz usuario@vecinoactivo.cl:/tmp/
```

**Si NO tienes acceso SSH:**
- Sube el archivo a Google Drive, Dropbox, o WeTransfer
- Comparte el link con quien tenga acceso al servidor

### Paso 3: Extraer en el servidor

```bash
# En el servidor
cd /ruta/al/proyecto

# Backup del build anterior (opcional)
mv build build.backup-$(date +%Y%m%d-%H%M%S)

# Extraer nuevo build
tar -xzf /tmp/vecino-activo-build-*.tar.gz

# Reiniciar contenedor
docker-compose -f docker-compose.prod.yml restart
```

---

## OPCIÓN 4: Deployment vía Panel de Control (SI USAS HOSTING WEB)

Si el sitio está en un hosting web (no Docker):

1. **Descargar el build local**
   - Comprimir la carpeta `build/`
   - Renombrar a `public_html.zip` o similar

2. **Subir al servidor**
   - Acceder al panel de control (cPanel, Plesk, etc.)
   - Ir a "Administrador de archivos"
   - Subir el archivo comprimido
   - Extraer en el directorio público

3. **Verificar**
   - Abrir https://vecinoactivo.cl/
   - Presionar Ctrl+Shift+R

---

## VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar que el build se actualizó

```bash
# Verificar el hash del archivo JS en producción
curl -I https://vecinoactivo.cl/static/js/main.6691ce72.js

# Debería responder: 200 OK
```

### 2. Verificar en el navegador

1. Abre https://vecinoactivo.cl/
2. Presiona **Ctrl+Shift+R** (forzar recarga sin caché)
3. Abre F12 → Console
4. Verifica que NO haya errores de Firebase
5. Busca el mensaje: "🔥 Inicializando Firebase con proyecto: stratega-ai-x"

### 3. Verificar manifest.json

```bash
curl -I https://vecinoactivo.cl/manifest.json

# Debería responder: 200 OK
```

---

## ARCHIVOS QUE DEBEN ESTAR EN EL SERVIDOR

```
/usr/share/nginx/html/  (o tu directorio público)
├── index.html
├── manifest.json
├── favicon.svg
├── robots.txt
├── sitemap.xml
└── static/
    ├── js/
    │   ├── main.6691ce72.js  ← ESTE ARCHIVO ES CRÍTICO
    │   └── ...
    └── css/
        ├── main.14be7c2a.css
        └── ...
```

---

## TROUBLESHOOTING

### Si después del deployment sigue el error:

1. **Limpiar caché del navegador**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Verificar que el archivo correcto está en el servidor**
   ```bash
   # En el servidor
   ls -la /usr/share/nginx/html/static/js/main.*.js
   
   # Debería mostrar: main.6691ce72.js
   ```

3. **Verificar que Firebase está en el código**
   ```bash
   # En el servidor
   grep -o "stratega-ai-x" /usr/share/nginx/html/static/js/main.6691ce72.js
   
   # Debería mostrar: stratega-ai-x
   ```

4. **Reiniciar Nginx**
   ```bash
   docker exec vecino-activo-prod nginx -s reload
   # O
   sudo systemctl reload nginx
   ```

---

## INFORMACIÓN DEL BUILD ACTUAL

### Build Local (Listo para desplegar)
- **Fecha**: 27 de enero, 10:30
- **Archivo JS**: `main.6691ce72.js`
- **Archivo CSS**: `main.14be7c2a.css`
- **Tamaño**: 517 KB (JS), 77 KB (CSS)
- **Estado**: ✅ Con Firebase configurado
- **Ubicación**: `/Users/camiloalegria/Desktop/AIntelligence/Vecino Activo/vecino_activo_v2/build/`

### Build en Producción (Antiguo)
- **Archivo JS**: `main.be85a1cf.js`
- **Estado**: ❌ Sin Firebase, causando error

---

## CONTACTO

Si necesitas ayuda con el deployment, necesito saber:

1. **¿Tienes acceso SSH al servidor?** (Sí/No)
2. **¿Qué tipo de servidor es?** (VPS, Hosting compartido, Cloud, etc.)
3. **¿Usas Docker?** (Sí/No)
4. **¿Tienes acceso al panel de control?** (cPanel, Plesk, etc.)
5. **¿Quién tiene acceso al servidor?** (Tú, un proveedor, etc.)

Con esta información puedo darte instrucciones más específicas.

---

## RESUMEN EJECUTIVO

**Problema**: Servidor tiene build antiguo sin Firebase
**Solución**: Desplegar el build nuevo que está listo
**Tiempo estimado**: 5-10 minutos
**Riesgo**: Bajo (solo actualización de archivos estáticos)
**Urgencia**: Alta (el sitio no funciona actualmente)

**Acción inmediata**: Elegir una de las 4 opciones arriba y ejecutarla.

---

**Fecha**: 27 de enero de 2026, 10:45
**Build listo**: main.6691ce72.js
**Estado**: ⏳ Esperando deployment
