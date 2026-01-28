# FIX: manifest.json 404 Error

**Fecha:** 28 Enero 2026  
**Error:** `GET https://vecinoactivo.cl/manifest.json 404 (Not Found)`  
**Prioridad:** ⚠️ Media (no crítico, solo afecta PWA)

---

## 🔍 ANÁLISIS PROFUNDO

### Verificaciones realizadas:
1. ✅ Archivo existe en `public/manifest.json`
2. ✅ Archivo se copia a `build/manifest.json` durante el build
3. ✅ HTML referencia correctamente: `<link rel="manifest" href="/manifest.json"/>`
4. ❌ Archivo NO está disponible en producción: https://vecinoactivo.cl/manifest.json

### Causa raíz:
**EasyPanel no está sirviendo correctamente los archivos estáticos de la raíz del build.**

El problema es que EasyPanel puede estar:
1. Sirviendo solo desde un subdirectorio
2. No copiando todos los archivos del build
3. Configuración de Nginx incorrecta
4. Falta configuración de archivos estáticos

---

## 🎯 SOLUCIONES

### SOLUCIÓN 1: Verificar configuración de EasyPanel (RECOMENDADO)

En EasyPanel, verifica:

1. **Build Command:**
   ```bash
   npm ci && npm run build
   ```

2. **Output Directory:**
   ```
   build
   ```

3. **Static Files:**
   Asegúrate que EasyPanel esté configurado para servir archivos estáticos desde la raíz del build.

4. **Nginx Configuration:**
   Si EasyPanel usa Nginx, necesita esta configuración:
   ```nginx
   location / {
       root /app/build;
       try_files $uri $uri/ /index.html;
   }
   
   # Servir archivos estáticos con caché
   location ~* \.(json|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
       root /app/build;
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

### SOLUCIÓN 2: Mover manifest.json a carpeta static (WORKAROUND)

Si EasyPanel solo sirve archivos desde `/static`, podemos mover el manifest:

1. Mover archivo:
   ```bash
   cp public/manifest.json public/static/manifest.json
   ```

2. Actualizar referencia en `public/index.html`:
   ```html
   <link rel="manifest" href="%PUBLIC_URL%/static/manifest.json" />
   ```

3. Rebuild y redeploy

### SOLUCIÓN 3: Verificar archivos en producción

Conectar al contenedor de EasyPanel y verificar:

```bash
# En EasyPanel, abrir terminal del contenedor
ls -la /app/build/manifest.json
ls -la /app/build/*.json
ls -la /app/build/
```

Esto te dirá si el archivo está ahí pero no se sirve, o si no se copió.

### SOLUCIÓN 4: Agregar manifest.json al HTML inline (ÚLTIMA OPCIÓN)

Si nada funciona, podemos embeber el manifest en el HTML:

```html
<link rel="manifest" href="data:application/json;base64,ewogICJzaG9ydF9uYW1lIjogIlZlY2lubyBBY3Rpdm8iLAogICJuYW1lIjogIlZlY2lubyBBY3Rpdm8gLSBSZWQgU29jaWFsIEhpcGVybG9jYWwiLAogICJkZXNjcmlwdGlvbiI6ICJDb25lY3RhIGNvbiB0dXMgdmVjaW5vcywgcGFydGljaXBhIGVuIHR1IGNvbXVuaWRhZCB5IHRyYW5zZm9ybWEgdHUgYmFycmlvIiwKICAiaWNvbnMiOiBbCiAgICB7CiAgICAgICJzcmMiOiAiZmF2aWNvbi5pY28iLAogICAgICAic2l6ZXMiOiAiNjR4NjQgMzJ4MzIgMjR4MjQgMTZ4MTYiLAogICAgICAidHlwZSI6ICJpbWFnZS94LWljb24iCiAgICB9LAogICAgewogICAgICAic3JjIjogImxvZ28xOTIucG5nIiwKICAgICAgInR5cGUiOiAiaW1hZ2UvcG5nIiwKICAgICAgInNpemVzIjogIjE5MngxOTIiCiAgICB9LAogICAgewogICAgICAic3JjIjogImxvZ281MTIucG5nIiwKICAgICAgInR5cGUiOiAiaW1hZ2UvcG5nIiwKICAgICAgInNpemVzIjogIjUxMng1MTIiCiAgICB9CiAgXSwKICAic3RhcnRfdXJsIjogIi4iLAogICJkaXNwbGF5IjogInN0YW5kYWxvbmUiLAogICJ0aGVtZV9jb2xvciI6ICIjNjY3ZWVhIiwKICAiYmFja2dyb3VuZF9jb2xvciI6ICIjZmZmZmZmIiwKICAib3JpZW50YXRpb24iOiAicG9ydHJhaXQtcHJpbWFyeSIsCiAgImNhdGVnb3JpZXMiOiBbInNvY2lhbCIsICJsaWZlc3R5bGUiXSwKICAibGFuZyI6ICJlcy1DTCIsCiAgImRpciI6ICJsdHIiLAogICJzY29wZSI6ICIvIgp9" />
```

---

## 🔧 PASOS INMEDIATOS

### 1. Verificar en EasyPanel:

Ve a tu proyecto en EasyPanel y verifica:
- Settings → Build Configuration
- ¿Cuál es el "Output Directory"?
- ¿Hay configuración de "Static Files"?

### 2. Verificar archivos en el contenedor:

En EasyPanel, abre la terminal del contenedor y ejecuta:
```bash
ls -la /app/build/ | grep -E "(manifest|json|ico|png)"
```

Esto te dirá qué archivos están presentes.

### 3. Verificar Nginx/servidor:

Si puedes ver la configuración de Nginx en EasyPanel, verifica que esté sirviendo archivos desde la raíz del build.

---

## 📊 IMPACTO

### ¿Es crítico?
**NO.** Este error solo afecta:
- ❌ Instalación como PWA (Progressive Web App)
- ❌ Agregar a pantalla de inicio en móviles
- ❌ Metadata de la app

### ¿Qué funciona normal?
- ✅ Toda la funcionalidad del sitio
- ✅ Navegación
- ✅ Autenticación
- ✅ Todas las features

---

## 🎯 RECOMENDACIÓN

1. **Primero:** Verifica la configuración de EasyPanel (Solución 1)
2. **Si no funciona:** Verifica archivos en el contenedor (Solución 3)
3. **Último recurso:** Usa workaround de mover a /static (Solución 2)

El error NO afecta la funcionalidad crítica del sitio, así que puedes dejarlo para después si prefieres enfocarte en otras cosas.

---

## 📝 INFORMACIÓN ADICIONAL

### Archivos que deberían estar en la raíz:
```
/manifest.json
/favicon.ico
/logo192.png
/logo512.png
/robots.txt
/sitemap.xml
```

### Verificar en producción:
- https://vecinoactivo.cl/manifest.json (404 ❌)
- https://vecinoactivo.cl/favicon.ico (¿funciona?)
- https://vecinoactivo.cl/logo192.png (¿funciona?)
- https://vecinoactivo.cl/robots.txt (¿funciona?)

Si TODOS dan 404, el problema es que EasyPanel no está sirviendo archivos estáticos de la raíz.

Si ALGUNOS funcionan, el problema es específico del manifest.json.

---

**Próximo paso:** Dime qué ves en la configuración de EasyPanel y qué archivos están en el contenedor.
