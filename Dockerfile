# Multi-stage build for production-optimized Docker image

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy built frontend
COPY --from=frontend-builder /app/client/build ./client/build

# Copy backend code
COPY --from=backend-builder /app/server ./server

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server/index.js"]
