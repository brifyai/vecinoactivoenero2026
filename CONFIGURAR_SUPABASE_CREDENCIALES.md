# 🔑 Configurar Credenciales de Supabase

## ❌ Error Actual

```
ERROR: supabaseKey is required
```

Este error ocurre porque faltan las credenciales de Supabase en el archivo `.env`

---

## ✅ Solución (5 minutos)

### Paso 1: Obtener credenciales de Supabase

1. Ve a: **https://app.supabase.com**
2. Selecciona tu proyecto (o crea uno nuevo)
3. En el menú lateral, click en **⚙️ Settings**
4. Click en **API** (en el submenú)
5. Verás dos valores importantes:

   **Project URL:**
   ```
   https://xyzcompany.supabase.co
   ```
   
   **Project API keys > anon public:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI4OTIyMCwiZXhwIjoxOTMxODY1MjIwfQ.kCw0nMkjm5q0y0y0y0y0y0y0y0y0y0y0y0y0y0y
   ```

### Paso 2: Editar archivo .env

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```env
# Supabase Configuration

# URL de tu proyecto Supabase
REACT_APP_SUPABASE_URL=https://xyzcompany.supabase.co

# Anon/Public Key de Supabase
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI4OTIyMCwiZXhwIjoxOTMxODY1MjIwfQ.kCw0nMkjm5q0y0y0y0y0y0y0y0y0y0y0y0y0y0y
```

3. **Guarda el archivo** (Ctrl/Cmd + S)

### Paso 3: Reiniciar el servidor

1. En la terminal donde corre `npm start`, presiona **Ctrl + C**
2. Ejecuta nuevamente:
   ```bash
   npm start
   ```

3. Espera a que compile

### Paso 4: Verificar

1. Abre http://localhost:3000
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   ✅ Conexión a Supabase exitosa
   ```

---

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore` (no se sube a Git)
- ✅ La `anon key` es segura para usar en el frontend
- ✅ Las políticas RLS protegen tus datos

**NUNCA compartas:**
- ❌ `service_role` key (solo para backend)
- ❌ Contraseñas de base de datos

---

## 🆘 Si no tienes proyecto en Supabase

### Crear proyecto nuevo (5 minutos)

1. Ve a: https://app.supabase.com
2. Click en **New Project**
3. Completa:
   - **Name:** vecino-activo
   - **Database Password:** (genera una segura)
   - **Region:** South America (São Paulo) - más cercano a Chile
4. Click en **Create new project**
5. Espera 2-3 minutos mientras se crea
6. Una vez listo, sigue los pasos del **Paso 1** arriba

---

## 📋 Checklist

- [ ] Obtuve Project URL de Supabase
- [ ] Obtuve anon public key de Supabase
- [ ] Edité el archivo `.env` con mis credenciales
- [ ] Guardé el archivo `.env`
- [ ] Reinicié el servidor con `npm start`
- [ ] La app carga sin errores
- [ ] Veo "✅ Conexión a Supabase exitosa" en consola

---

## 🎯 Siguiente paso

Una vez configurado, continúa con:
1. Ejecutar `storage_setup.sql` en Supabase
2. Probar Storage en `/storage-test`

📖 Ver: `STORAGE_QUICK_START.md`
