#!/bin/bash

# This script moves unused template files to a backup directory
# Based on knowing which files are actually used in the Support Company app

BACKUP_DIR="./unused-template-files"

# Components we know are NOT used (template files)
UNUSED_COMPONENTS=(
  "components/chat-widget-ai.tsx"
  "components/chat-widget-hybrid.tsx"
  "components/chat-widget-interactive.tsx"
  "components/chat-widget-multi-message.tsx"
  "components/chat-widget-natural.tsx"
  "components/chat-widget-sequential.tsx"
  "components/chat-widget.tsx"
  "components/code-block.tsx"
  "components/greeting.tsx"
  "components/icons.tsx"
  "components/placeholder-generator.tsx"
  "components/submit-button.tsx"
  "components/theme-provider.tsx"
  "components/toast.tsx"
)

# Unused AI/lib files
UNUSED_LIB=(
  "lib/ai/interactive-prompts.ts"
  "lib/ai/intro-prompts.ts"
  "lib/ai/models.test.ts"
  "lib/ai/models.ts"
  "lib/ai/prompts.ts"
  "lib/ai/providers.ts"
  "lib/ai/tools/create-document.ts"
  "lib/ai/tools/get-weather.ts"
  "lib/ai/tools/request-suggestions.ts"
  "lib/ai/tools/update-document.ts"
  "lib/artifacts/server.ts"
  "lib/constants.ts"
  "lib/errors.ts"
)

# Move .bak files
echo "Moving .bak files..."
find . -name "*.bak" -not -path "./node_modules/*" -not -path "./.next/*" | while read file; do
  dir=$(dirname "$file")
  mkdir -p "$BACKUP_DIR/$dir"
  mv "$file" "$BACKUP_DIR/$file"
  echo "Moved: $file"
done

# Move unused components
echo -e "\nMoving unused component files..."
for file in "${UNUSED_COMPONENTS[@]}"; do
  if [ -f "$file" ]; then
    dir=$(dirname "$file")
    mkdir -p "$BACKUP_DIR/$dir"
    mv "$file" "$BACKUP_DIR/$file"
    echo "Moved: $file"
  fi
done

# Move unused lib files
echo -e "\nMoving unused lib files..."
for file in "${UNUSED_LIB[@]}"; do
  if [ -f "$file" ]; then
    dir=$(dirname "$file")
    mkdir -p "$BACKUP_DIR/$dir"
    mv "$file" "$BACKUP_DIR/$file"
    echo "Moved: $file"
  fi
done

# Move test files (not needed for production)
echo -e "\nMoving test files..."
if [ -d "tests" ]; then
  mv tests "$BACKUP_DIR/"
  echo "Moved: tests directory"
fi

echo -e "\nCleanup complete! Unused files moved to: $BACKUP_DIR"
echo "You can safely delete this directory once you verify the app works correctly."