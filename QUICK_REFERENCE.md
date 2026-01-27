# ⚡ REFERENCIA RÁPIDA - Fix de Reacciones

## 🎯 PROBLEMA
Reacciones no se muestran ni se pueden agregar. Error: `42501 - violates row-level security policy`

## ✅ SOLUCIÓN
Ejecutar script SQL que corrige políticas RLS de la tabla `post_reactions`

## 📝 PASOS

### 1. Ejecutar SQL
```
Archivo: database/reactions/FIX_REACTIONS_RLS_DEFINITIVO.sql
Dónde: Supabase Dashboard → SQL Editor
Acción: Copiar, pegar, Run
```

### 2. Verificar
```
Archivo: database/reactions/TEST_REACTIONS_AFTER_FIX.sql
Resultado esperado: 3 políticas activas, RLS habilitado
```

### 3. Probar
```
Acción: Recargar app (Ctrl+Shift+R)
Verificar: Reacciones visibles y funcionando
```

## 📊 ARCHIVOS CLAVE

| Archivo | Propósito |
|---------|-----------|
| `INICIO_AQUI.md` | Inicio rápido |
| `EJECUTAR_FIX_REACCIONES.md` | Guía completa |
| `CHECKLIST_FIX_REACCIONES.md` | Checklist paso a paso |
| `SOLUCION_REACCIONES_RLS.md` | Documentación técnica |

## 🔧 CAMBIOS TÉCNICOS

### Base de datos:
- ✅ Políticas RLS recreadas (SELECT, INSERT, DELETE)
- ✅ Validación con `auth.uid()::text = user_id::text`

### Código (ya aplicado):
- ✅ `supabaseReactionsService.js` - Usa columna `emoji`
- ✅ `supabasePostsService.js` - Función `transformPostData()`
- ✅ `Post.js` - Carrusel de fotos, reacciones mejoradas

## 🐛 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| Error 42501 | Ejecutar de nuevo el script SQL |
| No veo reacciones | Recargar app (Ctrl+Shift+R) |
| No puedo agregar | Verificar autenticación |
| [object Object] | Ya corregido, recargar app |

## ⏱️ TIEMPO
- Ejecución: 5 min
- Verificación: 3 min
- Total: 8 min

## 📞 AYUDA
Ver: `EJECUTAR_FIX_REACCIONES.md` → Sección "SI ALGO NO FUNCIONA"

---

**Última actualización:** 27 enero 2026  
**Estado:** ✅ Listo para aplicar
