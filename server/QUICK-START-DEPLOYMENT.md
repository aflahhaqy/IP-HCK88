# Quick Start - Deploy to EC2 in 10 Minutes

## Before You Start

### 1. Get Supabase Database URL
- Go to https://supabase.com
- Login and create a new project (or use existing)
- Go to **Settings** > **Database**
- Copy **Connection String (URI)**
- It looks like: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

### 2. Launch EC2 Instance
- Instance Type: **t2.small** or higher
- OS: **Ubuntu 22.04 LTS**
- Security Group: Open ports **22, 80, 443, 3000**
- Download the **.pem** key file

---

## Deployment Steps

### 1. Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 2. Upload/Clone Your Code
```bash
# Clone from GitHub
git clone https://github.com/yourusername/your-repo.git
cd your-repo/server

# OR upload via SCP from your local machine:
# scp -i "your-key.pem" -r ./server ubuntu@your-ec2-ip:~/
```

### 3. Create Environment File
```bash
nano .env
```

Paste this (replace with your actual values):
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
SECRET_KEY=your_jwt_secret_key_min_32_chars
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
OPENAI_API_KEY=your_openai_api_key
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4. Install Dependencies & Setup
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install project dependencies
npm install --production

# Create logs directory
mkdir -p logs

# Run migrations
NODE_ENV=production npm run migrate
```

### 5. Start with PM2 using ecosystem.config.js
```bash
# Start app with PM2 (reads ecosystem.config.js automatically)
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to auto-start on system reboot
pm2 startup
# Copy and run the command that PM2 outputs, example:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Check status
pm2 status
```

**Why use ecosystem.config.js?**
- ✅ All PM2 settings in one file
- ✅ Auto-restart on crash
- ✅ Memory management (max 1GB)
- ✅ Log management
- ✅ Easy to version control

### 6. Configure Nginx (Quick)
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace content with:
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### 7. Test Your API
```bash
# Test locally on EC2
curl http://localhost:3000

# Test from your browser
http://your-ec2-public-ip
```

---

## Done! 🎉

Your API is now running on:
- **With Nginx:** `http://your-ec2-public-ip`
- **Direct:** `http://your-ec2-public-ip:3000`

---

## Common Commands

```bash
# Check app status
pm2 status

# View logs
pm2 logs coffee-shop-api

# Restart app
pm2 restart coffee-shop-api

# Stop app
pm2 stop coffee-shop-api
```

---

## Optional: Add SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Done! Your API now runs on HTTPS
```

---

## Troubleshooting

**App not starting?**
```bash
pm2 logs coffee-shop-api
```

**Nginx error?**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Database connection failed?**
- Check DATABASE_URL in .env
- Verify Supabase allows connections from EC2 IP
- Test: `psql "your-database-url"`

**Port 3000 already in use?**
```bash
sudo lsof -i :3000
# Kill the process or change PORT in .env
```

---

## Need More Help?

Read the full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
