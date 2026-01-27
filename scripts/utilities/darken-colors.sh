#!/bin/bash

# Script para oscurecer colores azules/púrpuras en archivos CSS
# Genera más contraste visual

echo "🎨 Oscureciendo colores azules/púrpuras en archivos CSS..."

# Colores a reemplazar:
# #667eea (azul claro) → #4f46e5 (indigo-600)
# #764ba2 (púrpura) → #6d28d9 (violet-700)
# #8b5cf6 (púrpura claro) → #7c3aed (violet-600)
# #a855f7 (púrpura muy claro) → #9333ea (fuchsia-600)
# #6366f1 (indigo) → #4f46e5 (indigo-600)

# Encontrar todos los archivos CSS
find src -name "*.css" -type f | while read file; do
  # Hacer backup
  cp "$file" "$file.backup"
  
  # Reemplazar colores (case insensitive)
  sed -i '' 's/#667eea/#4f46e5/gi' "$file"
  sed -i '' 's/#764ba2/#6d28d9/gi' "$file"
  sed -i '' 's/#8b5cf6/#7c3aed/gi' "$file"
  sed -i '' 's/#a855f7/#9333ea/gi' "$file"
  sed -i '' 's/#6366f1/#4f46e5/gi' "$file"
  
  # Verificar si hubo cambios
  if ! diff -q "$file" "$file.backup" > /dev/null 2>&1; then
    echo "✅ Actualizado: $file"
  fi
  
  # Eliminar backup
  rm "$file.backup"
done

echo ""
echo "✅ Proceso completado!"
echo ""
echo "Colores reemplazados:"
echo "  #667eea → #4f46e5 (azul más oscuro)"
echo "  #764ba2 → #6d28d9 (púrpura más oscuro)"
echo "  #8b5cf6 → #7c3aed (púrpura más oscuro)"
echo "  #a855f7 → #9333ea (púrpura más oscuro)"
echo "  #6366f1 → #4f46e5 (indigo más oscuro)"
