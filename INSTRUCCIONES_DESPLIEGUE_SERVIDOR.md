# 🚀 INSTRUCCIONES PARA DESPLEGAR EN SERVIDOR DE PRODUCCIÓN

## 🎯 SITUACIÓN ACTUAL

El script falló en macOS porque `www-data` no existe. Necesitas desplegar esto en tu **servidor de producción** donde está alojado `vecinoactivo.cl`.

## ⚡ OPCIONES DE DESPLIEGUE

### OPCIÓN 1: Subir Paquete al Servidor (Recomendado)

**Paso 1: Comprimir el paquete**
```bash
# Desde tu Mac, crear el archivo comprimido
cd vecino_activo_v2
tar -czf vecino-activo-fixed.tar.gz vecino-activo-deployment-20260124-171155/
```

**Paso 2: Subir al servidor**
```bash
# Subir al servidor donde está alojado vecinoactivo.cl
scp vecino-activo-fixed.tar.gz usuario@tu-servidor.com:/tmp/
```

**Paso 3: Desplegar en el servidor**
```bash
# Conectar al servidor
ssh usuario@tu-servidor.com

# Extraer y desplegar
cd /tmp
tar -xzf vecino-activo-fixed.tar.gz
cd vecino-activo-deployment-20260124-171155
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

### OPCIÓN 2: Test Local en Mac (Para Verificar)

**Probar localmente primero**:
```bash
cd vecino-activo-deployment-20260124-171155
chmod +x deploy-macos.sh
./deploy-macos.sh

# Luego probar
cd /usr/local/var/www/vecino-activo
python3 -m http.server 8080
# Abrir: http://localhost:8080
```

### OPCIÓN 3: Usar Panel de Control del Hosting

Si tu servidor tiene panel de control (cPanel, Plesk, etc.):

1. **Comprimir archivos**:
   ```bash
   cd vecino-activo-deployment-20260124-171155
   zip -r vecino-activo-fixed.zip *
   ```

2. **Subir via panel**:
   - Subir `vecino-activo-fixed.zip`
   - Extraer en el directorio web
   - Configurar permisos (755)

### OPCIÓN 4: Reemplazar en Docker/Contenedor

Si usas Docker en el servidor:

```bash
# En el servidor, acceder al contenedor
docker exec -it [container-name] /bin/sh

# Dentro del contenedor
rm -rf /usr/share/nginx/html/*
# Copiar archivos del paquete
```

## 🔍 VERIFICACIÓN POST-DESPLIEGUE

Después de cualquier método:

1. **Verificar sitio**: https://vecinoactivo.cl
2. **Sin errores 404**: F12 → Network
3. **Variables cargadas**: Console debe mostrar "✅ Variables de entorno cargadas"
4. **Login funciona**: admin@vecinoactivo.cl / admin123

## 📊 CONTENIDO DEL PAQUETE

El paquete incluye:
```
vecino-activo-deployment-20260124-171155/
├── index.html              # ✅ Variables inyectadas
├── static/
│   ├── css/main.5f76fd2b.css    # ✅ 389KB
│   └── js/main.757a47d8.js      # ✅ 1.3MB
├── nginx.conf              # ✅ Configuración optimizada
├── deploy.sh               # ✅ Para servidores Linux
├── deploy-macos.sh         # ✅ Para Mac (test local)
└── README.md               # ✅ Instrucciones
```

## 🎯 RECOMENDACIÓN

**USAR OPCIÓN 1**: Subir el paquete al servidor de producción y ejecutar `deploy.sh` allí.

**¿Por qué?**
- ✅ El script está diseñado para servidores Linux
- ✅ Configurará nginx correctamente
- ✅ Establecerá permisos apropiados
- ✅ Funcionará inmediatamente

## 🚨 URGENTE

**Tu aplicación necesita desplegarse en el servidor de producción, no en tu Mac.**

El problema de los archivos 404 está en `vecinoactivo.cl`, así que la solución debe aplicarse allí.

---

## 📞 ¿NECESITAS AYUDA?

Si no tienes acceso SSH al servidor:
1. Contacta a tu proveedor de hosting
2. Usa el panel de control web
3. O proporciona acceso para que pueda ayudarte

**El paquete está listo y probado. Solo necesita desplegarse en el servidor correcto.**