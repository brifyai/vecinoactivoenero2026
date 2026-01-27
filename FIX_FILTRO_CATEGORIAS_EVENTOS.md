# Fix: Filtro de Categorías en Eventos No Funciona

## Problema
Los botones de filtro de categorías (Todos, Música, Tecnología, Comida, Arte, Deportes) en `/app/eventos` no funcionan. Siempre muestran `filteredCount: 0`.

## Causa Raíz
Los eventos en la base de datos probablemente no tienen categorías asignadas (valores `NULL` o vacíos), por lo que el filtro no encuentra coincidencias.

## Solución

### Paso 1: Ver qué categorías tienen los eventos actualmente

Abre la consola del navegador en `http://localhost:3000/app/eventos` y expande el objeto `eventosCompletos` en los logs. Verás algo como:

```javascript
eventosCompletos: Array(8) [
  { title: "...", category: null, categoryType: "object", categoryNull: true },
  ...
]
```

### Paso 2: Ejecutar SQL para asignar categorías

Ve a tu panel de Supabase SQL Editor y ejecuta el archivo:

```
database/migrations/FIX_CATEGORIAS_EVENTOS_SIMPLE.sql
```

Este script:
1. Muestra el estado actual de los eventos
2. Asigna categorías a los 8 eventos distribuyéndolos entre las 5 categorías
3. Verifica los resultados

### Paso 3: Refrescar la página

Después de ejecutar el SQL, refresca `http://localhost:3000/app/eventos` y los filtros deberían funcionar.

## Distribución de Categorías

El script asigna las categorías así:
- Evento 1: Música
- Evento 2: Tecnología  
- Evento 3: Comida
- Evento 4: Arte
- Evento 5: Deportes
- Evento 6: Música
- Evento 7: Tecnología
- Evento 8: Comida

## Verificación

Después de aplicar el fix:
1. Los botones de categoría deberían filtrar correctamente
2. El contador `filteredCount` debería mostrar números > 0
3. Al hacer click en "Música" deberías ver 2 eventos
4. Al hacer click en "Tecnología" deberías ver 2 eventos
5. Al hacer click en "Comida" deberías ver 2 eventos
6. Al hacer click en "Arte" deberías ver 1 evento
7. Al hacer click en "Deportes" deberías ver 1 evento
8. Al hacer click en "Todos" deberías ver los 8 eventos

## Logs Mejorados

He agregado logs más detallados que muestran:
- Si la categoría es `null`
- Si la categoría es `undefined`
- El tipo de dato de la categoría
- El primer evento completo para debugging

Estos logs te ayudarán a identificar exactamente qué está pasando con las categorías.
