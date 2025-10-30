#!/bin/bash
set -e

echo "Updating TogetherOS on VPS..."

cd /var/www/togetheros

echo "→ Pulling latest code..."
git pull origin yolo

echo "→ Installing dependencies..."
cd apps/web
npm install

echo "→ Building application..."
npm run build

echo "→ Restarting PM2..."
pm2 restart togetheros

echo "✓ Update complete!"
echo "Visit: https://coopeverything.org/design"
