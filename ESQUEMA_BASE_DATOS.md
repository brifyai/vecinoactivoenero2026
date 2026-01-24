# Esquema de Base de Datos - Vecino Activo

## Resumen Ejecutivo

Este documento describe el esquema completo de base de datos para la aplicación **Vecino Activo**, una plataforma de red social comunitaria que conecta vecinos y fomenta la participación ciudadana.

**Base de Datos:** PostgreSQL (Supabase)  
**Total de Tablas:** 35 tablas principales  
**Extensiones:** PostGIS (para datos geoespaciales), UUID-OSSP

---

## Estructura General

### 1. **Módulo de Usuarios y Autenticación**

#### `users` - Usuarios
Tabla principal de usuarios del sistema.

**Campos principales:**
- `id` (UUID): Identificador único
- `email` (VARCHAR): Email único
- `password` (VARCHAR): Contraseña encriptada
- `name` (VARCHAR): Nombre completo
- `avatar` (TEXT): URL del avatar
- `phone` (VARCHAR): Teléfono
- `bio` (TEXT): Biografía
- `neighborhood_id`, `neighborhood_name`, `neighborhood_code`: Información del vecindario
- `verified`, `email_verified` (BOOLEAN): Estados de verificación
- `created_at`, `updated_at`, `last_login`: Timestamps

**Relaciones:**
- Uno a muchos con: posts, events, groups, projects, messages, notifications

---

### 2. **Módulo Social**

#### `friendships` - Amistades
Gestiona las relaciones de amistad entre usuarios.

**Campos:**
- `user_id`, `friend_id` (UUID): Referencias a usuarios
- `status` (VARCHAR): pending, accepted, rejected
- `created_at`, `accepted_at`: Timestamps

#### `posts` - Publicaciones
Publicaciones en el feed social.

**Campos:**
- `author_id` (UUID): Autor de la publicación
- `content` (TEXT): Contenido
- `image` (TEXT): URL de imagen
- `feeling`, `location`, `privacy`, `category`: Metadata
- `hashtags` (TEXT[]): Array de hashtags
- `likes`, `comments_count`, `shares`: Contadores

#### `post_reactions` - Reacciones a publicaciones
Emojis y reacciones a posts.

**Campos:**
- `post_id`, `user_id`: Referencias
- `emoji` (VARCHAR): Emoji de reacción

#### `comments` - Comentarios
Comentarios en publicaciones.

**Campos:**
- `post_id`, `author_id`: Referencias
- `content` (TEXT): Contenido del comentario
- `likes`: Contador de likes

---

### 3. **Módulo de Mensajería**

#### `messages` - Mensajes directos
Mensajes privados entre usuarios.

**Campos:**
- `sender_id`, `recipient_id` (UUID): Remitente y destinatario
- `content` (TEXT): Contenido del mensaje
- `read` (BOOLEAN): Estado de lectura

#### `notifications` - Notificaciones
Sistema de notificaciones.

**Campos:**
- `user_id`, `from_user_id`: Usuario receptor y emisor
- `type` (VARCHAR): Tipo de notificación
- `message` (TEXT): Mensaje
- `read` (BOOLEAN): Estado de lectura
- `post_id`, `event_id`, `project_id`: Referencias opcionales

---

### 4. **Módulo de Eventos**

#### `events` - Eventos
Eventos comunitarios.

**Campos:**
- `slug` (VARCHAR): URL amigable única
- `title`, `description`: Información básica
- `date`, `time`, `location`: Detalles del evento
- `image` (TEXT): Imagen del evento
- `created_by` (UUID): Organizador
- `category`, `privacy`: Metadata

#### `event_attendees` - Asistentes
Relación muchos a muchos entre eventos y usuarios.

**Campos:**
- `event_id`, `user_id`: Referencias
- `status` (VARCHAR): going, interested, not-going

---

### 5. **Módulo de Grupos**

#### `groups` - Grupos
Grupos comunitarios.

**Campos:**
- `slug`, `name`, `description`, `image`: Información básica
- `created_by` (UUID): Creador
- `privacy` (VARCHAR): Privacidad del grupo

#### `group_members` - Miembros de grupos
Membresía en grupos.

**Campos:**
- `group_id`, `user_id`: Referencias
- `role` (VARCHAR): admin, member

#### `group_posts` - Publicaciones en grupos
Posts específicos de grupos.

**Campos:**
- `group_id`, `user_id`: Referencias
- `content`, `image`: Contenido

---

### 6. **Módulo de Proyectos Comunitarios**

#### `projects` - Proyectos
Proyectos de mejora comunitaria.

**Campos:**
- `slug`, `title`, `description`, `category`: Información básica
- `status` (VARCHAR): propuesta, en_progreso, completado
- `creator_id` (UUID): Creador
- `neighborhood_id`, `neighborhood_name`, `neighborhood_code`: Vecindario
- `budget`, `funding_goal`, `current_funding`: Financiamiento
- `votes`: Contador de votos
- `start_date`, `end_date`, `completion_date`: Fechas
- `priority`, `tags`, `images`: Metadata

#### `project_volunteers` - Voluntarios
Voluntarios en proyectos.

**Campos:**
- `project_id`, `user_id`: Referencias
- `joined_at`: Fecha de unión

#### `project_voters` - Votantes
Votos en proyectos.

**Campos:**
- `project_id`, `user_id`: Referencias
- `voted_at`: Fecha de voto

#### `project_updates` - Actualizaciones
Actualizaciones de progreso.

**Campos:**
- `project_id`, `author_id`: Referencias
- `content`, `images`: Contenido

---

### 7. **Módulo de Encuestas**

#### `polls` - Encuestas
Votaciones comunitarias.

**Campos:**
- `title`, `description`: Información
- `status` (VARCHAR): active, closed
- `creator_id` (UUID): Creador
- `neighborhood_id`: Vecindario
- `total_votes`: Contador
- `ends_at`: Fecha de cierre

#### `poll_options` - Opciones
Opciones de votación.

**Campos:**
- `poll_id`: Referencia
- `text`: Texto de la opción
- `votes`: Contador

#### `poll_votes` - Votos
Votos individuales.

**Campos:**
- `poll_id`, `option_id`, `user_id`: Referencias
- `voted_at`: Timestamp

---

### 8. **Módulo de Negocios Locales**

#### `local_businesses` - Negocios
Directorio de negocios locales.

**Campos:**
- `name`, `description`, `category`, `subcategory`: Información básica
- `owner_id` (UUID): Dueño
- `neighborhood_id`, `neighborhood_name`, `neighborhood_code`: Vecindario
- `address`, `phone`, `email`, `website`, `whatsapp`, `instagram`, `facebook`: Contacto
- `hours` (JSONB): Horarios
- `images`, `logo`, `tags`, `services`: Media y servicios
- `price_range`, `accepts_cards`, `has_delivery`: Opciones
- `rating`, `total_reviews`: Calificación
- `is_verified`, `is_active`: Estados

#### `business_reviews` - Reseñas
Reseñas de negocios.

**Campos:**
- `business_id`, `user_id`: Referencias
- `rating` (INTEGER): 1-5 estrellas
- `comment`, `images`: Contenido

#### `business_offers` - Ofertas
Promociones de negocios.

**Campos:**
- `business_id`: Referencia
- `title`, `description`, `discount`, `code`, `terms`: Información
- `valid_until`: Fecha de expiración
- `is_active`: Estado

---

### 9. **Módulo de Recursos Compartidos**

#### `shared_resources` - Recursos
Recursos para préstamo entre vecinos.

**Campos:**
- `slug`, `name`, `description`, `category`, `subcategory`: Información
- `owner_id` (UUID): Dueño
- `neighborhood_id`, `neighborhood_name`, `neighborhood_code`: Vecindario
- `condition`, `images`: Estado
- `requires_deposit`, `deposit_amount`: Depósito
- `max_loan_days`, `rules`: Reglas de préstamo
- `is_available`, `total_loans`, `rating`: Estado y estadísticas

#### `resource_reservations` - Reservas
Reservas de recursos.

**Campos:**
- `resource_id`, `owner_id`, `borrower_id`: Referencias
- `start_date`, `end_date`: Fechas
- `purpose`: Propósito
- `status` (VARCHAR): pendiente, activa, completada, cancelada
- `deposit_paid`, `returned_in_good_condition`, `borrower_rating`: Evaluación

---

### 10. **Módulo de Ayuda Vecinal**

#### `help_requests` - Solicitudes de ayuda
Solicitudes de ayuda entre vecinos.

**Campos:**
- `slug`, `type`, `title`, `description`: Información
- `urgency` (VARCHAR): baja, normal, alta, urgente
- `status` (VARCHAR): abierta, en_proceso, resuelta, cancelada
- `requester_id` (UUID): Solicitante
- `neighborhood_id`, `neighborhood_name`, `neighborhood_code`: Vecindario
- `location`, `images`: Detalles
- `accepted_offer_id`: Oferta aceptada
- `resolved_at`: Fecha de resolución

#### `help_offers` - Ofertas de ayuda
Ofertas para ayudar.

**Campos:**
- `request_id`, `helper_id`: Referencias
- `message`, `availability`: Detalles

---

### 11. **Módulo de Calendario Comunitario**

#### `community_calendar` - Calendario
Eventos del calendario comunitario.

**Campos:**
- `title`, `description`, `type`: Información
- `date`, `start_time`, `end_time`, `location`: Detalles
- `organizer_id` (UUID): Organizador
- `neighborhood_id`, `neighborhood_name`, `neighborhood_code`: Vecindario
- `is_recurring`, `recurrence_pattern` (JSONB): Recurrencia
- `max_attendees`, `reminders` (JSONB): Configuración
- `images`, `tags`, `is_public`: Metadata

#### `calendar_attendees` - Asistentes
Confirmaciones de asistencia.

**Campos:**
- `event_id`, `user_id`: Referencias
- `confirmed_at`: Timestamp

---

### 12. **Módulo de Fotos**

#### `photos` - Fotos
Fotos de usuarios.

**Campos:**
- `user_id`, `album_id`: Referencias
- `url`, `caption`, `tags`: Información
- `uploaded_at`: Timestamp

#### `photo_albums` - Álbumes
Álbumes de fotos.

**Campos:**
- `user_id`: Referencia
- `name`, `description`, `cover_photo`: Información

---

### 13. **Módulo de Vecindarios**

#### `neighborhoods` - Vecindarios
Unidades vecinales con datos geoespaciales.

**Campos:**
- `id`, `codigo`, `nombre`: Identificación
- `comuna`, `region`: Ubicación administrativa
- `personas`, `hogares`: Demografía
- `geometry` (GEOMETRY): Polígono geoespacial (PostGIS)
- `properties` (JSONB): Propiedades adicionales

---

## Índices y Optimización

### Índices Principales

**Usuarios:**
- `idx_users_email`: Búsqueda por email
- `idx_users_neighborhood`: Filtrado por vecindario

**Posts:**
- `idx_posts_author`: Posts por autor
- `idx_posts_created`: Ordenamiento cronológico
- `idx_posts_category`: Filtrado por categoría

**Mensajes:**
- `idx_messages_sender`, `idx_messages_recipient`: Búsqueda de conversaciones
- `idx_messages_created`: Ordenamiento cronológico

**Eventos:**
- `idx_events_date`: Búsqueda por fecha
- `idx_events_slug`: Búsqueda por URL

**Proyectos:**
- `idx_projects_neighborhood`: Filtrado por vecindario
- `idx_projects_status`: Filtrado por estado

**Negocios:**
- `idx_businesses_category`: Filtrado por categoría
- `idx_businesses_verified`: Negocios verificados

**Vecindarios:**
- `idx_neighborhoods_geometry`: Índice espacial (GIST) para consultas geográficas
- `idx_neighborhoods_codigo`: Búsqueda por código

---

## Triggers y Funciones

### `update_updated_at_column()`
Función que actualiza automáticamente el campo `updated_at` en cada UPDATE.

**Aplicado a:**
- users, posts, events, groups, projects, polls, local_businesses, shared_resources, help_requests, community_calendar

---

## Row Level Security (RLS)

### Políticas Implementadas

**users:**
- `users_select_own`: Los usuarios pueden ver su propia información
- `users_update_own`: Los usuarios pueden actualizar su propia información

**posts, messages, notifications:**
- RLS habilitado para protección de datos sensibles

---

## Relaciones Principales

### Uno a Muchos
- `users` → `posts`, `events`, `groups`, `projects`, `messages`, `notifications`
- `posts` → `comments`, `post_reactions`
- `events` → `event_attendees`
- `groups` → `group_members`, `group_posts`
- `projects` → `project_volunteers`, `project_voters`, `project_updates`
- `polls` → `poll_options`, `poll_votes`
- `local_businesses` → `business_reviews`, `business_offers`
- `shared_resources` → `resource_reservations`
- `help_requests` → `help_offers`

### Muchos a Muchos
- `users` ↔ `users` (a través de `friendships`)
- `users` ↔ `events` (a través de `event_attendees`)
- `users` ↔ `groups` (a través de `group_members`)
- `users` ↔ `projects` (a través de `project_volunteers`, `project_voters`)

---

## Tipos de Datos Especiales

### JSONB
Usado para datos estructurados flexibles:
- `local_businesses.hours`: Horarios de atención
- `community_calendar.recurrence_pattern`: Patrones de recurrencia
- `community_calendar.reminders`: Configuración de recordatorios
- `neighborhoods.properties`: Propiedades adicionales

### GEOMETRY (PostGIS)
- `neighborhoods.geometry`: Polígonos de unidades vecinales (MultiPolygon, SRID 4326)

### Arrays (TEXT[])
- `posts.hashtags`: Lista de hashtags
- `projects.tags`, `projects.images`: Tags e imágenes
- `local_businesses.tags`, `local_businesses.services`, `local_businesses.images`
- `shared_resources.images`
- `help_requests.images`
- `community_calendar.images`, `community_calendar.tags`
- `photos.tags`

---

## Consideraciones de Seguridad

1. **Contraseñas**: Deben almacenarse encriptadas (bcrypt, argon2)
2. **RLS**: Implementado en tablas sensibles
3. **Validaciones**: Constraints en ratings (1-5), estados (enums)
4. **Cascadas**: ON DELETE CASCADE para mantener integridad referencial
5. **Índices**: Optimización de consultas frecuentes

---

## Migración y Despliegue

### Pasos para Implementar

1. **Crear extensiones:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   ```

2. **Ejecutar schema:**
   ```bash
   psql -U postgres -d vecino_activo -f database_schema.sql
   ```

3. **Verificar tablas:**
   ```sql
   \dt
   ```

4. **Cargar datos geoespaciales:**
   ```bash
   # Importar GeoJSON de unidades vecinales
   ogr2ogr -f "PostgreSQL" PG:"dbname=vecino_activo" \
     public/data/geo/unidades_vecinales_simple.geojson \
     -nln neighborhoods
   ```

---

## Mantenimiento

### Tareas Periódicas

1. **Vacuum y Analyze:**
   ```sql
   VACUUM ANALYZE;
   ```

2. **Reindexar:**
   ```sql
   REINDEX DATABASE vecino_activo;
   ```

3. **Backup:**
   ```bash
   pg_dump vecino_activo > backup_$(date +%Y%m%d).sql
   ```

---

## Estadísticas del Esquema

- **Total de Tablas:** 35
- **Total de Índices:** ~40
- **Total de Triggers:** 10
- **Relaciones:** ~60
- **Campos con Geolocalización:** 1 (neighborhoods.geometry)
- **Campos JSONB:** 4
- **Campos Array:** ~15

---

## Próximos Pasos

1. ✅ Implementar esquema en Supabase
2. ⏳ Migrar datos de localStorage a PostgreSQL
3. ⏳ Actualizar servicios para usar Supabase Client
4. ⏳ Implementar autenticación con Supabase Auth
5. ⏳ Configurar Storage para imágenes
6. ⏳ Implementar Real-time subscriptions
7. ⏳ Optimizar consultas y añadir más índices según uso

---

## Contacto y Soporte

Para dudas sobre el esquema o implementación, contactar al equipo de desarrollo.

**Última actualización:** Enero 2026
