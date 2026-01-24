# Dockerfile para Vecino Activo - React App (Optimizado para Producción)
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Limpiar cache de npm y actualizar package-lock.json
RUN npm cache clean --force

# Instalar dependencias (usar npm install en lugar de npm ci para resolver conflictos)
RUN npm install

# Copiar código fuente
COPY . .

# Argumentos de build para variables de entorno
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_ENVIRONMENT=production
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GEMINI_API_KEY

# Establecer variables de entorno para el build
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

# Construir la aplicación para producción
RUN npm run build

# Inyectar variables de entorno en el HTML (fallback)
RUN node -e "
const fs = require('fs');
const path = './build/index.html';
if (fs.existsSync(path)) {
  let html = fs.readFileSync(path, 'utf8');
  const envScript = \`
    <script>
      window.ENV = {
        REACT_APP_SUPABASE_URL: '${REACT_APP_SUPABASE_URL}',
        REACT_APP_SUPABASE_ANON_KEY: '${REACT_APP_SUPABASE_ANON_KEY}',
        REACT_APP_ENVIRONMENT: '${REACT_APP_ENVIRONMENT}',
        REACT_APP_GOOGLE_CLIENT_ID: '${REACT_APP_GOOGLE_CLIENT_ID}',
        REACT_APP_GEMINI_API_KEY: '${REACT_APP_GEMINI_API_KEY}'
      };
      console.log('✅ Variables de entorno cargadas desde window.ENV');
    </script>
  \`;
  html = html.replace('</head>', envScript + '</head>');
  fs.writeFileSync(path, html);
  console.log('✅ Variables inyectadas en build/index.html');
}
"

# Etapa de producción con nginx
FROM nginx:alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de entrada para inyección de variables en runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80

# Usar script de entrada personalizado
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]