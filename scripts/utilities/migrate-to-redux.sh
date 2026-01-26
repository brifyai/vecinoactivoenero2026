#!/bin/bash

# Script para migrar automáticamente imports de Context a Redux

echo "🚀 Iniciando migración automática a Redux..."

# Migrar useAuth
echo "📝 Migrando useAuth..."
find src -name "*.js" -type f -exec sed -i '' \
  "s/import { useAuth } from '..\/context\/AuthContext';/import { useReduxAuth as useAuth } from '..\/hooks\/useReduxAuth';/g" {} \;

find src -name "*.js" -type f -exec sed -i '' \
  "s/import { useAuth } from '..\/..\/context\/AuthContext';/import { useReduxAuth as useAuth } from '..\/..\/hooks\/useReduxAuth';/g" {} \;

find src -name "*.js" -type f -exec sed -i '' \
  "s/import { useAuth } from '..\/..\/..\/context\/AuthContext';/import { useReduxAuth as useAuth } from '..\/..\/..\/hooks\/useReduxAuth';/g" {} \;

# Migrar usePosts
echo "📝 Migrando usePosts..."
find src -name "*.js" -type f -exec sed -i '' \
  "s/import { usePosts } from '..\/context\/PostsContext';/import { useReduxPosts as usePosts } from '..\/hooks\/useReduxPosts';/g" {} \;

find src -name "*.js" -type f -exec sed -i '' \
  "s/import { usePosts } from '..\/..\/context\/PostsContext';/import { useReduxPosts as usePosts } from '..\/..\/hooks\/useReduxPosts';/g" {} \;

# Migrar useNotifications
echo "📝 Migrando useNotifications..."
find src -name "*.js" -type f -exec sed -i '' \
  "s/import { useNotifications } from '..\/context\/NotificationsContext';/import { useReduxNotifications as useNotifications } from '..\/hooks\/useReduxNotifications';/g" {} \;

find src -name "*.js" -type f -exec sed -i '' \
  "s/import { useNotifications } from '..\/..\/context\/NotificationsContext';/import { useReduxNotifications as useNotifications } from '..\/..\/hooks\/useReduxNotifications';/g" {} \;

echo "✅ Migración completada!"
echo "📊 Archivos modificados:"
git diff --name-only | wc -l
