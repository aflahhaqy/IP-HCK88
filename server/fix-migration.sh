#!/bin/bash

# Quick Fix Script for Migration Issues
# Run this on Ubuntu/EC2 if migration fails

set -e

echo "=================================="
echo "🔧 Migration Quick Fix Script"
echo "=================================="
echo ""

# Set production environment
export NODE_ENV=production
echo "✅ NODE_ENV set to: $NODE_ENV"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ ERROR: .env file not found!"
  echo ""
  echo "Please create .env file first:"
  echo "  cp .env.example .env"
  echo "  nano .env"
  echo ""
  exit 1
fi
echo "✅ .env file exists"

# Check if DATABASE_URL exists in .env
if ! grep -q "^DATABASE_URL=" .env; then
  echo "❌ ERROR: DATABASE_URL not found in .env"
  echo ""
  echo "Please add DATABASE_URL to .env:"
  echo "  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
  echo ""
  exit 1
fi
echo "✅ DATABASE_URL found in .env"

# Hide password for display
SAFE_DB_URL=$(grep "^DATABASE_URL=" .env | sed 's/:[^:]*@/:***@/')
echo "   $SAFE_DB_URL"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if pg package installed
if ! npm list pg >/dev/null 2>&1; then
  echo "⚠️  pg package not found, installing dependencies..."
  npm install --production
else
  echo "✅ pg package installed"
fi
echo ""

# Test database connection
echo "🔍 Testing database connection..."
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d= -f2-)

if command -v psql >/dev/null 2>&1; then
  if psql "$DB_URL" -c "SELECT version();" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
  else
    echo "❌ Database connection failed!"
    echo ""
    echo "Please check:"
    echo "  1. DATABASE_URL is correct"
    echo "  2. Password is correct"
    echo "  3. Supabase project is active"
    echo "  4. EC2 can reach Supabase (port 5432)"
    echo ""
    exit 1
  fi
else
  echo "⚠️  psql not installed, skipping connection test"
  echo "   Install with: sudo apt install postgresql-client -y"
fi
echo ""

# Check migration files exist
if [ ! -d "migrations" ] || [ -z "$(ls -A migrations)" ]; then
  echo "❌ ERROR: No migration files found in migrations/ folder"
  exit 1
fi
echo "✅ Migration files found: $(ls migrations | wc -l) files"
echo ""

# Show current migration status
echo "📋 Current migration status:"
npx sequelize-cli db:migrate:status --env production || true
echo ""

# Run migrations
echo "🔄 Running migrations..."
echo ""

if npx sequelize-cli db:migrate --env production; then
  echo ""
  echo "=================================="
  echo "✅ Migrations completed successfully!"
  echo "=================================="
  echo ""

  # Show final status
  echo "📋 Final migration status:"
  npx sequelize-cli db:migrate:status --env production
  echo ""

  echo "✅ All done! You can now:"
  echo "   - Start your app: pm2 start ecosystem.config.js"
  echo "   - Run seeders: NODE_ENV=production npm run seed"
  echo ""
else
  echo ""
  echo "=================================="
  echo "❌ Migration failed!"
  echo "=================================="
  echo ""
  echo "Troubleshooting steps:"
  echo "  1. Check error message above"
  echo "  2. Verify DATABASE_URL in .env"
  echo "  3. Test connection: psql \"\$DATABASE_URL\" -c 'SELECT 1;'"
  echo "  4. Check Supabase dashboard for errors"
  echo "  5. Read TROUBLESHOOTING-UBUNTU.md for more help"
  echo ""
  exit 1
fi
