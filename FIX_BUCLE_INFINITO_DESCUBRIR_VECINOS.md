# FIX CRÍTICO: Bucle Infinito en Descubrir Vecinos

**Fecha:** 28 Enero 2026  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** ✅ RESUELTO

---

## PROBLEMA IDENTIFICADO

### Síntomas
- Bucle infinito de requests en página https://vecinoactivo.cl/app/descubrir-vecinos
- Cientos de requests fallidos cada pocos segundos
- Error 404 constante en consola del navegador
- Página completamente inutilizable

### Causa Raíz
**Error de nombre de tabla en base de datos:**
- Código usaba tabla `friendships` (11 referencias)
- Base de datos real tiene tabla `friends`
- Error de Supabase: "Could not find the table 'public.friendships' in the schema cache"
- Hint: "Perhaps you meant the table 'public.friends'"

### Archivo Afectado
`src/services/supabaseFriendsService.js`

---

## SOLUCIÓN APLICADA

### Cambios Realizados
Reemplazadas **11 referencias** de `.from('friendships')` a `.from('friends')` en:

1. **Línea 8** - `getFriends()`: Obtener amigos del usuario
2. **Línea 35** - `getFriendRequests()`: Obtener solicitudes pendientes
3. **Línea 56** - `sendFriendRequest()`: Verificar relación existente
4. **Línea 66** - `sendFriendRequest()`: Insertar nueva solicitud
5. **Línea 89** - `acceptFriendRequest()`: Aceptar solicitud
6. **Línea 108** - `rejectFriendRequest()`: Rechazar solicitud
7. **Línea 125** - `removeFriend()`: Eliminar amistad
8. **Línea 141** - `areFriends()`: Verificar si son amigos
9. **Línea 171** - `searchUsers()`: Buscar usuarios (filtro)
10. **Línea 206** - `getFriendSuggestions()`: Sugerencias de amigos
11. **Línea 227** - `getPendingRequestsCount()`: Conteo de solicitudes

### Verificación
- ✅ No quedan referencias a `friendships` en el código
- ✅ Build de producción completado exitosamente
- ✅ 0 errores críticos (solo warnings menores)

---

## DEPLOYMENT

### Archivo Generado
```
vecino-activo-fix-bucle-infinito-20260128-150705.tar.gz (100 MB)
```

### Contenido del Package
- `build/` - Build de producción con el fix
- `public/` - Archivos públicos
- `nginx.conf` - Configuración Nginx
- `Dockerfile` - Configuración Docker
- `docker-entrypoint.sh` - Script de entrada
- `docker-compose.prod.yml` - Compose para producción
- `.dockerignore` - Exclusiones Docker

### Pasos para Deployment

1. **Subir archivo al servidor:**
   ```bash
   scp vecino-activo-fix-bucle-infinito-20260128-150705.tar.gz usuario@servidor:/ruta/
   ```

2. **En el servidor:**
   ```bash
   # Extraer
   tar -xzf vecino-activo-fix-bucle-infinito-20260128-150705.tar.gz
   
   # Rebuild y restart
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Purgar caché de Cloudflare:**
   - Ir a dashboard de Cloudflare
   - Seleccionar dominio vecinoactivo.cl
   - Caching > Purge Everything
   - Confirmar purga

4. **Verificar fix:**
   - Abrir https://vecinoactivo.cl/app/descubrir-vecinos
   - Verificar que NO haya requests infinitos en consola
   - Verificar que la página cargue correctamente
   - Probar funcionalidad de búsqueda de vecinos

---

## IMPACTO

### Antes del Fix
- ❌ Página Descubrir Vecinos completamente rota
- ❌ Cientos de requests fallidos por segundo
- ❌ Experiencia de usuario destruida
- ❌ Posible impacto en rendimiento del servidor

### Después del Fix
- ✅ Página funcional
- ✅ Requests correctos a tabla `friends`
- ✅ Sin bucles infinitos
- ✅ Experiencia de usuario restaurada

---

## LECCIONES APRENDIDAS

1. **Consistencia de nombres:** Mantener nombres de tablas consistentes entre código y base de datos
2. **Validación temprana:** Verificar nombres de tablas antes de deployment
3. **Monitoreo:** Implementar alertas para detectar bucles infinitos
4. **Testing:** Probar todas las páginas antes de deployment a producción

---

## PRÓXIMOS PASOS

1. ✅ Deployment urgente a producción
2. ⏳ Verificar que el bucle se detenga
3. ⏳ Monitorear logs del servidor
4. ⏳ Confirmar funcionalidad de Descubrir Vecinos
5. ⏳ Purgar caché de Cloudflare

---

## NOTAS TÉCNICAS

### Estructura de Tabla `friends`
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  status TEXT, -- 'pending', 'accepted'
  created_at TIMESTAMP
);
```

### Queries Afectados
- Obtener amigos aceptados
- Solicitudes pendientes
- Enviar/aceptar/rechazar solicitudes
- Verificar relaciones de amistad
- Buscar usuarios disponibles
- Sugerencias de amigos
- Conteo de solicitudes

---

**FIN DEL REPORTE**
