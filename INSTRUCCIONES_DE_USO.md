# 📖 INSTRUCCIONES DE USO - FRIENDBOOK

## 🚀 INICIO RÁPIDO

### 1. La aplicación ya está corriendo
La aplicación está actualmente ejecutándose en:
```
http://localhost:3003
```

### 2. Usuarios de prueba disponibles
Puedes iniciar sesión con cualquiera de estos usuarios:

```
Usuario 1:
Email: josephin.water@gmail.com
Password: 123456

Usuario 2:
Email: paige.turner@gmail.com
Password: 123456

Usuario 3:
Email: bob.frapples@gmail.com
Password: 123456
```

---

## 🎯 GUÍA DE FUNCIONALIDADES

### 📝 PUBLICACIONES

#### Crear una publicación:
1. En la página Home, click en "¿Qué estás pensando?"
2. Se abre el modal de crear publicación
3. Escribe tu texto
4. (Opcional) Agrega una imagen usando el componente de subida
5. (Opcional) Agrega un estado de ánimo (😊 feliz, 😍 enamorado, etc.)
6. (Opcional) Agrega una ubicación
7. Selecciona privacidad (Público, Amigos, Solo yo)
8. Click en "Publicar"

#### Interactuar con publicaciones:
- **Reaccionar:** Click en el botón de reacción y elige (Like, Love, Haha, Wow, Sad, Angry)
- **Comentar:** Click en "Comentar" y escribe tu comentario
- **Compartir:** Click en "Compartir" para compartir la publicación

---

### 👥 AMIGOS

#### Agregar amigos:
1. Ir a la página "Friends"
2. En la sección "Sugerencias de Amigos"
3. Click en "Agregar Amigo"
4. El usuario recibirá una solicitud

#### Gestionar solicitudes:
1. Ir a la página "Friends"
2. Tab "Solicitudes"
3. Click en "Aceptar" o "Rechazar"

#### Ver tus amigos:
1. Ir a la página "Friends"
2. Tab "Mis Amigos"
3. Puedes eliminar amigos con el botón "Eliminar"

---

### 💬 CHAT/MENSAJERÍA

#### Enviar mensajes:
1. Ir a la página "Messenger"
2. Selecciona una conversación de la lista (o crea una nueva)
3. Escribe tu mensaje en el campo de texto
4. Click en el botón de enviar o presiona Enter
5. El mensaje se guarda automáticamente

#### Ver conversaciones:
- Las conversaciones aparecen en el sidebar izquierdo
- Los mensajes no leídos muestran un contador
- Click en cualquier conversación para abrirla

#### Buscar conversaciones:
- Usa el campo de búsqueda en la parte superior
- Escribe el nombre del usuario

---

### 👨‍👩‍👧‍👦 GRUPOS

#### Crear un grupo:
1. Ir a la página "Groups"
2. Click en "Crear Grupo"
3. Ingresa el nombre del grupo
4. El grupo se crea automáticamente

#### Unirse a un grupo:
1. Ir a la página "Groups"
2. Tab "Descubrir"
3. Busca grupos sugeridos
4. Click en "Unirse al Grupo"

#### Ver tus grupos:
1. Ir a la página "Groups"
2. Tab "Tus Grupos"
3. Puedes ver todos los grupos a los que perteneces
4. Click en "Salir del Grupo" para abandonar

---

### 📅 EVENTOS

#### Crear un evento:
1. Ir a la página "Events"
2. Click en "Crear Evento" (botón en el sidebar)
3. Ingresa el nombre del evento
4. El evento se crea con datos por defecto

#### RSVP a un evento:
1. Ir a la página "Events"
2. Busca el evento que te interesa
3. Click en "Me Interesa" o "Asistiré"
4. Tu respuesta se guarda automáticamente

#### Filtrar eventos:
1. Usa los botones de categoría (Todos, Música, Tecnología, etc.)
2. Los eventos se filtran automáticamente

#### Ver eventos próximos:
- En el sidebar derecho verás los próximos 3 eventos
- El calendario muestra días con eventos

---

### 🖼️ IMÁGENES

#### Cambiar foto de perfil:
1. Ir a la página "Settings"
2. En la sección "Foto de Perfil"
3. Click en "Cambiar Foto"
4. Selecciona una imagen de tu computadora
5. La imagen se comprime y guarda automáticamente

#### Cambiar foto de portada:
1. Ir a la página "Timeline" (tu perfil)
2. Click en "Editar Portada"
3. Selecciona una imagen
4. La imagen se guarda automáticamente

#### Agregar imagen a publicación:
1. Al crear una publicación
2. Usa el componente de subida de imágenes
3. Click en "Cambiar Foto" o arrastra una imagen
4. Preview de la imagen antes de publicar

---

### 🔍 BÚSQUEDA

#### Buscar en la aplicación:
1. Click en el icono de búsqueda en el header
2. Escribe lo que buscas
3. Selecciona el tipo: Usuarios, Publicaciones, Páginas
4. Los resultados aparecen automáticamente

---

### 🔔 NOTIFICACIONES

#### Ver notificaciones:
1. Click en el icono de campana en el header
2. Se abre el dropdown con tus notificaciones
3. Notificaciones de:
   - Solicitudes de amistad
   - Reacciones a tus publicaciones
   - Comentarios en tus publicaciones
   - Menciones

#### Marcar como leída:
- Las notificaciones se marcan automáticamente al verlas

---

### ⚙️ CONFIGURACIÓN

#### Cambiar tema (Modo Oscuro):
1. Ir a la página "Settings"
2. Toggle "Modo Oscuro"
3. El tema cambia inmediatamente
4. La preferencia se guarda en localStorage

#### Editar perfil:
1. Ir a la página "Settings"
2. Edita tu información:
   - Nombre
   - Email
   - Biografía
   - Ubicación
   - Sitio web
3. Click en "Guardar Cambios"

---

## 💾 PERSISTENCIA DE DATOS

Todos los datos se guardan en localStorage:
- Usuarios y sesiones
- Publicaciones y comentarios
- Amigos y solicitudes
- Conversaciones de chat
- Grupos y eventos
- Notificaciones
- Preferencias (modo oscuro)

**Nota:** Los datos persisten entre sesiones, pero se borran si limpias el localStorage del navegador.

---

## 🔄 CERRAR SESIÓN

1. Click en tu avatar en el header
2. Se abre el dropdown de perfil
3. Click en "Cerrar Sesión"
4. Serás redirigido a la página de login

---

## 🆕 CREAR NUEVA CUENTA

1. En la página de login, click en "Crear cuenta nueva"
2. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña
   - Confirmar contraseña
3. Click en "Registrarse"
4. Tu cuenta se crea automáticamente
5. Serás redirigido al Home

---

## 🎨 CARACTERÍSTICAS ESPECIALES

### Estados de Ánimo:
Al crear una publicación, puedes agregar cómo te sientes:
- 😊 feliz
- 😍 enamorado
- 😎 genial
- 😢 triste
- 😂 divertido
- 🎉 celebrando
- 💪 motivado
- 😴 cansado

### Privacidad de Publicaciones:
- **Público:** Todos pueden ver
- **Amigos:** Solo tus amigos
- **Solo yo:** Solo tú

### Reacciones:
6 tipos de reacciones disponibles:
- 👍 Like
- ❤️ Love
- 😂 Haha
- 😮 Wow
- 😢 Sad
- 😠 Angry

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### La aplicación no carga:
1. Verifica que el servidor esté corriendo en http://localhost:3003
2. Refresca la página (F5 o Cmd+R)
3. Limpia el caché del navegador

### No puedo iniciar sesión:
1. Verifica que estés usando uno de los usuarios de prueba
2. Asegúrate de que el email y contraseña sean correctos
3. Si creaste una cuenta nueva, usa esas credenciales

### Las imágenes no se cargan:
1. Verifica que el archivo sea una imagen válida (JPG, PNG, GIF, WEBP)
2. Asegúrate de que el archivo no sea mayor a 5MB
3. Verifica el espacio de localStorage disponible

### Los datos desaparecieron:
1. Verifica que no hayas limpiado el localStorage del navegador
2. Los datos se guardan por dominio/puerto
3. Si cambias de puerto, los datos no estarán disponibles

---

## 📱 PÁGINAS DISPONIBLES

1. **Home** - Feed principal con publicaciones
2. **Timeline** - Tu perfil personal
3. **Friends** - Gestión de amigos
4. **Groups** - Grupos y comunidades
5. **Events** - Eventos y calendario
6. **Messenger** - Chat y mensajería
7. **Photos** - Galería de fotos
8. **Pages** - Páginas que te gustan
9. **Weather** - Widget de clima
10. **Music** - Reproductor de música
11. **Games** - Juegos y torneos
12. **Birthday** - Cumpleaños de amigos
13. **Calendar** - Calendario de eventos
14. **Favorites** - Contenido favorito
15. **History** - Historial de actividad
16. **Settings** - Configuración de cuenta
17. **About** - Acerca de Friendbook
18. **Help** - Centro de ayuda
19. **Contact** - Contacto y soporte

---

## 🎉 ¡DISFRUTA DE FRIENDBOOK!

La aplicación está completamente funcional y lista para usar. Explora todas las características y diviértete conectando con amigos.

**¿Preguntas o problemas?** Revisa la documentación en `PROYECTO_COMPLETADO.md`

