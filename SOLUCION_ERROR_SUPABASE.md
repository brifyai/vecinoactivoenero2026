# ✅ Solución: Error "supabaseKey is required"

## 🎯 Problema Resuelto

He creado el archivo `.env` que faltaba. Ahora necesitas agregar tus credenciales de Supabase.

---

## 🚀 Solución Rápida (5 minutos)

### 1️⃣ Obtener credenciales (2 min)

Ve a: **https://app.supabase.com** → Tu Proyecto → **Settings** → **API**

Copia estos dos valores:
- **Project URL** (ej: `https://xyzcompany.supabase.co`)
- **anon public key** (un JWT largo que empieza con `eyJ...`)

### 2️⃣ Editar .env (1 min)

Abre el archivo `.env` en la raíz del proyecto y reemplaza:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Con tus valores reales:

```env
REACT_APP_SUPABASE_URL=https://xyzcompany.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3️⃣ Reiniciar servidor (1 min)

```bash
# Detener el servidor actual (Ctrl + C)
# Luego reiniciar:
npm start
```

### 4️⃣ Verificar (1 min)

Abre http://localhost:3000 y revisa la consola del navegador (F12).

Deberías ver:
```
✅ Conexión a Supabase exitosa
```

---

## 📁 Archivos Creados

✅ `.env` - Archivo de configuración (edita este)
✅ `.env.example` - Plantilla de ejemplo
✅ `CONFIGURAR_SUPABASE_CREDENCIALES.md` - Guía detallada

---

## 🆘 ¿No tienes proyecto en Supabase?

Si aún no tienes un proyecto:

1. Ve a https://app.supabase.com
2. Click en **New Project**
3. Nombre: `vecino-activo`
4. Región: **South America (São Paulo)**
5. Espera 2-3 minutos
6. Obtén las credenciales (Paso 1 arriba)

---

## 🔒 Seguridad

- ✅ `.env` está en `.gitignore` (no se sube a Git)
- ✅ La `anon key` es segura para frontend
- ✅ Solo usa `anon public`, NUNCA `service_role`

---

## 📋 Checklist

- [ ] Tengo un proyecto en Supabase
- [ ] Copié Project URL
- [ ] Copié anon public key
- [ ] Edité `.env` con mis credenciales
- [ ] Guardé el archivo
- [ ] Reinicié `npm start`
- [ ] La app carga sin errores

---

## 🎯 Siguiente Paso

Una vez que la app cargue correctamente:

1. **Ejecutar SQL**: Copia `storage_setup.sql` en Supabase SQL Editor
2. **Probar Storage**: Ve a http://localhost:3000/storage-test
3. **Subir imagen**: Prueba el upload

📖 **Guía completa**: `STORAGE_QUICK_START.md`

---

**Tiempo total**: ~5 minutos
**Dificultad**: Fácil ⭐
