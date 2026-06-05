#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Ensure data directory exists (if needed for other local file uploads)
mkdir -p /app/data

# Run database sync (creates tables if they don't exist)
echo "Running database sync..."
npx prisma db push --accept-data-loss

# Seed initial data if needed (optional)
# npx tsx prisma/seed.ts || true

echo "Starting application..."
exec "$@"
