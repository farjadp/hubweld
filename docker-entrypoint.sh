#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Ensure data directory exists (if needed for other local file uploads)
mkdir -p /app/data

# Run migrations (creates DB if doesn't exist)
echo "Running database migrations..."
npx prisma migrate deploy || npx prisma db push

# Seed initial data if needed (optional)
# npx tsx prisma/seed.ts || true

echo "Starting application..."
exec "$@"
