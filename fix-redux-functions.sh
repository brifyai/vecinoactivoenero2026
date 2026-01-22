#!/bin/bash

echo "🔧 Arreglando funciones de Redux..."

# Archivos que necesitan updateUser
files_needing_updateUser=(
  "src/components/LocationVerification/LocationVerification.js"
  "src/components/ProfileHeader/ProfileHeader.js"
  "src/pages/Onboarding.js"
)

for file in "${files_needing_updateUser[@]}"; do
  if [ -f "$file" ]; then
    # Agregar const { updateUser } = useReduxAuth(); después de const user = useSelector(selectUser);
    sed -i '' '/const user = useSelector(selectUser);/a\
  const { updateUser } = useReduxAuth();
' "$file"
  fi
done

# Archivos que necesitan logout
files_needing_logout=(
  "src/components/ProfileDropdown/ProfileDropdown.js"
  "src/components/Sidebar/Sidebar.js"
)

for file in "${files_needing_logout[@]}"; do
  if [ -f "$file" ]; then
    # Agregar const { logout } = useReduxAuth(); después de const user = useSelector(selectUser);
    sed -i '' '/const user = useSelector(selectUser);/a\
  const { logout } = useReduxAuth();
' "$file"
  fi
done

echo "✅ Funciones de Redux arregladas!"
