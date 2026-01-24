# Dockerfile Simple y Robusto - Solución Definitiva para Archivos Estáticos
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production --legacy-peer-deps

# Copiar código fuente
COPY . .

# Variables de entorno para build
ARG REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_ENVIRONMENT=production
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GEMINI_API_KEY

ENV NODE_ENV=production
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY
ENV GENERATE_SOURCEMAP=false

# Build de la aplicación
RUN npm run build

# Verificar que el build se generó correctamente
RUN echo "=== BUILD VERIFICATION ===" && \
    ls -la build/ && \
    echo "=== STATIC FILES ===" && \
    ls -la build/static/ && \
    echo "=== CSS FILES ===" && \
    find build/static -name "*.css" -exec ls -lh {} \; && \
    echo "=== JS FILES ===" && \
    find build/static -name "*.js" -exec ls -lh {} \;

# Inyectar variables en HTML como respaldo
RUN node -e "
const fs = require('fs');
const path = './build/index.html';
if (fs.existsSync(path)) {
  let html = fs.readFileSync(path, 'utf8');
  const envVars = {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
    REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    REACT_APP_GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY,
    REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT
  };
  const script = \`<script>window.ENV = \${JSON.stringify(envVars, null, 2)};console.log('✅ Variables cargadas desde window.ENV');</script>\`;
  html = html.replace('</head>', script + '</head>');
  fs.writeFileSync(path, html);
  console.log('✅ Variables inyectadas en HTML');
} else {
  console.log('❌ index.html no encontrado');
  process.exit(1);
}
"

# Etapa de producción
FROM nginx:1.25-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Remover configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar build desde etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Crear configuración nginx simple y efectiva
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Logs para debug
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Archivos estáticos con cache
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        try_files $uri =404;
    }

    # Assets con cache
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        try_files $uri =404;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Compresión
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Verificar archivos copiados
RUN echo "=== NGINX FILES VERIFICATION ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== STATIC DIRECTORY ===" && \
    ls -la /usr/share/nginx/html/static/ && \
    echo "=== NGINX CONFIG ===" && \
    cat /etc/nginx/conf.d/default.conf && \
    echo "=== NGINX TEST ===" && \
    nginx -t

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]