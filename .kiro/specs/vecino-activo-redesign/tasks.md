# Plan de Implementación: Rediseño de Vecino Activo

## Descripción General

Este plan convierte el diseño de Vecino Activo en una serie de tareas de implementación incrementales. Cada tarea construye sobre las anteriores, integrando componentes de forma progresiva. El enfoque es implementar funcionalidad central primero, validar con pruebas, y luego agregar características avanzadas.

## Estado Actual del Proyecto

La mayoría de la infraestructura base y características principales ya están implementadas:
- ✅ Sistema de autenticación y verificación de ubicación (LocationVerification)
- ✅ Navegación comunitaria (CommunityNavigation)
- ✅ Descubrimiento de vecinos (DiscoverNeighbors)
- ✅ Sistema de conexiones entre vecinos (ConnectionsContext)
- ✅ Sistema de necesidades locales (LocalNeeds + LocalNeedsContext)
- ✅ Sistema de acciones comunitarias (CommunityActions + CommunityActionsContext)
- ✅ Feed con priorización (Feed + feedService)
- ✅ Directorio de servicios y negocios (Directory)
- ✅ Mapa de vecindarios (NeighborhoodMap)
- ✅ Mensajería directa (DirectMessages + MessagesContext)
- ✅ Sistema de notificaciones (NotificationsCenter)
- ✅ Sistema de búsqueda (SearchModal + SearchContext)
- ✅ Sistema de moderación (ModerationContext + ReportModal)
- ✅ Onboarding básico (Onboarding + LocationVerification)
- ✅ Identidad visual comunitaria (Post rediseñado)
- ✅ Expansión dinámica de vecindarios (neighborhoodExpansionService)

## Tareas Pendientes

Las siguientes tareas se enfocan en completar funcionalidades faltantes, mejorar características existentes y agregar pruebas de propiedades:

- [x] 1. Configurar estructura de proyecto y modelos de datos
  - [x] Crear estructura de carpetas para componentes, contextos, servicios
  - [x] Implementar modelos de datos (Usuario, Necesidad, Acción, Directorio, Vecindario, Conexión, Mensaje)
  - [x] Configurar Context API para gestión de estado global
  - [x] Crear servicio de almacenamiento persistente (localStorage/base de datos)
  - _Requisitos: Todos (base para todo el sistema)_

- [x] 2. Implementar sistema de autenticación y verificación
  - [x] 2.1 Crear flujo de registro con verificación de email
    - [x] Formulario de registro con validación
    - [x] Envío de código de verificación
    - [x] Confirmación de email
    - _Requisitos: 10.1_
  
  - [x] 2.2 Crear flujo de verificación de ubicación
    - [x] Geolocalización por GPS/IP
    - [x] Validación de código postal
    - [x] Opción de validación manual
    - _Requisitos: 10.1_
  
  - [x] 2.3 Crear flujo de login y sesión
    - [x] Autenticación con email/contraseña
    - [x] Gestión de sesión persistente
    - [x] Logout seguro
    - _Requisitos: 10.1_

- [x] 3. Implementar sistema de navegación enfocado en comunidad
  - [x] 3.1 Crear navegación principal con acciones comunitarias
    - Componente de navegación con: Descubrir Vecinos, Necesidades Locales, Acciones Comunitarias, Directorio, Mapa, Mensajes, Perfil
    - Navegación adaptativa para móvil (bottom navigation)
    - Indicador visual de sección actual
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_
  
  - [-] 3.2 Ocultar características genéricas de Facebook
    - Remover o deshabilitar: Stories, Pages, Games, Music, Timeline genérico
    - Mantener solo características enfocadas en comunidad
    - _Requisitos: 1.2_

- [ ] 4. Implementar sistema de asignación de vecindarios
  - [x] 4.1 Crear lógica de asignación dinámica de vecindarios
    - Asignar usuario a vecindario basado en ubicación
    - Calcular densidad poblacional
    - _Requisitos: 17.1_
  
  - [x] 4.2 Implementar expansión dinámica de vecindarios
    - Si usuarios < 500, expandir radio geográfico
    - Si usuarios > 5000, dividir en sub-vecindarios
    - _Requisitos: 17.2, 17.3_
  
  - [~] 4.3 Implementar búsqueda multi-vecindario en UI
    - Permitir ver contenido de vecindarios adyacentes en Feed
    - Marcar claramente origen del contenido
    - Agregar toggle en Feed para incluir vecindarios adyacentes
    - _Requisitos: 17.5_

- [x] 5. Implementar sistema de descubrimiento de vecinos
  - [x] 5.1 Crear página "Descubrir Vecinos"
    - Mostrar vecinos cercanos ordenados por proximidad
    - Filtrar por intereses compartidos
    - Mostrar ubicación aproximada (100-500m)
    - _Requisitos: 2.1, 2.2, 10.3_
  
  - [x] 5.2 Crear perfil de vecino con información relevante
    - Mostrar nombre, intereses, habilidades, distancia
    - Mostrar conexiones compartidas
    - Mostrar insignias de verificación
    - _Requisitos: 2.2, 8.2, 10.2_
  
  - [ ]* 5.3 Escribir prueba de propiedad para ordenamiento de vecinos
    - **Propiedad 2: Ordenamiento de Vecinos por Proximidad**
    - **Valida: Requisitos 2.1**

- [x] 6. Implementar sistema de conexiones entre vecinos
  - [x] 6.1 Crear flujo de solicitud de conexión
    - Botón para enviar solicitud desde perfil de vecino
    - Notificación al destinatario
    - Rastreo de estado de solicitud
    - _Requisitos: 2.3_
  
  - [x] 6.2 Crear gestión de solicitudes de conexión
    - Página de solicitudes pendientes
    - Botones para aceptar/rechazar
    - Establecer conexión mutua al aceptar
    - _Requisitos: 2.4, 2.6_
  
  - [x] 6.3 Crear lista de conexiones
    - Mostrar todas las conexiones aceptadas
    - Opciones para enviar mensaje o ver perfil
    - Opción para desconectar
    - _Requisitos: 2.5_
  
  - [ ]* 6.4 Escribir prueba de propiedad para notificación de conexión
    - **Propiedad 13: Notificación de Solicitudes de Conexión**
    - **Valida: Requisitos 2.3**

- [ ] 7. Implementar sistema de privacidad de ubicación
  - [~] 7.1 Implementar privacidad de ubicación sin conexión
    - Mostrar ubicación aproximada (100-500m) para no conectados
    - Nunca mostrar ubicación exacta sin consentimiento
    - Actualizar DiscoverNeighbors para usar ubicación aproximada
    - _Requisitos: 10.3_
  
  - [~] 7.2 Implementar privacidad de ubicación con conexión
    - Permitir compartir ubicación exacta entre conectados
    - Requerir consentimiento de ambos usuarios
    - Agregar configuración en perfil de usuario
    - _Requisitos: 10.4_
  
  - [ ]* 7.3 Escribir prueba de propiedad para privacidad de ubicación
    - **Propiedad 6: Privacidad de Ubicación Sin Conexión**
    - **Propiedad 7: Privacidad de Ubicación Con Conexión**
    - **Valida: Requisitos 10.3, 10.4**

- [x] 8. Implementar sistema de necesidades locales
  - [x] 8.1 Crear página "Necesidades Locales"
    - Mostrar feed de necesidades activas
    - Ordenar por proximidad e urgencia
    - Filtrar por tipo de necesidad
    - _Requisitos: 3.5, 6.1_
  
  - [x] 8.2 Crear formulario para crear necesidad local
    - Capturar tipo (Ayuda, Recurso, Habilidad)
    - Capturar descripción y urgencia
    - Capturar ubicación
    - _Requisitos: 3.1_
  
  - [x] 8.3 Crear sistema de respuestas a necesidades
    - Permitir responder a necesidad con mensaje directo
    - Habilitar comunicación entre solicitante y respondedor
    - _Requisitos: 3.3_
  
  - [~] 8.4 Crear flujo de resolución de necesidad
    - Permitir marcar necesidad como resuelta
    - Permitir calificar al ayudante
    - Actualizar reputación del ayudante
    - _Requisitos: 3.4, 8.5_
  
  - [ ]* 8.5 Escribir prueba de propiedad para captura de campos
    - **Propiedad 3: Captura de Campos de Necesidad**
    - **Valida: Requisitos 3.1**
  
  - [ ]* 8.6 Escribir prueba de propiedad para ordenamiento de necesidades
    - **Propiedad 4: Ordenamiento de Necesidades**
    - **Valida: Requisitos 3.5**

- [~] 9. Checkpoint - Asegurar que todas las pruebas pasen
  - Ejecutar todas las pruebas de propiedades
  - Verificar que el sistema de necesidades funciona correctamente
  - Preguntar al usuario si hay dudas

- [x] 10. Implementar sistema de acciones comunitarias
  - [x] 10.1 Crear página "Acciones Comunitarias"
    - Mostrar feed de acciones próximas
    - Filtrar por tipo de acción
    - Mostrar detalles de organizador
    - _Requisitos: 4.2_
  
  - [x] 10.2 Crear formulario para crear acción comunitaria
    - Capturar título, descripción, fecha/hora
    - Capturar ubicación y habilidades requeridas
    - Capturar límite de participantes
    - _Requisitos: 4.1_
  
  - [x] 10.3 Crear sistema de participación en acciones
    - Permitir unirse a acción
    - Agregar a lista de espera si está llena
    - Enviar confirmación
    - _Requisitos: 4.3, 4.6_
  
  - [x] 10.4 Crear gestión de participantes para organizador
    - Ver lista de participantes
    - Ver lista de espera
    - Gestionar cancelaciones
    - _Requisitos: 4.4_
  
  - [~] 10.5 Crear flujo de finalización de acción
    - Permitir compartir fotos
    - Permitir retroalimentación de participantes
    - Actualizar reputación de participantes
    - _Requisitos: 4.5, 8.5_
  
  - [ ]* 10.6 Escribir prueba de propiedad para captura de campos
    - **Propiedad 5: Captura de Campos de Acción**
    - **Valida: Requisitos 4.1**

- [x] 11. Implementar sistema de feed con priorización
  - [x] 11.1 Crear algoritmo de priorización de feed
    - Implementar fórmula: R = (W_tipo * U) / ((D + 1)^2 * (T + 1))
    - Priorizar: Necesidades > Acciones > Actualizaciones > Directorio
    - _Requisitos: 6.1_
  
  - [x] 11.2 Crear página de feed principal
    - Mostrar contenido ordenado por relevancia
    - Cargar incrementalmente sin abrumar
    - Permitir filtrado por tipo de contenido
    - _Requisitos: 6.1, 6.3, 6.4_
  
  - [~] 11.3 Implementar aprendizaje de preferencias
    - Rastrear engagement del usuario
    - Ajustar ranking futuro basado en interacciones
    - _Requisitos: 6.5_
  
  - [ ]* 11.4 Escribir prueba de propiedad para priorización
    - **Propiedad 1: Priorización de Feed**
    - **Valida: Requisitos 6.1**

- [x] 12. Implementar sistema de directorio
  - [x] 12.1 Crear página "Directorio"
    - Mostrar servicios locales
    - Filtrar por categoría
    - Ordenar por proximidad y calificación
    - _Requisitos: 5.1, 5.5_
  
  - [x] 12.2 Crear formulario para agregar servicio
    - Capturar nombre, categoría, descripción
    - Capturar ubicación, contacto, horarios
    - Verificar que sea local y relevante
    - _Requisitos: 5.3_
  
  - [~] 12.3 Crear sistema de reseñas y calificaciones
    - Permitir calificar servicio
    - Permitir escribir reseña
    - Actualizar calificación promedio
    - _Requisitos: 5.4_
  
  - [x] 12.4 Crear sistema de reportes de directorio
    - Permitir reportar entrada inexacta
    - Marcar para revisión
    - Notificar al remitente
    - _Requisitos: 5.6_
  
  - [ ]* 12.5 Escribir prueba de propiedad para directorio
    - **Propiedad 11: Directorio Sin Opciones Premium**
    - **Valida: Requisitos 18.2**

- [x] 13. Implementar sistema de mensajería directa
  - [x] 13.1 Crear página "Mensajes"
    - Mostrar lista de conversaciones
    - Mostrar contador de no leídos
    - Permitir buscar conversaciones
    - _Requisitos: 7.1_
  
  - [x] 13.2 Crear interfaz de conversación
    - Mostrar historial de mensajes en orden cronológico
    - Mostrar estado en línea del vecino
    - Mostrar indicador de escritura
    - _Requisitos: 7.1, 7.4_
  
  - [x] 13.3 Crear sistema de envío de mensajes
    - Permitir enviar mensaje
    - Entregar inmediatamente
    - Notificar al destinatario
    - _Requisitos: 7.2, 7.3_
  
  - [x] 13.4 Crear flujo de inicio de conversación
    - Permitir iniciar desde perfil de vecino
    - Permitir iniciar desde solicitud de conexión
    - _Requisitos: 7.5_
  
  - [~] 13.5 Implementar bloqueo de usuarios
    - Permitir bloquear usuario
    - Prevenir toda comunicación
    - Ocultar del descubrimiento
    - _Requisitos: 7.6, 10.6_
  
  - [ ]* 13.6 Escribir prueba de propiedad para historial
    - **Propiedad 14: Historial de Mensajes**
    - **Valida: Requisitos 7.1**

- [ ] 14. Implementar sistema de perfiles de usuario
  - [~] 14.1 Crear página de perfil personal mejorada
    - Mostrar vecindario, conexiones, actividad
    - Mostrar contribuciones y reputación
    - Permitir editar información
    - _Requisitos: 8.2, 8.5_
  
  - [~] 14.2 Crear sistema de reputación
    - Calcular puntuación basada en contribuciones
    - Mostrar insignias de confianza
    - Actualizar en tiempo real
    - _Requisitos: 8.5, 8.6_
  
  - [~] 14.3 Mejorar perfil público de vecino
    - Mostrar información relevante
    - Mostrar habilidades e intereses
    - Mostrar conexiones compartidas
    - _Requisitos: 8.3_
  
  - [ ]* 14.4 Escribir prueba de propiedad para reputación
    - **Propiedad 12: Rastreo de Contribuciones**
    - **Valida: Requisitos 8.5**

- [x] 15. Implementar sistema de notificaciones
  - [x] 15.1 Crear sistema de notificaciones
    - Notificar cuando necesidad coincide con habilidades
    - Notificar cuando se crea acción comunitaria
    - Notificar cuando se recibe solicitud de conexión
    - _Requisitos: 9.1, 9.2, 9.3_
  
  - [x] 15.2 Crear centro de notificaciones
    - Mostrar todas las notificaciones
    - Permitir marcar como leída
    - Permitir configurar preferencias
    - _Requisitos: 9.6_
  
  - [x] 15.3 Implementar notificaciones de mención
    - Notificar cuando se menciona en discusión
    - Notificar cuando se recibe respuesta a necesidad
    - _Requisitos: 9.4, 9.5_

- [x] 16. Implementar sistema de mapas
  - [x] 16.1 Crear página de mapa del vecindario
    - Mostrar vecindario con marcadores
    - Mostrar vecinos cercanos, necesidades, acciones
    - Permitir filtrado por tipo de contenido
    - _Requisitos: 12.1, 12.2_
  
  - [x] 16.2 Crear interactividad del mapa
    - Permitir hacer clic en marcadores
    - Mostrar detalles de vecino, necesidad o acción
    - Permitir zoom y navegación
    - _Requisitos: 12.3, 12.4_
  
  - [~] 16.3 Implementar visualización de servicios en mapa
    - Mostrar entradas del directorio en mapa
    - Mostrar ubicación y distancia
    - Agregar marcadores para servicios locales
    - _Requisitos: 12.5_
  
  - [ ]* 16.4 Escribir prueba de propiedad para visualización
    - **Propiedad 8: Visualización de Contenido en Mapa**
    - **Valida: Requisitos 12.1**

- [x] 17. Implementar sistema de búsqueda
  - [x] 17.1 Crear búsqueda de vecinos
    - Buscar por nombre, intereses, habilidades
    - Ordenar por proximidad y relevancia
    - _Requisitos: 14.1_
  
  - [x] 17.2 Crear búsqueda de necesidades
    - Buscar por tipo, descripción, urgencia
    - Devolver solicitudes activas
    - _Requisitos: 14.2_
  
  - [x] 17.3 Crear búsqueda de acciones
    - Buscar por título, descripción, habilidades
    - Devolver acciones próximas
    - _Requisitos: 14.3_
  
  - [x] 17.4 Crear búsqueda de servicios
    - Buscar por categoría, nombre, descripción
    - Devolver entradas del directorio
    - _Requisitos: 14.4_
  
  - [x] 17.5 Implementar filtros de búsqueda
    - Filtrar por tipo de contenido
    - Filtrar por distancia
    - Filtrar por fecha
    - _Requisitos: 14.5_
  
  - [~] 17.6 Implementar historial de búsqueda
    - Sugerir búsquedas anteriores
    - Sugerir búsquedas populares locales
    - _Requisitos: 14.6_
  
  - [ ]* 17.7 Escribir prueba de propiedad para búsqueda
    - **Propiedad 9: Ordenamiento de Resultados de Búsqueda**
    - **Valida: Requisitos 14.1**

- [~] 18. Checkpoint - Asegurar que todas las pruebas pasen
  - Ejecutar todas las pruebas de propiedades
  - Verificar que todos los sistemas funcionan correctamente
  - Preguntar al usuario si hay dudas

- [x] 19. Implementar sistema de moderación comunitaria
  - [x] 19.1 Crear sistema de reportes
    - Permitir reportar contenido inapropiado
    - Capturar razón y descripción
    - Enviar a moderadores
    - _Requisitos: 10.5, 16.1_
  
  - [~] 19.2 Crear panel de moderación
    - Mostrar reportes pendientes
    - Mostrar contenido reportado con contexto
    - Permitir tomar acciones
    - _Requisitos: 16.2_
  
  - [~] 19.3 Implementar acciones de moderación
    - Advertencia al usuario
    - Eliminación de contenido
    - Suspensión de cuenta
    - _Requisitos: 16.3_
  
  - [~] 19.4 Crear sistema de apelaciones
    - Permitir apelar acciones de moderación
    - Escalar a equipo central
    - _Requisitos: 16.4_
  
  - [x] 19.5 Implementar reputación de moderadores
    - Aumentar reputación por acciones justas
    - Permitir remover moderadores abusivos
    - _Requisitos: 16.5, 16.6_

- [ ] 20. Implementar sistema de análisis
  - [~] 20.1 Crear panel de análisis para organizadores
    - Mostrar métricas comunitarias
    - Mostrar tendencias en el tiempo
    - _Requisitos: 15.1, 15.2_
  
  - [~] 20.2 Implementar filtros de análisis
    - Filtrar por período de tiempo
    - Filtrar por tipo de contenido
    - Filtrar por área geográfica
    - _Requisitos: 15.3_
  
  - [~] 20.3 Crear sugerencias de análisis
    - Sugerir acciones basadas en tendencias
    - _Requisitos: 15.4_
  
  - [~] 20.4 Implementar exportación de datos
    - Exportar reportes en CSV/PDF
    - _Requisitos: 15.5_

- [x] 21. Implementar onboarding
  - [x] 21.1 Crear flujo de onboarding
    - Guiar a través de selección de vecindario
    - Guiar a través de configuración de perfil
    - Mostrar vecindario, vecinos, necesidades
    - _Requisitos: 13.1, 13.2, 13.3_
  
  - [~] 21.2 Crear sugerencias iniciales
    - Sugerir conexiones iniciales
    - Sugerir acciones comunitarias para unirse
    - _Requisitos: 13.4_

- [x] 22. Implementar identidad visual comunitaria
  - [x] 22.1 Crear diseño visual enfocado en comunidad
    - Usar colores y imágenes que enfaticen comunidad
    - Usar lenguaje e iconos comunitarios
    - _Requisitos: 11.1, 11.2_
  
  - [x] 22.2 Implementar retroalimentación visual comunitaria
    - Feedback que se sienta enfocado en comunidad
    - Lenguaje que enfatice ayuda y contribución
    - _Requisitos: 11.3_
  
  - [x] 22.3 Implementar métricas de impacto comunitario
    - Mostrar vecinos ayudados
    - Mostrar acciones participadas
    - Mostrar recursos compartidos
    - _Requisitos: 11.6_
  
  - [x] 22.4 Rediseñar componente Post con enfoque comunitario
    - Cambiar botones de interacción a lenguaje vecinal: "Me Uno", "Opinar", "Compartir"
    - Implementar reacciones vecinales: 🤝 Apoyo, ❤️ Me importa, 👏 Bien hecho, 💡 Buena idea, 🙌 Cuenta conmigo
    - Aplicar estilos modernos con gradiente púrpura y efectos hover
    - Usar iconos comunitarios: HandshakeIcon, ChatIcon, HomeWorkIcon
    - _Requisitos: 11.1, 11.2, 11.3_

- [~] 23. Final checkpoint - Asegurar que todas las pruebas pasen
  - Ejecutar todas las pruebas de propiedades
  - Verificar que el sistema completo funciona correctamente
  - Preguntar al usuario si hay dudas

- [ ] 24. Integración y validación final
  - [~] 24.1 Validar que todas las características funcionan juntas
    - Pruebas de integración end-to-end
    - Validar flujos completos de usuario
    - _Requisitos: Todos_
  
  - [~] 24.2 Validar diferenciación de Facebook
    - Verificar que navegación es comunitaria
    - Verificar que contenido es local
    - Verificar que privacidad es protegida
    - _Requisitos: 1.1, 1.2, 11.1_
  
  - [~] 24.3 Validar seguridad y confianza
    - Verificar que ubicación exacta nunca se muestra sin consentimiento
    - Verificar que verificación funciona
    - Verificar que moderación funciona
    - _Requisitos: 10.1, 10.3, 10.4, 16.1_

## Notas

- Las tareas marcadas con `*` son pruebas de propiedades y son opcionales para MVP rápido
- **Excepción**: La Propiedad 6 (Privacidad de Ubicación) es un bloqueador de despliegue y debe implementarse
- Cada tarea construye sobre las anteriores
- Los checkpoints aseguran que el sistema funciona correctamente antes de continuar
- Las pruebas de propiedades validan corrección universal, no solo ejemplos específicos
- El sistema está diseñado para ser completamente gratuito sin opciones premium

## Validación de Privacidad (Bloqueador de Despliegue)

Para cualquier consulta de ubicación, la lógica debe garantizar:

$L_{visible} = \begin{cases} L_{exacta} & \text{si } C(u_1, u_2) = \text{Aceptada} \\ L_{approx}(r) & \text{si } C(u_1, u_2) \neq \text{Aceptada} \end{cases}$

Donde:
- $L_{visible}$: Ubicación visible al usuario
- $L_{exacta}$: Ubicación exacta del otro usuario
- $L_{approx}(r)$: Ubicación aproximada con radio de 100-500m
- $C(u_1, u_2)$: Estado de conexión entre usuarios

Si esta validación falla en cualquier punto, el despliegue debe bloquearse.
