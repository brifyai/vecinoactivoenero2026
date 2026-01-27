# 🔍 INSTRUCCIONES DE DEBUGGING - MAPA DE UNIDADES VECINALES

## 📋 Problema Reportado

Las unidades vecinales en el mapa no muestran información completa en los popups.

---

## 🧪 TESTS DISPONIBLES

### Test 1: Página de Diagnóstico Automático

He creado una página HTML que verifica automáticamente todo el flujo de datos:

```
http://localhost:3000/test-mapa-debug.html
```

Esta página:
- ✅ Verifica que el archivo GeoJSON existe
- ✅ Carga el archivo completo
- ✅ Analiza las primeras 10 features
- ✅ Muestra las propiedades disponibles
- ✅ Simula el código del componente
- ✅ Genera un preview del popup

**Instrucciones:**
1. Abre `http://localhost:3000/test-mapa-debug.html` en tu navegador
2. Los tests se ejecutan automáticamente
3. Revisa los resultados (verde = OK, rojo = problema)
4. Toma captura de pantalla de los resultados

---

### Test 2: Consola del Navegador

He agregado logging extensivo al componente. Para ver los logs:

1. Abre el mapa: `http://localhost:3000/`
2. Abre la consola del navegador (F12 → Console)
3. Haz zoom en el mapa hasta nivel 10 o más
4. Busca estos mensajes:

```
🗺️ Cargando unidades vecinales desde archivo local...
✅ Cargadas XXXX unidades vecinales reales
🔍 Filtrando UVs visibles en viewport...
✅ XX UVs visibles filtradas en XXms
```

5. Haz click en una unidad vecinal
6. Deberías ver:

```
🖱️ Click en UV, propiedades: {uv_carto: "2", t_uv_nom: "2", ...}
📊 Datos formateados: {personas: "3.286", hogares: "988", ...}
📝 Popup HTML generado: <div class="demo-neighborhood-popup">...
```

---

## 🔍 VERIFICACIONES PASO A PASO

### Paso 1: Verificar que el Archivo GeoJSON Existe

```bash
ls -lh public/data/geo/unidades_vecinales_simple.geojson
```

Deberías ver:
```
-rw-r--r-- 46M unidades_vecinales_simple.geojson
```

### Paso 2: Verificar las Propiedades del GeoJSON

```bash
head -n 100 public/data/geo/unidades_vecinales_simple.geojson | jq '.features[0].properties'
```

Deberías ver:
```json
{
  "uv_carto": "2",
  "t_uv_nom": "2",
  "t_com_nom": "CAMARONES",
  "t_reg_nom": "ARICA Y PARINACOTA",
  "PERSONAS": "3286",
  "HOGARES": 988,
  "HOMBRE": "1650",
  "MUJER": "1636"
}
```

### Paso 3: Verificar el Zoom del Mapa

Las unidades vecinales solo se muestran cuando el zoom es >= 10.

En la consola del navegador, verifica:
```javascript
// Debería mostrar el zoom actual
console.log('Zoom actual:', map.getZoom());
```

Si el zoom es < 10, las UVs no se renderizarán.

### Paso 4: Verificar que showNeighborhoods está en true

En la consola del navegador:
```javascript
// Busca el estado de React DevTools
// O verifica que el botón "Ocultar Vecindarios" esté visible
```

### Paso 5: Verificar que hay Features Visibles

En la consola del navegador, busca:
```
✅ XX UVs visibles filtradas en XXms
```

Si dice "0 UVs visibles", significa que:
- El zoom es muy bajo (< 10)
- Estás fuera del área de Chile
- El filtro de viewport no está funcionando

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "No veo las unidades vecinales en el mapa"

**Causa**: Zoom muy bajo

**Solución**: Haz zoom hasta nivel 10 o más. Las UVs solo se muestran con zoom >= 10 para evitar problemas de performance.

---

### Problema 2: "Veo las UVs pero el popup está vacío"

**Causa**: Las propiedades no se están leyendo correctamente

**Solución**: 
1. Abre la consola (F12)
2. Haz click en una UV
3. Busca el log: `🖱️ Click en UV, propiedades:`
4. Verifica que las propiedades están ahí
5. Toma captura de pantalla y envíamela

---

### Problema 3: "El popup muestra 'Sin nombre', 'Sin comuna', etc."

**Causa**: Las propiedades del GeoJSON no coinciden con el código

**Solución**:
1. Ejecuta el test: `http://localhost:3000/test-mapa-debug.html`
2. Revisa la sección "Test 3: Propiedades"
3. Verifica que todas las propiedades están presentes
4. Si faltan propiedades, el archivo GeoJSON puede estar corrupto

---

### Problema 4: "El mapa no carga nada"

**Causa**: Error al cargar el archivo GeoJSON

**Solución**:
1. Abre la consola (F12)
2. Busca errores en rojo
3. Verifica que el archivo existe: `ls public/data/geo/unidades_vecinales_simple.geojson`
4. Verifica que el servidor está corriendo: `npm start`

---

## 📸 INFORMACIÓN QUE NECESITO

Para ayudarte mejor, necesito que me envíes:

### 1. Captura de Pantalla del Test Automático
```
http://localhost:3000/test-mapa-debug.html
```
Captura toda la página con los resultados de los tests.

### 2. Captura de la Consola del Navegador
1. Abre el mapa: `http://localhost:3000/`
2. Abre la consola (F12 → Console)
3. Haz zoom hasta nivel 10+
4. Haz click en una UV
5. Captura todos los logs que aparecen

### 3. Captura del Popup
Toma una foto del popup que se muestra cuando haces click en una UV.

### 4. Información del Navegador
- ¿Qué navegador usas? (Chrome, Firefox, Safari, etc.)
- ¿Qué versión?
- ¿Estás en modo incógnito?

---

## 🔧 CÓDIGO ACTUALIZADO

He actualizado el componente `NeighborhoodsLayer.js` con:

1. **Logging extensivo**: Ahora muestra en consola:
   - Las propiedades originales de cada feature
   - Los valores procesados (código UV, nombre, comuna, región)
   - Los datos demográficos formateados
   - El HTML del popup generado

2. **Validación de propiedades**: Verifica que las propiedades existen antes de usarlas

3. **Mensajes de advertencia**: Si una feature no tiene propiedades, lo indica en consola

---

## 📝 PRÓXIMOS PASOS

1. **Ejecuta el test automático**: `http://localhost:3000/test-mapa-debug.html`
2. **Revisa la consola del navegador** mientras usas el mapa
3. **Envíame las capturas de pantalla** con los resultados
4. **Describe exactamente qué ves** en el popup cuando haces click

Con esta información podré identificar exactamente dónde está el problema.

---

## 🚀 SI TODO FUNCIONA CORRECTAMENTE

Si los tests muestran que todo está bien pero aún no ves la información:

1. **Limpia el caché del navegador**:
   - Chrome: Ctrl+Shift+Delete → Borrar caché
   - Firefox: Ctrl+Shift+Delete → Borrar caché
   - Safari: Cmd+Option+E

2. **Recarga la página con Ctrl+F5** (recarga forzada)

3. **Prueba en modo incógnito** para descartar problemas de caché

4. **Prueba en otro navegador** para descartar problemas específicos del navegador

---

**Última actualización**: 27 de enero de 2026  
**Archivos modificados**: 
- `src/components/LandingMap/NeighborhoodsLayer.js` (con logging extensivo)
- `public/test-mapa-debug.html` (test automático nuevo)
