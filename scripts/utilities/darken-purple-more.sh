#!/bin/bash

# Script para oscurecer aún más el púrpura (reducir brillo)
# #6d28d9 → #5b21b6 (violet-800 - mucho más oscuro)

echo "🎨 Oscureciendo más el púrpura para reducir brillo..."

# Encontrar todos los archivos CSS
find src -name "*.css" -type f | while read file; do
  # Hacer backup
  cp "$file" "$file.backup"
  
  # Reemplazar púrpura por uno más oscuro (case insensitive)
  sed -i '' 's/#6d28d9/#5b21b6/gi' "$file"
  sed -i '' 's/#7c3aed/#6d28d9/gi' "$file"
  sed -i '' 's/#9333ea/#7c3aed/gi' "$file"
  
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
echo "Colores púrpuras oscurecidos:"
echo "  #6d28d9 → #5b21b6 (violet-800 - mucho más oscuro)"
echo "  #7c3aed → #6d28d9 (violet-700 - más oscuro)"
echo "  #9333ea → #7c3aed (violet-600 - más oscuro)"
