# 🛠️ Scripts de Desarrollo - Vecino Activo

Esta carpeta contiene todos los scripts de desarrollo organizados por categoría.

## 📁 Estructura

### `/testing`
Scripts para testing y validación de funcionalidades
- Archivos HTML de testing
- Scripts de testing de componentes
- Scripts de testing de funcionalidades específicas
- **`verify-firebase-status.js`** - Verificación rápida del estado de Firebase
- **`test-firebase-setup.js`** - Testing completo de Firebase (requiere service account)

### `/debugging`
Scripts para debugging y diagnóstico de problemas
- Scripts de diagnóstico de errores
- Scripts de debugging de componentes
- Scripts de corrección de problemas

### `/deployment`
Scripts para deployment y configuración de producción
- Scripts de despliegue
- Scripts de configuración
- Scripts de creación de paquetes

### `/utilities`
Scripts de utilidades y herramientas
- Scripts de optimización
- Scripts de inicialización
- Scripts de polling y alternativas
- Scripts de ejecución de procesos

## ⚠️ Importante

**Estos scripts son SOLO para desarrollo. NO ejecutar en producción.**

Para ejecutar cualquier script:
```bash
# Desde la raíz del proyecto
node scripts/[categoria]/[nombre-del-script].js
# o
bash scripts/[categoria]/[nombre-del-script].sh
```

## 📋 Uso Recomendado

1. **Testing**: Usar antes de hacer commits
2. **Debugging**: Usar cuando hay problemas específicos
3. **Deployment**: Usar solo para despliegues controlados
4. **Utilities**: Usar para tareas de mantenimiento

---

*Organizado para mantener el directorio raíz limpio y facilitar el mantenimiento.*