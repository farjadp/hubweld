# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libssl3

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Generate Prisma client and build
ENV NEXT_TELEMETRY_DISABLED=1
# Use the production PostgreSQL schema (avoids brittle sed mutation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN cp prisma/schema.prod.prisma prisma/schema.prisma
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install required packages for runtime (OpenSSL for Prisma, su-exec to drop privileges)
RUN apk add --no-cache openssl libssl3 libstdc++ su-exec

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./

# Make entrypoint executable and create data volume directory
RUN chmod +x /app/docker-entrypoint.sh && mkdir -p /app/data && chown nextjs:nodejs /app/data

# NOTE: We intentionally do NOT set `USER nextjs` here. The entrypoint must run
# as root to chown the Railway volume (mounted at /app/data as root), then it
# drops privileges to the nextjs user via su-exec before starting the server.

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Store user uploads on the persistent volume so they survive redeploys
ENV UPLOAD_DIR=/app/data/uploads

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
