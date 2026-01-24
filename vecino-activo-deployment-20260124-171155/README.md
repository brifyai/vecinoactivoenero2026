# Paquete de Despliegue - Vecino Activo

Este paquete contiene la aplicación Vecino Activo lista para desplegar en producción con todas las variables de entorno ya inyectadas.

## Contenido

- `index.html` - Página principal con variables inyectadas
- `static/` - Archivos CSS y JavaScript optimizados
- `nginx.conf` - Configuración de nginx
- `deploy.sh` - Script de despliegue automático
- `README.md` - Este archivo

## Variables de Entorno Incluidas

✅ REACT_APP_SUPABASE_URL: https://supabase.vecinoactivo.cl
✅ REACT_APP_SUPABASE_ANON_KEY: Configurada
✅ REACT_APP_GOOGLE_CLIENT_ID: Configurada
✅ REACT_APP_GEMINI_API_KEY: Configurada
✅ REACT_APP_ENVIRONMENT: production

## Instrucciones de Despliegue

### Opción 1: Despliegue Automático (Recomendado)

1. Subir todo el contenido de esta carpeta al servidor
2. Ejecutar como root:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Opción 2: Despliegue Manual

1. Copiar archivos al directorio web:
   ```bash
   sudo cp -r * /var/www/vecino-activo/
   sudo chown -R www-data:www-data /var/www/vecino-activo
   ```

2. Configurar nginx:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/vecino-activo
   sudo ln -sf /etc/nginx/sites-available/vecino-activo /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## Verificación

Después del despliegue, verificar:

1. **Sitio carga**: http://vecinoactivo.cl
2. **Sin errores en consola**: F12 > Console
3. **Variables cargadas**: Debe aparecer "✅ Variables de entorno cargadas desde window.ENV"
4. **Login funciona**: admin@vecinoactivo.cl / admin123

## Solución de Problemas

### Si aparecen errores de Supabase:
- Verificar que aparece el mensaje de variables cargadas en consola
- Comprobar conectividad: `curl -I https://supabase.vecinoactivo.cl`

### Si el sitio no carga:
- Verificar permisos: `ls -la /var/www/vecino-activo`
- Revisar logs nginx: `sudo tail -f /var/log/nginx/error.log`

## Información Técnica

- **Tamaño del bundle**: ~343KB (gzipped)
- **Tecnología**: React 18 + Redux Toolkit
- **Base de datos**: Supabase (self-hosted)
- **Autenticación**: Supabase Auth
- **Tiempo real**: Sistema de polling (2-3 segundos)

---

**Generado**: $(date)
**Versión**: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
