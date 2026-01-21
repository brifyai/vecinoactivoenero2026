# 🧪 GUÍA DE PRUEBAS - MAPAS 2024v4

**Fecha:** 18 de Enero, 2026  
**Versión:** 2024v4

---

## 🎯 OBJETIVO

Verificar que la actualización de mapas a la versión 2024v4 funciona correctamente en toda la aplicación.

---

## 🚀 ANTES DE EMPEZAR

### Verificar Servidores

1. **Backend** debe estar corriendo en puerto 3001
2. **Frontend** debe estar corriendo en puerto 3003

```bash
# Verificar procesos
ps aux | grep "npm start"

# Deberías ver:
# - Backend: npm start (en carpeta server)
# - Frontend: PORT=3003 npm start
```

### Abrir Navegador

Abre tu navegador en: **http://localhost:3003**

---

## ✅ PRUEBAS A REALIZAR

### 1. Mapa de Chile

**URL:** http://localhost:3003/map

**Qué verificar:**
- [ ] El mapa carga sin errores
- [ ] Se muestran los polígonos de las Unidades Vecinales
- [ ] Los polígonos son de color naranja (#f97316)
- [ ] Las estadísticas muestran:
  - Número de UVs (debería ser ~8,000+)
  - "N/A" en Habitantes
  - "N/A" en Hogares
  - Nota: "Datos no disponibles en versión 2024v4"

**Cómo probar:**
1. Navega a `/map`
2. Espera a que cargue el mapa
3. Verifica que Chile completo es visible
4. Verifica las estadísticas en la parte superior

**Resultado esperado:**
```
✅ Mapa carga correctamente
✅ Polígonos visibles en color naranja
✅ Estadísticas muestran "N/A" para población
```

---

### 2. Popups de Unidades Vecinales

**URL:** http://localhost:3003/map

**Qué verificar:**
- [ ] Al hacer clic en un polígono, se abre un popup
- [ ] El popup muestra:
  - Título: "🏘️ UV N° [código]"
  - Ubicación: "📍 [comuna], [región]"
  - NO muestra datos de población (porque no están disponibles)

**Cómo probar:**
1. Haz zoom en una región (por ejemplo, Santiago)
2. Haz clic en cualquier polígono naranja
3. Lee la información del popup

**Resultado esperado:**
```
✅ Popup se abre correctamente
✅ Muestra código de UV
✅ Muestra comuna y región
✅ NO muestra población (correcto)
```

**Ejemplo de popup:**
```
🏘️ UV N° 78
📍 ARICA, ARICA Y PARINACOTA
```

---

### 3. Etiquetas de UV (Zoom 15+)

**URL:** http://localhost:3003/map

**Qué verificar:**
- [ ] Al hacer zoom nivel 15 o más, aparecen etiquetas "UV XXX"
- [ ] Las etiquetas son de color naranja con borde blanco
- [ ] Las etiquetas están centradas en cada polígono

**Cómo probar:**
1. Haz zoom muy cerca en una ciudad (nivel 15+)
2. Observa si aparecen etiquetas en los polígonos

**Resultado esperado:**
```
✅ Etiquetas aparecen con zoom 15+
✅ Etiquetas muestran "UV [código]"
✅ Color naranja con borde blanco
```

---

### 4. Selector de Vecindario (Registro)

**URL:** http://localhost:3003/register

**Qué verificar:**
- [ ] El selector de vecindario aparece en el formulario
- [ ] La búsqueda funciona al escribir
- [ ] Muestra resultados con formato: "UV [código] - [nombre]"
- [ ] Muestra ubicación: "[comuna], [región]"
- [ ] El botón de geolocalización funciona

**Cómo probar:**
1. Ve a la página de registro
2. Busca "ARICA" en el selector
3. Verifica que aparecen resultados
4. Selecciona una UV
5. Prueba el botón de geolocalización (📍)

**Resultado esperado:**
```
✅ Búsqueda funciona correctamente
✅ Resultados muestran código y nombre
✅ Resultados muestran comuna y región
✅ Geolocalización funciona (si permites acceso)
```

**Ejemplo de resultado:**
```
UV 78 - CHINCHORRO ORIENTE
ARICA, ARICA Y PARINACOTA
```

---

### 5. Perfil de Unidad Vecinal

**URL:** http://localhost:3003/neighborhood/[id]

**Qué verificar:**
- [ ] El perfil de UV carga correctamente
- [ ] Muestra el nombre de la UV
- [ ] Muestra el código de la UV
- [ ] Muestra comuna y región
- [ ] Población y hogares muestran "0" o "N/A"

**Cómo probar:**
1. Desde el mapa, haz clic en una UV
2. En el popup, busca un enlace al perfil (si existe)
3. O navega manualmente a `/neighborhood/151017880` (ejemplo)

**Resultado esperado:**
```
✅ Perfil carga correctamente
✅ Muestra nombre y código
✅ Muestra comuna y región
✅ Población: 0 (correcto, no disponible)
✅ Hogares: 0 (correcto, no disponible)
```

---

### 6. Filtrado de Posts por Vecindario

**URL:** http://localhost:3003/home

**Qué verificar:**
- [ ] El toggle "Todos los Vecindarios" / "Mi Barrio" funciona
- [ ] Al seleccionar "Mi Barrio", solo se muestran posts de tu UV
- [ ] Los posts muestran el nombre de la UV del autor

**Cómo probar:**
1. Inicia sesión con un usuario que tenga UV asignada
2. Ve a la página de inicio
3. Cambia entre "Todos los Vecindarios" y "Mi Barrio"
4. Verifica que el filtrado funciona

**Resultado esperado:**
```
✅ Toggle funciona correctamente
✅ Filtrado por UV funciona
✅ Posts muestran UV del autor
```

---

## 🐛 PROBLEMAS COMUNES

### Problema 1: Mapa no carga

**Síntomas:**
- Pantalla en blanco
- Error en consola del navegador

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el archivo GeoJSON existe:
   ```bash
   ls -lh public/data/geo/unidades_vecinales_simple.geojson
   ```
4. Verifica que el backend está corriendo:
   ```bash
   curl http://localhost:3001/api/health
   ```

---

### Problema 2: Popups no muestran información

**Síntomas:**
- Popup aparece vacío
- Popup muestra "undefined"

**Solución:**
1. Verifica que los campos del GeoJSON son correctos
2. Abre la consola y busca errores
3. Verifica que el código está actualizado:
   ```bash
   grep "t_uv_nom" src/pages/NeighborhoodMap/NeighborhoodMap.js
   ```

---

### Problema 3: Selector no encuentra UVs

**Síntomas:**
- Búsqueda no devuelve resultados
- Dropdown no aparece

**Solución:**
1. Verifica que el contexto está cargando datos:
   ```bash
   grep "t_id_uv_ca" src/context/NeighborhoodContext.js
   ```
2. Abre la consola y busca errores
3. Verifica que el GeoJSON se carga correctamente

---

### Problema 4: Geolocalización no funciona

**Síntomas:**
- Botón de geolocalización no hace nada
- Error "Navegador no soporta geolocalización"

**Solución:**
1. Verifica que estás usando HTTPS o localhost
2. Permite el acceso a la ubicación en el navegador
3. Verifica que el algoritmo de distancia funciona

---

## 📊 RESULTADOS ESPERADOS

### Resumen de Pruebas

Al finalizar todas las pruebas, deberías tener:

```
✅ Mapa carga correctamente con ~8,000 UVs
✅ Popups muestran código, nombre, comuna, región
✅ Etiquetas UV aparecen con zoom 15+
✅ Selector de vecindario funciona en registro
✅ Búsqueda de UVs funciona correctamente
✅ Geolocalización detecta UV cercana
✅ Perfil de UV muestra datos correctos
✅ Filtrado de posts por UV funciona
```

### Limitaciones Conocidas

```
⚠️ Población: N/A (no disponible en versión 2024v4)
⚠️ Hogares: N/A (no disponible en versión 2024v4)
⚠️ Áreas verdes: No disponible
⚠️ Equipamiento: No disponible
```

---

## 📝 REPORTE DE PROBLEMAS

Si encuentras algún problema, anota:

1. **URL donde ocurrió:** _______________________
2. **Qué esperabas:** _______________________
3. **Qué pasó:** _______________________
4. **Mensaje de error (si hay):** _______________________
5. **Captura de pantalla:** _______________________

---

## ✅ CHECKLIST FINAL

Marca cada item cuando lo hayas probado:

- [ ] Mapa de Chile carga correctamente
- [ ] Popups muestran información correcta
- [ ] Etiquetas UV aparecen con zoom
- [ ] Selector de vecindario funciona
- [ ] Búsqueda de UVs funciona
- [ ] Geolocalización funciona
- [ ] Perfil de UV carga correctamente
- [ ] Filtrado de posts funciona

---

**Fecha de pruebas:** __________________  
**Probado por:** __________________  
**Resultado:** ✅ APROBADO / ❌ RECHAZADO

---

**Creado por:** Kiro AI  
**Fecha:** 18 de Enero, 2026
