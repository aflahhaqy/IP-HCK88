# PM2 & ecosystem.config.js Guide

## What is PM2?

PM2 adalah **production process manager** untuk Node.js yang:
- ✅ Menjalankan aplikasi di background
- ✅ Auto-restart jika aplikasi crash
- ✅ Load balancing (jika pakai cluster mode)
- ✅ Log management
- ✅ Memory monitoring & auto-restart
- ✅ Auto-start saat server reboot

---

## What is ecosystem.config.js?

File `ecosystem.config.js` adalah **configuration file** untuk PM2 yang berisi semua setting aplikasi Anda dalam satu file.

### Our Configuration:

```javascript
module.exports = {
  apps: [{
    name: 'coffee-shop-api',              // Nama aplikasi di PM2
    script: './app.js',                    // File entry point
    instances: 1,                          // Jumlah instance (1 = single process)
    autorestart: true,                     // Auto-restart jika crash
    watch: false,                          // Tidak auto-reload saat file berubah
    max_memory_restart: '1G',              // Restart jika memory > 1GB
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',          // Log error
    out_file: './logs/out.log',            // Log stdout
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true                       // Gabung semua log
  }]
};
```

---

## How to Use PM2 with ecosystem.config.js

### 1. Start Application

```bash
# Start dengan ecosystem.config.js (PM2 otomatis detect file ini)
pm2 start ecosystem.config.js

# Atau spesifik nama file
pm2 start ecosystem.config.js --env production
```

### 2. Check Status

```bash
pm2 status
```

Output:
```
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ mode        │ ↺       │ status  │ cpu      │
├─────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ coffee-shop-api  │ fork        │ 0       │ online  │ 0%       │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### 3. View Logs

```bash
# View all logs (real-time)
pm2 logs coffee-shop-api

# View only error logs
pm2 logs coffee-shop-api --err

# View last 100 lines
pm2 logs coffee-shop-api --lines 100

# View logs in file
cat logs/out.log
cat logs/err.log
```

### 4. Restart Application

```bash
# Restart aplikasi
pm2 restart coffee-shop-api

# Reload (zero-downtime reload for cluster mode)
pm2 reload coffee-shop-api

# Restart semua aplikasi
pm2 restart all
```

### 5. Stop Application

```bash
# Stop aplikasi (masih ada di PM2 list)
pm2 stop coffee-shop-api

# Delete dari PM2 list
pm2 delete coffee-shop-api

# Stop semua
pm2 stop all
```

### 6. Monitor Resources

```bash
# Monitor CPU, Memory usage (real-time)
pm2 monit

# Show detailed info
pm2 show coffee-shop-api

# List processes with memory usage
pm2 list
```

### 7. Save Configuration

```bash
# Save current PM2 process list
pm2 save

# Ini akan save ke ~/.pm2/dump.pm2
# Jadi saat server reboot, PM2 bisa restore process list
```

### 8. Auto-Start on System Reboot

```bash
# Generate startup script
pm2 startup

# Output akan memberi command yang harus dijalankan, contoh:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Copy dan run command tersebut
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save process list
pm2 save

# Test: reboot server dan cek apakah app auto-start
sudo reboot
```

---

## Common PM2 Commands Cheat Sheet

```bash
# Start
pm2 start ecosystem.config.js
pm2 start app.js --name my-api

# Status & Info
pm2 status
pm2 list
pm2 show coffee-shop-api
pm2 monit

# Logs
pm2 logs
pm2 logs coffee-shop-api
pm2 logs --lines 100
pm2 flush                    # Clear all logs

# Control
pm2 restart coffee-shop-api
pm2 reload coffee-shop-api
pm2 stop coffee-shop-api
pm2 delete coffee-shop-api

# Save & Startup
pm2 save
pm2 startup
pm2 unstartup               # Remove startup script

# Update PM2
pm2 update                  # Update PM2 in-memory
npm install -g pm2@latest   # Update PM2 globally
pm2 resurrect               # Restore saved processes
```

---

## Update Application (After Git Pull)

```bash
# 1. Pull latest code
cd ~/your-repo/server
git pull origin main

# 2. Install new dependencies (if any)
npm install --production

# 3. Run new migrations (if any)
NODE_ENV=production npm run migrate

# 4. Restart with PM2
pm2 restart ecosystem.config.js

# 5. Check logs
pm2 logs coffee-shop-api --lines 50
```

---

## Advanced: Cluster Mode (Multiple Instances)

Jika ingin run multiple instances untuk load balancing:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'coffee-shop-api',
    script: './app.js',
    instances: 'max',          // Auto-detect CPU cores
    // atau: instances: 2,     // Run 2 instances
    exec_mode: 'cluster',      // Enable cluster mode
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

**Note:** Untuk aplikasi kecil-menengah, **single instance (instances: 1)** sudah cukup.

---

## Troubleshooting

### App tidak start?
```bash
pm2 logs coffee-shop-api
# Check error di logs
```

### App crash terus-menerus?
```bash
pm2 show coffee-shop-api
# Check restart count dan error logs
```

### Memory leak?
```bash
pm2 monit
# Monitor memory usage
# Jika memory terus naik, ada memory leak di code
```

### Port sudah dipakai?
```bash
sudo lsof -i :3000
# Kill process atau change PORT di .env
```

### PM2 tidak auto-start setelah reboot?
```bash
# Re-setup startup script
pm2 unstartup
pm2 startup
# Run command yang PM2 berikan
pm2 save
```

---

## Environment Variables dengan PM2

Ada 2 cara set environment variables:

### 1. Pakai .env file (Recommended)
```bash
# .env file akan otomatis dibaca oleh dotenv
# Pastikan ada require('dotenv').config() di app.js
pm2 start ecosystem.config.js
```

### 2. Pakai env di ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'coffee-shop-api',
    script: './app.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'your_database_url'
    }
  }]
};
```

**Recommendation:** Gunakan `.env` file untuk secrets, dan `ecosystem.config.js` untuk non-sensitive configs.

---

## PM2 Web Dashboard (Optional)

PM2 punya web dashboard untuk monitoring:

```bash
# Install PM2 Plus (free tier available)
pm2 link [secret-key] [public-key]

# Access dashboard di https://app.pm2.io
```

---

## Summary

✅ **Start:** `pm2 start ecosystem.config.js`
✅ **Status:** `pm2 status`
✅ **Logs:** `pm2 logs coffee-shop-api`
✅ **Restart:** `pm2 restart coffee-shop-api`
✅ **Monitor:** `pm2 monit`
✅ **Save:** `pm2 save`
✅ **Startup:** `pm2 startup` → run command → `pm2 save`

Dengan `ecosystem.config.js`, semua configuration tersimpan rapi di version control dan mudah di-replicate ke server lain!
