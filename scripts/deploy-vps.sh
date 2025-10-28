#!/bin/bash
set -e

echo "========================================="
echo "TogetherOS VPS Deployment Script"
echo "Domain: coopeverything.org"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="coopeverything.org"
APP_DIR="/var/www/togetheros"
APP_USER="www-data"
NODE_VERSION="20"

echo -e "${YELLOW}Step 1/10: Checking prerequisites...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}Please run as root (sudo su)${NC}"
   exit 1
fi

echo -e "${GREEN}✓ Running as root${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js ${NODE_VERSION}...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
else
    NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -lt 20 ]; then
        echo -e "${YELLOW}Upgrading Node.js to v${NODE_VERSION}...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    fi
fi

echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found. Installing...${NC}"
    apt-get install -y npm
fi

echo -e "${GREEN}✓ npm $(npm -v) installed${NC}"

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

echo -e "${GREEN}✓ PM2 installed${NC}"

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    apt-get update -qq
    apt-get install -y nginx
fi

echo -e "${GREEN}✓ Nginx installed${NC}"

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt-get install -y certbot python3-certbot-nginx
fi

echo -e "${GREEN}✓ Certbot installed${NC}"

echo -e "${YELLOW}Step 2/10: Cloning repository...${NC}"

# Remove old installation if exists
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Removing old installation...${NC}"
    pm2 delete togetheros 2>/dev/null || true
    rm -rf "$APP_DIR"
fi

# Clone repository
git clone https://github.com/coopeverything/TogetherOS.git "$APP_DIR"
cd "$APP_DIR"

echo -e "${GREEN}✓ Repository cloned to $APP_DIR${NC}"

echo -e "${YELLOW}Step 3/10: Installing dependencies...${NC}"
npm install --force --no-package-lock

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}Step 4/10: Setting up environment variables...${NC}"

# Prompt for OpenAI API key
echo -e "${YELLOW}Please enter your OpenAI API key:${NC}"
read -r OPENAI_KEY

# Create .env file
cat > apps/web/.env.production << EOF
# OpenAI API Key
OPENAI_API_KEY=${OPENAI_KEY}

# Bridge Configuration
BRIDGE_RATE_LIMIT_PER_HOUR=30
BRIDGE_IP_SALT=$(openssl rand -hex 32)
BRIDGE_ENV=production

# Next.js
NEXTAUTH_URL=https://${DOMAIN}
EOF

echo -e "${GREEN}✓ Environment variables configured${NC}"

echo -e "${YELLOW}Step 5/10: Building application...${NC}"
cd apps/web
npm run build

echo -e "${GREEN}✓ Application built successfully${NC}"

echo -e "${YELLOW}Step 6/10: Setting up PM2...${NC}"
cd "$APP_DIR/apps/web"

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'togetheros',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/togetheros/apps/web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 delete togetheros 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ PM2 configured and running${NC}"

echo -e "${YELLOW}Step 7/10: Configuring Nginx...${NC}"

# Create Nginx configuration
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Increase timeouts for streaming responses
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

echo -e "${YELLOW}Step 8/10: Setting up SSL certificate...${NC}"

# Check if DNS is pointing to this server
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short ${DOMAIN} | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo -e "${YELLOW}WARNING: DNS not pointing to this server yet${NC}"
    echo -e "${YELLOW}Server IP: $SERVER_IP${NC}"
    echo -e "${YELLOW}Domain IP: $DOMAIN_IP${NC}"
    echo -e "${YELLOW}Skipping SSL setup. Run this command later:${NC}"
    echo -e "${YELLOW}certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
else
    echo -e "${GREEN}DNS looks good! Setting up SSL...${NC}"
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect
    echo -e "${GREEN}✓ SSL certificate installed${NC}"
fi

echo -e "${YELLOW}Step 9/10: Setting file permissions...${NC}"
chown -R www-data:www-data "$APP_DIR"

echo -e "${GREEN}✓ Permissions set${NC}"

echo -e "${YELLOW}Step 10/10: Testing deployment...${NC}"

# Test local connection
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Application running on port 3000${NC}"
else
    echo -e "${RED}✗ Application not responding on port 3000${NC}"
    echo "Checking PM2 logs:"
    pm2 logs togetheros --lines 20
fi

echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Your application should be accessible at:"
echo "  http://${DOMAIN}"
if [ "$SERVER_IP" == "$DOMAIN_IP" ]; then
    echo "  https://${DOMAIN}"
fi
echo ""
echo "Useful commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs togetheros  - View application logs"
echo "  pm2 restart togetheros - Restart application"
echo "  pm2 stop togetheros  - Stop application"
echo "  nginx -t             - Test Nginx configuration"
echo "  systemctl status nginx - Check Nginx status"
echo ""
echo -e "${YELLOW}Remember to delete the claude-deploy user after testing:${NC}"
echo "  sudo pkill -u claude-deploy"
echo "  sudo userdel -r claude-deploy"
echo ""
