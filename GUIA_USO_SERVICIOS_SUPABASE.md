# Guía de Uso: Servicios de Supabase

## 📚 Índice Rápido

1. [Importación](#importación)
2. [Autenticación](#autenticación)
3. [Posts y Feed](#posts-y-feed)
4. [Mensajería](#mensajería)
5. [Eventos](#eventos)
6. [Grupos](#grupos)
7. [Amistades](#amistades)
8. [Notificaciones](#notificaciones)
9. [Proyectos](#proyectos)
10. [Encuestas](#encuestas)
11. [Negocios Locales](#negocios-locales)
12. [Recursos Compartidos](#recursos-compartidos)
13. [Solicitudes de Ayuda](#solicitudes-de-ayuda)
14. [Calendario](#calendario)
15. [Fotos](#fotos)
16. [Storage](#storage)

---

## Importación

### Opción 1: Importación Individual
```javascript
import supabaseAuthService from '../services/supabaseAuthService';
import supabasePostsService from '../services/supabasePostsService';
```

### Opción 2: Desde Índice
```javascript
import { 
  supabaseAuthService, 
  supabasePostsService,
  supabaseMessagesService 
} from '../services';
```

---

## Autenticación

### Login
```javascript
const { user, session } = await supabaseAuthService.login(email, password);
```

### Registro
```javascript
const { user } = await supabaseAuthService.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'Juan Pérez',
  neighborhoodId: 1
});
```

### Obtener Usuario Actual
```javascript
const user = await supabaseAuthService.getCurrentUser();
```

### Logout
```javascript
await supabaseAuthService.logout();
```

### Actualizar Perfil
```javascript
await supabaseAuthService.updateProfile(userId, {
  name: 'Nuevo Nombre',
  bio: 'Mi biografía'
});
```

---

## Posts y Feed

### Obtener Posts
```javascript
const posts = await supabasePostsService.getPosts(neighborhoodId, 20, 0);
```

### Crear Post
```javascript
const newPost = await supabasePostsService.createPost({
  content: 'Mi primer post',
  authorId: userId,
  neighborhoodId: neighborhoodId,
  images: ['url1.jpg', 'url2.jpg']
});
```

### Like a Post
```javascript
await supabasePostsService.likePost(postId, userId);
```

### Agregar Comentario
```javascript
const comment = await supabasePostsService.addComment(postId, {
  content: 'Gran post!',
  authorId: userId
});
```

### Real-time Subscription
```javascript
const unsubscribe = supabasePostsService.subscribeToNewPosts(
  neighborhoodId,
  (newPost) => {
    console.log('Nuevo post:', newPost);
  }
);

// Cleanup
unsubscribe();
```

---

## Mensajería

### Obtener Conversaciones
```javascript
const conversations = await supabaseMessagesService.getConversations(userId);
```

### Obtener Mensajes
```javascript
const messages = await supabaseMessagesService.getMessages(conversationId, 50, 0);
```

### Enviar Mensaje
```javascript
const message = await supabaseMessagesService.sendMessage({
  conversationId: conversationId,
  senderId: userId,
  content: 'Hola!',
  type: 'text'
});
```

### Marcar como Leído
```javascript
await supabaseMessagesService.markAsRead(messageId, userId);
```

### Real-time Subscription
```javascript
const unsubscribe = supabaseMessagesService.subscribeToConversation(
  conversationId,
  (newMessage) => {
    console.log('Nuevo mensaje:', newMessage);
  }
);
```

---

## Eventos

### Obtener Eventos
```javascript
const events = await supabaseEventsService.getEvents(neighborhoodId, {
  category: 'social',
  startDate: '2026-01-01'
});
```

### Crear Evento
```javascript
const event = await supabaseEventsService.createEvent({
  title: 'Fiesta Vecinal',
  description: 'Celebración comunitaria',
  startDate: '2026-02-15T18:00:00',
  endDate: '2026-02-15T22:00:00',
  location: 'Plaza Central',
  organizerId: userId,
  neighborhoodId: neighborhoodId,
  category: 'social'
});
```

### RSVP a Evento
```javascript
await supabaseEventsService.rsvpToEvent(eventId, userId, 'asistire');
```

---

## Grupos

### Obtener Grupos
```javascript
const groups = await supabaseGroupsService.getGroups(neighborhoodId);
```

### Crear Grupo
```javascript
const group = await supabaseGroupsService.createGroup({
  name: 'Club de Lectura',
  description: 'Amantes de los libros',
  creatorId: userId,
  neighborhoodId: neighborhoodId,
  privacy: 'publico'
});
```

### Unirse a Grupo
```javascript
await supabaseGroupsService.joinGroup(groupId, userId);
```

---

## Amistades

### Obtener Amigos
```javascript
const friends = await supabaseFriendsService.getFriends(userId);
```

### Enviar Solicitud
```javascript
await supabaseFriendsService.sendFriendRequest(myUserId, friendUserId);
```

### Aceptar Solicitud
```javascript
await supabaseFriendsService.acceptFriendRequest(requestId, userId);
```

---

## Notificaciones

### Obtener Notificaciones
```javascript
const notifications = await supabaseNotificationsService.getNotifications(userId, 20, 0);
```

### Marcar como Leída
```javascript
await supabaseNotificationsService.markAsRead(notificationId, userId);
```

### Marcar Todas como Leídas
```javascript
await supabaseNotificationsService.markAllAsRead(userId);
```

### Real-time Subscription
```javascript
const unsubscribe = supabaseNotificationsService.subscribeToNotifications(
  userId,
  (notification) => {
    console.log('Nueva notificación:', notification);
  }
);
```

---

## Proyectos

### Obtener Proyectos
```javascript
const projects = await supabaseProjectsService.getProjects(neighborhoodId);
```

### Crear Proyecto
```javascript
const project = await supabaseProjectsService.createProject({
  title: 'Parque Comunitario',
  description: 'Renovación del parque',
  category: 'infraestructura',
  creatorId: userId,
  neighborhoodId: neighborhoodId,
  budget: 50000,
  startDate: '2026-03-01',
  endDate: '2026-06-30'
});
```

### Votar Proyecto
```javascript
await supabaseProjectsService.voteProject(projectId, userId);
```

### Unirse como Voluntario
```javascript
await supabaseProjectsService.joinAsVolunteer(projectId, userId);
```

### Agregar Actualización
```javascript
const update = await supabaseProjectsService.addUpdate(
  projectId,
  userId,
  'Avance del 50% completado',
  ['foto1.jpg', 'foto2.jpg']
);
```

---

## Encuestas

### Obtener Encuestas
```javascript
const polls = await supabasePollsService.getPolls(neighborhoodId);
```

### Crear Encuesta
```javascript
const poll = await supabasePollsService.createPoll({
  title: '¿Qué mejora prefieres?',
  description: 'Votación para mejoras',
  options: ['Parque', 'Cancha', 'Biblioteca'],
  endsAt: '2026-02-28',
  creatorId: userId,
  neighborhoodId: neighborhoodId
});
```

### Votar
```javascript
await supabasePollsService.vote(pollId, optionId, userId);
```

---

## Negocios Locales

### Obtener Negocios
```javascript
const businesses = await supabaseBusinessService.getBusinesses(neighborhoodId, 'restaurante');
```

### Registrar Negocio
```javascript
const business = await supabaseBusinessService.registerBusiness({
  name: 'Café del Barrio',
  description: 'Café artesanal',
  category: 'gastronomia',
  ownerId: userId,
  neighborhoodId: neighborhoodId,
  address: 'Calle 123',
  phone: '555-1234'
});
```

### Agregar Reseña
```javascript
const review = await supabaseBusinessService.addReview(businessId, {
  userId: userId,
  rating: 5,
  comment: 'Excelente servicio!'
});
```

### Crear Oferta
```javascript
const offer = await supabaseBusinessService.createOffer(businessId, {
  title: '2x1 en cafés',
  description: 'Válido hasta fin de mes',
  discount: 50,
  validUntil: '2026-01-31'
}, userId);
```

---

## Recursos Compartidos

### Obtener Recursos
```javascript
const resources = await supabaseResourcesService.getResources(neighborhoodId, 'herramientas');
```

### Agregar Recurso
```javascript
const resource = await supabaseResourcesService.addResource({
  name: 'Taladro Eléctrico',
  description: 'Taladro profesional',
  category: 'herramientas',
  ownerId: userId,
  neighborhoodId: neighborhoodId,
  condition: 'excelente',
  maxLoanDays: 3
});
```

### Reservar Recurso
```javascript
const reservation = await supabaseResourcesService.reserveResource({
  resourceId: resourceId,
  ownerId: ownerId,
  borrowerId: userId,
  startDate: '2026-02-01',
  endDate: '2026-02-03',
  purpose: 'Reparaciones en casa'
});
```

### Aprobar Reserva
```javascript
await supabaseResourcesService.approveReservation(reservationId, userId);
```

---

## Solicitudes de Ayuda

### Obtener Solicitudes
```javascript
const requests = await supabaseHelpService.getHelpRequests(neighborhoodId, 'abierta');
```

### Crear Solicitud
```javascript
const request = await supabaseHelpService.createHelpRequest({
  type: 'transporte',
  title: 'Necesito ayuda con mudanza',
  description: 'Mudanza pequeña',
  urgency: 'normal',
  requesterId: userId,
  neighborhoodId: neighborhoodId
});
```

### Ofrecer Ayuda
```javascript
const offer = await supabaseHelpService.offerHelp({
  requestId: requestId,
  helperId: userId,
  message: 'Puedo ayudarte!',
  availability: 'Sábado por la mañana'
});
```

### Aceptar Oferta
```javascript
await supabaseHelpService.acceptOffer(requestId, offerId, userId);
```

---

## Calendario

### Obtener Eventos del Calendario
```javascript
const events = await supabaseCalendarService.getCalendarEvents(
  neighborhoodId,
  '2026-02-01',
  '2026-02-28'
);
```

### Crear Evento
```javascript
const event = await supabaseCalendarService.createCalendarEvent({
  title: 'Reunión Vecinal',
  description: 'Reunión mensual',
  eventType: 'reunion',
  startDate: '2026-02-15T19:00:00',
  endDate: '2026-02-15T21:00:00',
  location: 'Salón Comunal',
  creatorId: userId,
  neighborhoodId: neighborhoodId,
  requiresRsvp: true
});
```

### RSVP
```javascript
await supabaseCalendarService.rsvpToEvent(eventId, userId, 'asistire');
```

---

## Fotos

### Obtener Álbumes
```javascript
const albums = await supabasePhotosService.getAlbums(userId, neighborhoodId);
```

### Crear Álbum
```javascript
const album = await supabasePhotosService.createAlbum({
  title: 'Fiesta Vecinal 2026',
  description: 'Fotos del evento',
  ownerId: userId,
  neighborhoodId: neighborhoodId,
  privacy: 'publico'
});
```

### Subir Foto
```javascript
const photo = await supabasePhotosService.uploadPhoto({
  url: photoUrl,
  caption: 'Gran momento!',
  uploaderId: userId,
  albumId: albumId,
  neighborhoodId: neighborhoodId,
  tags: ['fiesta', 'comunidad']
});
```

---

## Storage

### Subir Imagen
```javascript
const { path, url } = await supabaseStorageService.uploadImage(
  file,
  'images',
  'posts'
);
```

### Subir Múltiples Imágenes
```javascript
const results = await supabaseStorageService.uploadMultipleImages(
  files,
  'images',
  'events'
);
```

### Eliminar Imagen
```javascript
await supabaseStorageService.deleteImage(path, 'images');
```

### Obtener URL Pública
```javascript
const url = supabaseStorageService.getPublicUrl(path, 'images');
```

---

## 🔧 Manejo de Errores

Todos los servicios lanzan errores que deben ser capturados:

```javascript
try {
  const posts = await supabasePostsService.getPosts(neighborhoodId);
} catch (error) {
  console.error('Error al cargar posts:', error.message);
  // Manejar error
}
```

En Redux Thunks:

```javascript
export const loadPosts = createAsyncThunk(
  'posts/loadPosts',
  async ({ neighborhoodId }, { rejectWithValue }) => {
    try {
      const posts = await supabasePostsService.getPosts(neighborhoodId);
      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

---

## 📝 Notas Importantes

1. **Autenticación**: Siempre verificar que el usuario esté autenticado antes de llamar servicios
2. **Permisos**: Los servicios validan ownership automáticamente
3. **Real-time**: Recordar hacer cleanup de subscriptions
4. **Paginación**: Usar limit y offset para grandes conjuntos de datos
5. **Imágenes**: Usar supabaseStorageService antes de guardar URLs en otros servicios

---

## 🚀 Ejemplo Completo: Crear Post con Imagen

```javascript
import { 
  supabasePostsService, 
  supabaseStorageService 
} from '../services';

async function createPostWithImage(content, imageFile, userId, neighborhoodId) {
  try {
    // 1. Subir imagen
    const { url } = await supabaseStorageService.uploadImage(
      imageFile,
      'images',
      'posts'
    );

    // 2. Crear post con URL de imagen
    const post = await supabasePostsService.createPost({
      content,
      authorId: userId,
      neighborhoodId,
      images: [url]
    });

    return post;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

**Última Actualización:** 24 Enero 2026
