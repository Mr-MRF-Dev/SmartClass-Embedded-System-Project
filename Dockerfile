# <base> Use Bun as the base image
FROM oven/bun:latest AS base
# </base>

# <deps> Install dependencies only when needed
FROM base AS deps

WORKDIR /app
COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile
# </deps>

# <builder> Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Add build-time environment variables
ARG BACKEND_API_URL
ENV BACKEND_API_URL=${BACKEND_API_URL:-http://localhost:5000}

RUN bun run build
# </builder>

# <runner> Production image, copy all the files and run next
FROM base AS runner

ARG VERSION
LABEL version=${VERSION:-latest}
LABEL org.opencontainers.image.version=${VERSION:-latest}
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/Mr-MRF-Dev/SmartClass-Embedded-System-Project"
LABEL org.opencontainers.image.description="SmartClass Embedded System Project"

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user using groupadd and useradd (available in the base image)
RUN groupadd -r -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for pre-render cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
# </runner>