# Troubleshooting Migration & Seeding di Ubuntu/EC2

## Error: "Please install mysql2 package manually"

### Penyebab:
Sequelize mencoba load semua database drivers saat startup, termasuk MySQL meskipun kita pakai PostgreSQL.

### Solusi:

#### Option 1: Ignore Warning (Recommended)
Jika aplikasi tetap jalan dan migration berhasil, warning ini bisa diabaikan. Sequelize hanya perlu `pg` package yang sudah terinstall.

#### Option 2: Set NODE_ENV Explicitly
```bash
# Pastikan NODE_ENV diset sebelum run migration
export NODE_ENV=production
npm run migrate
```

#### Option 3: Run Migration dengan Explicit Config
```bash
# Gunakan config spesifik (production)
npx sequelize-cli db:migrate --env production
```

---

## Error: "Connection Refused" atau "ECONNREFUSED"

### Penyebab:
- Database URL salah
- Firewall block koneksi
- Supabase credentials salah

### Solusi:

#### 1. Verify Database URL di .env
```bash
cat .env | grep DATABASE_URL
```

Format harus seperti ini:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### 2. Test Koneksi Manual dengan psql
```bash
# Install psql jika belum ada
sudo apt install postgresql-client -y

# Test koneksi
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Jika berhasil connect, akan muncul PostgreSQL prompt:
```
postgres=>
```

Ketik `\q` untuk keluar.

#### 3. Check Environment Variables Loaded
```bash
# Test apakah .env terbaca
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

---

## Error: "Dialect needs to be explicitly supplied"

### Penyebab:
Sequelize tidak bisa detect dialect dari DATABASE_URL.

### Solusi:

Pastikan [config/config.json](c:\Users\eki\OneDrive\文档\Hacktiv8\3-phase2\IP-HCK88\server\config\config.json) production config sudah benar:

```json
{
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    },
    "logging": false
  }
}
```

---

## Error: "SSL connection required"

### Penyebab:
Supabase requires SSL connection, tapi config tidak include SSL options.

### Solusi:

Update [config/config.json](c:\Users\eki\OneDrive\文档\Hacktiv8\3-phase2\IP-HCK88\server\config\config.json):

```json
{
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

---

## Error: "relation does not exist" atau "table not found"

### Penyebab:
Migration belum jalan atau gagal.

### Solusi:

#### 1. Check Migration Status
```bash
# List migrations yang sudah jalan
npx sequelize-cli db:migrate:status --env production
```

#### 2. Undo & Re-run Migrations
```bash
# Undo last migration
npx sequelize-cli db:migrate:undo --env production

# Re-run all migrations
npx sequelize-cli db:migrate --env production
```

#### 3. Check di Supabase Dashboard
- Login ke Supabase
- Go to Table Editor
- Verify tables created

---

## Error: "No migrations were executed"

### Penyebab:
Semua migrations sudah pernah jalan.

### Solusi:

Ini bukan error! Artinya database sudah up-to-date.

Check dengan:
```bash
npx sequelize-cli db:migrate:status --env production
```

Output seharusnya:
```
up 20241015124633-create-inventory.js
up 20251016112520-fix-inventory-staffid-fkey.js
...
```

---

## Error: "password authentication failed"

### Penyebab:
Password salah di DATABASE_URL.

### Solusi:

#### 1. Get Correct Password dari Supabase
- Login ke Supabase Dashboard
- Settings > Database
- Reset password jika lupa
- Copy Connection String yang baru

#### 2. Update .env
```bash
nano .env
# Update DATABASE_URL dengan password yang benar
```

#### 3. Restart App
```bash
pm2 restart coffee-shop-api
```

---

## Error: "node_modules not found" atau Module Error

### Penyebab:
Dependencies belum terinstall.

### Solusi:

```bash
# Install dependencies
npm install --production

# Atau jika ada permission issue
sudo npm install --production --unsafe-perm
```

---

## Error: Permission Denied saat Migration

### Penyebab:
User PostgreSQL tidak punya permission untuk create tables.

### Solusi:

Di Supabase, default user `postgres` sudah punya full permission. Tapi jika pakai custom user:

```sql
-- Login ke Supabase SQL Editor dan run:
GRANT ALL PRIVILEGES ON DATABASE postgres TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

---

## Complete Migration & Seeding Steps (Ubuntu/EC2)

### Step-by-Step:

```bash
# 1. Navigate to project directory
cd ~/your-repo/server

# 2. Verify .env file exists and correct
cat .env

# 3. Test database connection
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -c "SELECT version();"

# 4. Install dependencies if not done
npm install --production

# 5. Check current migration status
NODE_ENV=production npx sequelize-cli db:migrate:status

# 6. Run migrations
NODE_ENV=production npx sequelize-cli db:migrate

# 7. (Optional) Run seeders if you have them
NODE_ENV=production npx sequelize-cli db:seed:all

# 8. Verify tables created in Supabase Dashboard
# Go to Supabase > Table Editor > Should see all tables
```

---

## Debug Mode - Run with Verbose Logging

```bash
# Run migration with full SQL logging
NODE_ENV=production DEBUG=sequelize:* npx sequelize-cli db:migrate

# Or temporary enable logging in config
# Edit config/config.json production config:
{
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    },
    "logging": console.log  // Enable SQL logging
  }
}
```

---

## Common Issues Checklist

Check these jika migration/seeding gagal:

- [ ] ✅ Node.js version >= 18 (`node --version`)
- [ ] ✅ `pg` package installed (`npm list pg`)
- [ ] ✅ `.env` file exists dan isinya benar
- [ ] ✅ `DATABASE_URL` di .env format benar
- [ ] ✅ Password di DATABASE_URL correct
- [ ] ✅ Supabase project active dan accessible
- [ ] ✅ EC2 Security Group allow outbound port 5432
- [ ] ✅ `NODE_ENV=production` saat run migration
- [ ] ✅ File `config/config.json` production config correct
- [ ] ✅ Migration files ada di `migrations/` folder
- [ ] ✅ Test psql connection berhasil

---

## Get Help

Jika masih error, jalankan dan kirim output:

```bash
# 1. Node version
node --version

# 2. NPM list pg package
npm list pg

# 3. Check .env (hide password)
cat .env | grep DATABASE_URL | sed 's/:[^@]*@/:***@/'

# 4. Test database connection
psql "$(grep DATABASE_URL .env | cut -d= -f2)" -c "SELECT version();"

# 5. Migration status
NODE_ENV=production npx sequelize-cli db:migrate:status

# 6. Try migrate with verbose
NODE_ENV=production npx sequelize-cli db:migrate 2>&1 | tee migrate-error.log

# Send migrate-error.log for diagnosis
```

---

## Quick Fix Script

Buat script untuk auto-fix common issues:

```bash
#!/bin/bash
# fix-migration.sh

echo "🔍 Checking environment..."

# Check NODE_ENV
export NODE_ENV=production
echo "✅ NODE_ENV=$NODE_ENV"

# Check .env
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi
echo "✅ .env file exists"

# Check DATABASE_URL
if ! grep -q DATABASE_URL .env; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi
echo "✅ DATABASE_URL found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run migration
echo "🔄 Running migrations..."
npx sequelize-cli db:migrate --env production

echo "✅ Done!"
```

Save as `fix-migration.sh`, then:
```bash
chmod +x fix-migration.sh
./fix-migration.sh
```
