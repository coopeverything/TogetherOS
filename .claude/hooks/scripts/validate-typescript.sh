#!/usr/bin/env bash
# TypeScript Validation Hook
# Runs TypeScript type checking before commits to catch errors early

set -euo pipefail

echo "🔍 Running TypeScript type check..."

# Build packages first (required for type checking)
if ! npm run build:packages 2>&1 | grep -q "successfully"; then
  echo "❌ Package build failed"
  exit 1
fi

# Run TypeScript type check
if npx tsc --noEmit; then
  echo "✅ TypeScript check passed"
  exit 0
else
  echo "❌ TypeScript errors found. Please fix before committing."
  echo ""
  echo "💡 Tip: Run 'npx tsc --noEmit' locally to see all errors"
  exit 1
fi
