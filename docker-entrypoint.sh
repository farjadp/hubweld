#!/bin/sh
set -e

UPLOADS="${UPLOAD_DIR:-/app/data/uploads}"

# The Railway volume is mounted at /app/data owned by root. Create the uploads
# directory and hand ownership to the nextjs user so the app can write to it.
# These run as root; guard with `|| true` so a non-root context won't crash-loop.
mkdir -p /app/data "$UPLOADS" 2>/dev/null || true
chown -R nextjs:nodejs /app/data 2>/dev/null || true

# Use the production PostgreSQL schema at runtime
cp /app/prisma/schema.prod.prisma /app/prisma/schema.prisma

# Run database sync (creates tables if they don't exist)
echo "Running database sync..."
npx prisma db push --accept-data-loss

echo "Starting application as nextjs..."
# Drop privileges to the non-root user if we are currently root.
if [ "$(id -u)" = "0" ] && command -v su-exec >/dev/null 2>&1; then
  exec su-exec nextjs:nodejs "$@"
else
  exec "$@"
fi
