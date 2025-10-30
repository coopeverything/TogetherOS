#!/bin/bash
set -e

echo "========================================="
echo "Deploying TogetherOS to coopeverything.org"
echo "========================================="

DOMAIN="coopeverything.org"
APP_DIR="/var/www/togetheros/apps/web"

# Remove old subdomain config
echo "Removing togetheros.deeperlayers.com config..."
rm -f /etc/nginx/sites-enabled/togetheros.deeperlayers.com
rm -f /etc/nginx/sites-available/togetheros.deeperlayers.com

# Create Nginx configuration for coopeverything.org
echo "Creating Nginx configuration for $DOMAIN..."
cat > /etc/nginx/sites-available/${DOMAIN} << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name coopeverything.org www.coopeverything.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeouts for streaming responses
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

# Enable site
echo "Enabling site..."
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Test Nginx
echo "Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "Restarting Nginx..."
systemctl restart nginx

echo ""
echo "✓ Nginx configured for $DOMAIN"
echo ""
echo "The app is already running on port 3000 via PM2"
echo "Bridge is accessible at: http://$DOMAIN/bridge"
echo ""
echo "DNS Configuration needed:"
echo "  Type: A"
echo "  Host: coopeverything.org"
echo "  Points to: 72.60.27.167"
echo ""
echo "After DNS propagates, test with:"
echo "  curl -I http://coopeverything.org"
echo ""
echo "To set up SSL (after DNS works), run:"
echo "  certbot --nginx -d coopeverything.org -d www.coopeverything.org"
echo ""
