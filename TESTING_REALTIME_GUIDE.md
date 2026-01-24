# 🧪 Guía de Testing Real-Time

Esta guía te ayudará a ejecutar tests completos de la funcionalidad real-time de tu aplicación.

## 📋 Qué se Testea

### 1. Real-Time Posts
- ✅ Creación de posts en tiempo real
- ✅ Actualización de posts existentes
- ✅ Eliminación de posts
- ✅ Eventos WebSocket para todas las operaciones

### 2. Real-Time Notifications
- ✅ Creación de notificaciones individuales
- ✅ Creación de notificaciones en lote
- ✅ Marcar notificaciones como leídas
- ✅ Eliminación de notificaciones
- ✅ Eventos WebSocket para todas las operaciones

### 3. Real-Time Messages
- ✅ Creación de conversaciones
- ✅ Envío de mensajes individuales
- ✅ Secuencias de mensajes (conversaciones)
- ✅ Edición de mensajes
- ✅ Eliminación de mensajes
- ✅ Eventos WebSocket para mensajes y conversaciones

## 🚀 Cómo Ejecutar los Tests

### Opción 1: Configuración Automática
```bash
# 1. Ejecutar configuración automática
node setup_realtime_tests.js

# 2. Ejecutar todos los tests
node run_realtime_tests.js
```

### Opción 2: Tests Individuales
```bash
# Solo posts
node test_realtime_posts.js

# Solo notificaciones
node test_realtime_notifications.js

# Solo mensajes
node test_realtime_messages.js
```

### Opción 3: Script Bash (Linux/Mac)
```bash
# Hacer ejecutable (solo la primera vez)
chmod +x test_realtime.sh

# Ejecutar
./test_realtime.sh
```

## ⚙️ Configuración Previa

### 1. Variables de Entorno
Asegúrate de tener un archivo `.env` con:
```env
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 2. Base de Datos
Las siguientes tablas deben existir:
- `users` (con al menos 2 usuarios)
- `posts`
- `notifications`
- `messages`
- `conversations`

### 3. Real-Time Habilitado
- Supabase Real-time debe estar habilitado
- Las tablas deben tener publicaciones configuradas
- RLS (Row Level Security) debe estar configurado correctamente

## 📊 Interpretando los Resultados

### Códigos de Salida
- `0`: Todos los tests pasaron ✅
- `1`: Algunos tests fallaron ❌

### Tipos de Logs
- **INFO** (Azul): Información general
- **SUCCESS** (Verde): Operación exitosa
- **WARNING** (Amarillo): Advertencia, no crítico
- **ERROR** (Rojo): Error que requiere atención

### Ejemplo de Salida Exitosa
```
[2024-01-24T10:30:00.000Z] INFO: 🚀 Iniciando tests de Real-time Posts
[2024-01-24T10:30:01.000Z] SUCCESS: Estado de suscripción: SUBSCRIBED
[2024-01-24T10:30:02.000Z] SUCCESS: Post creado exitosamente: ID 123
[2024-01-24T10:30:03.000Z] SUCCESS: ✅ Evento INSERT real-time recibido correctamente
```

## 🔧 Solución de Problemas

### Error: "Faltan credenciales de Supabase"
```bash
# Verificar que el archivo .env existe y tiene las variables correctas
cat .env
```

### Error: "No se encontraron usuarios"
```bash
# Crear usuarios de prueba ejecutando:
node initialize_demo_data.js
```

### Error: "Subscription failed"
- Verificar que Supabase Real-time está habilitado
- Verificar que las tablas tienen publicaciones configuradas
- Verificar conectividad de red

### Error: "Table doesn't exist"
```bash
# Ejecutar el script de configuración de base de datos
psql -f database_schema.sql
```

## 📁 Archivos Generados

### Reportes
- `realtime_test_report_[timestamp].json`: Reporte detallado en JSON
- Logs en consola con timestamps y colores

### Scripts
- `test_realtime.sh`: Script bash para ejecutar tests
- Archivos de configuración temporal

## 🎯 Métricas Importantes

### Latencia Real-Time
- Los eventos deben recibirse en menos de 3 segundos
- Secuencias de mensajes deben mantener orden

### Confiabilidad
- 100% de eventos INSERT deben recibirse
- 100% de eventos UPDATE deben recibirse
- 100% de eventos DELETE deben recibirse

### Performance
- Tests deben completarse en menos de 2 minutos
- No debe haber memory leaks en las suscripciones

## 🔄 Automatización

### CI/CD Integration
```yaml
# Ejemplo para GitHub Actions
- name: Run Realtime Tests
  run: |
    npm install
    node setup_realtime_tests.js
    node run_realtime_tests.js
```

### Cron Jobs
```bash
# Ejecutar tests cada hora
0 * * * * cd /path/to/project && node run_realtime_tests.js
```

## 📚 Recursos Adicionales

- [Documentación Supabase Real-time](https://supabase.com/docs/guides/realtime)
- [Configuración RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Troubleshooting WebSockets](https://supabase.com/docs/guides/realtime/troubleshooting)

## 🆘 Soporte

Si encuentras problemas:

1. Ejecuta `node setup_realtime_tests.js` para diagnóstico
2. Revisa los logs detallados en el reporte JSON
3. Verifica la configuración de Supabase
4. Consulta la documentación de troubleshooting

---

**¡Happy Testing!** 🎉