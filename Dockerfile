# Use Bun official image for fast JS/TS runtime
FROM oven/bun:latest

# Create app directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* bun.lock* ./

# Install deps (bun will detect package.json)
RUN bun install --production

# Copy the rest of the source
COPY . .

# Ensure .env is provided at runtime via environment variables or secret mounts
ENV NODE_ENV=production

# Non-root user is already set in official Bun image; run as default

# Default command: run the TypeScript entry directly with Bun
CMD ["bun", "index.ts"]
