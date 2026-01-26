#!/bin/bash

echo "🔧 Arreglando contextos que usan AuthContext..."

# Migrar contextos a usar Redux
find src/context -name "*.js" -type f -exec sed -i '' \
  "s/import { useAuth } from '\.\/AuthContext';/import { useSelector } from 'react-redux';\nimport { selectUser } from '..\/store\/selectors\/authSelectors';/g" {} \;

# Reemplazar const { user } = useAuth(); por const user = useSelector(selectUser);
find src/context -name "*.js" -type f -exec sed -i '' \
  "s/const { user } = useAuth();/const user = useSelector(selectUser);/g" {} \;

echo "✅ Contextos arreglados!"
