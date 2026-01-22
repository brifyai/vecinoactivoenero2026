# Guía Rápida - Vecino Activo

## Inicio Rápido

### Instalación
```bash
npm install
npm start
```

### Compilación
```bash
npm run build
```

---

## Rutas Principales

| Ruta | Descripción | Componente |
|------|-------------|-----------|
| `/` | Página de inicio | Home |
| `/iniciar-sesion` | Login | Login |
| `/registrarse` | Registro | Register |
| `/onboarding` | Onboarding | Onboarding |
| `/descubrir-vecinos` | Descubrimiento de vecinos | DiscoverNeighbors |
| `/necesidades-locales` | Necesidades locales | LocalNeeds |
| `/acciones-comunitarias` | Acciones comunitarias | CommunityActions |
| `/feed` | Feed principal | Feed |
| `/mensajes-directos` | Mensajería directa | DirectMessages |
| `/mapa` | Mapa del vecindario | NeighborhoodMap |
| `/directorio` | Directorio de servicios | Directory |
| `/vecinos` | Lista de vecinos | Friends |
| `/fotos` | Galería de fotos | Photos |
| `/configuracion` | Configuración | Settings |

---

## Contextos Principales

### AuthContext
```javascript
import { useAuth } from './context/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

### MessagesContext
```javascript
import { useMessages } from './context/MessagesContext';
const { sendMessage, getConversation, conversations } = useMessages();
```

### ModerationContext
```javascript
import { useModeration } from './context/ModerationContext';
const { createReport, getPendingReports } = useModeration();
```

### LocalNeedsContext
```javascript
import { useLocalNeeds } from './context/LocalNeedsContext';
const { createNeed, getNeedsByNeighborhood } = useLocalNeeds();
```

### CommunityActionsContext
```javascript
import { useCommunityActions } from './context/CommunityActionsContext';
const { createAction, getActionsByNeighborhood } = useCommunityActions();
```

---

## Servicios Principales

### storageService
```javascript
import storageService from './services/storageService';

// Usuarios
storageService.getUser(userId);
storageService.updateUser(userId, updates);

// Mensajes
storageService.getMessages();
storageService.saveMessages(messages);

// Reportes
storageService.getReports();
storageService.saveReports(reports);
```

### geolocationService
```javascript
import geolocationService from './services/geolocationService';

// Obtener ubicación actual
const location = await geolocationService.getCurrentLocation();

// Calcular distancia
const distance = geolocationService.calculateDistance(lat1, lon1, lat2, lon2);
```

### feedService
```javascript
import feedService from './services/feedService';

// Calcular relevancia
const relevance = feedService.calculateRelevance(item, userLocation);

// Ordenar feed
const sorted = feedService.sortByRelevance(items, userLocation);
```

---

## Componentes Reutilizables

### ActionCard
```javascript
<ActionCard action={action} onJoin={handleJoin} />
```

### NeedCard
```javascript
<NeedCard need={need} onRespond={handleRespond} />
```

### ChatWindow
```javascript
<ChatWindow conversation={conversation} currentUserId={userId} />
```

### ConversationList
```javascript
<ConversationList 
  conversations={conversations}
  onSelectConversation={handleSelect}
  currentUserId={userId}
/>
```

---

## Flujos de Usuario

### 1. Registro y Verificación
1. Usuario accede a `/registrarse`
2. Completa formulario de registro
3. Verifica email
4. Verifica ubicación (GPS/IP/código postal)
5. Se asigna a vecindario automáticamente
6. Redirige a `/onboarding`

### 2. Descubrimiento de Vecinos
1. Usuario accede a `/descubrir-vecinos`
2. Ve lista de vecinos cercanos ordenados por proximidad
3. Puede ver perfil de vecino
4. Puede enviar solicitud de conexión
5. Una vez conectado, puede enviar mensajes

### 3. Crear Necesidad Local
1. Usuario accede a `/necesidades-locales`
2. Hace clic en "Crear Necesidad"
3. Completa formulario (tipo, descripción, urgencia)
4. Se publica en el vecindario
5. Otros vecinos pueden responder

### 4. Crear Acción Comunitaria
1. Usuario accede a `/acciones-comunitarias`
2. Hace clic en "Crear Acción"
3. Completa formulario (título, fecha, ubicación, habilidades)
4. Se publica en el vecindario
5. Otros vecinos pueden unirse

### 5. Mensajería Directa
1. Usuario accede a `/mensajes-directos`
2. Selecciona conversación o inicia nueva
3. Escribe mensaje
4. Envía con botón o Enter
5. Destinatario recibe notificación

### 6. Reportar Contenido
1. Usuario ve contenido inapropiado
2. Hace clic en "Reportar"
3. Selecciona razón
4. Escribe descripción
5. Se envía a moderadores

---

## Estructura de Datos

### Usuario
```javascript
{
  id: string,
  email: string,
  name: string,
  avatar: string,
  neighborhood: string,
  location: { lat, lon },
  verified: boolean,
  reputation: number,
  connections: string[],
  createdAt: string
}
```

### Necesidad Local
```javascript
{
  id: string,
  userId: string,
  type: 'help' | 'resource' | 'skill',
  title: string,
  description: string,
  urgency: 1-10,
  location: { lat, lon },
  neighborhood: string,
  responses: string[],
  status: 'open' | 'resolved',
  createdAt: string
}
```

### Acción Comunitaria
```javascript
{
  id: string,
  organizerId: string,
  title: string,
  description: string,
  date: string,
  time: string,
  location: { lat, lon },
  neighborhood: string,
  skills: string[],
  maxParticipants: number,
  participants: string[],
  waitlist: string[],
  createdAt: string
}
```

### Mensaje
```javascript
{
  id: string,
  senderId: string,
  recipientId: string,
  content: string,
  read: boolean,
  timestamp: string
}
```

### Reporte
```javascript
{
  id: string,
  reporterUserId: string,
  contentId: string,
  contentType: 'need' | 'action' | 'message' | 'profile',
  reason: string,
  description: string,
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected',
  moderatorId: string,
  action: 'warning' | 'deletion' | 'suspension' | 'none',
  createdAt: string,
  resolvedAt: string
}
```

---

## Debugging

### Ver datos en localStorage
```javascript
// En consola del navegador
localStorage.getItem('vecino_direct_messages')
localStorage.getItem('vecino_reports')
localStorage.getItem('vecino_moderators')
```

### Limpiar datos
```javascript
// En consola del navegador
localStorage.clear()
```

### Ver logs
```javascript
// En App.js
console.log('✅ App component rendering');
```

---

## Troubleshooting

### Problema: Mensajes no se envían
**Solución**: Verificar que los usuarios estén conectados en ConnectionsContext

### Problema: Ubicación no se detecta
**Solución**: Permitir acceso a ubicación en navegador, o usar código postal

### Problema: Feed vacío
**Solución**: Crear necesidades o acciones en el vecindario

### Problema: Datos no persisten
**Solución**: Verificar que localStorage no esté deshabilitado

---

## Próximos Pasos

1. **Migrar a Backend Real**
   - Crear API REST
   - Usar base de datos (MongoDB, PostgreSQL)
   - Implementar autenticación JWT

2. **Mejorar Seguridad**
   - Encriptación de mensajes
   - Validación en servidor
   - Rate limiting

3. **Agregar Características**
   - Notificaciones push
   - Integración de mapas
   - Análisis y métricas

4. **Optimizar Rendimiento**
   - Lazy loading
   - Code splitting
   - Caché

---

## Contacto y Soporte

Para preguntas o problemas, consultar:
- Documentación: `PROYECTO_COMPLETADO.md`
- Especificación: `.kiro/specs/vecino-activo-redesign/`
- Fases: `FASE_*.md`

