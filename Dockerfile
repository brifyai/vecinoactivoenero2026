# Dockerfile para Vecino Activo - React App
FROM node:18-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx si existe
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || echo "No custom nginx config found"

# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]