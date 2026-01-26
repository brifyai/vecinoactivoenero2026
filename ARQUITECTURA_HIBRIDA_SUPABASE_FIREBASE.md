# Arquitectura Híbrida: Supabase + Firebase

## Resumen

La aplicación Vecino Activo utiliza una arquitectura híbrida que combina:
- **Supabase Self-Hosted**: Base de datos principal, autenticación, storage
- **Firebase**: Realtime (mensajes y notificaciones en tiempo real)

## Distribución de Responsabilidades

### Supabase Self-Hosted (`supabase.vecinoactivo.cl`)

#### ✅ Base de Datos (PostgreSQL)
- Usuarios (`users`)
- Posts (`posts`)
- Comentarios (`comments`)
- Notificaciones (`notifications`)
- Mensajes (`messages`)
- Eventos, grupos, proyectos, etc.

#### ✅ Autenticación
- Login/Register (custom auth con tabla `users`)
- Sesiones persistentes en localStorage
- Tokens de acceso

#### ✅ Storage
- Imágenes de perfil
- Fotos de posts
- Archivos adjuntos
- Documentos

#### ❌ Realtime (WebSocket)
- **NO DISPONIBLE** en Supabase self-hosted sin configuración adicional
- Los intentos de conexión WebSocket fallan
- Se usa Firebase en su lugar

### Firebase (`stratega-ai-x.firebaseapp.com`)

#### ✅ Firestore Realtime
- Mensajes en tiempo real
- Notificaciones push
- Estado de presencia de usuarios
- Actualizaciones de posts en tiempo real

#### ✅ Cloud Messaging (FCM)
- Push notifications
- Notificaciones en background
- Service Worker para notificaciones

#### ❌ Autenticación
- NO se usa Firebase Auth
- Se usa autenticación custom de Supabase

#### ❌ Storage
- NO se usa Firebase Storage
- Se usa Supabase Storage

## Flujo de Datos

### 1. Autenticación
```
Usuario → Login Form → customAuthService → Supabase DB
                                        ↓
                                  localStorage (sesión)
```

### 2. Posts y Contenido
```
Usuario → Crear Post → Supabase DB (posts table)
                            ↓
                      Firebase Firestore (sync para realtime)
                            ↓
                      Otros usuarios reciben actualización
```

### 3. Mensajes en Tiempo Real
```
Usuario A → Enviar Mensaje → Supabase DB (messages table)
                                    ↓
                              Firebase Firestore (sync)
                                    ↓
                              Usuario B recibe mensaje instantáneo
```

### 4. Notificaciones
```
Evento → Crear Notificación → Supabase DB (notifications table)
                                    ↓
                              Firebase FCM
                                    ↓
                              Push notification al usuario
```

## Servicios y Hooks

### Supabase Services
- `supabaseAuthService.js` - Autenticación
- `supabasePostsService.js` - CRUD de posts
- `supabaseMessagesService.js` - CRUD de mensajes
- `supabaseNotificationsService.js` - CRUD de notificaciones
- `supabaseStorageService.js` - Upload/download de archivos

### Firebase Services
- `firebaseMessagesService.js` - Realtime de mensajes
- `firebaseNotificationsService.js` - Realtime de notificaciones
- `pushNotificationService.js` - FCM push notifications

### Hooks
- `useSupabaseRealtime.js` - **DESHABILITADO** (solo carga datos, no realtime)
- `useFirebaseMessages.js` - Mensajes en tiempo real
- `useFirebaseNotifications.js` - Notificaciones en tiempo real
- `useHybridRealtime.js` - Coordinador híbrido

## Configuración

### Variables de Entorno

```env
# Supabase
REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyBZQYW7aRY1o07IW3NwCXY-v6Q85mMCCNU
REACT_APP_FIREBASE_AUTH_DOMAIN=stratega-ai-x.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=stratega-ai-x
REACT_APP_FIREBASE_STORAGE_BUCKET=stratega-ai-x.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=777409222994
REACT_APP_FIREBASE_APP_ID=1:777409222994:web:4b23f04e44e4a38aca428b
REACT_APP_FIREBASE_VAPID_KEY=<tu-vapid-key>
```

## Ventajas de esta Arquitectura

1. **Costo**: Supabase self-hosted es gratis, solo pagas el servidor
2. **Control**: Tienes control total sobre los datos en tu servidor
3. **Realtime**: Firebase proporciona realtime robusto y escalable
4. **Simplicidad**: No necesitas configurar realtime en Supabase
5. **Escalabilidad**: Firebase maneja millones de conexiones simultáneas

## Desventajas

1. **Complejidad**: Dos sistemas para mantener
2. **Sincronización**: Debes sincronizar datos entre Supabase y Firebase
3. **Costos Firebase**: Firebase tiene costos por uso (aunque generoso en tier gratuito)
4. **Latencia**: Doble escritura (Supabase + Firebase) puede agregar latencia

## Migración Futura

Si en el futuro quieres usar solo Supabase:

1. Configurar Supabase Realtime en tu servidor
2. Habilitar extensión `pg_net` y `supabase_realtime`
3. Configurar políticas RLS para realtime
4. Reemplazar hooks de Firebase con `useSupabaseRealtime`
5. Eliminar dependencias de Firebase

## Monitoreo

### Logs Importantes
- `✅ Datos cargados de [tabla]` - Supabase carga exitosa
- `🔥 Firebase conectado` - Firebase realtime activo
- `⚠️ WebSocket no disponible` - Supabase realtime no configurado (esperado)
- `🔄 Firebase no disponible, usando polling` - Fallback a polling

### Métricas a Monitorear
- Latencia de escritura en Supabase
- Latencia de sincronización a Firebase
- Conexiones activas en Firebase
- Uso de FCM (push notifications)
- Errores de sincronización

## Soporte

Para problemas:
1. Verificar logs en consola del navegador
2. Verificar estado de Supabase: `https://supabase.vecinoactivo.cl/health`
3. Verificar Firebase Console para errores
4. Revisar service worker para notificaciones

---

**Última actualización**: Enero 2026
**Versión**: 1.0
