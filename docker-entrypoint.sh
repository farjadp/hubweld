#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Use the production PostgreSQL schema at runtime
cp /app/prisma/schema.prod.prisma /app/prisma/schema.prisma

# Run database sync (creates tables if they don't exist)
echo "Running database sync..."
npx prisma db push --accept-data-loss

echo "Starting application..."
exec "$@"
