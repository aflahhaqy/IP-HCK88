#!/bin/bash

# Coffee Shop POS - EC2 Setup Script
# This script automates the setup process on a fresh Ubuntu EC2 instance

set -e

echo "=================================="
echo "Coffee Shop POS - EC2 Setup Script"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Please do not run as root. Run as ubuntu user."
    exit 1
fi

# Update system
echo "Step 1: Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo ""
echo "Step 2: Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
echo ""
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install PM2
echo ""
echo "Step 3: Installing PM2..."
sudo npm install -g pm2

# Install Git
echo ""
echo "Step 4: Installing Git..."
sudo apt install -y git

# Install Nginx
echo ""
echo "Step 5: Installing Nginx..."
sudo apt install -y nginx

# Enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo ""
echo "Step 6: Creating project directory..."
cd ~

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "Please create .env file with your environment variables before continuing."
    echo ""
    echo "Create .env file now? (y/n)"
    read -r create_env

    if [ "$create_env" = "y" ]; then
        echo ""
        echo "Creating .env file from example..."
        cp .env.example .env
        echo ""
        echo "✅ .env file created. Please edit it with your actual values:"
        echo "   nano .env"
        echo ""
        echo "After editing .env, run this script again."
        exit 0
    else
        echo "Please create .env file manually and run this script again."
        exit 0
    fi
fi

# Install dependencies
echo ""
echo "Step 7: Installing Node.js dependencies..."
npm install --production

# Create logs directory
echo ""
echo "Step 8: Creating logs directory..."
mkdir -p logs

# Run migrations
echo ""
echo "Step 9: Running database migrations..."
NODE_ENV=production npm run migrate

echo ""
echo "Migrations completed successfully!"

# Start with PM2
echo ""
echo "Step 10: Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
echo ""
echo "Step 11: Setting up PM2 startup script..."
pm2 startup | tail -n 1 | sudo bash

echo ""
echo "=================================="
echo "✅ Setup completed successfully!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Configure Nginx reverse proxy (see DEPLOYMENT.md)"
echo "2. Setup SSL certificate with Certbot (see DEPLOYMENT.md)"
echo "3. Test your API endpoints"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs coffee-shop-api - View logs"
echo "  pm2 restart coffee-shop-api - Restart app"
echo "  pm2 monit              - Monitor resources"
echo ""
echo "View full deployment guide: cat DEPLOYMENT.md"
echo ""
