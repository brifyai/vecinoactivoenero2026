# 🔧 Instrucciones para Configurar Testing Real-Time

## 🎯 Problema Identificado

Los tests de real-time fallan porque:
1. ❌ Falta la tabla `conversations` en la base de datos
2. ❌ Real-time no está configurado correctamente
3. ❌ No hay usuarios de prueba suficientes

## 🚀 Solución Rápida

### Paso 1: Ejecutar Script en Supabase

1. **Ir a Supabase Dashboard**
   - Abre tu proyecto en https://supabase.com/dashboard
   - Ve a la sección "SQL Editor"

2. **Ejecutar el Script Completo**
   - Copia todo el contenido del archivo `SUPABASE_SETUP_REALTIME.sql`
   - Pégalo en el SQL Editor
   - Haz clic en "Run" para ejecutar

3. **Verificar Resultados**
   - El script mostrará mensajes de confirmación al final
   - Deberías ver "🎉 CONFIGURACIÓN COMPLETADA"

### Paso 2: Ejecutar Tests

Una vez completado el paso 1, ejecuta:

```bash
# Verificar configuración
npm run test:realtime:setup

# Ejecutar todos los tests
npm run test:realtime
```

## 🔍 Verificación Manual

Si quieres verificar que todo está configurado correctamente:

### Verificar Tablas
```sql
-- En Supabase SQL Editor
SELECT tablename 
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'posts', 'notifications', 'users');
```

### Verificar Real-time
```sql
-- Verificar que las tablas están en real-time
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Verificar Usuarios de Prueba
```sql
-- Ver usuarios de prueba
SELECT email, name, username 
FROM users 
WHERE email LIKE '%test%@vecinoactivo.cl';
```

## 🛠️ Solución de Problemas

### Error: "Table doesn't exist"
- Ejecuta el script `SUPABASE_SETUP_REALTIME.sql` completo
- Verifica que tienes permisos de administrador en Supabase

### Error: "Real-time subscription failed"
- Ve a Supabase Dashboard > Settings > API
- Verifica que Real-time está habilitado
- Ejecuta la parte de Real-time del script

### Error: "No users found"
- El script crea usuarios automáticamente
- Si persiste, ejecuta solo la sección de usuarios del script

## 📋 Checklist de Configuración

- [ ] Script `SUPABASE_SETUP_REALTIME.sql` ejecutado exitosamente
- [ ] Tabla `conversations` creada
- [ ] Columna `conversation_id` agregada a `messages`
- [ ] Real-time habilitado para todas las tablas
- [ ] Al menos 3 usuarios de prueba creados
- [ ] Políticas RLS configuradas
- [ ] Tests ejecutándose sin errores

## 🎯 Resultado Esperado

Después de la configuración, deberías ver:

```bash
npm run test:realtime:setup
# ✅ Variables de entorno cargadas desde .env
# ✅ Cliente Supabase inicializado  
# ✅ Conexión a Supabase verificada
# ✅ users (con datos)
# ✅ posts (con datos)
# ✅ notifications (vacía)
# ✅ messages (vacía)
# ✅ conversations (vacía)
# ✅ Real-time configurado correctamente
# ✅ Encontrados 3 usuarios existentes

npm run test:realtime
# 🚀 Iniciando tests de Real-time Posts...
# ✅ Estado de suscripción: SUBSCRIBED
# ✅ Post creado exitosamente: ID xxx
# ✅ Evento INSERT real-time recibido correctamente
```

## 🆘 Si Nada Funciona

1. **Verifica las credenciales en .env**
   ```bash
   cat .env | grep SUPABASE
   ```

2. **Ejecuta el script de configuración completa**
   ```bash
   ./setup_complete_realtime.sh
   ```

3. **Contacta soporte** con los logs de error específicos

---

**¡Una vez completada la configuración, tendrás un sistema completo de testing real-time funcionando!** 🎉