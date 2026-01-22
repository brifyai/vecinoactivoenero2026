# Instrucciones de Despliegue - Vecino Activo

## Requisitos Previos

### Sistema
- Node.js 16+ instalado
- npm 8+ instalado
- Git instalado
- 500MB de espacio en disco

### Navegador
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Instalación Local

### 1. Clonar Repositorio
```bash
git clone <repository-url>
cd vecino-activo
```

### 2. Instalar Dependencias Frontend
```bash
npm install
```

### 3. Instalar Dependencias Backend
```bash
cd server
npm install
cd ..
```

### 4. Iniciar Servidores

#### Terminal 1 - Frontend
```bash
npm start
```
Acceder a: http://localhost:3000

#### Terminal 2 - Backend
```bash
cd server
npm start
```
Acceder a: http://localhost:3001

---

## Compilación para Producción

### Build Frontend
```bash
npm run build
```
Genera carpeta `build/` lista para desplegar.

### Build Backend
```bash
cd server
npm run build  # Si existe script de build
```

---

## Despliegue en Vercel (Recomendado)

### Frontend
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel
```

### Backend
```bash
cd server
vercel
```

---

## Despliegue en Heroku

### Frontend
```bash
# Crear app
heroku create vecino-activo-frontend

# Desplegar
git push heroku main
```

### Backend
```bash
cd server

# Crear app
heroku create vecino-activo-backend

# Desplegar
git push heroku main
```

---

## Despliegue en AWS

### Frontend (S3 + CloudFront)
```bash
# Build
npm run build

# Subir a S3
aws s3 sync build/ s3://vecino-activo-frontend/

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

### Backend (EC2 o Elastic Beanstalk)
```bash
# Elastic Beanstalk
eb init
eb create vecino-activo-backend
eb deploy
```

---

## Despliegue en Docker

### Dockerfile Frontend
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Dockerfile Backend
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
  backend:
    build: ./server
    ports:
      - "3001:3001"
```

---

## Variables de Entorno

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/vecino-activo
JWT_SECRET=your-secret-key
```

---

## Configuración de Base de Datos

### Migración de localStorage a MongoDB

```javascript
// scripts/migrate-to-mongodb.js
const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect(process.env.DATABASE_URL);

// Definir esquemas
const userSchema = new mongoose.Schema({
  id: String,
  email: String,
  name: String,
  // ... más campos
});

// Migrar datos
const users = JSON.parse(localStorage.getItem('friendbook_users'));
User.insertMany(users);
```

---

## Monitoreo y Logs

### Frontend
```bash
# Ver logs en tiempo real
npm run logs

# Usar Sentry para error tracking
npm install @sentry/react
```

### Backend
```bash
# Ver logs
pm2 logs

# Usar Winston para logging
npm install winston
```

---

## Optimizaciones de Producción

### Frontend
```bash
# Minificación
npm run build

# Análisis de bundle
npm install -g webpack-bundle-analyzer

# Lazy loading
React.lazy(() => import('./pages/Home'))
```

### Backend
```bash
# Caché
npm install redis

# Compresión
npm install compression

# Rate limiting
npm install express-rate-limit
```

---

## Seguridad

### HTTPS
```bash
# Generar certificado SSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Usar en Express
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3001);
```

### CORS
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Validación
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/users', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Procesar
});
```

---

## Backup y Recuperación

### Backup de Datos
```bash
# MongoDB
mongodump --db vecino-activo --out ./backup

# Restaurar
mongorestore --db vecino-activo ./backup/vecino-activo
```

### Backup de Código
```bash
# Git
git push origin main
git tag v1.0.0
git push origin v1.0.0
```

---

## Mantenimiento

### Actualizar Dependencias
```bash
# Frontend
npm update
npm audit fix

# Backend
cd server
npm update
npm audit fix
```

### Limpiar Caché
```bash
# npm
npm cache clean --force

# Docker
docker system prune
```

---

## Troubleshooting

### Puerto en Uso
```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### Errores de Conexión
```bash
# Verificar conectividad
curl http://localhost:3001/api/health

# Ver logs
npm run logs
```

### Problemas de Rendimiento
```bash
# Analizar bundle
npm run analyze

# Profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt
```

---

## Checklist de Despliegue

- [ ] Todas las pruebas pasan
- [ ] Build sin errores
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] HTTPS habilitado
- [ ] CORS configurado
- [ ] Logs configurados
- [ ] Monitoreo configurado
- [ ] Backup configurado
- [ ] Documentación actualizada
- [ ] Equipo notificado
- [ ] Plan de rollback preparado

---

## Soporte Post-Despliegue

### Monitoreo
- Uptime monitoring
- Error tracking
- Performance monitoring
- User analytics

### Mantenimiento
- Actualizaciones de seguridad
- Parches de bugs
- Optimizaciones de rendimiento
- Backups regulares

### Escalabilidad
- Load balancing
- Auto-scaling
- Caché distribuido
- CDN

---

## Contacto

Para soporte técnico:
- Email: support@vecinoactivo.com
- Slack: #vecino-activo-support
- GitHub Issues: github.com/vecinoactivo/issues

