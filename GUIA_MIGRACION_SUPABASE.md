# Guía de Migración a Supabase

## Estado Actual

✅ **Paso 1 Completado:** Esquema de base de datos creado en Supabase  
🔄 **Paso 2 En Progreso:** Configuración de Supabase Client  
⏳ **Paso 3 Pendiente:** Migración de datos  
⏳ **Paso 4 Pendiente:** Actualización de Redux slices  
⏳ **Paso 5 Pendiente:** Testing y validación

---

## Paso 2: Configuración de Supabase Client

### Archivos Creados

1. **`src/config/supabase.js`** - Cliente de Supabase configurado
2. **`src/services/supabaseAuthService.js`** - Servicio de autenticación
3. **`src/services/supabasePostsService.js`** - Servicio de publicaciones
4. **`database_functions.sql`** - Funciones SQL auxiliares

### Variables de Entorno Necesarias

Agregar al archivo `.env`:

```env
REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Instalación Completada

```bash
npm install @supabase/supabase-js
```

---

## Paso 3: Ejecutar Funciones SQL

Ejecutar en Supabase SQL Editor:

```bash
# Copiar contenido de database_functions.sql y ejecutar en Supabase
```

**Funciones creadas:**
- `increment_post_comments()` - Incrementar contador de comentarios
- `decrement_post_comments()` - Decrementar contador de comentarios
- `increment_comment_likes()` - Incrementar likes en comentarios
- `increment_project_votes()` - Incrementar votos en proyectos
- `decrement_project_votes()` - Decrementar votos en proyectos
- `increment_poll_votes()` - Incrementar votos en encuestas
- `increment_poll_option_votes()` - Incrementar votos en opciones
- `update_business_rating()` - Actualizar rating de negocios
- `find_neighborhood_by_point()` - Buscar vecindario por coordenadas
- `find_nearby_neighborhoods()` - Buscar vecindarios cercanos
- `get_neighborhood_stats()` - Obtener estadísticas de vecindario
- `mark_notifications_read()` - Marcar notificaciones como leídas
- `get_user_conversations()` - Obtener conversaciones de usuario

---

## Paso 4: Migración de Datos (Opcional)

Si tienes datos en localStorage que quieres migrar:

### Script de Migración

```javascript
// src/utils/migrateToSupabase.js
import { supabase } from '../config/supabase';
import storageService from '../services/storageService';

export async function migrateLocalStorageToSupabase() {
  try {
    console.log('🔄 Iniciando migración...');
    
    // 1. Migrar usuarios
    const users = storageService.getUsers();
    console.log(`📦 Migrando ${users.length} usuarios...`);
    
    for (const user of users) {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: '123456', // Contraseña temporal
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });
      
      if (authError) {
        console.error(`Error al migrar usuario ${user.email}:`, authError);
        continue;
      }
      
      // Crear perfil en tabla users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio,
          neighborhood_id: user.neighborhoodId,
          neighborhood_name: user.neighborhoodName,
          neighborhood_code: user.neighborhoodCode,
          verified: user.verified || false,
          email_verified: true
        }]);
      
      if (userError) {
        console.error(`Error al crear perfil ${user.email}:`, userError);
      }
    }
    
    // 2. Migrar posts
    const posts = storageService.getPosts();
    console.log(`📦 Migrando ${posts.length} posts...`);
    
    // ... continuar con posts, eventos, etc.
    
    console.log('✅ Migración completada');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}
```

---

## Paso 5: Actualizar Redux Slices

### Ejemplo: authSlice.js

**Antes (localStorage):**
```javascript
import storageService from '../../services/storageService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const users = storageService.getUsers();
    const user = users.find(u => u.email === email);
    return user;
  }
);
```

**Después (Supabase):**
```javascript
import supabaseAuthService from '../../services/supabaseAuthService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user, session } = await supabaseAuthService.login(email, password);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Slices a Actualizar

1. ✅ **authSlice.js** - Usar `supabaseAuthService`
2. ⏳ **postsSlice.js** - Usar `supabasePostsService`
3. ⏳ **messagesSlice.js** - Crear `supabaseMessagesService`
4. ⏳ **eventsSlice.js** - Crear `supabaseEventsService`
5. ⏳ **groupsSlice.js** - Crear `supabaseGroupsService`
6. ⏳ **friendsSlice.js** - Crear `supabaseFriendsService`
7. ⏳ **notificationsSlice.js** - Crear `supabaseNotificationsService`
8. ⏳ **projectsSlice.js** - Crear `supabaseProjectsService`
9. ⏳ **pollsSlice.js** - Crear `supabasePollsService`
10. ⏳ **localBusinessSlice.js** - Crear `supabaseBusinessService`
11. ⏳ **sharedResourcesSlice.js** - Crear `supabaseResourcesService`
12. ⏳ **helpRequestsSlice.js** - Crear `supabaseHelpService`

---

## Paso 6: Configurar Storage para Imágenes

### Crear Buckets en Supabase

```sql
-- Crear bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Crear bucket para posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true);

-- Crear bucket para eventos
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true);

-- Crear bucket para negocios
INSERT INTO storage.buckets (id, name, public)
VALUES ('businesses', 'businesses', true);
```

### Políticas de Storage

```sql
-- Permitir subida de avatares autenticados
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir lectura pública de avatares
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Servicio de Upload

```javascript
// src/services/supabaseStorageService.js
import { supabase } from '../config/supabase';

class SupabaseStorageService {
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async uploadPostImage(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}

export default new SupabaseStorageService();
```

---

## Paso 7: Implementar Real-time

### Suscripciones en Componentes

```javascript
import { useEffect } from 'react';
import { supabase } from '../config/supabase';

function Feed() {
  useEffect(() => {
    // Suscribirse a nuevos posts
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('Nuevo post:', payload.new);
        // Actualizar estado con nuevo post
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <div>Feed</div>;
}
```

---

## Paso 8: Testing

### Checklist de Pruebas

- [ ] Registro de usuario
- [ ] Login de usuario
- [ ] Logout de usuario
- [ ] Crear publicación
- [ ] Comentar publicación
- [ ] Reaccionar a publicación
- [ ] Enviar mensaje
- [ ] Crear evento
- [ ] Unirse a grupo
- [ ] Votar en encuesta
- [ ] Crear proyecto
- [ ] Registrar negocio
- [ ] Solicitar ayuda
- [ ] Real-time notifications
- [ ] Upload de imágenes

---

## Paso 9: Despliegue

### Variables de Entorno en Producción

Configurar en EasyPanel:

```env
REACT_APP_SUPABASE_URL=https://supabase.vecinoactivo.cl
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Build y Deploy

```bash
npm run build
# Deploy automático con git push
```

---

## Troubleshooting

### Error: "Invalid API key"
- Verificar que `REACT_APP_SUPABASE_ANON_KEY` esté configurada
- Verificar que la key sea la correcta en Supabase Dashboard

### Error: "Row Level Security"
- Verificar políticas RLS en Supabase
- Temporalmente deshabilitar RLS para testing:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ```

### Error: "Connection refused"
- Verificar que `REACT_APP_SUPABASE_URL` sea correcta
- Verificar que Supabase esté corriendo

---

## Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [PostGIS Functions](https://postgis.net/docs/reference.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## Próximos Pasos

1. ✅ Ejecutar `database_functions.sql` en Supabase
2. ⏳ Configurar variables de entorno
3. ⏳ Crear servicios para todas las entidades
4. ⏳ Actualizar Redux slices
5. ⏳ Implementar Storage
6. ⏳ Testing completo
7. ⏳ Deploy a producción

---

**Última actualización:** Enero 2026
