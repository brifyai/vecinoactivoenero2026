#!/bin/bash

echo "🔧 Eliminando TODOS los usos de useAuth()..."

# Reemplazar const { user } = useAuth(); por const user = useSelector(selectUser);
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { user } = useAuth();/const user = useSelector(selectUser);/g" {} \;

# Reemplazar const { user, updateUser } = useAuth(); por const user = useSelector(selectUser);
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { user, updateUser } = useAuth();/const user = useSelector(selectUser);/g" {} \;

# Reemplazar const { login, isAuthenticated } = useAuth(); por const { login, isAuthenticated } = useReduxAuth();
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { login, isAuthenticated } = useAuth();/const { login, isAuthenticated } = useReduxAuth();/g" {} \;

# Reemplazar const { register, verifyUserEmail } = useAuth(); por const { register, verifyUserEmail } = useReduxAuth();
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { register, verifyUserEmail } = useAuth();/const { register, verifyUserEmail } = useReduxAuth();/g" {} \;

# Reemplazar const { user: currentUser, updateUser } = useAuth(); por const currentUser = useSelector(selectUser);
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { user: currentUser, updateUser } = useAuth();/const currentUser = useSelector(selectUser);/g" {} \;

# Reemplazar const { user: currentUser } = useAuth(); por const currentUser = useSelector(selectUser);
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { user: currentUser } = useAuth();/const currentUser = useSelector(selectUser);/g" {} \;

# Reemplazar const { user, logout } = useAuth(); por const user = useSelector(selectUser);
find src -name "*.js" -type f -exec sed -i '' \
  "s/const { user, logout } = useAuth();/const user = useSelector(selectUser);/g" {} \;

# Agregar import de useSelector donde sea necesario
find src -name "*.js" -type f -exec sed -i '' \
  "s/import { useReduxAuth as useAuth } from/import { useSelector } from 'react-redux';\nimport { selectUser } from '..\/store\/selectors\/authSelectors';\nimport { useReduxAuth } from/g" {} \;

echo "✅ Todos los usos de useAuth() eliminados!"
