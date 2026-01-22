# Bug: Foto de vecino cambia foto del usuario actual

## Descripción
Cuando el usuario hace clic en la foto de un vecino, la foto del usuario actual (en el header superior izquierdo) se cambia por la foto del vecino.

## Comportamiento esperado
- Al hacer clic en la foto de un vecino, debería navegar al perfil de ese vecino
- La foto del usuario actual en el header NO debería cambiar
- Solo el contenido de la página debería mostrar el perfil del vecino

## Comportamiento actual
- Al hacer clic en la foto de un vecino, la foto del header se cambia
- Esto indica que el estado del usuario actual en Redux está siendo modificado incorrectamente

## Causa probable
El problema está en que algún componente está llamando a `updateUser()` o `dispatch(updateUser())` con los datos del vecino en lugar de mantener separados:
- `currentUser`: El usuario autenticado (debe permanecer constante)
- `profileUser`: El usuario cuyo perfil se está viendo (puede cambiar)

## Solución
1. Verificar que UserProfile.js use `profileUser` para el perfil que se está viendo
2. Verificar que el Header use `currentUser` de Redux
3. Asegurar que ningún componente llame a `updateUser()` con datos de otros usuarios
4. Los componentes que muestran listas de vecinos NO deben modificar el usuario actual

## Archivos a revisar
- src/pages/UserProfile.js
- src/components/Header/Header.js
- src/pages/DiscoverNeighbors/DiscoverNeighbors.js
- src/components/FriendSuggestions/FriendSuggestions.js
- Cualquier componente que muestre listas de usuarios
