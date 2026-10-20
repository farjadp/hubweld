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

# ── Schema migrations ─────────────────────────────────────────────────────
# This used to run `prisma db push --accept-data-loss` on every boot, which
# let a single schema edit drop a production column — and its data — silently,
# with no record of what changed. Migrations are applied explicitly instead.
#
# A failure here is deliberately fatal: starting the app against a schema we
# could not migrate is worse than not starting at all.
echo "Applying database migrations..."
if ! npx prisma migrate deploy; then
  # A database created by the old `db push` flow already has the tables but no
  # migration history, so `migrate deploy` refuses to touch it (P3005). Mark
  # the baseline as applied once, then let the newer migrations run.
  echo "migrate deploy failed — baselining an existing database as 0_init"
  npx prisma migrate resolve --applied 0_init
  npx prisma migrate deploy
fi

# Seed catalogue and article content. The script is idempotent — it skips any
# slug that already exists — so it is safe on every boot. Never fatal: a fresh
# database with no admin/supplier yet must not crash-loop the container.
echo "Seeding content (idempotent)..."
node /app/prisma/seed-content.mjs || echo "Content seed skipped: $?"
node /app/prisma/seed-catalogue.mjs || echo "Catalogue seed skipped: $?"
node /app/prisma/seed-miller.mjs || echo "Miller seed skipped: $?"

echo "Starting application as nextjs..."
# Drop privileges to the non-root user if we are currently root.
if [ "$(id -u)" = "0" ] && command -v su-exec >/dev/null 2>&1; then
  exec su-exec nextjs:nodejs "$@"
else
  exec "$@"
fi
