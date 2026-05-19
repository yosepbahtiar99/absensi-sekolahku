#!/bin/bash

# Configuration
APP_DIR="/root/absensi-sekolahku"
NGINX_ROOT="/var/www/absensi"
PM2_NAME="absensi-api"
NODE_VERSION="22"

# Colors for logging
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Deployment for Absensi Sekolahku...${NC}"

# Navigate to app directory
cd $APP_DIR || { echo -e "${RED}Directory $APP_DIR not found!${NC}"; exit 1; }

# Save current commit hash for potential rollback
OLD_COMMIT=$(git rev-parse HEAD)

echo -e "${GREEN}1. Pulling latest code from master branch...${NC}"
git fetch origin master
git reset --hard origin/master || { echo -e "${RED}Git pull failed!${NC}"; exit 1; }
NEW_COMMIT=$(git rev-parse HEAD)

# Make sure we use the correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use $NODE_VERSION

# Check if client dependencies changed
CLIENT_CHANGED=$(git diff --name-only $OLD_COMMIT $NEW_COMMIT | grep "^client/package.json")
# Check if server dependencies changed
SERVER_CHANGED=$(git diff --name-only $OLD_COMMIT $NEW_COMMIT | grep "^server/package.json")

# -----------------
# 2. Deploy Backend
# -----------------
echo -e "${GREEN}2. Deploying Backend...${NC}"
cd $APP_DIR/server

if [ -n "$SERVER_CHANGED" ]; then
    echo -e "${YELLOW}Server dependencies changed. Installing npm modules...${NC}"
    npm install || { echo -e "${RED}Backend npm install failed! Rollback initiated.${NC}"; git reset --hard $OLD_COMMIT; exit 1; }
else
    echo -e "${YELLOW}No server dependencies changed. Skipping npm install.${NC}"
fi

# Restart PM2
pm2 restart $PM2_NAME || pm2 start index.js --name $PM2_NAME
echo -e "${GREEN}Backend deployed successfully!${NC}"


# -----------------
# 3. Deploy Frontend
# -----------------
echo -e "${GREEN}3. Deploying Frontend...${NC}"
cd $APP_DIR/client

if [ -n "$CLIENT_CHANGED" ]; then
    echo -e "${YELLOW}Client dependencies changed. Installing npm modules...${NC}"
    npm install || { echo -e "${RED}Frontend npm install failed! Rollback initiated.${NC}"; git reset --hard $OLD_COMMIT; pm2 restart $PM2_NAME; exit 1; }
else
    echo -e "${YELLOW}No client dependencies changed. Skipping npm install.${NC}"
fi

# Build frontend
echo -e "${YELLOW}Building React/Vite app...${NC}"
npm run build || { echo -e "${RED}Frontend build failed! Rollback initiated.${NC}"; git reset --hard $OLD_COMMIT; pm2 restart $PM2_NAME; exit 1; }

# Copy to Nginx directory
echo -e "${YELLOW}Syncing dist to $NGINX_ROOT...${NC}"
# Use rsync to copy and delete old files but preserve ownership if necessary
rsync -a --delete dist/ $NGINX_ROOT/ || { echo -e "${RED}Failed to sync files to Nginx root!${NC}"; exit 1; }

echo -e "${GREEN}Frontend deployed successfully!${NC}"

# Set permissions for Nginx just to be safe
chown -R www-data:www-data $NGINX_ROOT
find $NGINX_ROOT -type d -exec chmod 755 {} \;
find $NGINX_ROOT -type f -exec chmod 644 {} \;

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETED SUCCESSFULLY! 🚀${NC}"
echo -e "${GREEN}=======================================${NC}"
exit 0
