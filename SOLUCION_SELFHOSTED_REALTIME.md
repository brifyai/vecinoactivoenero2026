# 🔧 Solución: Habilitar Real-time en Supabase Self-hosted

## 🎯 Problema Identificado

Tu instancia de Supabase es **self-hosted** (`https://supabase.vecinoactivo.cl`) y **no tiene Real-time configurado**.

**Error específico**: `WebSocket error: Unexpected server response: 503`

## 🚀 Soluciones Disponibles

### Opción A: Configurar Real-time en Self-hosted (Técnico)

#### 1. Verificar Docker Compose
Tu instancia self-hosted necesita el servicio `realtime` habilitado:

```yaml
# docker-compose.yml
services:
  realtime:
    image: supabase/realtime:latest
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=${POSTGRES_PASSWORD}
      - DB_NAME=postgres
      - PORT=4000
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "4000:4000"
    depends_on:
      - db
```

#### 2. Variables de Entorno Necesarias
```env
# .env para Supabase self-hosted
REALTIME_ENABLED=true
REALTIME_PORT=4000
REALTIME_HOST=0.0.0.0
```

#### 3. Configuración de Nginx/Proxy
```nginx
# nginx.conf
location /realtime/ {
    proxy_pass http://realtime:4000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### Opción B: Migrar a Supabase Cloud (Recomendado)

#### Ventajas:
- ✅ Real-time habilitado por defecto
- ✅ Sin configuración adicional
- ✅ Mantenimiento automático
- ✅ Escalabilidad automática

#### Pasos:
1. Crear proyecto en https://supabase.com
2. Exportar datos de tu instancia actual
3. Importar a la nueva instancia
4. Actualizar variables de entorno

### Opción C: Implementar Alternativa (Inmediato)

#### Polling en lugar de Real-time:
```javascript
// Polling cada 5 segundos
const usePolling = (table, interval = 5000) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from(table).select('*');
      setData(data);
    };
    
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  }, [table, interval]);
  
  return data;
};
```

## 🎯 Recomendación Inmediata

### Para Continuar Desarrollando HOY:

1. **Usar Polling** (Opción C) - Funciona inmediatamente
2. **Planificar migración** a Supabase Cloud
3. **Documentar limitación** actual

### Script de Polling Listo para Usar:

```javascript
// src/hooks/usePollingData.js
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const usePollingData = (table, interval = 5000) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  }, [table, interval]);
  
  return { data, loading, error, refetch: () => fetchData() };
};
```

## 📊 Comparación de Opciones

| Opción | Tiempo | Complejidad | Real-time | Costo |
|--------|--------|-------------|-----------|-------|
| A: Configurar Self-hosted | 2-4 horas | Alta | ✅ Sí | Gratis |
| B: Migrar a Cloud | 1-2 horas | Media | ✅ Sí | $25/mes |
| C: Usar Polling | 30 min | Baja | ⚠️ Simulado | Gratis |

## 🚀 Próximos Pasos

1. **Inmediato**: Implementar polling para continuar desarrollo
2. **Corto plazo**: Decidir entre configurar self-hosted o migrar
3. **Largo plazo**: Tener Real-time completamente funcional

¿Qué opción prefieres seguir?