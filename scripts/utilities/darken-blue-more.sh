#!/bin/bash

# Script para oscurecer más el azul (reducir brillo)
# #4f46e5 → #3730a3 (indigo-800 - mucho más oscuro)

echo "🎨 Oscureciendo más el azul para reducir brillo..."

# Encontrar todos los archivos CSS
find src -name "*.css" -type f | while read file; do
  # Hacer backup
  cp "$file" "$file.backup"
  
  # Reemplazar azul por uno más oscuro (case insensitive)
  sed -i '' 's/#4f46e5/#3730a3/gi' "$file"
  
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
echo "Color azul oscurecido:"
echo "  #4f46e5 → #3730a3 (indigo-800 - mucho más oscuro, mejor contraste)"
