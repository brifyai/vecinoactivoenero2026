# Dockerfile Simple y Robusto para Vecino Activo
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Instalar git (necesario para algunas dependencias)
RUN apk add --no-cache git

# Copiar archivos de configuración
COPY package*.json ./

# Limpiar cache y instalar dependencias
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Argumentos de build
ARG REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_ENVIRONMENT=production
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GEMINI_API_KEY

# Variables de entorno para build
ENV NODE_ENV=production
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

# Build de la aplicación
RUN npm run build

# Inyectar variables como fallback
RUN echo "const fs = require('fs'); \
const path = './build/index.html'; \
if (fs.existsSync(path)) { \
  let html = fs.readFileSync(path, 'utf8'); \
  const envScript = \`<script>window.ENV={REACT_APP_SUPABASE_URL:'$REACT_APP_SUPABASE_URL',REACT_APP_SUPABASE_ANON_KEY:'$REACT_APP_SUPABASE_ANON_KEY',REACT_APP_ENVIRONMENT:'$REACT_APP_ENVIRONMENT'};console.log('✅ Variables cargadas');</script>\`; \
  html = html.replace('</head>', envScript + '</head>'); \
  fs.writeFileSync(path, html); \
  console.log('Variables inyectadas'); \
}" > inject.js && node inject.js

# Etapa de producción
FROM nginx:alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar build
COPY --from=build /app/build /usr/share/nginx/html

# Configuración nginx básica
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /static/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]