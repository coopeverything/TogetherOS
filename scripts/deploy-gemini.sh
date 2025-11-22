#!/bin/bash
set -exuo pipefail

echo "🚀 Starting deployment..."

# Load credentials from environment variables
if [ -z "$GEMINI_VPS_SSH_PRIVATE_KEY" ] || [ -z "$GEMINI_VPS_HOST" ] || [ -z "$GEMINI_VPS_USER" ]; then
  echo "❌ Error: GEMINI_VPS_SSH_PRIVATE_KEY, GEMINI_VPS_HOST, and GEMINI_VPS_USER must be set as environment variables."
  exit 1
fi

# Configure SSH
mkdir -p ~/.ssh
echo "$GEMINI_VPS_SSH_PRIVATE_KEY" > ~/.ssh/deploy_key
chmod 600 ~/.ssh/deploy_key
ssh-keyscan -H "$GEMINI_VPS_HOST" >> ~/.ssh/known_hosts

# Deploy via SSH
ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no ${GEMINI_VPS_USER}@${GEMINI_VPS_HOST} bash -s << 'ENDSSH'
  set -exuo pipefail
  echo "🚀 Starting deployment on server..."

  cd /var/www/togetheros

  echo "→ Pulling latest code from yolo..."
  git fetch origin yolo 2>&1
  git reset --hard origin/yolo 2>&1

  echo "→ Running database migrations..."
  set +e
  export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
  bash scripts/run-migrations.sh 2>&1
  MIGRATION_EXIT=$?
  set -e
  if [ $MIGRATION_EXIT -ne 0 ]; then
    echo "⚠️  Migration failed (exit code: $MIGRATION_EXIT), continuing with deployment..."
    echo "Database may need manual intervention"
  fi

  echo "→ Installing dependencies..."
  npm install --production=false 2>&1 | tail -20

  echo "→ Building TypeScript packages..."
  npm run build:packages 2>&1 | tail -10

  echo "→ Cleaning previous build..."
  cd apps/web
  rm -rf .next
  echo "✓ .next directory removed"

  echo "→ Building application..."
  npm run build 2>&1 || {
    echo "❌ Build failed!"
    exit 1
  }
  echo "✓ Build complete"

  echo "→ Restarting PM2..."
  pm2 restart togetheros 2>&1 || pm2 start ecosystem.config.js 2>&1
  pm2 status togetheros 2>&1

  echo "✅ Deployment complete!"
  echo "Visit: https://coopeverything.org"
ENDSSH

# Cleanup SSH key
rm -f ~/.ssh/deploy_key

echo "✅ Deployment script finished."
