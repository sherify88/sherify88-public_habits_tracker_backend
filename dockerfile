# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/main.js || exit 1

# Start the application
CMD ["node", "dist/main.js"] 