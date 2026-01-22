#!/bin/bash

# List of context files to migrate
contexts=(
  "src/context/FriendsContext.js"
  "src/context/HelpRequestsContext.js"
  "src/context/SharedResourcesContext.js"
  "src/context/ProjectsContext.js"
  "src/context/PollsContext.js"
  "src/context/CommunityCalendarContext.js"
  "src/context/PostsContext.js"
)

echo "🚀 Migrating contexts to use Redux notifications..."

for file in "${contexts[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Processing $file..."
    
    # Replace import statement
    sed -i '' "s/import { useNotifications } from '\.\/NotificationsContext';/import { useDispatch } from 'react-redux';\nimport { createNotification } from '..\/store\/slices\/notificationsSlice';/" "$file"
    
    # Replace useNotifications() hook call
    sed -i '' 's/const { addNotification } = useNotifications();/const dispatch = useDispatch();/' "$file"
    
    # Replace addNotification calls with dispatch(createNotification(...))
    # This is more complex, so we'll use perl for better regex support
    perl -i -pe 's/addNotification\(([^,]+),\s*{/dispatch(createNotification({\n        userId: $1,/g' "$file"
    
    echo "  ✅ Migrated $file"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ Migration complete!"
