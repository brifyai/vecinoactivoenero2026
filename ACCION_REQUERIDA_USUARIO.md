# 🚨 ACCIÓN REQUERIDA: Configurar Credenciales de Supabase

## ❌ Error Actual

```
ERROR: supabaseKey is required
```

La aplicación no puede iniciar porque faltan las credenciales de Supabase.

---

## ✅ Solución (5 minutos)

### Paso 1: Obtener credenciales de Supabase

1. Abre: **https://app.supabase.com**
2. Selecciona tu proyecto (o crea uno nuevo si no tienes)
3. Click en **⚙️ Settings** (menú lateral)
4. Click en **API**
5. Copia estos dos valores:

   📋 **Project URL:**
   ```
   https://xyzcompany.supabase.co
   ```
   
   📋 **anon public (en Project API keys):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI4OTIyMCwiZXhwIjoxOTMxODY1MjIwfQ...
   ```

### Paso 2: Editar archivo .env

1. Abre el archivo **`.env`** en la raíz del proyecto
2. Reemplaza las líneas con tus valores reales:

```env
REACT_APP_SUPABASE_URL=https://xyzcompany.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Guarda el archivo** (Cmd/Ctrl + S)

### Paso 3: Verificar configuración

```bash
npm run check-env
```

Deberías ver:
```
✅ REACT_APP_SUPABASE_URL configurada
✅ REACT_APP_SUPABASE_ANON_KEY configurada
✅ ¡Configuración correcta!
```

### Paso 4: Reiniciar servidor

```bash
npm start
```

---

## 🆘 Si no tienes proyecto en Supabase

### Crear proyecto nuevo (3 minutos)

1. Ve a: https://app.supabase.com
2. Click en **+ New Project**
3. Completa:
   - **Name:** `vecino-activo`
   - **Database Password:** (genera una segura y guárdala)
   - **Region:** **South America (São Paulo)** ← Más cercano a Chile
4. Click en **Create new project**
5. Espera 2-3 minutos mientras se crea el proyecto
6. Una vez listo, sigue el **Paso 1** arriba para obtener las credenciales

---

## 📁 Archivos Creados

He creado estos archivos para ayudarte:

- ✅ **`.env`** - Archivo de configuración (EDITA ESTE)
- ✅ **`.env.example`** - Plantilla de ejemplo
- ✅ **`check-env.js`** - Script para verificar configuración
- ✅ **`CONFIGURAR_SUPABASE_CREDENCIALES.md`** - Guía detallada
- ✅ **`SOLUCION_ERROR_SUPABASE.md`** - Solución rápida

---

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore` (no se sube a Git)
- ✅ La `anon public key` es segura para usar en frontend
- ✅ Solo usa `anon public`, **NUNCA** `service_role`

---

## 📋 Checklist

- [ ] Tengo un proyecto en Supabase
- [ ] Copié **Project URL** de Supabase
- [ ] Copié **anon public key** de Supabase
- [ ] Edité el archivo **`.env`** con mis credenciales reales
- [ ] Guardé el archivo `.env`
- [ ] Ejecuté `npm run check-env` y salió ✅
- [ ] Ejecuté `npm start`
- [ ] La app carga sin errores

---

## 🎯 Después de configurar

Una vez que la app cargue correctamente, continúa con:

### 1. Ejecutar SQL de Storage (5 min)
   - Abre `storage_setup.sql`
   - Copia todo el contenido
   - Pégalo en Supabase SQL Editor
   - Ejecuta

### 2. Probar Storage (5 min)
   - Ve a: http://localhost:3000/storage-test
   - Sube una imagen de prueba
   - Verifica que funcione

📖 **Guía completa**: `STORAGE_QUICK_START.md`

---

## 🆘 Ayuda

Si tienes problemas:

1. **Verifica configuración:**
   ```bash
   npm run check-env
   ```

2. **Lee la guía detallada:**
   - `CONFIGURAR_SUPABASE_CREDENCIALES.md`

3. **Verifica que copiaste:**
   - ✅ La URL completa (con https://)
   - ✅ La key completa (empieza con eyJ...)
   - ✅ Sin espacios al inicio o final

---

**Tiempo estimado**: 5 minutos
**Dificultad**: Fácil ⭐

¡Una vez configurado, todo funcionará automáticamente! 🚀
