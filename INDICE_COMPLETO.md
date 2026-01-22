# Índice Completo - Vecino Activo

## 📑 Documentación Principal

### Resúmenes Ejecutivos
- `RESUMEN_FINAL.md` - Resumen ejecutivo del proyecto
- `PROYECTO_FINAL_COMPLETADO.md` - Documentación completa del proyecto
- `VALIDACION_FINAL.md` - Checklist de validación
- `INSTRUCCIONES_DESPLIEGUE.md` - Guía de despliegue

### Documentación de Fases
- `FASE_1_CIMIENTOS_COMPLETADA.md` - Fase 1: Cimientos
- `FASE_2_UTILIDAD_CORE_COMPLETADA.md` - Fase 2: Utilidad Core
- `FASE_3_EXPANSION_COMPLETADA.md` - Fase 3: Expansión
- `FASE_4_ECOSISTEMA_COMPLETADA.md` - Fase 4: Ecosistema

### Documentación de Tareas
- `TAREA_3_NAVEGACION_COMPLETADA.md` - Tarea 3: Navegación Principal
- `TAREA_4_ASIGNACION_VECINDARIOS_COMPLETADA.md` - Tarea 4: Asignación de Vecindarios

### Guías de Referencia
- `GUIA_RAPIDA.md` - Guía rápida de referencia
- `INSTRUCCIONES_DE_USO.md` - Instrucciones de uso
- `ESTADO_ACTUAL_TAREAS.md` - Estado actual de tareas

### Especificación
- `.kiro/specs/vecino-activo-redesign/requirements.md` - Requisitos
- `.kiro/specs/vecino-activo-redesign/design.md` - Diseño técnico
- `.kiro/specs/vecino-activo-redesign/tasks.md` - Plan de implementación

---

## 🗂️ Estructura de Carpetas

### `/src`
```
src/
├── components/          # 22+ componentes reutilizables
│   ├── ActionCard/
│   ├── ChatWindow/
│   ├── CommunityNavigation/
│   ├── ConversationList/
│   ├── CreateActionModal/
│   ├── CreateNeedModal/
│   ├── LocationVerification/
│   ├── NeedCard/
│   ├── NeighborhoodStats/
│   ├── RespondNeedModal/
│   └── ... (más componentes)
├── context/             # 11+ contextos de estado
│   ├── AuthContext.js
│   ├── CommunityActionsContext.js
│   ├── ConnectionsContext.js
│   ├── LocalNeedsContext.js
│   ├── MessagesContext.js
│   ├── ModerationContext.js
│   ├── NeighborhoodExpansionContext.js
│   ├── NeighborhoodsContext.js
│   └── ... (más contextos)
├── pages/               # 15+ páginas
│   ├── CommunityActions/
│   ├── DirectMessages/
│   ├── DiscoverNeighbors/
│   ├── Feed/
│   ├── LocalNeeds/
│   ├── Onboarding/
│   └── ... (más páginas)
├── services/            # 7 servicios
│   ├── feedService.js
│   ├── geocodingService.js
│   ├── geolocationService.js
│   ├── imageService.js
│   ├── neighborhoodExpansionService.js
│   ├── neighborhoodService.js
│   └── storageService.js
├── utils/               # 6 utilidades
│   ├── advancedSearch.js
│   ├── formatNumber.js
│   ├── iconMapping.js
│   ├── persistenceManager.js
│   ├── sweetalert.js
│   └── translations.js
├── hooks/               # Hooks personalizados
│   └── useInfiniteScroll.js
├── App.js               # Componente principal
├── index.js             # Punto de entrada
└── index.css            # Estilos globales
```

### `/server`
```
server/
├── index.js             # Servidor Express
├── package.json         # Dependencias
└── node_modules/        # Módulos instalados
```

### `/public`
```
public/
├── index.html           # HTML principal
└── data/
    └── geo/
        └── unidades_vecinales_simple.geojson
```

### `/scripts`
```
scripts/
├── convert-shapefile.sh
├── merge-demographic-data.js
├── simplify-and-merge-uv.js
├── simplify-geojson.js
└── update-uv-ago2025.js
```

---

## 📄 Archivos de Configuración

- `package.json` - Dependencias del proyecto
- `package-lock.json` - Lock file de npm
- `.gitignore` - Archivos ignorados por git
- `.gitattributes` - Atributos de git
- `README.md` - Documentación del repositorio

---

## 🔗 Contextos de Estado (11+)

### Autenticación y Verificación
- `AuthContext.js` - Autenticación de usuarios
- `VerificationContext.js` - Verificación de usuarios

### Comunidad y Vecindarios
- `NeighborhoodsContext.js` - Gestión de vecindarios
- `NeighborhoodContext.js` - Vecindario actual
- `NeighborhoodExpansionContext.js` - Expansión dinámica
- `ConnectionsContext.js` - Conexiones entre usuarios

### Contenido Comunitario
- `LocalNeedsContext.js` - Necesidades locales
- `CommunityActionsContext.js` - Acciones comunitarias
- `PostsContext.js` - Posts y actualizaciones

### Comunicación
- `MessagesContext.js` - Mensajería directa
- `ChatContext.js` - Chat en tiempo real
- `NotificationsContext.js` - Notificaciones

### Moderación y Seguridad
- `ModerationContext.js` - Moderación de contenido
- `ReportsContext.js` - Reportes de usuarios
- `SecurityContext.js` - Seguridad

### Otros
- `AppContext.js` - Estado global de la app
- `SearchContext.js` - Búsqueda
- `SidebarContext.js` - Sidebar
- `FriendsContext.js` - Amigos
- `EventsContext.js` - Eventos
- `GroupsContext.js` - Grupos
- `PhotosContext.js` - Fotos
- `GamificationContext.js` - Gamificación
- `ServicesContext.js` - Servicios
- `ProjectsContext.js` - Proyectos
- `HelpRequestsContext.js` - Solicitudes de ayuda
- `CommunityCalendarContext.js` - Calendario comunitario
- `LocalBusinessContext.js` - Negocios locales
- `SharedResourcesContext.js` - Recursos compartidos

---

## 🎨 Componentes (22+)

### Navegación
- `CommunityNavigation/` - Navegación principal comunitaria
- `Header/` - Encabezado
- `Sidebar/` - Barra lateral
- `RightSidebar/` - Barra lateral derecha

### Tarjetas y Elementos
- `ActionCard/` - Tarjeta de acción
- `NeedCard/` - Tarjeta de necesidad
- `EventCard/` - Tarjeta de evento
- `FriendCard/` - Tarjeta de amigo
- `PageCard/` - Tarjeta de página
- `ServiceCard/` - Tarjeta de servicio

### Modales
- `CreateActionModal/` - Modal para crear acción
- `CreateNeedModal/` - Modal para crear necesidad
- `CreatePostModal/` - Modal para crear post
- `CreateStoryModal/` - Modal para crear historia
- `EditProfileModal/` - Modal para editar perfil
- `CommentsModal/` - Modal de comentarios
- `ReactionsModal/` - Modal de reacciones
- `ReportModal/` - Modal de reporte
- `ShareModal/` - Modal de compartir
- `VerificationModal/` - Modal de verificación

### Utilidades
- `NeighborhoodStats/` - Estadísticas de vecindario
- `LocationVerification/` - Verificación de ubicación
- `NeighborhoodSelector/` - Selector de vecindario
- `SearchModal/` - Modal de búsqueda
- `NotificationsCenter/` - Centro de notificaciones
- `NotificationsDropdown/` - Dropdown de notificaciones
- `MessagesDropdown/` - Dropdown de mensajes
- `ProfileDropdown/` - Dropdown de perfil
- `ConversationList/` - Lista de conversaciones
- `ChatWindow/` - Ventana de chat
- `EmojiPicker/` - Selector de emojis
- `ImageUploader/` - Cargador de imágenes
- `PhotoLightbox/` - Galería de fotos
- `SkeletonLoader/` - Cargador esqueleto
- `VerifiedBadge/` - Badge de verificación

---

## 📄 Páginas (15+)

### Principales
- `Home.js` - Página de inicio
- `Feed/Feed.js` - Feed principal

### Comunidad
- `DiscoverNeighbors/DiscoverNeighbors.js` - Descubrimiento de vecinos
- `LocalNeeds/LocalNeeds.js` - Necesidades locales
- `CommunityActions/CommunityActions.js` - Acciones comunitarias
- `Community/Community.js` - Página de comunidad
- `Directory/Directory.js` - Directorio de servicios

### Comunicación
- `DirectMessages/DirectMessages.js` - Mensajes directos
- `Messenger.js` - Mensajería

### Información
- `UserProfile.js` - Perfil de usuario
- `NeighborhoodProfile/NeighborhoodProfile.js` - Perfil de vecindario
- `NeighborhoodMap/NeighborhoodMap.js` - Mapa del vecindario

### Otros
- `Onboarding.js` - Onboarding
- `Login.js` - Login
- `Register.js` - Registro
- `Settings.js` - Configuración
- `About.js` - Acerca de
- `Contact.js` - Contacto
- `Help.js` - Ayuda
- `Events.js` - Eventos
- `Friends.js` - Amigos
- `Photos.js` - Fotos
- `Birthday.js` - Cumpleaños
- `Timeline.js` - Línea de tiempo
- `Pages.js` - Páginas
- `Groups.js` - Grupos
- `Calendar.js` - Calendario
- `Favorites.js` - Favoritos
- `History.js` - Historial
- `Polls/Polls.js` - Votaciones
- `Projects/Projects.js` - Proyectos
- `HelpRequests/HelpRequests.js` - Solicitudes de ayuda
- `SharedResources/SharedResources.js` - Recursos compartidos
- `LocalBusinesses/LocalBusinesses.js` - Negocios locales
- `CommunityCalendar/CommunityCalendar.js` - Calendario comunitario

---

## 🔧 Servicios (7)

1. **storageService.js** - Gestión de localStorage
2. **geolocationService.js** - Geolocalización
3. **geocodingService.js** - Geocoding
4. **imageService.js** - Gestión de imágenes
5. **neighborhoodService.js** - Gestión de vecindarios
6. **feedService.js** - Priorización de feed
7. **neighborhoodExpansionService.js** - Expansión dinámica

---

## 🛠️ Utilidades (6)

1. **advancedSearch.js** - Búsqueda avanzada
2. **formatNumber.js** - Formateo de números
3. **iconMapping.js** - Mapeo de iconos
4. **persistenceManager.js** - Gestión de persistencia
5. **sweetalert.js** - Alertas personalizadas
6. **translations.js** - Traducciones

---

## 📊 Estadísticas de Archivos

| Tipo | Cantidad | Líneas |
|------|----------|--------|
| Contextos | 11+ | ~1,500 |
| Componentes | 22+ | ~2,000 |
| Páginas | 15+ | ~1,500 |
| Servicios | 7 | ~800 |
| Utilidades | 6 | ~400 |
| Estilos CSS | 30+ | ~2,000 |
| Documentación | 10+ | ~3,000 |
| **Total** | **100+** | **~12,000** |

---

## 🔍 Cómo Navegar el Código

### Para Entender la Arquitectura
1. Leer `PROYECTO_FINAL_COMPLETADO.md`
2. Revisar `.kiro/specs/vecino-activo-redesign/design.md`
3. Explorar `src/context/` para ver los contextos

### Para Agregar una Característica
1. Crear contexto en `src/context/`
2. Crear componentes en `src/components/`
3. Crear página en `src/pages/`
4. Agregar ruta en `src/App.js`

### Para Entender un Flujo
1. Buscar la página en `src/pages/`
2. Ver qué contextos usa
3. Revisar los componentes que renderiza
4. Seguir el flujo de datos

### Para Debuggear
1. Ver logs en consola del navegador
2. Usar React DevTools
3. Revisar localStorage en DevTools
4. Usar Network tab para ver API calls

---

## 📚 Lectura Recomendada

### Orden de Lectura
1. `RESUMEN_FINAL.md` - Visión general
2. `PROYECTO_FINAL_COMPLETADO.md` - Detalles completos
3. `.kiro/specs/vecino-activo-redesign/requirements.md` - Requisitos
4. `.kiro/specs/vecino-activo-redesign/design.md` - Diseño técnico
5. `GUIA_RAPIDA.md` - Referencia rápida

### Para Desarrolladores
1. `INSTRUCCIONES_DESPLIEGUE.md` - Cómo desplegar
2. `src/App.js` - Estructura principal
3. `src/context/` - Contextos de estado
4. `src/services/` - Servicios

### Para Usuarios
1. `INSTRUCCIONES_DE_USO.md` - Cómo usar
2. `GUIA_RAPIDA.md` - Referencia rápida

---

## 🎯 Búsqueda Rápida

### Buscar por Característica
- Autenticación: `src/context/AuthContext.js`
- Mensajería: `src/context/MessagesContext.js`
- Necesidades: `src/context/LocalNeedsContext.js`
- Acciones: `src/context/CommunityActionsContext.js`
- Moderación: `src/context/ModerationContext.js`
- Navegación: `src/components/CommunityNavigation/`
- Expansión: `src/services/neighborhoodExpansionService.js`

### Buscar por Página
- Inicio: `src/pages/Home.js`
- Mensajes: `src/pages/DirectMessages/`
- Necesidades: `src/pages/LocalNeeds/`
- Acciones: `src/pages/CommunityActions/`
- Descubrimiento: `src/pages/DiscoverNeighbors/`

---

## ✅ Checklist de Navegación

- [ ] Leí `RESUMEN_FINAL.md`
- [ ] Leí `PROYECTO_FINAL_COMPLETADO.md`
- [ ] Exploré `src/context/`
- [ ] Exploré `src/components/`
- [ ] Exploré `src/pages/`
- [ ] Exploré `src/services/`
- [ ] Entiendo la arquitectura
- [ ] Puedo agregar características
- [ ] Puedo debuggear problemas

---

**Índice Completo de Vecino Activo**
Última actualización: Enero 2026

