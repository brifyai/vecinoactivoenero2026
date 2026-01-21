# 🧪 INSTRUCCIONES DE PRUEBA - VECINO ACTIVO

**Fecha:** 18 de Enero, 2026

---

## 🚀 CÓMO PROBAR LAS NUEVAS FUNCIONALIDADES

### 1. Registro con Unidad Vecinal

**Pasos:**
1. Navega a `/register`
2. Completa nombre, email y contraseña
3. **NUEVO:** Verás el selector de Unidad Vecinal
4. Prueba buscar: "Santiago", "Providencia", "Las Condes"
5. O click en "Detectar mi ubicación" (requiere permisos)
6. Selecciona una UV de la lista
7. Completa el registro

**Resultado Esperado:**
- ✅ Badge de UV seleccionada visible
- ✅ Registro exitoso
- ✅ Usuario tiene neighborhoodId asignado

### 2. Filtro por Vecindario en Home

**Pasos:**
1. Inicia sesión con usuario que tiene UV
2. Ve a Home (`/`)
3. **NUEVO:** Verás dos botones arriba del feed:
   - "🌍 Todos los Vecindarios"
   - "🏘️ Mi Barrio (UV XXX)"
4. Click en "Mi Barrio"
5. Crea una publicación

**Resultado Esperado:**
- ✅ Solo se muestran posts de tu UV
- ✅ Nuevos posts incluyen tu UV automáticamente
- ✅ Toggle funciona correctamente

### 3. Perfil de Unidad Vecinal

**Pasos:**
1. Navega a `/neighborhood/1` (o cualquier ID)
2. O desde el mapa (próximamente)

**Resultado Esperado:**
- ✅ Header con gradiente naranja
- ✅ Badge "UV XXX"
- ✅ Estadísticas: habitantes, hogares, posts
- ✅ Tabs: Publicaciones, Información, Vecinos
- ✅ Si es tu UV: Badge "Tu Vecindario"

### 4. Votaciones Comunitarias

**Pasos:**
1. Navega a `/polls`
2. Verás 2 encuestas de ejemplo
3. Click en una opción para votar
4. Prueba los filtros: Activas, Mis Votos, Finalizadas

**Resultado Esperado:**
- ✅ Voto registrado exitosamente
- ✅ Badge "Votaste" aparece
- ✅ Barras de progreso se actualizan
- ✅ No puedes votar dos veces
- ✅ Porcentajes se calculan correctamente

### 5. Geolocalización

**Pasos:**
1. En registro, click "Detectar mi ubicación"
2. Acepta permisos del navegador
3. Espera 1-2 segundos

**Resultado Esperado:**
- ✅ Se detecta UV más cercana (radio 5km)
- ✅ UV se selecciona automáticamente
- ✅ Si no hay UV cercana: mensaje de error
- ✅ Fallback a selección manual

---

## 🔍 CASOS DE PRUEBA

### Caso 1: Usuario Nuevo con UV

```
DADO que soy un usuario nuevo
CUANDO me registro y selecciono una UV
ENTONCES:
- Mi perfil tiene neighborhoodId
- Puedo filtrar por "Mi Barrio"
- Mis posts incluyen mi UV
- Veo el badge en mi perfil
```

### Caso 2: Usuario Existente sin UV

```
DADO que soy un usuario existente sin UV
CUANDO inicio sesión
ENTONCES:
- Puedo usar la app normalmente
- No veo el filtro "Mi Barrio"
- Mis posts no tienen UV
- Puedo actualizar mi perfil (próximamente)
```

### Caso 3: Filtrado de Posts

```
DADO que tengo UV asignada
CUANDO activo "Mi Barrio"
ENTONCES:
- Solo veo posts de mi UV
- Posts de otras UVs no aparecen
- Puedo volver a "Todos"
```

### Caso 4: Votaciones

```
DADO que hay encuestas activas
CUANDO voto en una
ENTONCES:
- Mi voto se registra
- No puedo votar de nuevo
- Veo los resultados
- Aparece en "Mis Votos"
```

---

## 🐛 QUÉ BUSCAR (BUGS POTENCIALES)

### Geolocalización

- ❌ Error si no hay permisos
- ❌ Error si no hay UV cercana
- ❌ Timeout si tarda mucho
- ❌ Error en navegadores sin soporte

### Filtros

- ❌ Posts duplicados
- ❌ Filtros no se combinan bien
- ❌ Estado no se mantiene al navegar

### Votaciones

- ❌ Voto duplicado
- ❌ Porcentajes incorrectos
- ❌ Tiempo restante negativo
- ❌ Encuestas no se guardan

### UI/UX

- ❌ Elementos superpuestos
- ❌ Colores inconsistentes
- ❌ Animaciones bruscas
- ❌ Responsive roto

---

## 📊 CHECKLIST DE FUNCIONALIDADES

### Registro
- [ ] Selector de UV visible
- [ ] Búsqueda funciona
- [ ] Geolocalización funciona
- [ ] Validación obligatoria
- [ ] Badge de selección visible

### Home
- [ ] Filtro de vecindario visible (si tiene UV)
- [ ] Toggle funciona
- [ ] Posts se filtran correctamente
- [ ] Nuevos posts incluyen UV

### Perfil de UV
- [ ] Página carga correctamente
- [ ] Estadísticas correctas
- [ ] Tabs funcionan
- [ ] Posts filtrados por UV
- [ ] Badge "Tu Vecindario" si aplica

### Votaciones
- [ ] Encuestas se muestran
- [ ] Voto se registra
- [ ] No permite voto duplicado
- [ ] Porcentajes correctos
- [ ] Filtros funcionan
- [ ] Tiempo restante correcto

---

## 🔧 COMANDOS ÚTILES

### Limpiar localStorage
```javascript
localStorage.clear()
location.reload()
```

### Ver datos de usuario
```javascript
console.log(JSON.parse(localStorage.getItem('currentUser')))
```

### Ver posts
```javascript
console.log(JSON.parse(localStorage.getItem('posts')))
```

### Ver encuestas
```javascript
console.log(JSON.parse(localStorage.getItem('communityPolls')))
```

### Simular usuario con UV
```javascript
const user = JSON.parse(localStorage.getItem('currentUser'))
user.neighborhoodId = 1
user.neighborhoodName = "Santiago Centro"
user.neighborhoodCode = "001"
localStorage.setItem('currentUser', JSON.stringify(user))
location.reload()
```

---

## 📱 PRUEBAS EN DIFERENTES DISPOSITIVOS

### Desktop (1920x1080)
- [ ] Layout correcto
- [ ] Todos los elementos visibles
- [ ] Hover effects funcionan

### Laptop (1366x768)
- [ ] Layout se adapta
- [ ] Sidebar visible
- [ ] Chat colapsable funciona

### Tablet (768x1024)
- [ ] Responsive parcial
- [ ] Algunos elementos ocultos
- [ ] Navegación funcional

### Mobile (375x667)
- [ ] Responsive parcial
- [ ] Menú hamburguesa (próximamente)
- [ ] Touch events funcionan

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Mínimo Viable

- ✅ Usuario puede registrarse con UV
- ✅ Usuario puede filtrar por vecindario
- ✅ Usuario puede ver perfil de UV
- ✅ Usuario puede votar en encuestas
- ✅ Geolocalización funciona (con permisos)

### Deseable

- ⏳ Responsive completo
- ⏳ Animaciones suaves
- ⏳ Feedback visual claro
- ⏳ Manejo de errores robusto

### Opcional

- ⏳ Onboarding
- ⏳ Tutorial
- ⏳ Analytics
- ⏳ Tests automatizados

---

## 🎯 PRÓXIMAS PRUEBAS

Cuando se implementen:

### Sistema de Emergencias
- [ ] Botón de pánico visible
- [ ] Modal de emergencia funciona
- [ ] Alertas se envían
- [ ] Geolocalización automática

### Verificación de Vecinos
- [ ] Badge visible
- [ ] Modal de verificación funciona
- [ ] Contador de verificadores
- [ ] Mínimo 3 vecinos

### Notificaciones Vecinales
- [ ] Dropdown de notificaciones
- [ ] Alertas se muestran
- [ ] Filtros funcionan
- [ ] Marcar como leída

---

## 📝 REPORTE DE BUGS

Si encuentras un bug, reporta con:

1. **Descripción:** ¿Qué pasó?
2. **Pasos:** ¿Cómo reproducirlo?
3. **Esperado:** ¿Qué debería pasar?
4. **Actual:** ¿Qué pasó realmente?
5. **Navegador:** Chrome, Firefox, Safari, etc.
6. **Dispositivo:** Desktop, Mobile, Tablet
7. **Screenshot:** Si es posible

---

## 🎉 ¡LISTO PARA PROBAR!

Todas las funcionalidades están implementadas y listas para pruebas. Sigue las instrucciones y reporta cualquier problema encontrado.

**¡Buena suerte!** 🚀
