#!/bin/bash
set -e

echo "Setting up togetheros.deeperlayers.com..."

# Create Nginx configuration
cat > /etc/nginx/sites-available/togetheros.deeperlayers.com << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name togetheros.deeperlayers.com;

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

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

echo "✓ Configuration created"

# Enable the site
ln -sf /etc/nginx/sites-available/togetheros.deeperlayers.com /etc/nginx/sites-enabled/
echo "✓ Site enabled"

# Test Nginx
nginx -t
echo "✓ Nginx test passed"

# Restart Nginx
systemctl restart nginx
echo "✓ Nginx restarted"

echo ""
echo "Done! Now add DNS A record:"
echo "  Host: togetheros.deeperlayers.com"
echo "  Points to: 72.60.27.167"
echo ""
echo "Then test with:"
echo "  curl -I http://togetheros.deeperlayers.com"
