# Deployment Guide - Coffee Shop POS API to AWS EC2

## Prerequisites

### 1. Supabase Database Setup
- Create a Supabase project at https://supabase.com
- Get your DATABASE_URL from Supabase Dashboard:
  - Go to Settings > Database
  - Copy the Connection String (URI format)
  - Example: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### 2. AWS EC2 Instance
- Launch an EC2 instance (Ubuntu 22.04 LTS recommended)
- Instance type: t2.small or higher (minimum 2GB RAM)
- Security Group: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (API)
- Create or use existing Key Pair (.pem file)

### 3. Domain (Optional)
- Point your domain A record to EC2 Public IP
- Example: api.yourdomain.com → EC2_IP

---

## Step 1: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

---

## Step 2: Install Node.js and Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

---

## Step 3: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/your-repo.git

# Or if using private repo:
# git clone https://your-token@github.com/yourusername/your-repo.git

# Navigate to server directory
cd your-repo/server
```

---

## Step 4: Setup Environment Variables

```bash
# Create .env file
nano .env
```

Paste your environment variables:

```env
NODE_ENV=production
PORT=3000

# Supabase Database URL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Secret (generate a strong random string)
SECRET_KEY=your_very_long_secret_key_minimum_32_characters

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
```

Save with `Ctrl+O`, `Enter`, then `Ctrl+X`

---

## Step 5: Install Dependencies and Run Migrations

```bash
# Install Node modules
npm install --production

# Run database migrations
NODE_ENV=production npm run migrate

# Optional: Seed initial data (if you have seeders)
# NODE_ENV=production npm run seed
```

---

## Step 6: Create Logs Directory

```bash
# Create logs directory for PM2
mkdir -p logs
```

---

## Step 7: Start Application with PM2

```bash
# Start app using PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs coffee-shop-api

# Monitor
pm2 monit
```

---

## Step 8: Configure PM2 Startup Script

```bash
# Generate startup script
pm2 startup

# Copy and run the command that PM2 outputs
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save PM2 process list
pm2 save
```

---

## Step 9: Setup Nginx Reverse Proxy (Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/coffee-shop-api
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/coffee-shop-api /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

---

## Step 10: Setup SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## Useful PM2 Commands

```bash
# Restart app
pm2 restart coffee-shop-api

# Stop app
pm2 stop coffee-shop-api

# Delete app from PM2
pm2 delete coffee-shop-api

# View logs
pm2 logs coffee-shop-api --lines 100

# Monitor
pm2 monit

# Show app info
pm2 show coffee-shop-api
```

---

## Update/Redeploy Application

```bash
# Navigate to project directory
cd ~/your-repo/server

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install --production

# Run new migrations (if any)
NODE_ENV=production npm run migrate

# Restart app
pm2 restart coffee-shop-api

# Check logs
pm2 logs coffee-shop-api --lines 50
```

---

## Troubleshooting

### Check if app is running
```bash
pm2 status
pm2 logs coffee-shop-api
```

### Check Nginx status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check port usage
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80
```

### Database connection issues
```bash
# Test database connection from EC2
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### Check firewall
```bash
# Check UFW status
sudo ufw status

# Allow ports if needed
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
```

### View application errors
```bash
pm2 logs coffee-shop-api --err --lines 100
```

---

## Environment Checklist

- [ ] Supabase database created and accessible
- [ ] DATABASE_URL correctly set in .env
- [ ] All API keys (Midtrans, OpenAI, Google) configured
- [ ] EC2 Security Group allows ports 80, 443, 3000
- [ ] Migrations run successfully
- [ ] PM2 running and saved
- [ ] Nginx configured and running
- [ ] SSL certificate installed (if using domain)
- [ ] Application accessible via browser

---

## API Endpoints to Test

After deployment, test these endpoints:

```bash
# Health check (replace with your domain or IP)
curl http://your-domain.com/

# Get products
curl http://your-domain.com/

# Staff login
curl -X POST http://your-domain.com/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"password"}'
```

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs coffee-shop-api`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables: `cat .env`
4. Test database connection from EC2
5. Check EC2 Security Group settings in AWS Console
