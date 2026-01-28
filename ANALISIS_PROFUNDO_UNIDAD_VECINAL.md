# 🏘️ ANÁLISIS PROFUNDO: SISTEMA DE UNIDAD VECINAL

## 📋 RESUMEN EJECUTIVO

El sistema de Unidad Vecinal (UV) es el núcleo organizacional de la aplicación Vecino Activo. Cada UV representa una comunidad geográfica específica con su propia administración, usuarios y datos.

---

## 🗂️ ARQUITECTURA DEL SISTEMA

### 1. MODELO DE DATOS

#### Tabla: `neighborhoods`
```sql
CREATE TABLE neighborhoods (
  id VARCHAR(100) PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  comuna VARCHAR(100),
  region VARCHAR(100),
  personas INTEGER DEFAULT 0,
  hogares INTEGER DEFAULT 0,
  geometry GEOMETRY(MultiPolygon, 4326),
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos clave:**
- `id`: Identificador único de la UV
- `codigo`: Código único (ej: "UV-001")
- `nombre`: Nombre descriptivo de la UV
- `geometry`: Polígono geográfico para el mapa
- `properties`: Datos adicionales en formato JSON

---

## 🔐 SISTEMA DE ROLES Y PERMISOS

### Tabla: `admin_roles`

**Tipos de roles:**
1. **super_admin**: Acceso total al sistema
2. **uv_admin**: Administrador de una UV específica
3. **delegate**: Delegado con permisos limitados
4. **moderator**: Moderador de contenido

### Permisos por Rol

| Permiso | super_admin | uv_admin | delegate | moderator |
|---------|-------------|----------|----------|-----------|
| Gestionar Tickets | ✅ | ✅ | ✅ | ❌ |
| Enviar Campañas | ✅ | ✅ | ❌ | ❌ |
| Gestionar Usuarios | ✅ | ✅ | ❌ | ❌ |
| Ver Analíticas | ✅ | ✅ | ✅ | ❌ |
| Moderar Contenido | ✅ | ✅ | ✅ | ✅ |

---

## 📊 COMPONENTES DEL SISTEMA

### 1. Redux Store (`adminDashboardSlice.js`)

**Estado Global:**
```javascript
{
  currentAdmin: null,              // Usuario admin actual
  permissions: {...},              // Permisos del usuario
  userNeighborhoods: [],          // UVs administradas
  currentNeighborhood: null,      // UV seleccionada
  dashboardStats: {               // Estadísticas
    tickets: {...},
    campaigns: {...},
    users: {...}
  }
}
```

**Acciones Async:**
- `fetchAdminRoles`: Obtener roles administrativos
- `checkUserPermissions`: Verificar permisos de usuario
- `fetchUserNeighborhoods`: Obtener UVs del usuario
- `fetchDashboardStats`: Obtener estadísticas
- `fetchNeighborhoodUsers`: Obtener usuarios de la UV

### 2. Hook Personalizado (`useReduxAdmin.js`)

**Funciones principales:**
```javascript
// Gestión de vecindarios
getCurrentNeighborhoodId()
getCurrentNeighborhoodName()
getAdministeredNeighborhoods()

// Verificación de permisos
hasPermission(permission)
canManageTickets()
canSendCampaigns()
canManageUsers()

// Estadísticas
getTotalTickets()
getTotalUsers()
getTotalCampaigns()
```

### 3. Servicio de Backend (`supabaseAdminService.js`)

**Métodos disponibles:**
- `createAdminRole(roleData)`: Crear rol administrativo
- `getAdminRoles(filters)`: Obtener roles
- `checkUserPermissions(userId, neighborhoodId)`: Verificar permisos
- `getUserNeighborhoods(userId)`: Obtener UVs del usuario
- `getDashboardStats(neighborhoodId)`: Obtener estadísticas
- `getNeighborhoodUsers(neighborhoodId)`: Obtener usuarios

---

## 🔍 FLUJO DE AUTENTICACIÓN Y AUTORIZACIÓN

### 1. Login del Administrador
```
Usuario → AdminLogin → Supabase Auth → Verificar rol
                                      ↓
                            fetchUserNeighborhoods()
                                      ↓
                            checkUserPermissions()
                                      ↓
                            Redirigir a Dashboard
```

### 2. Selección de UV
```
Dashboard → Selector de UV → setCurrentNeighborhood()
                                      ↓
                            fetchDashboardStats(uvId)
                                      ↓
                            Cargar datos específicos de la UV
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. **FALTA DE SELECTOR DE UV EN EL DASHBOARD** ⚠️ CRÍTICO

**Problema:** No hay un componente visible para seleccionar entre múltiples UVs.

**Ubicación:** `AdminHeader.js` - Debe agregarse en el header global

**Evidencia del código:**
- `AdminHeader.js` NO tiene selector de UV
- Solo tiene: búsqueda, notificaciones, configuración
- El breadcrumb fue eliminado previamente

**Impacto:** 
- Usuarios con múltiples UVs no pueden cambiar entre ellas
- No hay feedback visual de qué UV está activa
- Experiencia de usuario confusa

### 2. **INICIALIZACIÓN INCOMPLETA EN AdminDashboard.js** ⚠️ CRÍTICO

**Problema:** El componente `AdminDashboard.js` NO llama a `fetchUserNeighborhoods()`.

**Código actual (líneas 127-165):**
```javascript
useEffect(() => {
  const checkAdminAccess = async () => {
    // ❌ NO llama a fetchUserNeighborhoods()
    // ❌ Solo hace checkUserAdminRole() que es una función temporal
    const adminData = await checkUserAdminRole(user.id);
    
    // ❌ Hardcodea neighborhood_id: 'uv-001'
    dispatch(setCurrentAdmin({
      admin: {
        neighborhoodId: adminData.neighborhood_id, // 'uv-001' hardcoded
        neighborhoodName: adminData.neighborhood_name
      }
    }));
  };
  
  checkAdminAccess();
}, [isAuthenticated, user]);
```

**Función temporal (línea 169):**
```javascript
const checkUserAdminRole = async (userId) => {
  // TODO: Implementar consulta real a admin_roles
  // ❌ SIMULACIÓN - No consulta la base de datos real
  return {
    neighborhood_id: 'uv-001',
    neighborhood_name: 'Unidad Vecinal Las Condes Centro',
    role_type: 'uv_admin',
    permissions: ['manage_tickets', 'send_campaigns']
  };
};
```

**Impacto:**
- NO se cargan las UVs reales del usuario desde la base de datos
- Siempre usa 'uv-001' hardcoded
- `userNeighborhoods` en Redux queda vacío `[]`
- `currentNeighborhood` se setea manualmente pero no desde la BD

### 3. **DATOS NO CARGAN SI NO HAY UV SELECCIONADA**

**Problema:** El `useEffect` en `DashboardOverview.js` depende de `currentNeighborhood` pero puede ser `null`.

**Código actual (línea 60):**
```javascript
useEffect(() => {
  const neighborhoodId = getCurrentNeighborhoodId();
  if (neighborhoodId) {
    loadDashboardData(neighborhoodId);
  }
}, [currentNeighborhood]);
```

**Problema:** 
- Si `currentNeighborhood` es `null`, no se cargan datos
- No hay mensaje de estado vacío
- Usuario ve pantalla en blanco

### 4. **INICIALIZACIÓN AUTOMÁTICA EXISTE PERO NO SE EJECUTA**

**Código en `adminDashboardSlice.js` (línea 267):**
```javascript
.addCase(fetchUserNeighborhoods.fulfilled, (state, action) => {
  state.userNeighborhoods = action.payload;
  // ✅ ESTO YA EXISTE
  if (!state.currentNeighborhood && action.payload.length > 0) {
    state.currentNeighborhood = action.payload[0].neighborhood;
  }
})
```

**Problema:** 
- ✅ El código de inicialización automática SÍ existe
- ❌ PERO `fetchUserNeighborhoods()` NUNCA se llama en `AdminDashboard.js`
- Por lo tanto, este código nunca se ejecuta

### 5. **SERVICIO DE VECINDARIOS NO INTEGRADO**

**Problema:** `neighborhoodService.js` solo funciona en desarrollo y no está integrado con Supabase.

**Código actual:**
```javascript
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : null; // ❌ Sin backend en producción
```

**Solución:** Ya existe `supabaseAdminService.getUserNeighborhoods()` - solo falta usarlo.

---

## 🛠️ SOLUCIONES IMPLEMENTABLES

### ✅ Solución 1: Agregar Selector de UV en AdminHeader

**Archivo:** `src/components/AdminDashboard/AdminHeader.js`

**Cambios necesarios:**

1. Importar el hook `useReduxAdmin`
2. Agregar selector dropdown en el header-left (después del toggle)
3. Agregar estilos CSS para el selector

```javascript
// AGREGAR IMPORT
import { useReduxAdmin } from '../../hooks/useReduxAdmin';

// DENTRO DEL COMPONENTE
const { 
  userNeighborhoods, 
  currentNeighborhood,
  setCurrentNeighborhood 
} = useReduxAdmin();

// EN EL JSX - AGREGAR DESPUÉS DEL TOGGLE
<div className="admin-header-left">
  <button className="mobile-sidebar-toggle" onClick={onSidebarToggle}>
    <MenuIcon />
  </button>

  {/* NUEVO: Selector de Unidad Vecinal */}
  {userNeighborhoods.length > 0 && (
    <div className="neighborhood-selector">
      <select 
        value={currentNeighborhood?.id || ''} 
        onChange={(e) => {
          const selected = userNeighborhoods.find(
            uv => uv.neighborhood.id === e.target.value
          );
          if (selected) {
            setCurrentNeighborhood(selected.neighborhood);
          }
        }}
        className="neighborhood-select"
      >
        <option value="">Seleccionar UV</option>
        {userNeighborhoods.map(uv => (
          <option key={uv.neighborhood.id} value={uv.neighborhood.id}>
            {uv.neighborhood.nombre} ({uv.role_type})
          </option>
        ))}
      </select>
    </div>
  )}
</div>
```

**CSS a agregar en `AdminHeader.css`:**
```css
.neighborhood-selector {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.neighborhood-select {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
  cursor: pointer;
  min-width: 250px;
  transition: all 0.2s;
}

.neighborhood-select:hover {
  border-color: #cbd5e0;
}

.neighborhood-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .neighborhood-selector {
    margin-left: 10px;
  }
  
  .neighborhood-select {
    min-width: 180px;
    font-size: 13px;
    padding: 6px 12px;
  }
}
```

### ✅ Solución 2: Cargar UVs Reales en AdminDashboard.js

**Archivo:** `src/pages/AdminDashboard/AdminDashboard.js`

**REEMPLAZAR la función `checkAdminAccess` completa:**

```javascript
// AGREGAR IMPORT
import { 
  selectCurrentAdmin, 
  selectAdminRole, 
  selectIsUVAdmin,
  setCurrentAdmin,
  fetchDashboardStats,
  fetchUserNeighborhoods,  // ✅ AGREGAR ESTE IMPORT
  checkUserPermissions     // ✅ AGREGAR ESTE IMPORT
} from '../../store/slices/adminDashboardSlice';

// REEMPLAZAR useEffect completo (líneas 127-165)
useEffect(() => {
  const checkAdminAccess = async () => {
    try {
      if (!isAuthenticated) {
        navigate('/iniciar-sesion-admin');
        return;
      }

      if (!user) {
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }

      console.log('🔐 Inicializando dashboard para usuario:', user.id);

      // ✅ NUEVO: Cargar vecindarios reales del usuario
      const neighborhoodsResult = await dispatch(fetchUserNeighborhoods(user.id));
      
      if (fetchUserNeighborhoods.rejected.match(neighborhoodsResult)) {
        console.error('❌ Error cargando vecindarios:', neighborhoodsResult.payload);
        setError('No tienes vecindarios asignados');
        setLoading(false);
        return;
      }

      const neighborhoods = neighborhoodsResult.payload;
      
      if (!neighborhoods || neighborhoods.length === 0) {
        setError('No tienes vecindarios asignados');
        setLoading(false);
        return;
      }

      console.log('✅ Vecindarios cargados:', neighborhoods.length);

      // ✅ NUEVO: Verificar permisos en el primer vecindario
      const firstNeighborhood = neighborhoods[0];
      const permissionsResult = await dispatch(
        checkUserPermissions({
          userId: user.id,
          neighborhoodId: firstNeighborhood.neighborhood.id
        })
      );

      if (checkUserPermissions.rejected.match(permissionsResult)) {
        console.error('❌ Error verificando permisos:', permissionsResult.payload);
        setError('No tienes permisos de administrador');
        setLoading(false);
        return;
      }

      console.log('✅ Permisos verificados:', permissionsResult.payload);

      // ✅ Configurar datos del administrador
      dispatch(setCurrentAdmin({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url
      }));

      // ✅ Cargar estadísticas del primer vecindario
      dispatch(fetchDashboardStats(firstNeighborhood.neighborhood.id));

      setLoading(false);
    } catch (err) {
      console.error('❌ Error checking admin access:', err);
      setError('Error al verificar permisos de administrador');
      setLoading(false);
    }
  };

  checkAdminAccess();
}, [isAuthenticated, user, dispatch, navigate]);

// ✅ ELIMINAR la función checkUserAdminRole() temporal (líneas 169-178)
```

### ✅ Solución 3: Mensaje de Estado Vacío en DashboardOverview

**Archivo:** `src/pages/AdminDashboard/DashboardOverview.js`

**AGREGAR al inicio del componente (después de los hooks, antes del useEffect):**

```javascript
// AGREGAR DESPUÉS DE LOS HOOKS (línea ~58)
// Verificar si hay UV seleccionada
if (!currentNeighborhood) {
  return (
    <div className="dashboard-overview">
      <div className="dashboard-empty-state">
        <div className="empty-state-icon">
          <DashboardIcon style={{ fontSize: 80, color: '#cbd5e0' }} />
        </div>
        <h2>No hay Unidad Vecinal seleccionada</h2>
        <p>Por favor selecciona una Unidad Vecinal del menú superior para ver las estadísticas</p>
      </div>
    </div>
  );
}
```

**CSS a agregar en `DashboardOverview.css`:**
```css
.dashboard-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px;
}

.empty-state-icon {
  margin-bottom: 24px;
  opacity: 0.5;
}

.dashboard-empty-state h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.dashboard-empty-state p {
  font-size: 16px;
  color: #718096;
  max-width: 400px;
}
```

### ✅ Solución 4: Agregar Logs de Debugging

**Agregar en múltiples archivos para rastrear el flujo:**

```javascript
// En AdminDashboard.js - después de cargar vecindarios
console.log('🏘️ Vecindarios cargados:', neighborhoods);
console.log('🏘️ Primer vecindario:', neighborhoods[0]);

// En DashboardOverview.js - al inicio del useEffect
console.log('🏠 currentNeighborhood:', currentNeighborhood);
console.log('🏠 neighborhoodId:', getCurrentNeighborhoodId());

// En adminDashboardSlice.js - en fetchUserNeighborhoods.fulfilled
console.log('✅ Redux: Vecindarios guardados:', action.payload);
console.log('✅ Redux: currentNeighborhood auto-seleccionado:', state.currentNeighborhood);
```

---

## 📈 MÉTRICAS Y ESTADÍSTICAS

### Datos que se Obtienen por UV

1. **Tickets:**
   - Total, Pendientes, En Progreso, Resueltos, Urgentes

2. **Campañas:**
   - Total, Enviadas, Programadas, Borradores

3. **Usuarios:**
   - Total, Verificados

### Consulta SQL de Estadísticas

```sql
-- Tickets
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved
FROM tickets 
WHERE neighborhood_id = $1;

-- Usuarios
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE verified = true) as verified
FROM users 
WHERE neighborhood_id = $1;
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Tareas Inmediatas (CRÍTICAS)

- [ ] **1. Agregar selector de UV en AdminHeader.js**
  - [ ] Importar `useReduxAdmin`
  - [ ] Agregar dropdown con `userNeighborhoods`
  - [ ] Implementar `onChange` para cambiar UV
  - [ ] Agregar estilos CSS para el selector
  - [ ] Probar en desktop y móvil

- [ ] **2. Reemplazar inicialización en AdminDashboard.js**
  - [ ] Importar `fetchUserNeighborhoods` y `checkUserPermissions`
  - [ ] Reemplazar `checkAdminAccess()` con código real
  - [ ] Eliminar función temporal `checkUserAdminRole()`
  - [ ] Agregar logs de debugging
  - [ ] Probar carga inicial

- [ ] **3. Agregar estado vacío en DashboardOverview.js**
  - [ ] Agregar verificación `if (!currentNeighborhood)`
  - [ ] Mostrar mensaje amigable
  - [ ] Agregar estilos CSS para estado vacío
  - [ ] Probar cuando no hay UV seleccionada

- [ ] **4. Agregar logs de debugging**
  - [ ] En AdminDashboard.js (carga de UVs)
  - [ ] En DashboardOverview.js (verificación de UV)
  - [ ] En adminDashboardSlice.js (auto-selección)
  - [ ] Verificar logs en consola del navegador

### 🧪 Tareas de Testing

- [ ] **Probar con usuario sin UVs asignadas**
  - [ ] Verificar mensaje de error apropiado
  - [ ] No debe crashear la aplicación

- [ ] **Probar con usuario con 1 UV**
  - [ ] Debe auto-seleccionarse
  - [ ] Debe cargar estadísticas
  - [ ] Selector debe mostrar 1 opción

- [ ] **Probar con usuario con múltiples UVs**
  - [ ] Debe auto-seleccionar la primera
  - [ ] Selector debe mostrar todas las opciones
  - [ ] Cambio de UV debe recargar datos
  - [ ] Estadísticas deben actualizarse

- [ ] **Probar cambio de UV**
  - [ ] Selector debe funcionar
  - [ ] Datos deben recargarse
  - [ ] No debe haber errores en consola
  - [ ] Transición debe ser suave

### 🔧 Tareas de Mejora (OPCIONALES)

- [ ] Migrar `neighborhoodService.js` a Supabase
- [ ] Agregar caché de estadísticas (evitar recargas innecesarias)
- [ ] Implementar actualización en tiempo real de estadísticas
- [ ] Agregar indicador de UV activa en el sidebar
- [ ] Permitir cambio rápido de UV sin recargar página completa
- [ ] Agregar breadcrumb con nombre de UV en cada página
- [ ] Agregar animación de transición al cambiar UV
- [ ] Guardar última UV seleccionada en localStorage

### 📊 Verificación de Base de Datos

- [ ] **Verificar tabla `admin_roles`**
  ```sql
  SELECT * FROM admin_roles WHERE user_id = 'USER_ID_AQUI';
  ```

- [ ] **Verificar tabla `neighborhoods`**
  ```sql
  SELECT id, codigo, nombre FROM neighborhoods LIMIT 10;
  ```

- [ ] **Verificar relación usuario-vecindario**
  ```sql
  SELECT 
    ar.user_id,
    ar.role_type,
    n.nombre as neighborhood_name
  FROM admin_roles ar
  JOIN neighborhoods n ON ar.neighborhood_id = n.id
  WHERE ar.user_id = 'USER_ID_AQUI';
  ```

---

## 🐛 DEBUGGING

### Logs a Revisar

```javascript
// En DashboardOverview.js
console.log('🏠 currentNeighborhood:', currentNeighborhood);
console.log('🏘️ userNeighborhoods:', userNeighborhoods);
console.log('📊 dashboardStats:', dashboardStats);

// En useReduxAdmin.js
console.log('👤 authUser:', authUser);
console.log('🔐 permissions:', permissions);
```

### Comandos de Consola

```javascript
// Verificar estado de Redux
window.__REDUX_DEVTOOLS_EXTENSION__?.()

// Ver estado actual
store.getState().adminDashboard
```

---

## 📝 CONCLUSIONES

El sistema de Unidad Vecinal está **bien arquitecturado a nivel de backend** pero tiene **problemas críticos de implementación en el frontend**:

### ✅ FORTALEZAS

1. **Backend sólido**: 
   - `supabaseAdminService.js` tiene todos los métodos necesarios
   - `getUserNeighborhoods()` funciona correctamente
   - `checkUserPermissions()` implementado
   
2. **Redux bien estructurado**: 
   - `adminDashboardSlice.js` tiene todas las acciones async
   - Auto-selección de primera UV implementada (línea 267)
   - Estado global bien organizado

3. **Hook personalizado completo**: 
   - `useReduxAdmin.js` tiene todas las utilidades necesarias
   - Funciones helper bien implementadas
   - Fácil de usar en componentes

### ❌ PROBLEMAS CRÍTICOS

1. **NO se cargan UVs reales** ⚠️ CRÍTICO
   - `AdminDashboard.js` usa función temporal `checkUserAdminRole()`
   - Hardcodea `neighborhood_id: 'uv-001'`
   - NUNCA llama a `fetchUserNeighborhoods()`
   
2. **NO hay selector visible** ⚠️ CRÍTICO
   - `AdminHeader.js` no tiene dropdown de UVs
   - Usuario no puede cambiar entre UVs
   - No hay feedback visual de UV activa

3. **NO hay estado vacío** ⚠️ IMPORTANTE
   - `DashboardOverview.js` no maneja `currentNeighborhood === null`
   - Pantalla en blanco si no hay UV
   - Mala experiencia de usuario

### 🎯 PRIORIDADES DE IMPLEMENTACIÓN

**PRIORIDAD 1 (CRÍTICA):**
1. Reemplazar inicialización en `AdminDashboard.js` con código real
2. Agregar selector de UV en `AdminHeader.js`

**PRIORIDAD 2 (IMPORTANTE):**
3. Agregar estado vacío en `DashboardOverview.js`
4. Agregar logs de debugging

**PRIORIDAD 3 (MEJORAS):**
5. Optimizaciones de UX
6. Caché de datos
7. Animaciones

### 🚀 IMPACTO ESPERADO

Después de implementar las soluciones:

- ✅ Usuarios podrán ver sus UVs reales desde la base de datos
- ✅ Selector visible para cambiar entre UVs
- ✅ Auto-selección de primera UV funcionará correctamente
- ✅ Estadísticas se cargarán para la UV correcta
- ✅ Experiencia de usuario profesional y completa

### 📌 NOTA IMPORTANTE

El código de auto-selección **YA EXISTE** en `adminDashboardSlice.js` (línea 267), pero **NUNCA SE EJECUTA** porque `fetchUserNeighborhoods()` no se llama en `AdminDashboard.js`.

**Una vez implementadas las soluciones 1 y 2, el sistema funcionará completamente.**

---

**Fecha de análisis:** 28 de enero de 2026  
**Analista:** Kiro AI Assistant  
**Estado:** ✅ Análisis completo - Listo para implementación
