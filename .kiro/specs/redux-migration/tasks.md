# Migración a Redux - Plan de Implementación

## Estado: 🚧 EN PROGRESO

---

## Fase 1: Setup y Contextos Core ✅ COMPLETADA

### 1.1 Setup Inicial
- [x] 1.1.1 Instalar dependencias Redux
- [x] 1.1.2 Configurar store básico
- [x] 1.1.3 Integrar Provider en index.js
- [x] 1.1.4 Configurar Redux DevTools
- [x] 1.1.5 Configurar Redux Persist

### 1.2 Migrar AuthContext → authSlice
- [x] 1.2.1 Crear authSlice con estado inicial
- [x] 1.2.2 Implementar acciones: login, logout, register
- [x] 1.2.3 Crear selectores en authSelectors.js
- [x] 1.2.4 Crear hook useReduxAuth.js
- [x] 1.2.5 Actualizar componentes Login y Register
- [x] 1.2.6 Tests de authSlice
- [x] 1.2.7 Validar persistencia de sesión

### 1.3 Migrar PostsContext → postsSlice
- [x] 1.3.1 Crear postsSlice con estado inicial
- [x] 1.3.2 Implementar acciones: createPost, updatePost, deletePost
- [x] 1.3.3 Implementar acciones: addReaction, removeReaction, addComment
- [x] 1.3.4 Crear selectores en postsSelectors.js
- [x] 1.3.5 Crear hook useReduxPosts.js
- [x] 1.3.6 Actualizar componente Post
- [x] 1.3.7 Actualizar componente CreatePostModal
- [x] 1.3.8 Tests de postsSlice
- [x] 1.3.9 Validar sincronización con storageService

### 1.4 Migrar EventsContext → eventsSlice
- [x] 1.4.1 Crear eventsSlice con estado inicial
- [x] 1.4.2 Implementar acciones: createEvent, updateEvent, deleteEvent
- [x] 1.4.3 Implementar acciones: rsvpEvent, inviteToEvent
- [x] 1.4.4 Crear selectores en eventsSelectors.js
- [x] 1.4.5 Crear hook useReduxEvents.js
- [x] 1.4.6 Actualizar página Events
- [x] 1.4.7 Actualizar componente EventCard
- [x] 1.4.8 Tests de eventsSlice
- [x] 1.4.9 Validar persistencia de eventos

### 1.5 Migrar GroupsContext → groupsSlice
- [x] 1.5.1 Crear groupsSlice con estado inicial
- [x] 1.5.2 Implementar acciones: createGroup, joinGroup, leaveGroup
- [x] 1.5.3 Implementar acciones: updateGroup, deleteGroup
- [x] 1.5.4 Crear selectores en groupsSelectors.js
- [x] 1.5.5 Crear hook useReduxGroups.js
- [x] 1.5.6 Actualizar página Groups
- [x] 1.5.7 Tests de groupsSlice
- [x] 1.5.8 Validar persistencia de grupos

### 1.6 Migrar FriendsContext → friendsSlice
- [x] 1.6.1 Crear friendsSlice con estado inicial
- [x] 1.6.2 Implementar acciones: sendFriendRequest, acceptRequest, rejectRequest
- [x] 1.6.3 Implementar acciones: removeFriend, loadFriends
- [x] 1.6.4 Crear selectores en friendsSelectors.js
- [x] 1.6.5 Crear hook useReduxFriends.js
- [x] 1.6.6 Actualizar página Friends
- [x] 1.6.7 Tests de friendsSlice
- [x] 1.6.8 Validar persistencia de amigos

---

## Fase 2: Contextos de Vecindario 🔄 SIGUIENTE

### 2.1 Migrar NeighborhoodContext → neighborhoodSlice
- [ ] 2.1.1 Crear neighborhoodSlice con estado inicial
- [ ] 2.1.2 Implementar acciones de vecindario
- [ ] 2.1.3 Crear selectores en neighborhoodSelectors.js
- [ ] 2.1.4 Crear hook useReduxNeighborhood.js
- [ ] 2.1.5 Actualizar componentes que usan NeighborhoodContext
- [ ] 2.1.6 Tests de neighborhoodSlice
- [ ] 2.1.7 Validar persistencia

### 2.2 Migrar LocalNeedsContext → localNeedsSlice
- [ ] 2.2.1 Crear localNeedsSlice con estado inicial
- [ ] 2.2.2 Implementar acciones: createNeed, updateNeed, deleteNeed
- [ ] 2.2.3 Implementar acciones: respondToNeed, markAsResolved
- [ ] 2.2.4 Crear selectores en localNeedsSelectors.js
- [ ] 2.2.5 Crear hook useReduxLocalNeeds.js
- [ ] 2.2.6 Actualizar página LocalNeeds
- [ ] 2.2.7 Actualizar componente NeedCard
- [ ] 2.2.8 Tests de localNeedsSlice
- [ ] 2.2.9 Validar persistencia

### 2.3 Migrar CommunityActionsContext → communityActionsSlice
- [ ] 2.3.1 Crear communityActionsSlice con estado inicial
- [ ] 2.3.2 Implementar acciones: createAction, joinAction, leaveAction
- [ ] 2.3.3 Implementar acciones: updateAction, deleteAction
- [ ] 2.3.4 Crear selectores en communityActionsSelectors.js
- [ ] 2.3.5 Crear hook useReduxCommunityActions.js
- [ ] 2.3.6 Actualizar página CommunityActions
- [ ] 2.3.7 Actualizar componente ActionCard
- [ ] 2.3.8 Tests de communityActionsSlice
- [ ] 2.3.9 Validar persistencia

### 2.4 Migrar ConnectionsContext → connectionsSlice
- [ ] 2.4.1 Crear connectionsSlice con estado inicial
- [ ] 2.4.2 Implementar acciones de conexiones
- [ ] 2.4.3 Crear selectores en connectionsSelectors.js
- [ ] 2.4.4 Crear hook useReduxConnections.js
- [ ] 2.4.5 Actualizar componentes que usan ConnectionsContext
- [ ] 2.4.6 Tests de connectionsSlice
- [ ] 2.4.7 Validar persistencia

### 2.5 Migrar NeighborhoodsContext → neighborhoodsSlice
- [ ] 2.5.1 Crear neighborhoodsSlice con estado inicial
- [ ] 2.5.2 Implementar acciones de vecindarios múltiples
- [ ] 2.5.3 Crear selectores en neighborhoodsSelectors.js
- [ ] 2.5.4 Crear hook useReduxNeighborhoods.js
- [ ] 2.5.5 Actualizar componentes que usan NeighborhoodsContext
- [ ] 2.5.6 Tests de neighborhoodsSlice
- [ ] 2.5.7 Validar persistencia

---

## Fase 3: Contextos de Comunicación

### 3.1 Migrar MessagesContext → messagesSlice
- [ ] 3.1.1 Crear messagesSlice con estado inicial
- [ ] 3.1.2 Implementar acciones: sendMessage, markAsRead, deleteMessage
- [ ] 3.1.3 Crear selectores en messagesSelectors.js
- [ ] 3.1.4 Crear hook useReduxMessages.js
- [ ] 3.1.5 Actualizar página DirectMessages
- [ ] 3.1.6 Tests de messagesSlice
- [ ] 3.1.7 Validar persistencia

### 3.2 Migrar ChatContext → chatSlice
- [ ] 3.2.1 Crear chatSlice con estado inicial
- [ ] 3.2.2 Implementar acciones de chat
- [ ] 3.2.3 Crear selectores en chatSelectors.js
- [ ] 3.2.4 Crear hook useReduxChat.js
- [ ] 3.2.5 Actualizar componente ChatWindow
- [ ] 3.2.6 Tests de chatSlice
- [ ] 3.2.7 Validar persistencia

### 3.3 Migrar NotificationsContext → notificationsSlice
- [ ] 3.3.1 Crear notificationsSlice con estado inicial
- [ ] 3.3.2 Implementar acciones: addNotification, markAsRead, markAllAsRead
- [ ] 3.3.3 Crear selectores en notificationsSelectors.js
- [ ] 3.3.4 Crear hook useReduxNotifications.js
- [ ] 3.3.5 Actualizar componente NotificationsDropdown
- [ ] 3.3.6 Tests de notificationsSlice
- [ ] 3.3.7 Validar persistencia

---

## Fase 4: Contextos de Utilidad

### 4.1 Migrar SearchContext → searchSlice
- [ ] 4.1.1 Crear searchSlice con estado inicial
- [ ] 4.1.2 Implementar acciones de búsqueda
- [ ] 4.1.3 Crear selectores en searchSelectors.js
- [ ] 4.1.4 Crear hook useReduxSearch.js
- [ ] 4.1.5 Actualizar componente SearchModal
- [ ] 4.1.6 Tests de searchSlice

### 4.2 Migrar PhotosContext → photosSlice
- [ ] 4.2.1 Crear photosSlice con estado inicial
- [ ] 4.2.2 Implementar acciones: uploadPhoto, deletePhoto
- [ ] 4.2.3 Crear selectores en photosSelectors.js
- [ ] 4.2.4 Crear hook useReduxPhotos.js
- [ ] 4.2.5 Actualizar página Photos
- [ ] 4.2.6 Tests de photosSlice
- [ ] 4.2.7 Validar persistencia

### 4.3 Migrar GamificationContext → gamificationSlice
- [ ] 4.3.1 Crear gamificationSlice con estado inicial
- [ ] 4.3.2 Implementar acciones de gamificación
- [ ] 4.3.3 Crear selectores en gamificationSelectors.js
- [ ] 4.3.4 Crear hook useReduxGamification.js
- [ ] 4.3.5 Actualizar componentes que usan GamificationContext
- [ ] 4.3.6 Tests de gamificationSlice
- [ ] 4.3.7 Validar persistencia

### 4.4 Migrar VerificationContext → verificationSlice
- [ ] 4.4.1 Crear verificationSlice con estado inicial
- [ ] 4.4.2 Implementar acciones de verificación
- [ ] 4.4.3 Crear selectores en verificationSelectors.js
- [ ] 4.4.4 Crear hook useReduxVerification.js
- [ ] 4.4.5 Actualizar componentes que usan VerificationContext
- [ ] 4.4.6 Tests de verificationSlice
- [ ] 4.4.7 Validar persistencia

---

## Fase 5: Contextos Especializados

### 5.1 Migrar ProjectsContext → projectsSlice
- [ ] 5.1.1 Crear projectsSlice con estado inicial
- [ ] 5.1.2 Implementar acciones de proyectos
- [ ] 5.1.3 Crear selectores en projectsSelectors.js
- [ ] 5.1.4 Crear hook useReduxProjects.js
- [ ] 5.1.5 Actualizar página Projects
- [ ] 5.1.6 Tests de projectsSlice
- [ ] 5.1.7 Validar persistencia

### 5.2 Migrar PollsContext → pollsSlice
- [ ] 5.2.1 Crear pollsSlice con estado inicial
- [ ] 5.2.2 Implementar acciones: createPoll, vote, closePoll
- [ ] 5.2.3 Crear selectores en pollsSelectors.js
- [ ] 5.2.4 Crear hook useReduxPolls.js
- [ ] 5.2.5 Actualizar página Polls
- [ ] 5.2.6 Tests de pollsSlice
- [ ] 5.2.7 Validar persistencia

### 5.3 Migrar HelpRequestsContext → helpRequestsSlice
- [ ] 5.3.1 Crear helpRequestsSlice con estado inicial
- [ ] 5.3.2 Implementar acciones de solicitudes de ayuda
- [ ] 5.3.3 Crear selectores en helpRequestsSelectors.js
- [ ] 5.3.4 Crear hook useReduxHelpRequests.js
- [ ] 5.3.5 Actualizar página HelpRequests
- [ ] 5.3.6 Tests de helpRequestsSlice
- [ ] 5.3.7 Validar persistencia

### 5.4 Migrar CommunityCalendarContext → communityCalendarSlice
- [ ] 5.4.1 Crear communityCalendarSlice con estado inicial
- [ ] 5.4.2 Implementar acciones de calendario
- [ ] 5.4.3 Crear selectores en communityCalendarSelectors.js
- [ ] 5.4.4 Crear hook useReduxCommunityCalendar.js
- [ ] 5.4.5 Actualizar página CommunityCalendar
- [ ] 5.4.6 Tests de communityCalendarSlice
- [ ] 5.4.7 Validar persistencia

### 5.5 Migrar LocalBusinessContext → localBusinessSlice
- [ ] 5.5.1 Crear localBusinessSlice con estado inicial
- [ ] 5.5.2 Implementar acciones de negocios locales
- [ ] 5.5.3 Crear selectores en localBusinessSelectors.js
- [ ] 5.5.4 Crear hook useReduxLocalBusiness.js
- [ ] 5.5.5 Actualizar página LocalBusinesses
- [ ] 5.5.6 Tests de localBusinessSlice
- [ ] 5.5.7 Validar persistencia

### 5.6 Migrar SharedResourcesContext → sharedResourcesSlice
- [ ] 5.6.1 Crear sharedResourcesSlice con estado inicial
- [ ] 5.6.2 Implementar acciones de recursos compartidos
- [ ] 5.6.3 Crear selectores en sharedResourcesSelectors.js
- [ ] 5.6.4 Crear hook useReduxSharedResources.js
- [ ] 5.6.5 Actualizar página SharedResources
- [ ] 5.6.6 Tests de sharedResourcesSlice
- [ ] 5.6.7 Validar persistencia

### 5.7 Migrar ReportsContext → reportsSlice
- [ ] 5.7.1 Crear reportsSlice con estado inicial
- [ ] 5.7.2 Implementar acciones de reportes
- [ ] 5.7.3 Crear selectores en reportsSelectors.js
- [ ] 5.7.4 Crear hook useReduxReports.js
- [ ] 5.7.5 Actualizar componentes que usan ReportsContext
- [ ] 5.7.6 Tests de reportsSlice
- [ ] 5.7.7 Validar persistencia

### 5.8 Migrar ModerationContext → moderationSlice
- [ ] 5.8.1 Crear moderationSlice con estado inicial
- [ ] 5.8.2 Implementar acciones de moderación
- [ ] 5.8.3 Crear selectores en moderationSelectors.js
- [ ] 5.8.4 Crear hook useReduxModeration.js
- [ ] 5.8.5 Actualizar componentes que usan ModerationContext
- [ ] 5.8.6 Tests de moderationSlice
- [ ] 5.8.7 Validar persistencia

### 5.9 Migrar SecurityContext → securitySlice
- [ ] 5.9.1 Crear securitySlice con estado inicial
- [ ] 5.9.2 Implementar acciones de seguridad
- [ ] 5.9.3 Crear selectores en securitySelectors.js
- [ ] 5.9.4 Crear hook useReduxSecurity.js
- [ ] 5.9.5 Actualizar componentes que usan SecurityContext
- [ ] 5.9.6 Tests de securitySlice
- [ ] 5.9.7 Validar persistencia

### 5.10 Migrar ServicesContext → servicesSlice
- [ ] 5.10.1 Crear servicesSlice con estado inicial
- [ ] 5.10.2 Implementar acciones de servicios
- [ ] 5.10.3 Crear selectores en servicesSelectors.js
- [ ] 5.10.4 Crear hook useReduxServices.js
- [ ] 5.10.5 Actualizar componentes que usan ServicesContext
- [ ] 5.10.6 Tests de servicesSlice
- [ ] 5.10.7 Validar persistencia

---

## Fase 6: Contextos UI y Limpieza Final

### 6.1 Migrar AppContext → appSlice
- [ ] 6.1.1 Crear appSlice con estado inicial (darkMode, UI state)
- [ ] 6.1.2 Implementar acciones: toggleDarkMode, setUIState
- [ ] 6.1.3 Crear selectores en appSelectors.js
- [ ] 6.1.4 Crear hook useReduxApp.js
- [ ] 6.1.5 Actualizar componentes que usan AppContext
- [ ] 6.1.6 Tests de appSlice

### 6.2 Migrar SidebarContext → uiSlice
- [ ] 6.2.1 Integrar estado de sidebar en uiSlice
- [ ] 6.2.2 Implementar acciones de UI
- [ ] 6.2.3 Actualizar componente Sidebar
- [ ] 6.2.4 Tests de uiSlice

### 6.3 Migrar NeighborhoodExpansionContext → neighborhoodExpansionSlice
- [ ] 6.3.1 Crear neighborhoodExpansionSlice con estado inicial
- [ ] 6.3.2 Implementar acciones de expansión
- [ ] 6.3.3 Crear selectores en neighborhoodExpansionSelectors.js
- [ ] 6.3.4 Crear hook useReduxNeighborhoodExpansion.js
- [ ] 6.3.5 Actualizar componentes que usan NeighborhoodExpansionContext
- [ ] 6.3.6 Tests de neighborhoodExpansionSlice
- [ ] 6.3.7 Validar persistencia

### 6.4 Limpieza Final
- [ ] 6.4.1 Eliminar todos los archivos de Context antiguos
- [ ] 6.4.2 Eliminar imports de Context en App.js
- [ ] 6.4.3 Actualizar todos los imports en componentes
- [ ] 6.4.4 Eliminar feature flags
- [ ] 6.4.5 Limpiar código muerto
- [ ] 6.4.6 Actualizar documentación
- [ ] 6.4.7 Tests de regresión completos

---

## Fase 7: Validación y Optimización

### 7.1 Testing Completo
- [ ] 7.1.1 Ejecutar todos los tests unitarios
- [ ] 7.1.2 Tests de integración end-to-end
- [ ] 7.1.3 Tests de persistencia
- [ ] 7.1.4 Tests de migración de datos
- [ ] 7.1.5 Tests de performance

### 7.2 Optimización
- [ ] 7.2.1 Analizar bundle size
- [ ] 7.2.2 Optimizar selectores con memoización
- [ ] 7.2.3 Implementar code splitting si es necesario
- [ ] 7.2.4 Optimizar re-renders
- [ ] 7.2.5 Profiling con React DevTools

### 7.3 Documentación
- [ ] 7.3.1 Actualizar README.md
- [ ] 7.3.2 Crear REDUX_GUIDE.md
- [ ] 7.3.3 Documentar estructura del store
- [ ] 7.3.4 Documentar patrones de uso
- [ ] 7.3.5 Crear guía de troubleshooting

### 7.4 Validación Final
- [ ] 7.4.1 Verificar que toda la funcionalidad funciona
- [ ] 7.4.2 Verificar que no hay regresiones
- [ ] 7.4.3 Verificar que Redux DevTools funciona
- [ ] 7.4.4 Verificar que la persistencia funciona
- [ ] 7.4.5 Verificar performance
- [ ] 7.4.6 Code review completo

---

## Notas de Implementación

### Prioridades
1. **CRÍTICO**: Fase 1 (Auth, Posts, Events, Groups, Friends) - Funcionalidad core
2. **ALTO**: Fase 2 (Vecindario) - Funcionalidad principal de la app
3. **MEDIO**: Fases 3-4 (Comunicación y Utilidad)
4. **BAJO**: Fases 5-6 (Especializados y UI)

### Estrategia de Testing
- Cada slice debe tener tests antes de considerarse completo
- Tests de integración después de cada fase
- Validación manual de funcionalidad crítica

### Rollback Plan
- Mantener contextos antiguos hasta validar cada slice
- Feature flags para activar/desactivar Redux por dominio
- Backup de localStorage antes de migración de datos

### Métricas de Éxito
- ✅ 0 regresiones en funcionalidad
- ✅ Redux DevTools funcionando
- ✅ Persistencia funcionando
- ✅ Performance igual o mejor
- ✅ Código más mantenible
