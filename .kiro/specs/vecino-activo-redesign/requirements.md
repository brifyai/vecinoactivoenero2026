# Documento de Requisitos: Rediseño de Vecino Activo

## Introducción

Vecino Activo se está rediseñando de una red social genérica tipo Facebook a una plataforma de conexión de vecinos. La transformación se enfoca en ayudar a los vecinos a descubrirse mutuamente, abordar necesidades prácticas de la comunidad y construir conexiones locales significativas. La aplicación rediseñada se sentirá distintamente diferente de Facebook, enfatizando la acción comunitaria sobre el consumo de redes sociales. **La aplicación es completamente gratuita para todos los usuarios.**

## Glosario

- **Vecino**: Un usuario que vive en la misma área de vecindario/geográfica
- **Vecindario**: Un área geográfica definida dinámicamente basada en densidad poblacional (ej: un distrito de la ciudad, área de código postal, o límite comunitario) que se ajusta para mantener entre 500-5000 usuarios activos
- **Ubicación Aproximada**: La ubicación del usuario mostrada como un radio de 100-500 metros en lugar de la ubicación exacta de su casa
- **Verificación de Ubicación**: El proceso de confirmar que el usuario reside en el vecindario mediante geolocalización, validación de servicios públicos o código postal verificado
- **Conexión**: Una relación mutua entre vecinos (similar a "amigos" pero enfocado en el vecindario)
- **Necesidad Local**: Una solicitud de ayuda, recursos o servicios de la comunidad (ej: "buscando plomero", "necesito ayuda para mudarme")
- **Acción Comunitaria**: Una actividad o iniciativa práctica en la que los vecinos pueden participar (ej: limpieza, intercambio de habilidades, intercambio de recursos)
- **Proximidad**: Distancia geográfica entre vecinos
- **Descubrimiento**: El proceso de encontrar y aprender sobre vecinos y oportunidades locales
- **Participación**: Participación activa en actividades de vecindario y conexiones
- **Feed**: El flujo de contenido principal mostrando información relevante del vecindario
- **Directorio**: Una lista buscable de servicios locales, negocios y recursos

## Requisitos

### Requisito 1: Navegación Enfocada en el Vecindario

**Historia de Usuario:** Como vecino, quiero una navegación que enfatice la conexión de vecinos y acciones prácticas, para que pueda encontrar rápidamente lo que importa a mi comunidad en lugar de características sociales genéricas.

#### Criterios de Aceptación

1. CUANDO la aplicación carga, EL Sistema_de_Navegación DEBERÁ mostrar acciones primarias enfocadas en conexión de vecinos (Descubrir Vecinos, Necesidades Locales, Acciones Comunitarias, Directorio)
2. CUANDO un usuario ve la navegación, EL Sistema_de_Navegación NO DEBERÁ mostrar prominentemente características sociales genéricas (Historias, Páginas, Juegos, Música)
3. CUANDO un usuario navega entre secciones, EL Sistema_de_Navegación DEBERÁ mantener una jerarquía visual clara mostrando la ubicación actual
4. CUANDO la aplicación está en móvil, EL Sistema_de_Navegación DEBERÁ adaptarse a una navegación inferior o menú colapsable manteniendo la visibilidad de acciones primarias
5. DONDE un usuario tiene preferencias de vecindario establecidas, EL Sistema_de_Navegación DEBERÁ destacar secciones relevantes basadas en sus intereses

### Requisito 2: Descubrimiento y Conexión de Vecinos

**Historia de Usuario:** Como nuevo vecino, quiero descubrir y conectar con otros vecinos en mi área, para que pueda construir relaciones y encontrar personas con intereses compartidos.

#### Criterios de Aceptación

1. CUANDO un usuario abre la sección Descubrir Vecinos, EL Sistema_de_Descubrimiento DEBERÁ mostrar vecinos cercanos ordenados por proximidad e intereses compartidos
2. CUANDO un usuario ve un perfil de vecino, EL Sistema_de_Descubrimiento DEBERÁ mostrar información relevante (nombre, intereses, habilidades, ubicación, conexiones compartidas)
3. CUANDO un usuario envía una solicitud de conexión, EL Gestor_de_Conexiones DEBERÁ notificar al destinatario y rastrear el estado de la solicitud
4. CUANDO un usuario acepta una solicitud de conexión, EL Gestor_de_Conexiones DEBERÁ establecer una conexión mutua y habilitar mensajería directa
5. CUANDO un usuario ve sus conexiones, EL Gestor_de_Conexiones DEBERÁ mostrar todas las conexiones aceptadas con opciones para enviar mensajes o ver perfiles
6. SI un usuario rechaza una solicitud de conexión, ENTONCES EL Gestor_de_Conexiones DEBERÁ eliminar la solicitud y no sugerir ese usuario nuevamente durante 30 días

### Requisito 3: Necesidades Locales y Solicitudes de Ayuda

**Historia de Usuario:** Como vecino, quiero publicar y responder a necesidades locales (solicitudes de ayuda, intercambio de recursos), para que pueda contribuir a mi comunidad y obtener ayuda cuando la necesito.

#### Criterios de Aceptación

1. CUANDO un usuario crea una publicación de necesidad local, EL Sistema_de_Necesidades DEBERÁ capturar el tipo (Solicitud de Ayuda, Recurso Necesario, Habilidad Buscada), descripción y nivel de urgencia
2. CUANDO se publica una necesidad local, EL Sistema_de_Necesidades DEBERÁ notificar a vecinos relevantes basado en sus intereses y habilidades
3. CUANDO un vecino responde a una solicitud de ayuda, EL Sistema_de_Necesidades DEBERÁ habilitar comunicación directa entre el solicitante y el respondedor
4. CUANDO una necesidad local se resuelve, EL Sistema_de_Necesidades DEBERÁ permitir al solicitante marcarla como completa y opcionalmente calificar al ayudante
5. CUANDO un usuario ve el feed de Necesidades Locales, EL Sistema_de_Necesidades DEBERÁ mostrar solicitudes activas ordenadas por proximidad y urgencia
6. SI una necesidad local no recibe respuestas en 7 días, ENTONCES EL Sistema_de_Necesidades DEBERÁ sugerir aumentar visibilidad o republicar

### Requisito 4: Acciones Comunitarias y Eventos

**Historia de Usuario:** Como organizador, quiero crear y promover acciones comunitarias (limpiezas, intercambios de habilidades, intercambios de recursos), para que los vecinos puedan participar en iniciativas locales significativas.

#### Criterios de Aceptación

1. CUANDO un usuario crea una acción comunitaria, EL Sistema_de_Acciones DEBERÁ capturar título, descripción, fecha/hora, ubicación, habilidades requeridas y límite de participación
2. CUANDO se crea una acción comunitaria, EL Sistema_de_Acciones DEBERÁ mostrarla en el feed de Acciones Comunitarias y notificar a vecinos interesados
3. CUANDO un vecino se une a una acción comunitaria, EL Sistema_de_Acciones DEBERÁ agregarlo a la lista de participantes y enviar confirmación
4. CUANDO una acción comunitaria está en progreso, EL Sistema_de_Acciones DEBERÁ mostrar el conteo de participantes en tiempo real y detalles de ubicación
5. CUANDO una acción comunitaria se completa, EL Sistema_de_Acciones DEBERÁ permitir a los participantes compartir fotos y retroalimentación
6. DONDE un usuario tiene habilidades específicas, EL Sistema_de_Acciones DEBERÁ destacar acciones comunitarias que necesitan esas habilidades

### Requisito 5: Directorio de Vecindario y Servicios Locales

**Historia de Usuario:** Como vecino, quiero encontrar y compartir información sobre servicios locales y negocios, para que pueda apoyar la economía local y ayudar a otros a encontrar servicios confiables.

#### Criterios de Aceptación

1. CUANDO un usuario busca en el Directorio, EL Sistema_de_Directorio DEBERÁ mostrar servicios locales, negocios y recursos filtrados por categoría
2. CUANDO un usuario ve una entrada del directorio, EL Sistema_de_Directorio DEBERÁ mostrar información de contacto, ubicación, horarios, calificaciones y reseñas de vecinos
3. CUANDO un vecino agrega un servicio al directorio, EL Sistema_de_Directorio DEBERÁ verificar que sea local y relevante antes de publicar
4. CUANDO un usuario califica o reseña un servicio, EL Sistema_de_Directorio DEBERÁ actualizar el perfil del servicio y notificar al propietario del negocio
5. CUANDO un usuario busca un tipo de servicio específico, EL Sistema_de_Directorio DEBERÁ devolver resultados ordenados por proximidad y calificación
6. SI una entrada del directorio se reporta como inexacta, ENTONCES EL Sistema_de_Directorio DEBERÁ marcarla para revisión y notificar al remitente

### Requisito 6: Feed de Vecindario y Priorización de Contenido

**Historia de Usuario:** Como vecino, quiero un feed que muestre lo que importa a mi comunidad, para que vea información local relevante en lugar de contenido social genérico.

#### Criterios de Aceptación

1. CUANDO un usuario ve el feed principal, EL Sistema_de_Feed DEBERÁ priorizar contenido por relevancia: Necesidades Locales > Acciones Comunitarias > Actualizaciones de Vecinos > Elementos del Directorio
2. CUANDO se publica contenido, EL Sistema_de_Feed DEBERÁ determinar relevancia basado en proximidad, intereses del usuario y patrones de participación
3. CUANDO un usuario desplaza el feed, EL Sistema_de_Feed DEBERÁ cargar nuevo contenido incrementalmente sin abrumar la interfaz
4. CUANDO un usuario filtra el feed, EL Sistema_de_Feed DEBERÁ permitir filtrado por tipo de contenido (Necesidades, Acciones, Actualizaciones, Servicios)
5. CUANDO un usuario se involucra con contenido (me gusta, comenta, comparte), EL Sistema_de_Feed DEBERÁ aprender preferencias y ajustar el ranking futuro del feed
6. DONDE un usuario no se ha involucrado con la aplicación en 7 días, EL Sistema_de_Feed DEBERÁ enviar un resumen de actividad local importante

### Requisito 7: Mensajería Directa y Comunicación de Vecinos

**Historia de Usuario:** Como vecino, quiero comunicarme directamente con otros vecinos, para que pueda coordinar ayuda, discutir problemas comunitarios o construir relaciones.

#### Criterios de Aceptación

1. CUANDO un usuario abre una conversación, EL Sistema_de_Mensajería DEBERÁ mostrar el historial de mensajes con ese vecino
2. CUANDO un usuario envía un mensaje, EL Sistema_de_Mensajería DEBERÁ entregarlo inmediatamente y notificar al destinatario
3. CUANDO un usuario recibe un mensaje, EL Sistema_de_Mensajería DEBERÁ mostrar una notificación y marcar la conversación como no leída
4. CUANDO un usuario está en una conversación, EL Sistema_de_Mensajería DEBERÁ mostrar el estado en línea del vecino e indicador de escritura
5. CUANDO un usuario quiere iniciar una conversación, EL Sistema_de_Mensajería DEBERÁ permitir iniciar desde un perfil de vecino o solicitud de conexión
6. SI un usuario bloquea a otro vecino, ENTONCES EL Sistema_de_Mensajería DEBERÁ prevenir toda comunicación y ocultar al usuario bloqueado del descubrimiento

### Requisito 8: Perfil de Usuario e Identidad de Vecindario

**Historia de Usuario:** Como vecino, quiero un perfil que muestre mi identidad de vecindario y cómo puedo contribuir, para que otros vecinos puedan entender quién soy y qué ofrezco.

#### Criterios de Aceptación

1. CUANDO un usuario crea un perfil, EL Sistema_de_Perfiles DEBERÁ capturar ubicación del vecindario, intereses, habilidades y disponibilidad
2. CUANDO un usuario ve su perfil, EL Sistema_de_Perfiles DEBERÁ mostrar su vecindario, conexiones, historial de actividad y contribuciones
3. CUANDO un vecino ve el perfil de otro, EL Sistema_de_Perfiles DEBERÁ mostrar información relevante (habilidades, intereses, conexiones compartidas, distancia)
4. CUANDO un usuario actualiza sus habilidades o intereses, EL Sistema_de_Perfiles DEBERÁ actualizar su visibilidad en descubrimiento y recomendaciones de acciones
5. CUANDO un usuario completa acciones comunitarias o ayuda a vecinos, EL Sistema_de_Perfiles DEBERÁ rastrear contribuciones y mostrar una puntuación de reputación
6. DONDE un usuario tiene alta reputación, EL Sistema_de_Perfiles DEBERÁ destacarlos como miembro confiable de la comunidad

### Requisito 9: Notificaciones y Alertas Comunitarias

**Historia de Usuario:** Como vecino, quiero notificaciones oportunas sobre actividad comunitaria relevante, para que no pierda necesidades locales importantes u oportunidades.

#### Criterios de Aceptación

1. CUANDO una necesidad local coincide con las habilidades de un usuario, EL Sistema_de_Notificaciones DEBERÁ enviar una notificación con detalles y opciones de acción
2. CUANDO se crea una acción comunitaria en el vecindario del usuario, EL Sistema_de_Notificaciones DEBERÁ notificar a vecinos interesados basado en sus intereses
3. CUANDO un vecino envía una solicitud de conexión, EL Sistema_de_Notificaciones DEBERÁ notificar al destinatario con el perfil del solicitante
4. CUANDO un usuario se menciona en una discusión comunitaria, EL Sistema_de_Notificaciones DEBERÁ enviar una notificación con contexto
5. CUANDO la solicitud de ayuda de un usuario recibe una respuesta, EL Sistema_de_Notificaciones DEBERÁ notificarlo inmediatamente
6. DONDE un usuario tiene preferencias de notificación establecidas, EL Sistema_de_Notificaciones DEBERÁ respetar preferencias de frecuencia y tipo

### Requisito 10: Seguridad del Vecindario y Confianza

**Historia de Usuario:** Como vecino, quiero sentirme seguro y confiar en las personas con las que me estoy conectando, para que pueda participar con confianza en actividades comunitarias.

#### Criterios de Aceptación

1. CUANDO un usuario crea una cuenta, EL Sistema_de_Confianza DEBERÁ verificar su ubicación de vecindario mediante geolocalización, validación de servicios públicos o código postal verificado
2. CUANDO un usuario ve el perfil de otro, EL Sistema_de_Confianza DEBERÁ mostrar insignias de verificación (correo verificado, vecindario verificado, contribuidor activo)
3. CUANDO un usuario no ha establecido una conexión mutua, EL Sistema_de_Confianza DEBERÁ mostrar su ubicación como un área aproximada (radio de 100-500m) en lugar de su ubicación exacta
4. CUANDO dos usuarios establecen una conexión mutua, EL Sistema_de_Confianza DEBERÁ permitir compartir ubicación más precisa si ambos lo consienten
5. CUANDO un usuario reporta comportamiento inapropiado, EL Sistema_de_Confianza DEBERÁ enviar el reporte a moderadores comunitarios verificados o equipo central para investigación
6. CUANDO un usuario bloquea a otro vecino, EL Sistema_de_Confianza DEBERÁ prevenir toda interacción y ocultarlos del descubrimiento
7. CUANDO se organiza una acción comunitaria, EL Sistema_de_Confianza DEBERÁ mostrar reputación del organizador y reseñas de participantes
8. SI un usuario tiene múltiples reportes de comportamiento inapropiado, ENTONCES EL Sistema_de_Confianza DEBERÁ suspender su cuenta pendiente de revisión

### Requisito 11: Identidad Visual y Enfoque en Vecindario

**Historia de Usuario:** Como usuario, quiero que la aplicación se sienta distintamente enfocada en la comunidad y diferente de Facebook, para que me recuerde que esto es sobre conexión de vecindario, no consumo de redes sociales.

#### Criterios de Aceptación

1. CUANDO la aplicación carga, EL Sistema_Visual DEBERÁ mostrar un diseño que enfatice la comunidad (mapa de vecindario, colores locales, imágenes comunitarias)
2. CUANDO un usuario ve la interfaz, EL Sistema_Visual DEBERÁ usar lenguaje e iconos que enfaticen conexión de vecindario (Vecinos, Necesidades Locales, Acciones Comunitarias)
3. CUANDO un usuario interactúa con contenido, EL Sistema_Visual DEBERÁ proporcionar retroalimentación que se sienta enfocada en la comunidad (ayudando, conectando, contribuyendo)
4. CUANDO la aplicación muestra notificaciones, EL Sistema_Visual DEBERÁ usar lenguaje e imágenes relevantes a la comunidad
5. CUANDO un usuario ve su perfil, EL Sistema_Visual DEBERÁ enfatizar su vecindario y contribuciones a la comunidad
6. DONDE la aplicación muestra métricas, EL Sistema_Visual DEBERÁ mostrar impacto comunitario (vecinos ayudados, acciones en las que participó, recursos compartidos)

### Requisito 12: Mapa de Vecindario y Contexto Geográfico

**Historia de Usuario:** Como vecino, quiero ver mi vecindario en un mapa y entender el contexto geográfico, para que pueda encontrar vecinos cercanos y oportunidades locales.

#### Criterios de Aceptación

1. CUANDO un usuario abre el mapa del vecindario, EL Sistema_de_Mapas DEBERÁ mostrar su vecindario con vecinos cercanos, necesidades locales y acciones comunitarias
2. CUANDO un usuario ve el mapa, EL Sistema_de_Mapas DEBERÁ mostrar su ubicación y permitir filtrado por tipo de contenido
3. CUANDO un usuario hace clic en un marcador del mapa, EL Sistema_de_Mapas DEBERÁ mostrar detalles sobre ese vecino, necesidad o acción
4. CUANDO un usuario amplía el mapa, EL Sistema_de_Mapas DEBERÁ ajustar el nivel de detalle y mostrar/ocultar marcadores apropiadamente
5. CUANDO un usuario quiere encontrar servicios cercanos, EL Sistema_de_Mapas DEBERÁ mostrar entradas del directorio con ubicación y distancia
6. DONDE un usuario tiene compartir ubicación habilitado, EL Sistema_de_Mapas DEBERÁ mostrar su ubicación a otros vecinos (con controles de privacidad)

### Requisito 13: Incorporación y Configuración de Vecindario

**Historia de Usuario:** Como nuevo usuario, quiero un proceso de incorporación claro que me ayude a configurar mi perfil de vecindario, para que pueda comenzar rápidamente a conectar con vecinos.

#### Criterios de Aceptación

1. CUANDO un nuevo usuario se registra, EL Sistema_de_Incorporación DEBERÁ guiarlo a través de la selección de vecindario y configuración de perfil
2. CUANDO un usuario completa la incorporación, EL Sistema_de_Incorporación DEBERÁ mostrarle su vecindario, vecinos cercanos y necesidades locales
3. CUANDO un usuario omite pasos de incorporación, EL Sistema_de_Incorporación DEBERÁ permitirle completar la configuración más tarde
4. CUANDO un usuario termina la incorporación, EL Sistema_de_Incorporación DEBERÁ sugerir conexiones iniciales y acciones comunitarias para unirse
5. CUANDO un usuario regresa a la aplicación después de la incorporación, EL Sistema_de_Incorporación NO DEBERÁ mostrar la incorporación nuevamente
6. DONDE un usuario cambia su vecindario, EL Sistema_de_Incorporación DEBERÁ actualizar su perfil y mostrar nuevo contenido local

### Requisito 14: Búsqueda y Descubrimiento en Contenido de Vecindario

**Historia de Usuario:** Como vecino, quiero buscar vecinos, necesidades, acciones y servicios, para que pueda encontrar lo que busco rápidamente.

#### Criterios de Aceptación

1. CUANDO un usuario busca un vecino, EL Sistema_de_Búsqueda DEBERÁ devolver resultados ordenados por proximidad y relevancia
2. CUANDO un usuario busca una necesidad local, EL Sistema_de_Búsqueda DEBERÁ devolver solicitudes activas que coincidan con los términos de búsqueda
3. CUANDO un usuario busca una acción comunitaria, EL Sistema_de_Búsqueda DEBERÁ devolver acciones próximas con palabras clave coincidentes
4. CUANDO un usuario busca un servicio, EL Sistema_de_Búsqueda DEBERÁ devolver entradas del directorio con categorías o nombres coincidentes
5. CUANDO un usuario ve resultados de búsqueda, EL Sistema_de_Búsqueda DEBERÁ mostrar filtros para tipo de contenido, distancia y fecha
6. DONDE un usuario tiene historial de búsqueda, EL Sistema_de_Búsqueda DEBERÁ sugerir búsquedas anteriores y búsquedas locales populares

### Requisito 15: Análisis e Información de la Comunidad

**Historia de Usuario:** Como organizador de vecindario, quiero entender la actividad y participación de la comunidad, para que pueda identificar necesidades y oportunidades de mejora.

#### Criterios de Aceptación

1. CUANDO un organizador de vecindario ve análisis, EL Sistema_de_Análisis DEBERÁ mostrar métricas comunitarias (vecinos activos, necesidades locales publicadas, acciones completadas)
2. CUANDO un organizador ve el panel, EL Sistema_de_Análisis DEBERÁ mostrar tendencias en el tiempo (crecimiento, participación, tipos de actividad)
3. CUANDO un organizador filtra análisis, EL Sistema_de_Análisis DEBERÁ permitir filtrado por período de tiempo, tipo de contenido y área geográfica
4. CUANDO un organizador identifica una tendencia, EL Sistema_de_Análisis DEBERÁ sugerir acciones para abordar necesidades comunitarias
5. CUANDO un organizador exporta datos, EL Sistema_de_Análisis DEBERÁ proporcionar reportes en formatos estándar (CSV, PDF)
6. DONDE un organizador tiene acceso de administrador, EL Sistema_de_Análisis DEBERÁ mostrar métricas detalladas y registros de actividad de usuarios

### Requisito 16: Moderación Comunitaria y Gobernanza

**Historia de Usuario:** Como organizador de vecindario, quiero que la comunidad se autorregule con moderadores verificados, para que el contenido inapropiado se maneje rápidamente sin depender de un equipo central.

#### Criterios de Aceptación

1. CUANDO un usuario reporta contenido inapropiado, EL Sistema_de_Moderación DEBERÁ enviar el reporte a moderadores comunitarios verificados (usuarios con alta reputación)
2. CUANDO un moderador revisa un reporte, EL Sistema_de_Moderación DEBERÁ mostrar el contenido reportado, razón del reporte y contexto
3. CUANDO un moderador toma una acción (advertencia, eliminación de contenido, suspensión), EL Sistema_de_Moderación DEBERÁ notificar al usuario afectado y registrar la acción
4. CUANDO un usuario apela una acción de moderación, EL Sistema_de_Moderación DEBERÁ escalar a un equipo central para revisión
5. CUANDO un moderador actúa consistentemente de manera justa, EL Sistema_de_Moderación DEBERÁ aumentar su reputación y visibilidad
6. SI un moderador abusa de su poder, ENTONCES EL Sistema_de_Moderación DEBERÁ permitir que otros moderadores lo remuevan de su rol

### Requisito 17: Vecindarios Dinámicos y Escalabilidad Geográfica

**Historia de Usuario:** Como usuario en una ciudad densa, quiero que mi vecindario tenga un tamaño manejable con actividad relevante, para que el feed no esté abrumado ni vacío.

#### Criterios de Aceptación

1. CUANDO un usuario se registra, EL Sistema_de_Vecindarios DEBERÁ asignarle un vecindario basado en su ubicación y densidad poblacional local
2. CUANDO un vecindario tiene menos de 500 usuarios activos, EL Sistema_de_Vecindarios DEBERÁ expandir el radio geográfico para incluir más usuarios
3. CUANDO un vecindario tiene más de 5000 usuarios activos, EL Sistema_de_Vecindarios DEBERÁ dividirlo en sub-vecindarios basados en límites geográficos naturales
4. CUANDO un usuario se muda a un nuevo vecindario, EL Sistema_de_Vecindarios DEBERÁ actualizar su asignación y mostrar nuevo contenido local
5. CUANDO un usuario quiere conectar con vecindarios adyacentes, EL Sistema_de_Vecindarios DEBERÁ permitir ver contenido de áreas cercanas con filtros claros
6. DONDE un usuario tiene intereses específicos, EL Sistema_de_Vecindarios DEBERÁ permitir unirse a grupos de interés que cruzan límites de vecindarios

### Requisito 18: Directorio Comunitario Completamente Gratuito

**Historia de Usuario:** Como propietario de negocio local, quiero que mi servicio sea visible en el directorio de forma completamente gratuita, para que los vecinos puedan encontrarme sin barreras económicas.

#### Criterios de Aceptación

1. CUANDO un negocio local se agrega al directorio, EL Sistema_de_Directorio DEBERÁ ofrecerlo de forma completamente gratuita con información completa
2. CUANDO un usuario busca un servicio, EL Sistema_de_Directorio DEBERÁ mostrar todos los resultados ordenados por proximidad, calificación y relevancia sin opciones premium
3. CUANDO un negocio tiene alta calificación de vecinos, EL Sistema_de_Directorio DEBERÁ destacarlo naturalmente en resultados de búsqueda
4. CUANDO un usuario ve un servicio en el directorio, EL Sistema_de_Directorio DEBERÁ mostrar información verificada, calificaciones y reseñas de vecinos
5. CUANDO un negocio es reportado como fraudulento, EL Sistema_de_Directorio DEBERÁ investigar y remover la entrada si se confirma
6. DONDE un negocio tiene múltiples reseñas positivas, EL Sistema_de_Directorio DEBERÁ aumentar su visibilidad en búsquedas relevantes
