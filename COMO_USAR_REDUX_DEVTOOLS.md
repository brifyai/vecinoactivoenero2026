# 🔧 CÓMO USAR REDUX DEVTOOLS

## Guía Completa para Debugging Visual

---

## 📥 INSTALACIÓN

### 1. Instalar Extensión del Navegador

**Chrome:**
https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

**Firefox:**
https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/

**Edge:**
https://microsoftedge.microsoft.com/addons/detail/redux-devtools/

---

## 🚀 ABRIR REDUX DEVTOOLS

1. Abre tu aplicación en el navegador: http://localhost:3003
2. Presiona F12 (o clic derecho → Inspeccionar)
3. Ve a la pestaña "Redux"

Si no ves la pestaña "Redux", recarga la página.

---

## 📊 INTERFAZ DE REDUX DEVTOOLS

### Panel Izquierdo: Lista de Acciones

Muestra todas las acciones que se han disparado:

```
🔵 @@INIT
🔵 persist/REHYDRATE
🔵 auth/restoreSession/pending
🔵 auth/restoreSession/fulfilled
🔵 posts/load/pending
🔵 posts/load/fulfilled
🔵 notifications/load/fulfilled
```

### Panel Central: Detalles de la Acción

Muestra información detallada de la acción seleccionada:

**Tab "Action":**
```javascript
{
  type: "auth/login/fulfilled",
  payload: {
    id: 1,
    name: "Juan Pérez",
    email: "juan@example.com",
    avatar: "..."
  }
}
```

**Tab "State":**
```javascript
{
  auth: {
    user: { id: 1, name: "Juan Pérez", ... },
    isAuthenticated: true,
    loading: false
  },
  posts: {
    items: [...],
    loading: false
  },
  notifications: {
    items: [...],
    unreadCount: 3
  }
}
```

**Tab "Diff":**
```javascript
// Muestra qué cambió
{
  auth: {
    user: {
-     null
+     { id: 1, name: "Juan Pérez", ... }
    },
    isAuthenticated: {
-     false
+     true
    }
  }
}
```

---

## 🎯 CASOS DE USO

### 1. Ver Qué Causó un Cambio

**Problema:** "El avatar cambió pero no sé por qué"

**Solución:**
1. Abre Redux DevTools
2. Busca acciones relacionadas con "avatar"
3. Haz clic en la acción
4. Ve el tab "Diff" para ver qué cambió
5. Ve el tab "Trace" para ver dónde se disparó

**Ejemplo:**
```
🔵 auth/updateUserAvatar
  Payload: "new-avatar.jpg"
  Diff:
    auth.user.avatar: "old.jpg" → "new-avatar.jpg"
  Trace:
    Settings.js:45
    handleAvatarChange()
```

### 2. Time Travel (Volver Atrás en el Tiempo)

**Problema:** "Quiero ver cómo era el estado antes"

**Solución:**
1. Haz clic en cualquier acción anterior
2. La aplicación volverá a ese estado
3. Puedes navegar hacia adelante y atrás

**Ejemplo:**
```
Acción 1: Login → Usuario logueado
Acción 2: Crear post → Post creado
Acción 3: Agregar reacción → Reacción agregada

Haz clic en Acción 1 → Vuelves al estado después del login
(El post y la reacción desaparecen temporalmente)
```

### 3. Reproducir un Bug

**Problema:** "Encontré un bug pero no puedo reproducirlo"

**Solución:**
1. Cuando encuentres el bug, abre Redux DevTools
2. Haz clic en el botón "Export" (arriba a la derecha)
3. Guarda el archivo JSON
4. Envía el archivo al equipo
5. Ellos pueden hacer "Import" y reproducir exactamente el mismo estado

### 4. Ver Estado Completo

**Problema:** "Quiero ver todo el estado de la aplicación"

**Solución:**
1. Haz clic en la última acción
2. Ve al tab "State"
3. Expande los objetos para ver todo

**Ejemplo:**
```javascript
{
  auth: {
    user: {
      id: 1,
      name: "Juan Pérez",
      email: "juan@example.com",
      avatar: "...",
      neighborhood: "Miraflores",
      neighborhoodId: 123
    },
    isAuthenticated: true,
    loading: false,
    error: null
  },
  posts: {
    items: [
      { id: 1, content: "Hola vecinos!", ... },
      { id: 2, content: "Vendo bicicleta", ... }
    ],
    loading: false
  },
  notifications: {
    items: [
      { id: 1, message: "Nuevo vecino", read: false },
      { id: 2, message: "Nueva reacción", read: true }
    ],
    unreadCount: 1
  }
}
```

### 5. Filtrar Acciones

**Problema:** "Hay demasiadas acciones, quiero ver solo las de login"

**Solución:**
1. Usa el campo de búsqueda arriba de la lista de acciones
2. Escribe "login"
3. Solo verás acciones que contengan "login"

**Ejemplo:**
```
Buscar: "login"

Resultados:
🔵 auth/login/pending
🔵 auth/login/fulfilled
```

### 6. Saltar a una Acción Específica

**Problema:** "Quiero ver el estado justo después del login"

**Solución:**
1. Busca la acción "auth/login/fulfilled"
2. Haz clic en ella
3. Ve el tab "State" para ver el estado en ese momento

---

## 🎨 BOTONES ÚTILES

### Barra Superior

**Dispatcher:**
- Permite disparar acciones manualmente
- Útil para testing

**Slider:**
- Navega entre acciones con un slider
- Útil para ver cambios graduales

**Export:**
- Exporta el estado actual
- Útil para compartir bugs

**Import:**
- Importa un estado exportado
- Útil para reproducir bugs

**Lock:**
- Bloquea la vista actual
- Útil para comparar estados

**Persist:**
- Guarda el estado en localStorage
- Útil para mantener el estado entre recargas

---

## 💡 TIPS Y TRUCOS

### 1. Usar el Slider para Ver Animaciones

Mueve el slider lentamente para ver cómo cambia el estado paso a paso.

### 2. Usar "Jump" para Saltar Rápido

Haz clic derecho en una acción → "Jump" para saltar directamente a ese estado.

### 3. Usar "Skip" para Ignorar Acciones

Haz clic derecho en una acción → "Skip" para ignorarla temporalmente.

### 4. Usar "Commit" para Limpiar

Haz clic en "Commit" para limpiar todas las acciones anteriores y empezar de nuevo.

### 5. Usar "Revert" para Deshacer

Haz clic en "Revert" para volver al estado inicial.

---

## 🐛 DEBUGGING PASO A PASO

### Ejemplo: "El avatar no se actualiza"

**Paso 1:** Abre Redux DevTools

**Paso 2:** Intenta cambiar el avatar en la aplicación

**Paso 3:** Busca acciones relacionadas:
```
Buscar: "avatar"
```

**Paso 4:** Verifica que la acción se disparó:
```
🔵 auth/updateUserAvatar
  Payload: "new-avatar.jpg"
```

**Paso 5:** Ve el tab "Diff":
```javascript
{
  auth: {
    user: {
      avatar: {
-       "old-avatar.jpg"
+       "new-avatar.jpg"
      }
    }
  }
}
```

**Paso 6:** Si el estado cambió pero la UI no:
- El problema está en el componente
- Verifica que use `useSelector(selectUserAvatar)`

**Paso 7:** Si el estado NO cambió:
- El problema está en el slice
- Verifica el reducer en `authSlice.js`

---

## 📱 DEBUGGING EN PRODUCCIÓN

### Habilitar DevTools Solo para Admins

```javascript
// src/store/index.js
export const store = configureStore({
  // ...
  devTools: process.env.NODE_ENV !== 'production' || 
            window.location.hostname === 'localhost' ||
            localStorage.getItem('enableDevTools') === 'true'
});
```

Para habilitar en producción:
```javascript
localStorage.setItem('enableDevTools', 'true');
// Recargar la página
```

---

## 🎓 RECURSOS

### Documentación Oficial
https://github.com/reduxjs/redux-devtools

### Video Tutoriales
- [Redux DevTools Tutorial](https://www.youtube.com/watch?v=IlM7497j6LY)
- [Time Travel Debugging](https://www.youtube.com/watch?v=VvUdvte1Y3s)

### Atajos de Teclado
- `Ctrl/Cmd + H` - Ocultar/mostrar DevTools
- `Ctrl/Cmd + Q` - Limpiar acciones
- `Ctrl/Cmd + Shift + S` - Exportar estado

---

## ✅ CHECKLIST DE DEBUGGING

Cuando encuentres un bug:

- [ ] Abre Redux DevTools
- [ ] Identifica la acción relacionada
- [ ] Ve el tab "Action" para ver el payload
- [ ] Ve el tab "Diff" para ver qué cambió
- [ ] Ve el tab "State" para ver el estado completo
- [ ] Ve el tab "Trace" para ver dónde se disparó
- [ ] Usa Time Travel para reproducir
- [ ] Exporta el estado si necesitas compartir

---

## 🎉 CONCLUSIÓN

Redux DevTools es tu mejor amigo para debugging. Con él puedes:

✅ Ver TODAS las acciones en tiempo real
✅ Inspeccionar el estado completo
✅ Volver atrás en el tiempo
✅ Reproducir bugs fácilmente
✅ Compartir estados con el equipo

**¡Nunca más te preguntarás "¿por qué cambió esto?"!**
