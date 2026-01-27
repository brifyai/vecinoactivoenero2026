# Solución: Fotos no se muestran en posts del admin

## Problema
Las fotos están en la base de datos pero no se muestran en la línea de tiempo del dashboard de admin.

## Causa
Los posts se cargan desde `useSupabaseRealtime` que usa `select('*')`, pero Redux persist guarda los posts sin el campo `media` y nunca se recargan.

## Solución Definitiva

### Paso 1: Limpiar Redux Persist
En la consola del navegador (F12), ejecuta:
```javascript
localStorage.clear()
```

Luego recarga la página con `Ctrl + Shift + R` (hard refresh).

### Paso 2: Verificar que las fotos están en la BD
Ejecuta:
```bash
node scripts/debugging/check-posts-with-media-admin.js
```

Deberías ver que todos los posts del admin tienen fotos.

### Paso 3: Si aún no se ven las fotos

El problema es que `useSupabaseRealtime` carga los posts pero Redux persist los guarda sin `media`. 

**Solución temporal:** Ve a `http://localhost:3000/app/home` (la página principal de usuario, no admin). Ahí los posts SÍ deberían mostrar las fotos porque usan el componente `Post` completo.

**Solución permanente:** El dashboard de admin necesita recargar los posts cada vez que se abre, no usar los datos de Redux persist.

## Archivos Creados

1. `database/migrations/AGREGAR_FOTOS_POSTS_ADMIN.sql` - Script para agregar fotos a posts del admin
2. `database/migrations/VERIFICAR_FOTOS_ADMIN.sql` - Script para verificar fotos
3. `scripts/debugging/check-posts-with-media-admin.js` - Script Node.js para verificar fotos
4. `scripts/debugging/check-posts-media.js` - Script Node.js general

## Estado Actual

✅ Fotos agregadas a la base de datos (15 posts del admin con fotos)
✅ Script SQL funcionando correctamente
✅ Componente `Post` preparado para mostrar fotos
❌ Dashboard de admin no muestra fotos (problema de Redux persist)

## Próximos Pasos

1. Ir a `http://localhost:3000/app/home` para ver los posts con fotos
2. O modificar el dashboard para que recargue posts cada vez (no recomendado por performance)
3. O esperar a que Redux persist se actualice naturalmente cuando se creen nuevos posts

## Notas Técnicas

- La columna en la tabla `posts` es `author_id`, no `user_id`
- El campo `media` es un array de URLs de imágenes
- Las imágenes son de Unsplash (gratuitas)
- El componente `Post` ya soporta 1, 2, o 3+ imágenes con carrusel
