#!/bin/bash

# Script para actualizar colores RGBA que quedaron del azul/púrpura viejo
# rgba(102, 126, 234, ...) → rgba(55, 48, 163, ...) (nuevo azul oscuro #3730a3)

echo "🎨 Actualizando colores RGBA de azul/púrpura..."

# Encontrar todos los archivos CSS
find src -name "*.css" -type f | while read file; do
  # Hacer backup
  cp "$file" "$file.backup"
  
  # Reemplazar rgba del azul viejo (102, 126, 234) por el nuevo (55, 48, 163)
  sed -i '' 's/rgba(102, 126, 234,/rgba(55, 48, 163,/g' "$file"
  sed -i '' 's/rgba(102,126,234,/rgba(55,48,163,/g' "$file"
  
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
echo "Colores RGBA actualizados:"
echo "  rgba(102, 126, 234, ...) → rgba(55, 48, 163, ...) (azul más oscuro)"
