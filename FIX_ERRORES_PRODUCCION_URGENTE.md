# 🚨 FIX ERRORES EN PRODUCCIÓN - URGENTE

**Fecha:** 28 de enero de 2026  
**Sitio:** https://vecinoactivo.cl/

---

## 🔴 ERRORES IDENTIFICADOS

### 1. manifest.json 404 ❌
```
Failed to load resource: the server responded with a status of 404
https://vecinoactivo.cl/manifest.json
```

### 2. FCM Token Error ⚠️
```
FirebaseError: Messaging: The notification permission was not granted and blocked instead. 
(messaging/permission-blocked)
```

### 3. Neighborhoods JSON Error ❌
```
Error loading neighborhoods: SyntaxError: Unexpected token 'v', "version ht"... is not valid JSON
```

---

## ✅ SOLUCIONES

### Solución 1: Agregar manifest.json

**Problema:** El archivo `manifest.json` no existe en el build de producción.

**Verificar:**
```bash
ls -la public/manifest.json
```

**Si no existe, crear:**
```bash
cat > public/manifest.json << 'EOF'
{
  "short_name": "Vecino Activo",
  "name": "Vecino Activo - Plataforma de Comunidades Vecinales",
  "description": "Conecta con tu comunidad vecinal",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
EOF
```

**Rebuild:**
```bash
npm run build
```

---

### Solución 2: Hacer FCM Opcional (No Crítico)

**Problema:** Firebase intenta obtener permisos de notificaciones pero el usuario los bloqueó.

**Solución:** Modificar el código para que FCM sea opcional.

**Archivo:** `src/config/firebase.js`

**Cambiar:**
```javascript
// Código actual (falla si no hay permisos)
export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: FIREBASE_CONFIG.vapidKey });
    return token;
  } catch (error) {
    console.error('❌ Error obteniendo FCM token:', error);
    throw error; // ❌ Esto causa el error
  }
};
```

**Por:**
```javascript
// Código mejorado (no falla si no hay permisos)
export const getFCMToken = async () => {
  try {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('ℹ️ Este navegador no soporta notificaciones');
      return null;
    }

    // Verificar permisos actuales
    if (Notification.permission === 'denied') {
      console.log('ℹ️ Permisos de notificaciones denegados por el usuario');
      return null;
    }

    // Solo intentar obtener token si hay permisos o están por defecto
    if (Notification.permission === 'granted' || Notification.permission === 'default') {
      const token = await getToken(messaging, { vapidKey: FIREBASE_CONFIG.vapidKey });
      return token;
    }

    return null;
  } catch (error) {
    console.log('ℹ️ No se pudo obtener FCM token (no crítico):', error.message);
    return null; // ✅ Retornar null en lugar de throw
  }
};
```

---

### Solución 3: Fix Neighborhoods JSON Error ❌ CRÍTICO

**Problema:** El servidor está devolviendo HTML en lugar de JSON para los archivos GeoJSON.

**Causa:** Nginx no está sirviendo correctamente los archivos `.geojson` de la carpeta `public/data/geo/`.

**Verificar archivos:**
```bash
ls -la public/data/geo/
```

**Archivos esperados:**
- `unidades_vecinales_ago2025.geojson`
- `unidades_vecinales_ago2025_index.json`

**Solución A: Verificar que los archivos existen en el build**

```bash
# Verificar en el build
ls -la build/data/geo/

# Si no existen, verificar que están en public/
ls -la public/data/geo/
```

**Solución B: Configurar Nginx para servir archivos .geojson**

**Archivo:** `nginx.conf`

**Agregar:**
```nginx
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
    
    # Cache
    expires 1d;
    add_header Cache-Control "public, immutable";
}
```

**Solución C: Verificar rutas en el código**

**Archivo:** `src/components/LandingMap/LandingMap.js`

**Buscar:**
```javascript
const INDEX_URL = '/data/geo/unidades_vecinales_ago2025_index.json';
```

**Verificar que la ruta es correcta y el archivo existe.**

---

## 🔧 PASOS PARA APLICAR LOS FIXES

### Paso 1: Crear manifest.json
```bash
# En tu máquina local
cat > public/manifest.json << 'EOF'
{
  "short_name": "Vecino Activo",
  "name": "Vecino Activo - Plataforma de Comunidades Vecinales",
  "description": "Conecta con tu comunidad vecinal",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
EOF
```

### Paso 2: Modificar firebase.js
```bash
# Editar src/config/firebase.js
# Aplicar los cambios de la Solución 2
```

### Paso 3: Verificar archivos GeoJSON
```bash
# Verificar que existen
ls -la public/data/geo/unidades_vecinales_ago2025.geojson
ls -la public/data/geo/unidades_vecinales_ago2025_index.json

# Si no existen, copiarlos desde backup o regenerarlos
```

### Paso 4: Rebuild
```bash
npm run build
```

### Paso 5: Verificar el build
```bash
# Verificar que manifest.json está en el build
ls -la build/manifest.json

# Verificar que los archivos GeoJSON están en el build
ls -la build/data/geo/
```

### Paso 6: Crear paquete para deployment
```bash
tar -czf vecino-activo-fix-errores-$(date +%Y%m%d-%H%M%S).tar.gz build/
```

### Paso 7: Enviar al proveedor
```bash
# Enviar el .tar.gz al proveedor
# Incluir instrucciones de nginx.conf si es necesario
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Después del deployment, verificar:

- [ ] `https://vecinoactivo.cl/manifest.json` carga correctamente (200 OK)
- [ ] No hay errores de FCM en la consola (o son solo warnings informativos)
- [ ] El mapa carga correctamente
- [ ] Los archivos GeoJSON se cargan (verificar en Network tab)
- [ ] No hay errores de JSON parsing

---

## 🐛 DEBUGGING

### Verificar manifest.json
```bash
curl -I https://vecinoactivo.cl/manifest.json
# Debe retornar: HTTP/1.1 200 OK
```

### Verificar archivos GeoJSON
```bash
curl -I https://vecinoactivo.cl/data/geo/unidades_vecinales_ago2025_index.json
# Debe retornar: HTTP/1.1 200 OK
# Content-Type: application/json
```

### Verificar contenido
```bash
curl https://vecinoactivo.cl/data/geo/unidades_vecinales_ago2025_index.json
# Debe retornar JSON válido, NO HTML
```

---

## 📝 NOTAS IMPORTANTES

### Error de FCM (No Crítico)
- Este error NO impide que la app funcione
- Solo afecta las notificaciones push
- Los usuarios pueden seguir usando la app normalmente
- Se puede ignorar si no se necesitan notificaciones push

### Error de Neighborhoods (CRÍTICO)
- Este error SÍ impide que el mapa funcione
- Debe solucionarse para que el mapa cargue
- Prioridad: ALTA

### manifest.json (Importante)
- Necesario para PWA (Progressive Web App)
- Mejora la experiencia en móviles
- Permite "Agregar a pantalla de inicio"
- Prioridad: MEDIA

---

## 🎯 PRIORIDADES

1. 🔴 **CRÍTICO:** Fix Neighborhoods JSON Error
2. 🟡 **IMPORTANTE:** Agregar manifest.json
3. 🟢 **OPCIONAL:** Hacer FCM opcional (mejora UX)

---

**Creado por:** Kiro AI Assistant  
**Fecha:** 28 de enero de 2026  
**Estado:** ⏳ Pendiente aplicar fixes
