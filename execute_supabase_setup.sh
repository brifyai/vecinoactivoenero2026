#!/bin/bash

# Script para ejecutar la configuración usando Supabase CLI
# Requiere tener supabase CLI instalado y configurado

echo "🚀 Ejecutando configuración de Supabase..."

# Verificar si supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "💡 Instala con: npm install -g supabase"
    echo "💡 O usa el dashboard web: https://supabase.com/dashboard"
    exit 1
fi

# Verificar si está logueado
if ! supabase projects list &> /dev/null; then
    echo "❌ No estás logueado en Supabase CLI"
    echo "💡 Ejecuta: supabase login"
    exit 1
fi

# Ejecutar el script SQL
echo "📝 Ejecutando script de configuración..."
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < SUPABASE_SETUP_REALTIME.sql

if [ $? -eq 0 ]; then
    echo "✅ Configuración completada exitosamente"
    echo "🧪 Ahora puedes ejecutar: npm run test:realtime"
else
    echo "❌ Error ejecutando la configuración"
    echo "💡 Usa el dashboard web: https://supabase.com/dashboard"
fi