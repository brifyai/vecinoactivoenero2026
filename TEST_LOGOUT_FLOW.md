# 🧪 TEST LOGOUT FLOW

## Pasos para probar el logout

### 1. Preparación
1. Abrir el navegador en modo incógnito o limpiar localStorage
2. Abrir DevTools (F12) y ir a la pestaña Console
3. Ir a `http://localhost:3003`

### 2. Iniciar sesión
1. Debería redirigir a `/iniciar-sesion`
2. Ingresar credenciales y hacer login
3. Verificar que redirige a home (`/`)
4. Verificar en Console que aparece:
   ```
   ✅ Backup creado exitosamente
   ```

### 3. Verificar sesión activa
1. Abrir DevTools > Application > Local Storage > http://localhost:3003
2. Verificar que existen:
   - `friendbook_session`
   - `currentUser`
   - `friendbook_backup`
   - `friendbook_last_backup`
   - `persist:vecino-activo-root`

### 4. Hacer logout
1. Hacer clic en el botón "Cerrar Sesión" (puede estar en ProfileDropdown, Sidebar o Settings)
2. Si hay confirmación, confirmar
3. Verificar logs en Console:
   ```
   🔵 ProfileDropdown - Iniciando logout
   🔵 handleLogout llamado
   🔴 LOGOUT EJECUTADO - Limpiando estado
   🚪 Limpiando datos para logout...
   ✅ Backups eliminados - logout preparado
   ✅ Estado limpiado - isAuthenticated: false
   🔵 Logout dispatch completado
   ```

### 5. Verificar redirección
1. La página debería recargar automáticamente
2. Debería redirigir a `/iniciar-sesion`
3. NO debería volver a home automáticamente

### 6. Verificar localStorage limpio
1. Abrir DevTools > Application > Local Storage > http://localhost:3003
2. Verificar que NO existen:
   - `friendbook_session` ❌
   - `currentUser` ❌
   - `friendbook_backup` ❌
   - `friendbook_last_backup` ❌
   - `persist:vecino-activo-root` ❌
3. Debería existir temporalmente (se limpia al recargar):
   - `friendbook_intentional_logout` = "true" (se limpia en el siguiente load)

### 7. Verificar que NO se restaura sesión
1. Después de la recarga, verificar logs en Console:
   ```
   🚪 Logout intencional detectado - NO se restaurarán datos
   ```
2. NO debería aparecer:
   ```
   🔄 Datos perdidos detectados, recuperando backup...
   ✅ Datos restaurados desde backup
   ```

### 8. Intentar acceder a ruta protegida
1. Intentar navegar manualmente a `http://localhost:3003/`
2. Debería redirigir inmediatamente a `/iniciar-sesion`
3. NO debería mostrar contenido de home

## ✅ Criterios de éxito

- [ ] Logout limpia todo el estado de Redux
- [ ] Logout limpia localStorage completamente
- [ ] Logout establece flag de logout intencional
- [ ] persistenceManager NO restaura datos después de logout
- [ ] Redirección automática a `/iniciar-sesion`
- [ ] No se puede acceder a rutas protegidas sin login
- [ ] Logs aparecen en el orden correcto
- [ ] No hay errores en Console

## ❌ Señales de problema

Si ves estos logs, el logout NO está funcionando:
```
🔄 Datos perdidos detectados, recuperando backup...
✅ Datos restaurados desde backup
persist/REHYDRATE
auth/restoreSession/fulfilled
```

Si después de logout vuelves a home automáticamente, el problema persiste.

## 🔧 Troubleshooting

### Problema: Sigue restaurando sesión
**Solución:** Verificar que `persistenceManager.clearForLogout()` se está llamando correctamente

### Problema: No redirige a login
**Solución:** Verificar que `window.location.href = '/iniciar-sesion'` se ejecuta en el hook

### Problema: Errores en Console
**Solución:** Verificar que todos los archivos están guardados y el servidor está actualizado

### Problema: localStorage no se limpia
**Solución:** Verificar que el reducer `logout` está limpiando todos los keys correctamente
