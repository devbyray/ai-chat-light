# syntax=docker/dockerfile:1

# Use official Node.js 22 image as base
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package manager files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy rest of the app source
COPY . .

# Build the Nuxt app
RUN pnpm run build

# Production image
FROM node:22-alpine AS production
WORKDIR /app

# Copy only built output and necessary files
COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Install only production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod --frozen-lockfile

# Expose default Nuxt port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start Nuxt app
CMD ["pnpm", "start"]
