# PLAN DE LIMPIEZA Y REFACTORIZACIÓN DE CÓDIGO

## Fase 1: Limpieza Inmediata (1-2 días)

### 1.1 Eliminar Riesgos de Seguridad

```bash
# CRÍTICO: Eliminar archivo de bypass de autenticación
rm BYPASS_SUPABASE_AUTH.js

# Verificar que no hay referencias
grep -r "BYPASS_SUPABASE_AUTH" src/
grep -r "bypass" src/ --ignore-case | grep -i auth
```

### 1.2 Organizar Scripts de Testing

```bash
# Crear estructura
mkdir -p scripts/testing
mkdir -p scripts/debugging
mkdir -p scripts/deployment
mkdir -p scripts/utilities

# Mover archivos de testing
mv test_*.js scripts/testing/
mv test_*.html scripts/testing/
mv test_*.sh scripts/testing/

# Mover archivos de debugging
mv debug_*.js scripts/debugging/
mv debug_*.html scripts/debugging/
mv diagnose_*.js scripts/debugging/
mv check_*.js scripts/debugging/
mv fix_*.js scripts/debugging/
mv deep_*.js scripts/debugging/

# Mover archivos de deployment
mv deploy_*.sh scripts/deployment/
mv setup_*.sh scripts/deployment/
mv create_*.sh scripts/deployment/

# Mover utilidades
mv initialize_*.js scripts/utilities/
mv optimize_*.js scripts/utilities/
mv polling_*.js scripts/utilities/
mv run_*.js scripts/utilities/

# Crear README en scripts/
cat > scripts/README.md << 'EOF'
# Scripts de Desarrollo

## testing/
Scripts para testing y validación de funcionalidades

## debugging/
Scripts para debugging y diagnóstico de problemas

## deployment/
Scripts para deployment y configuración de producción

## utilities/
Scripts de utilidades y herramientas

**Nota:** Estos scripts son solo para desarrollo. No ejecutar en producción.
EOF
```

### 1.3 Limpiar Dockerfiles

```bash
# Crear carpeta de historial
mkdir -p .docker-history

# Mover Dockerfiles antiguos
mv Dockerfile.backup .docker-history/
mv Dockerfile.backup-* .docker-history/
mv Dockerfile.failed .docker-history/
mv Dockerfile.fixed .docker-history/
mv Dockerfile.minimal .docker-history/
mv Dockerfile.previous .docker-history/
mv Dockerfile.simple .docker-history/
mv Dockerfile.ultra-simple .docker-history/

# Crear README
cat > .docker-history/README.md << 'EOF'
# Historial de Dockerfiles

Estos son Dockerfiles antiguos mantenidos para referencia histórica.

El Dockerfile principal está en la raíz del proyecto.

## Versiones:
- Dockerfile.backup: Backup anterior
- Dockerfile.failed: Versión que falló
- Dockerfile.fixed: Versión corregida
- Dockerfile.minimal: Versión minimalista
- Dockerfile.simple: Versión simple
- Dockerfile.ultra-simple: Versión ultra simple

EOF
```

### 1.4 Limpiar Documentación Obsoleta

```bash
# Crear carpeta de archivo
mkdir -p docs/archive

# Mover documentación antigua
mv ADMIN_DASHBOARD_COMPLETADO.md docs/archive/
mv ADMIN_DASHBOARD_IMPLEMENTATION.md docs/archive/
mv ADMIN_FEATURES_CENTRADO.md docs/archive/
mv ALINEACION_PANELES_SOLUCION.md docs/archive/
mv ALTURA_CONTENEDORES_IGUALADA.md docs/archive/
mv ANALISIS_COMPLETO_FINALIZADO.md docs/archive/
mv BOTON_EMERGENCIA_DISEÑO.md docs/archive/
mv CHECKLIST_FINAL_VECINO_ACTIVO.md docs/archive/
mv CORRECCION_DISENO_VECINOS.md docs/archive/
mv DISENO_UNIFORME_PANELES.md docs/archive/
mv EMERGENCY_BUTTON_IMPLEMENTATION_COMPLETE.md docs/archive/
mv ESQUEMA_BASE_DATOS.md docs/archive/
mv GUIA_FIREBASE_PASO_A_PASO.md docs/archive/
mv IMPLEMENTACION_COMPLETA_REALTIME_OPTIMIZACIONES.md docs/archive/
mv INFORME_COMPLETO_VECINO_ACTIVO_2026.md docs/archive/
mv INFORME_COMPLETO_VECINO_ACTIVO_2026_ACTUALIZADO.md docs/archive/
mv INTEGRATED_LOGIN_SYSTEM.md docs/archive/
mv MAPA_SOLUCION_FINAL.md docs/archive/
mv OPTIMIZACIONES_MAPA_IMPLEMENTADAS.md docs/archive/
mv PLAN_CORRECCION_PROBLEMAS.md docs/archive/
mv REPORTE_TESTING_COMPLETO.md docs/archive/
mv SISTEMA_HIBRIDO_DOCUMENTACION.md docs/archive/
mv SISTEMA_HIBRIDO_INSTALADO.md docs/archive/
mv SISTEMA_HIBRIDO_LISTO.md docs/archive/
mv SOLUCION_ERROR_MAPA_UNIDADES_VECINALES.md docs/archive/
mv SOLUCION_PERFORMANCE_DISCOVER_NEIGHBORS.md docs/archive/

# Crear índice
cat > docs/archive/INDEX.md << 'EOF'
# Documentación Archivada

Esta carpeta contiene documentación obsoleta mantenida para referencia histórica.

Para documentación actual, ver:
- README.md (raíz del proyecto)
- docs/ARCHITECTURE.md
- docs/SETUP.md
- docs/API.md

EOF
```

### 1.5 Limpiar Archivos HTML de Testing

```bash
# Mover archivos HTML de testing
mv check-react-simple.html scripts/testing/
mv debug-login-simple.html scripts/testing/
mv public/debug-login-direct.html scripts/testing/
mv public/test-login.html scripts/testing/
mv test_button_click.html scripts/testing/
```

### 1.6 Eliminar Archivo PHP

```bash
# Eliminar contact.php (debe ser manejado por backend)
rm public/contact.php

# Crear nota en README
cat >> README.md << 'EOF'

## Nota sobre Contact Form
El formulario de contacto debe ser manejado por el backend.
Crear endpoint: POST /api/contact
EOF
```

---

## Fase 2: Refactorización de Componentes (1-2 semanas)

### 2.1 Refactorizar SharedResources.js

**Paso 1: Crear hooks**
```bash
touch src/hooks/useSharedResourcesFilters.js
touch src/hooks/useSharedResourcesModals.js
```

**Paso 2: Crear componentes**
```bash
mkdir -p src/components/SharedResources
touch src/components/SharedResources/SharedResourcesHeader.js
touch src/components/SharedResources/SharedResourcesStats.js
touch src/components/SharedResources/SharedResourcesList.js
touch src/components/SharedResources/ReservationsList.js
touch src/components/SharedResources/PendingRequestsList.js
touch src/components/SharedResources/AddResourceModal.js
touch src/components/SharedResources/ReserveResourceModal.js
touch src/components/SharedResources/CompleteReservationModal.js
```

**Paso 3: Migrar código**
- Mover lógica de filtrado a `useSharedResourcesFilters.js`
- Mover lógica de modales a `useSharedResourcesModals.js`
- Dividir JSX en componentes
- Actualizar imports en página principal

### 2.2 Refactorizar LocalBusinesses.js

Similar a SharedResources.js

### 2.3 Refactorizar Landing.js

**Paso 1: Crear hooks**
```bash
touch src/hooks/useLandingNavigation.js
touch src/hooks/useLandingContactForm.js
```

**Paso 2: Crear componentes**
```bash
mkdir -p src/components/Landing
touch src/components/Landing/HeroSection.js
touch src/components/Landing/WhatIsSection.js
touch src/components/Landing/FeaturesSection.js
touch src/components/Landing/BenefitsSection.js
touch src/components/Landing/ContactSection.js
touch src/components/Landing/CTASection.js
touch src/components/Landing/Footer.js
```

---

## Fase 3: Consolidar Redux + Contextos (1-2 semanas)

### 3.1 Auditoría de Contextos vs Redux

```bash
# Script para auditar
cat > scripts/audit-context-redux.js << 'EOF'
const fs = require('fs');
const path = require('path');

const contextDir = 'src/context';
const slicesDir = 'src/store/slices';

const contexts = fs.readdirSync(contextDir).filter(f => f.endsWith('Context.js'));
const slices = fs.readdirSync(slicesDir).filter(f => f.endsWith('Slice.js'));

console.log('Contextos:', contexts.length);
console.log('Redux Slices:', slices.length);

// Buscar duplicados
contexts.forEach(ctx => {
  const name = ctx.replace('Context.js', '');
  const sliceName = name + 'Slice.js';
  if (slices.includes(sliceName)) {
    console.log(`⚠️  DUPLICADO: ${name}`);
  }
});
EOF

node scripts/audit-context-redux.js
```

### 3.2 Decisión: Redux o Contextos

**Recomendación:** Usar Redux para datos globales, Contextos solo para UI

```javascript
// Mantener en Redux:
- auth
- posts
- events
- messages
- notifications
- campaigns
- tickets
- emergency
- projects
- polls
- friends
- groups
- etc.

// Mantener en Contextos:
- Sidebar (UI state)
- Theme (UI state)
- Search (UI state)
- Modals (UI state)
```

### 3.3 Migración

```bash
# Para cada contexto que debe ser Redux:
# 1. Crear slice en store/slices/
# 2. Actualizar imports en componentes
# 3. Eliminar contexto
# 4. Eliminar provider en App.js

# Ejemplo:
# rm src/context/EventsContext.js
# Actualizar App.js para eliminar EventsProvider
# Actualizar componentes para usar Redux
```

---

## Fase 4: Crear BaseSupabaseService (3-5 días)

### 4.1 Crear clase base

```bash
touch src/services/BaseSupabaseService.js
```

### 4.2 Refactorizar servicios

```bash
# Para cada servicio:
# 1. Extender BaseSupabaseService
# 2. Eliminar métodos genéricos
# 3. Mantener solo métodos específicos
# 4. Actualizar imports

# Servicios a refactorizar:
# - supabaseAdminService.js
# - supabaseCampaignsService.js
# - supabaseTicketsService.js
# - supabasePostsService.js
# - supabaseEventsService.js
# - supabaseProjectsService.js
# - etc.
```

---

## Fase 5: Reorganizar Estructura de Carpetas (1 semana)

### 5.1 Crear nueva estructura

```bash
# Crear estructura feature-based
mkdir -p src/features
mkdir -p src/features/auth/{components,pages,services,hooks,store}
mkdir -p src/features/posts/{components,pages,services,hooks,store}
mkdir -p src/features/events/{components,pages,services,hooks,store}
mkdir -p src/features/messages/{components,pages,services,hooks,store}
mkdir -p src/features/notifications/{components,pages,services,hooks,store}
mkdir -p src/features/admin/{components,pages,services,hooks,store}
mkdir -p src/features/emergency/{components,pages,services,hooks,store}
mkdir -p src/features/campaigns/{components,pages,services,hooks,store}
mkdir -p src/features/tickets/{components,pages,services,hooks,store}
mkdir -p src/features/projects/{components,pages,services,hooks,store}
mkdir -p src/features/polls/{components,pages,services,hooks,store}
mkdir -p src/features/friends/{components,pages,services,hooks,store}
mkdir -p src/features/groups/{components,pages,services,hooks,store}
mkdir -p src/features/resources/{components,pages,services,hooks,store}
mkdir -p src/features/businesses/{components,pages,services,hooks,store}

# Crear carpetas compartidas
mkdir -p src/shared/{components,hooks,services,utils,types}
mkdir -p src/core/{config,store,types}
```

### 5.2 Migrar archivos

```bash
# Migrar por feature
# Ejemplo para auth:
mv src/pages/Login.js src/features/auth/pages/
mv src/pages/Register.js src/features/auth/pages/
mv src/pages/AdminLogin.js src/features/auth/pages/
mv src/hooks/useReduxAuth.js src/features/auth/hooks/
mv src/store/slices/authSlice.js src/features/auth/store/
mv src/services/supabaseAuthService.js src/features/auth/services/
```

---

## Fase 6: Limpiar Imports y Dead Code (3-5 días)

### 6.1 Instalar herramientas

```bash
npm install --save-dev eslint-plugin-unused-imports
npm install --save-dev depcheck
```

### 6.2 Configurar ESLint

```json
// .eslintrc.json
{
  "plugins": ["unused-imports"],
  "rules": {
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-last",
        "argsIgnorePattern": "^_"
      }
    ]
  }
}
```

### 6.3 Ejecutar análisis

```bash
# Encontrar imports no utilizados
npm run lint -- --fix

# Encontrar dependencias no utilizadas
npx depcheck

# Encontrar código comentado
grep -r "^[[:space:]]*\/\/" src/ | grep -v "TODO\|FIXME\|NOTE" | head -20
```

---

## Fase 7: Estandarizar Patrones (1 semana)

### 7.1 Crear guía de estilo

```bash
touch docs/CODING_STANDARDS.md
```

**Contenido:**
```markdown
# Estándares de Código

## Naming
- Componentes: PascalCase (Button.js)
- Hooks: camelCase con prefijo 'use' (useAuth.js)
- Servicios: camelCase con sufijo 'Service' (authService.js)
- Contextos: PascalCase con sufijo 'Context' (AuthContext.js)
- Constantes: UPPER_SNAKE_CASE (API_URL)

## Estructura de Archivos
- Máximo 300 líneas por archivo
- Máximo 3 niveles de anidamiento
- Máximo 5 responsabilidades por componente

## Manejo de Errores
- Usar try/catch en async functions
- Retornar { success, data, error }
- Loguear errores con contexto

## Imports
- Agrupar: React, librerías, componentes, servicios, utils
- Eliminar imports no utilizados
- Usar imports absolutos para src/

## Comentarios
- Usar TODO/FIXME para trabajo futuro
- Eliminar código comentado
- Documentar funciones complejas
```

### 7.2 Crear templates

```bash
# Crear templates para nuevos archivos
mkdir -p .templates

# Template de componente
cat > .templates/Component.jsx << 'EOF'
import React from 'react';
import './Component.css';

const Component = ({ prop1, prop2 }) => {
  return (
    <div className="component">
      {/* Content */}
    </div>
  );
};

export default Component;
EOF

# Template de hook
cat > .templates/useHook.js << 'EOF'
import { useState, useCallback } from 'react';

export function useHook() {
  const [state, setState] = useState(null);

  const action = useCallback(() => {
    // Action logic
  }, []);

  return { state, action };
}
EOF

# Template de servicio
cat > .templates/service.js << 'EOF'
import BaseSupabaseService from './BaseSupabaseService';

class MyService extends BaseSupabaseService {
  constructor() {
    super('table_name', '📝');
  }

  // Métodos específicos
}

export default new MyService();
EOF
```

---

## Cronograma Estimado

| Fase | Descripción | Duración | Prioridad |
|------|-------------|----------|-----------|
| 1 | Limpieza Inmediata | 1-2 días | 🔴 CRÍTICO |
| 2 | Refactorizar Componentes | 1-2 semanas | 🟠 ALTO |
| 3 | Consolidar Redux/Contextos | 1-2 semanas | 🟠 ALTO |
| 4 | BaseSupabaseService | 3-5 días | 🟠 ALTO |
| 5 | Reorganizar Carpetas | 1 semana | 🟡 MEDIO |
| 6 | Limpiar Imports/Dead Code | 3-5 días | 🟡 MEDIO |
| 7 | Estandarizar Patrones | 1 semana | 🟡 MEDIO |
| **TOTAL** | | **~6-8 semanas** | |

---

## Checklist de Implementación

### Fase 1 ✅ COMPLETADA
- [x] Eliminar BYPASS_SUPABASE_AUTH.js
- [x] Crear carpeta scripts/ y mover archivos
- [x] Crear carpeta .docker-history/ y mover Dockerfiles
- [x] Crear carpeta docs/archive/ y mover documentación
- [x] Mover archivos HTML de testing
- [x] Eliminar public/contact.php
- [x] Actualizar .gitignore
- [x] Crear temp/ para archivos temporales
- [x] Organizar todos los scripts restantes

### Fase 2 🔄 EN PROGRESO
- [x] Crear hooks para SharedResources
- [x] Crear componentes para SharedResources
- [x] Refactorizar SharedResources.js (762 → 168 líneas, -78%)
- [ ] Crear hooks para LocalBusinesses
- [ ] Crear componentes para LocalBusinesses
- [ ] Refactorizar LocalBusinesses.js
- [ ] Crear hooks para Landing
- [ ] Crear componentes para Landing
- [ ] Refactorizar Landing.js

### Fase 3
- [ ] Auditar Contextos vs Redux
- [ ] Decidir estrategia
- [ ] Crear plan de migración
- [ ] Migrar contextos a Redux
- [ ] Eliminar contextos duplicados
- [ ] Actualizar App.js

### Fase 4
- [ ] Crear BaseSupabaseService
- [ ] Refactorizar supabaseAdminService
- [ ] Refactorizar supabaseCampaignsService
- [ ] Refactorizar supabaseTicketsService
- [ ] Refactorizar otros servicios
- [ ] Actualizar imports

### Fase 5
- [ ] Crear estructura feature-based
- [ ] Migrar archivos por feature
- [ ] Actualizar imports
- [ ] Verificar que todo funciona

### Fase 6
- [ ] Instalar herramientas de análisis
- [ ] Ejecutar linters
- [ ] Eliminar imports no utilizados
- [ ] Eliminar dead code
- [ ] Eliminar código comentado

### Fase 7
- [ ] Crear guía de estilo
- [ ] Crear templates
- [ ] Documentar estándares
- [ ] Capacitar al equipo

---

## Métricas de Éxito

- [ ] Reducir líneas de código en 20-30%
- [ ] Reducir número de archivos en 15-20%
- [ ] Reducir componentes > 300 líneas a 0
- [ ] Reducir servicios duplicados a 0
- [ ] Reducir contextos duplicados a 0
- [ ] Aumentar cobertura de tests a 60%+
- [ ] Reducir tiempo de build en 10-15%
- [ ] Mejorar velocidad de carga en 15-20%

