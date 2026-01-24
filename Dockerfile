# Dockerfile Ultra Simple - Sin Inyección Manual de Variables
FROM node:20-alpine AS build

WORKDIR /app

# Instalar git
RUN apk add --no-cache git

# Copiar package files
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Variables de entorno para build (React las incluye automáticamente)
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

# Build de la aplicación (React incluye las variables automáticamente)
RUN npm run build

# Verificar que el build se generó
RUN ls -la build/ && ls -la build/static/

# Etapa de producción
FROM nginx:1.25-alpine

# Instalar curl
RUN apk add --no-cache curl

# Copiar build
COPY --from=build /app/build /usr/share/nginx/html

# Configuración nginx simple y efectiva
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Archivos estáticos
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
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

# Test nginx
RUN nginx -t

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]