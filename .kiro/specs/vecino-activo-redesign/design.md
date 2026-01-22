# Documento de Diseño: Rediseño de Vecino Activo

## Descripción General

Vecino Activo se rediseña como una plataforma de conexión de vecinos que enfatiza la acción comunitaria sobre el consumo de redes sociales. El sistema prioriza necesidades locales, acciones comunitarias y conexiones significativas entre vecinos. La arquitectura se organiza alrededor de conceptos geográficos (vecindarios dinámicos) y tipos de contenido específicos (necesidades, acciones, servicios).

## Arquitectura

### Capas del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Capa de Presentación                      │
│  (Interfaz de Usuario, Componentes, Navegación)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Capa de Lógica de Negocio                │
│  (Gestión de Vecindarios, Feed, Búsqueda, Moderación)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Capa de Datos                             │
│  (Usuarios, Contenido, Conexiones, Ubicaciones)            │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales

1. **Sistema de Navegación**: Enfocado en acciones comunitarias (Descubrir Vecinos, Necesidades Locales, Acciones Comunitarias, Directorio)
2. **Sistema de Descubrimiento**: Encuentra vecinos por proximidad e intereses
3. **Sistema de Necesidades**: Publica y responde a solicitudes de ayuda
4. **Sistema de Acciones**: Crea y participa en iniciativas comunitarias
5. **Sistema de Directorio**: Busca servicios locales verificados
6. **Sistema de Feed**: Prioriza contenido por relevancia comunitaria
7. **Sistema de Mensajería**: Comunicación directa entre vecinos
8. **Sistema de Perfiles**: Identidad de vecindario y reputación
9. **Sistema de Mapas**: Contexto geográfico y visualización
10. **Sistema de Confianza**: Verificación, privacidad y seguridad
11. **Sistema de Moderación**: Autorregulación comunitaria
12. **Sistema de Vecindarios**: Asignación dinámica basada en densidad

## Modelos de Datos

### Usuario
```
{
  id: string,
  email: string,
  nombre: string,
  vecindario_id: string,
  ubicacion_aproximada: {
    latitud: number,
    longitud: number,
    radio_metros: number  // 100-500m
  },
  ubicacion_exacta: {
    latitud: number,
    longitud: number
  },
  perfil: {
    intereses: string[],
    habilidades: string[],
    disponibilidad: string,
    bio: string
  },
  reputacion: {
    puntuacion: number,
    acciones_completadas: number,
    vecinos_ayudados: number,
    calificacion_promedio: number
  },
  verificacion: {
    email_verificado: boolean,
    ubicacion_verificada: boolean,
    metodo_verificacion: 'geolocation' | 'utility_bill' | 'postal_code'
  },
  privacidad: {
    compartir_ubicacion: boolean,
    mostrar_ubicacion_exacta: boolean,
    conexiones_mutuas_solo: boolean
  },
  bloqueados: string[],
  rol: 'usuario' | 'moderador' | 'admin',
  estado: 'activo' | 'suspendido' | 'eliminado',
  fecha_creacion: timestamp,
  ultima_actividad: timestamp
}
```

### Necesidad Local
```
{
  id: string,
  usuario_id: string,
  vecindario_id: string,
  tipo: 'solicitud_ayuda' | 'recurso_necesario' | 'habilidad_buscada',
  titulo: string,
  descripcion: string,
  urgencia: 'baja' | 'media' | 'alta' | 'critica',
  ubicacion: {
    latitud: number,
    longitud: number,
    radio_metros: number
  },
  habilidades_requeridas: string[],
  respuestas: {
    usuario_id: string,
    mensaje: string,
    timestamp: timestamp
  }[],
  estado: 'activa' | 'en_progreso' | 'resuelta' | 'cancelada',
  calificacion_resolutor: {
    usuario_id: string,
    puntuacion: number,
    comentario: string
  },
  fecha_creacion: timestamp,
  fecha_vencimiento: timestamp,
  fecha_resolucion: timestamp
}
```

### Acción Comunitaria
```
{
  id: string,
  organizador_id: string,
  vecindario_id: string,
  titulo: string,
  descripcion: string,
  fecha_inicio: timestamp,
  fecha_fin: timestamp,
  ubicacion: {
    latitud: number,
    longitud: number,
    nombre: string
  },
  habilidades_requeridas: string[],
  limite_participantes: number,
  participantes: {
    usuario_id: string,
    fecha_union: timestamp,
    estado: 'confirmado' | 'cancelado'
  }[],
  lista_espera: string[],  // Usuarios esperando si hay cancelaciones
  fotos: string[],
  retroalimentacion: {
    usuario_id: string,
    comentario: string,
    calificacion: number
  }[],
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada',
  fecha_creacion: timestamp
}
```

### Entrada de Directorio
```
{
  id: string,
  nombre_negocio: string,
  categoria: string,
  descripcion: string,
  ubicacion: {
    latitud: number,
    longitud: number,
    direccion: string
  },
  contacto: {
    telefono: string,
    email: string,
    sitio_web: string
  },
  horarios: {
    lunes_viernes: string,
    sabado: string,
    domingo: string
  },
  propietario_id: string,
  vecindario_id: string,
  calificacion_promedio: number,
  resenas: {
    usuario_id: string,
    calificacion: number,
    comentario: string,
    fecha: timestamp
  }[],
  verificado: boolean,
  reportes: {
    usuario_id: string,
    razon: string,
    fecha: timestamp
  }[],
  estado: 'activo' | 'suspendido' | 'eliminado',
  fecha_creacion: timestamp
}
```

### Vecindario
```
{
  id: string,
  nombre: string,
  centro: {
    latitud: number,
    longitud: number
  },
  radio_metros: number,
  usuarios_activos: number,
  densidad_poblacional: number,
  estado: 'activo' | 'dividido' | 'fusionado',
  sub_vecindarios: string[],
  vecindario_padre: string,
  fecha_creacion: timestamp,
  ultima_actualizacion: timestamp
}
```

### Conexión
```
{
  id: string,
  usuario_1_id: string,
  usuario_2_id: string,
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'bloqueada',
  fecha_solicitud: timestamp,
  fecha_respuesta: timestamp,
  bloqueado_por: string  // null si no está bloqueado
}
```

### Mensaje
```
{
  id: string,
  remitente_id: string,
  destinatario_id: string,
  contenido: string,
  leido: boolean,
  fecha_envio: timestamp,
  fecha_lectura: timestamp
}
```

### Reporte de Moderación
```
{
  id: string,
  reportador_id: string,
  contenido_id: string,
  tipo_contenido: 'necesidad' | 'accion' | 'mensaje' | 'perfil',
  razon: string,
  descripcion: string,
  estado: 'pendiente' | 'en_revision' | 'resuelto' | 'rechazado',
  moderador_id: string,
  accion_tomada: 'advertencia' | 'eliminacion' | 'suspension' | 'ninguna',
  fecha_reporte: timestamp,
  fecha_resolucion: timestamp
}
```

## Interfaces y Componentes

### Navegación Principal
- **Descubrir Vecinos**: Explora vecinos cercanos con filtros por intereses
- **Necesidades Locales**: Ve y publica solicitudes de ayuda
- **Acciones Comunitarias**: Participa en iniciativas locales
- **Directorio**: Busca servicios locales verificados
- **Mapa**: Visualiza contenido en contexto geográfico
- **Mensajes**: Comunícate con vecinos conectados
- **Perfil**: Gestiona tu identidad y reputación

### Flujos Principales

#### Flujo de Descubrimiento de Vecinos
1. Usuario abre "Descubrir Vecinos"
2. Sistema obtiene vecinos en el mismo vecindario
3. Filtra por intereses compartidos
4. Ordena por proximidad
5. Muestra perfiles con ubicación aproximada
6. Usuario puede enviar solicitud de conexión

#### Flujo de Necesidad Local
1. Usuario abre "Necesidades Locales"
2. Elige crear nueva necesidad
3. Selecciona tipo (Ayuda, Recurso, Habilidad)
4. Completa descripción y urgencia
5. Sistema notifica vecinos relevantes
6. Responden con mensajes directos
7. Usuario marca como resuelta y califica

#### Flujo de Acción Comunitaria
1. Usuario abre "Acciones Comunitarias"
2. Elige crear nueva acción
3. Completa detalles (fecha, ubicación, habilidades)
4. Sistema notifica vecinos interesados
5. Vecinos se unen como participantes
6. Organizador gestiona participantes
7. Después de completar, comparten fotos y retroalimentación

#### Flujo de Búsqueda de Servicios
1. Usuario abre "Directorio"
2. Busca por categoría o término
3. Sistema devuelve resultados ordenados por proximidad y calificación
4. Usuario ve detalles, horarios, reseñas
5. Puede contactar directamente o dejar reseña

## Algoritmos Clave

### Algoritmo de Priorización de Feed (Mejorado)

La relevancia de una publicación se calcula usando una fórmula que considera el tipo de contenido, urgencia, proximidad y tiempo transcurrido:

$$R = \frac{(W_{tipo} \cdot U)}{(D + 1)^2 \cdot (T + 1)}$$

Donde:
- **W_tipo**: Peso del tipo de contenido (Necesidades: 1.0, Acciones: 0.8, Actualizaciones: 0.5, Directorio: 0.3)
- **U**: Nivel de urgencia (Crítica: 4, Alta: 3, Media: 2, Baja: 1)
- **D**: Distancia en kilómetros desde el usuario
- **T**: Tiempo transcurrido en horas desde la publicación

Esta fórmula asegura que:
- Las necesidades críticas se priorizan inicialmente pero pierden relevancia rápidamente
- El contenido cercano siempre es más relevante
- El contenido antiguo se desvanece naturalmente del feed

### Algoritmo de Búsqueda Multi-Vecindario

Para evitar el efecto "isla" donde usuarios pierden contenido relevante en vecindarios adyacentes:

```
CUANDO usuario busca contenido:
  1. Buscar en vecindario_id del usuario
  2. Buscar en radio de proximidad física (independiente de vecindario_id)
  3. Combinar resultados ordenados por:
     a. Proximidad física
     b. Relevancia de contenido
     c. Fecha de publicación
  4. Marcar claramente contenido de vecindarios adyacentes
```

### Algoritmo de Asignación de Vecindarios (Mejorado)
```
SI usuarios_activos < 500:
  expandir_radio_geografico(+20%)
SI usuarios_activos > 5000:
  dividir_en_sub_vecindarios()
  basado en limites geograficos naturales
  
PARA usuarios en limites de vecindarios:
  permitir_ver_contenido_vecindarios_adyacentes()
  con_filtro_claro_de_origen()
```

### Algoritmo de Cálculo de Reputación
```
puntuacion_reputacion = (
  (acciones_completadas * 10) +
  (calificacion_promedio * 20) +
  (vecinos_ayudados * 5) +
  (tiempo_activo_meses * 2) -
  (reportes_confirmados * 50)
)

insignia_confianza:
  SI puntuacion >= 100: "Miembro Confiable"
  SI puntuacion >= 50: "Contribuidor Activo"
  SI puntuacion >= 0: "Nuevo Miembro"
```

### Algoritmo de Privacidad de Ubicación
```
SI conexion_mutua_establecida:
  mostrar_ubicacion_exacta = true
SINO:
  mostrar_ubicacion_aproximada(radio_100_500m)
  
SI usuario_bloquea_otro:
  ocultar_ubicacion_completamente()
```

## Estrategia de Pruebas

### Propiedades de Corrección

Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas del sistema. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de corrección verificables por máquina.

#### Propiedad 1: Priorización de Feed
*Para cualquier* feed de contenido mixto, el contenido debe aparecer ordenado por: Necesidades Locales > Acciones Comunitarias > Actualizaciones de Vecinos > Elementos del Directorio.
**Valida: Requisitos 6.1**

#### Propiedad 2: Ordenamiento de Vecinos por Proximidad
*Para cualquier* lista de vecinos en la sección Descubrir, los vecinos deben estar ordenados por distancia geográfica (más cercanos primero).
**Valida: Requisitos 2.1**

#### Propiedad 3: Captura de Campos de Necesidad
*Para cualquier* necesidad local creada, todos los campos requeridos (tipo, descripción, urgencia) deben ser capturados y almacenados.
**Valida: Requisitos 3.1**

#### Propiedad 4: Ordenamiento de Necesidades
*Para cualquier* feed de necesidades locales, las necesidades deben estar ordenadas por proximidad e urgencia (más urgentes y cercanas primero).
**Valida: Requisitos 3.5**

#### Propiedad 5: Captura de Campos de Acción
*Para cualquier* acción comunitaria creada, todos los campos requeridos (título, descripción, fecha, ubicación, habilidades, límite) deben ser capturados.
**Valida: Requisitos 4.1**

#### Propiedad 6: Privacidad de Ubicación Sin Conexión
*Para cualquier* usuario sin conexión mutua establecida, su ubicación debe mostrarse como un área aproximada (radio de 100-500m), no como ubicación exacta.
**Valida: Requisitos 10.3**

#### Propiedad 7: Privacidad de Ubicación Con Conexión
*Para cualquier* par de usuarios con conexión mutua establecida, ambos pueden compartir ubicación exacta si ambos lo consienten.
**Valida: Requisitos 10.4**

#### Propiedad 8: Visualización de Contenido en Mapa
*Para cualquier* mapa de vecindario abierto, debe mostrar vecinos cercanos, necesidades locales y acciones comunitarias.
**Valida: Requisitos 12.1**

#### Propiedad 9: Ordenamiento de Resultados de Búsqueda
*Para cualquier* búsqueda de vecino, los resultados deben estar ordenados por proximidad y relevancia.
**Valida: Requisitos 14.1**

#### Propiedad 10: Expansión Dinámica de Vecindarios
*Para cualquier* vecindario con menos de 500 usuarios activos, el radio geográfico debe expandirse automáticamente.
**Valida: Requisitos 17.2**

#### Propiedad 11: Directorio Sin Opciones Premium
*Para cualquier* búsqueda de servicios, todos los resultados deben mostrarse sin filtros premium, ordenados por proximidad y calificación.
**Valida: Requisitos 18.2**

#### Propiedad 12: Rastreo de Contribuciones
*Para cualquier* usuario que completa acciones comunitarias, su puntuación de reputación debe aumentar.
**Valida: Requisitos 8.5**

#### Propiedad 13: Notificación de Solicitudes de Conexión
*Para cualquier* solicitud de conexión enviada, el destinatario debe recibir una notificación con el perfil del solicitante.
**Valida: Requisitos 2.3**

#### Propiedad 14: Historial de Mensajes
*Para cualquier* conversación abierta, todos los mensajes previos deben mostrarse en orden cronológico.
**Valida: Requisitos 7.1**

#### Propiedad 15: Navegación Enfocada en Comunidad
*Para cualquier* navegación principal, las acciones primarias deben ser: Descubrir Vecinos, Necesidades Locales, Acciones Comunitarias, Directorio.
**Valida: Requisitos 1.1**

## Manejo de Errores

### Errores de Ubicación
- **Ubicación no disponible**: Mostrar opción para ingresar manualmente o usar código postal
- **Ubicación fuera de servicio**: Permitir al usuario seleccionar vecindario manualmente
- **Verificación fallida**: Ofrecer métodos alternativos (servicios públicos, código postal)

### Errores de Conexión
- **Solicitud duplicada**: Mostrar solicitud existente en lugar de crear nueva
- **Usuario bloqueado**: Mostrar mensaje que el usuario está bloqueado
- **Usuario no encontrado**: Mostrar que el usuario no existe o fue eliminado

### Errores de Contenido
- **Contenido reportado**: Mostrar en revisión hasta que moderador actúe
- **Usuario suspendido**: Ocultar contenido del usuario suspendido
- **Contenido eliminado**: Mostrar que fue eliminado por violación de políticas

### Errores de Búsqueda
- **Sin resultados**: Sugerir búsquedas alternativas o vecindarios adyacentes
- **Búsqueda vacía**: Mostrar contenido popular o recomendado
- **Búsqueda lenta**: Mostrar indicador de carga y permitir cancelar

## Consideraciones de Seguridad

1. **Privacidad de Ubicación**: Nunca mostrar ubicación exacta sin consentimiento mutuo. Esta es una prueba de despliegue bloqueante (deployment blocker).
2. **Verificación de Identidad**: Requerir verificación de email y ubicación antes de participar. Considerar integración futura con autoridades locales (ej: Presidentes de Juntas de Vecinos como validadores).
3. **Moderación de Contenido**: Revisar reportes rápidamente para mantener comunidad segura. Usar moderadores comunitarios verificados como primera línea.
4. **Bloqueo de Usuarios**: Permitir bloquear usuarios problemáticos completamente.
5. **Auditoría de Acciones**: Registrar todas las acciones de moderación para transparencia.
6. **Protección de Datos**: Encriptar ubicaciones exactas y datos sensibles.
7. **Validación de Ubicación**: Métodos soportados:
   - Geolocalización por GPS/IP
   - Validación de servicios públicos (recibos)
   - Código postal verificado
   - Validación manual por moderadores locales (futuro)

## Consideraciones de Rendimiento

1. **Carga Incremental**: Cargar contenido del feed incrementalmente sin abrumar
2. **Caché de Vecindarios**: Cachear asignaciones de vecindarios para búsquedas rápidas
3. **Índices de Búsqueda**: Indexar contenido por proximidad para búsquedas rápidas
4. **Paginación**: Paginar resultados de búsqueda para evitar cargas grandes
5. **Compresión de Ubicación**: Usar geohashing para comparaciones rápidas de proximidad
6. **Shadow Testing**: Antes de desplegar expansión dinámica de vecindarios, realizar shadow testing con simulaciones de carga geográfica
7. **Monitoreo de Frontera**: Monitorear usuarios en límites de vecindarios para asegurar que no pierdan contenido relevante

## Diferenciación de Facebook

| Aspecto | Facebook | Vecino Activo |
|--------|----------|---------------|
| Enfoque | Conexión social global | Conexión local comunitaria |
| Contenido Primario | Posts personales, fotos | Necesidades locales, acciones |
| Navegación | Timeline, Amigos, Grupos | Descubrir Vecinos, Necesidades, Acciones |
| Privacidad | Amigos/Público | Ubicación aproximada por defecto |
| Objetivo | Consumo de contenido | Acción comunitaria |
| Métrica de Éxito | Engagement, Tiempo en app | Necesidades resueltas, Acciones completadas |
| Monetización | Publicidad | Completamente gratuito |
| Moderación | Equipo central | Moderadores comunitarios + equipo central |

## Próximos Pasos de Implementación

1. Configurar estructura de base de datos con modelos definidos
2. Implementar sistema de autenticación y verificación de ubicación
3. Crear componentes de navegación enfocados en comunidad
4. Implementar algoritmo de asignación de vecindarios dinámicos
5. Desarrollar sistema de feed con priorización
6. Crear interfaces de necesidades locales y acciones comunitarias
7. Implementar sistema de mensajería directa
8. Desarrollar sistema de moderación comunitaria
9. Crear visualización de mapas con contenido
10. Implementar sistema de reputación y confianza
