# Paso 6.4: Despliegue a Producción

## Objetivo

Desplegar la aplicación Vecino Activo a producción con todas las configuraciones necesarias.

---

## 🚀 Opciones de Despliegue

### Opción 1: Vercel (Recomendado)
- ✅ Deploy automático desde Git
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Serverless functions
- ✅ Preview deployments

### Opción 2: Netlify
- ✅ Deploy automático
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Formularios y funciones

### Opción 3: AWS Amplify
- ✅ Integración con AWS
- ✅ CI/CD automático
- ✅ Escalabilidad

### Opción 4: Docker + VPS
- ✅ Control total
- ✅ Personalizable
- ⚠️ Requiere más configuración

---

## 📦 Preparación para Producción

### 1. Variables de Entorno

Crear archivo `.env.production`:

```bash
# Supabase
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-de-produccion

# App
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.vecinoactivo.com

# Analytics (opcional)
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Sentry (opcional)
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 2. Optimizaciones de Build

```json
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "source-map-explorer 'build/static/js/*.js'",
    "build:prod": "GENERATE_SOURCEMAP=false react-scripts build"
  }
}
```

### 3. Configurar .gitignore

```bash
# .gitignore
.env
.env.local
.env.production
.env.development
node_modules/
build/
.DS_Store
npm-debug.log*
```

---

## 🔧 Despliegue con Vercel

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Configurar Proyecto

```bash
vercel
```

Responder las preguntas:
- Set up and deploy? **Y**
- Which scope? **Tu cuenta**
- Link to existing project? **N**
- Project name? **vecino-activo**
- Directory? **./
**
- Override settings? **N**

### 4. Configurar Variables de Entorno

En Vercel Dashboard:
1. Ir a Settings > Environment Variables
2. Agregar:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - Otras variables necesarias

### 5. Deploy

```bash
# Deploy a producción
vercel --prod

# Deploy preview
vercel
```

### 6. Configurar Dominio Personalizado

En Vercel Dashboard:
1. Ir a Settings > Domains
2. Agregar dominio: `vecinoactivo.com`
3. Configurar DNS según instrucciones

---

## 🌐 Despliegue con Netlify

### 1. Crear netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 2. Deploy desde Git

1. Ir a https://app.netlify.com
2. Click "New site from Git"
3. Conectar repositorio
4. Configurar:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Agregar variables de entorno
6. Deploy

### 3. Configurar Dominio

1. Ir a Domain settings
2. Agregar dominio personalizado
3. Configurar DNS

---

## 🐳 Despliegue con Docker

### 1. Crear Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Crear nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. Crear docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - REACT_APP_SUPABASE_URL=${REACT_APP_SUPABASE_URL}
      - REACT_APP_SUPABASE_ANON_KEY=${REACT_APP_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### 4. Build y Deploy

```bash
# Build imagen
docker build -t vecino-activo .

# Run localmente
docker run -p 80:80 vecino-activo

# Deploy con docker-compose
docker-compose up -d
```

---

## 🔒 Configuración de Seguridad

### 1. HTTPS

Todos los servicios recomendados (Vercel, Netlify) incluyen HTTPS automático.

Para VPS con Docker, usar Let's Encrypt:

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d vecinoactivo.com -d www.vecinoactivo.com
```

### 2. Headers de Seguridad

```javascript
// public/_headers (Netlify)
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(self), microphone=(), camera=()
```

### 3. Content Security Policy

```javascript
// src/index.html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co;">
```

---

## 📊 Monitoreo y Analytics

### 1. Google Analytics

```javascript
// src/utils/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  if (process.env.REACT_APP_GA_TRACKING_ID) {
    ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
  }
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};
```

```javascript
// src/App.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, logPageView } from './utils/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView();
  }, [location]);

  // ...
}
```

### 2. Sentry para Error Tracking

```bash
npm install @sentry/react
```

```javascript
// src/index.js
import * as Sentry from '@sentry/react';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENV,
    tracesSampleRate: 1.0
  });
}
```

### 3. Supabase Dashboard

Monitorear en Supabase Dashboard:
- Database > Logs
- Storage > Usage
- Auth > Users
- API > Logs

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🎯 Performance Optimization

### 1. Code Splitting

```javascript
// src/App.js
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/UserProfile'));
const Events = lazy(() => import('./pages/Events'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Image Optimization

```javascript
// Usar WebP con fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

### 3. Service Worker

```javascript
// src/index.js
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Registrar service worker
serviceWorkerRegistration.register();
```

---

## 📱 PWA Configuration

### 1. manifest.json

```json
{
  "short_name": "Vecino Activo",
  "name": "Vecino Activo - Red Social Comunitaria",
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
  "theme_color": "#4F46E5",
  "background_color": "#ffffff"
}
```

### 2. Service Worker

Ya incluido en Create React App, solo activar:

```javascript
// src/index.js
serviceWorkerRegistration.register();
```

---

## ✅ Checklist de Despliegue

### Pre-Deploy
- [ ] Tests pasando (npm test)
- [ ] Build exitoso (npm run build)
- [ ] Variables de entorno configuradas
- [ ] .gitignore actualizado
- [ ] README.md actualizado

### Configuración
- [ ] Dominio configurado
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados
- [ ] CORS configurado en Supabase
- [ ] Storage buckets creados
- [ ] RLS policies configuradas

### Monitoreo
- [ ] Google Analytics configurado
- [ ] Sentry configurado
- [ ] Logs de Supabase revisados
- [ ] Performance monitoreado

### Post-Deploy
- [ ] Verificar que la app carga
- [ ] Probar login/registro
- [ ] Probar crear post
- [ ] Probar mensajería
- [ ] Probar notificaciones
- [ ] Verificar real-time
- [ ] Probar en móvil
- [ ] Verificar SEO

---

## 🚨 Rollback Plan

### Si algo sale mal:

1. **Vercel/Netlify:**
   - Ir a Deployments
   - Click en deployment anterior
   - Click "Promote to Production"

2. **Docker:**
   ```bash
   # Volver a imagen anterior
   docker pull vecino-activo:previous
   docker-compose up -d
   ```

3. **Git:**
   ```bash
   # Revertir commit
   git revert HEAD
   git push origin main
   ```

---

## 📈 Post-Launch

### Semana 1
- [ ] Monitorear errores en Sentry
- [ ] Revisar analytics
- [ ] Recopilar feedback de usuarios
- [ ] Optimizar performance

### Mes 1
- [ ] Analizar métricas de uso
- [ ] Identificar features más usadas
- [ ] Planear mejoras
- [ ] Escalar recursos si necesario

---

## 🎉 ¡Felicitaciones!

Tu aplicación Vecino Activo está ahora en producción con:
- ✅ Backend profesional (Supabase)
- ✅ Frontend optimizado (React + Redux)
- ✅ Real-time habilitado
- ✅ Storage configurado
- ✅ Seguridad implementada
- ✅ Monitoreo activo
- ✅ CI/CD configurado

**¡La aplicación está lista para escalar y crecer!** 🚀

---

**Documentación Completa:** Ver todos los archivos PASO_6_*.md
