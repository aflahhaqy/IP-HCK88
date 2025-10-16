#!/bin/bash

# Migration script that properly loads .env file
# Usage: ./migrate.sh

echo "🔄 Running database migration..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ ERROR: .env file not found!"
  echo "Please create .env file with DATABASE_URL"
  exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Set NODE_ENV to production
export NODE_ENV=production

# Show what we're connecting to (hide password)
echo "📡 Connecting to database..."
echo "   $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"
echo ""

# Run migration
npx sequelize-cli db:migrate --env production

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "📋 Current migration status:"
  npx sequelize-cli db:migrate:status --env production
else
  echo ""
  echo "❌ Migration failed!"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check DATABASE_URL in .env"
  echo "  2. Verify Supabase is accessible"
  echo "  3. Check config/config.json production settings"
  exit 1
fi
