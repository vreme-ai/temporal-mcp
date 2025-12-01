# Use Node 20 Alpine for small image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source (needed before npm ci because prepare script runs build)
COPY src ./src

# Install dependencies (this will run prepare -> build)
RUN npm ci

# Production stage
FROM node:20-alpine AS release

WORKDIR /app

# Copy built files and package files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install production dependencies only (skip prepare script since build is done)
RUN npm ci --omit=dev --ignore-scripts

# Set environment variable
ENV NODE_ENV=production

# Run the server
CMD ["node", "build/index.js"]