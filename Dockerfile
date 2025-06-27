# Use Node.js LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies first for building
RUN npm ci --ignore-scripts

# Generate Prisma client for TypeScript compilation
RUN npx prisma generate

# Copy source code and entrypoint
COPY . .

# Build the TypeScript application
RUN npm run build

# Install only production dependencies in separate location to avoid conflicts
RUN rm -rf node_modules && \
    npm ci --only=production --ignore-scripts && \
    npm install prisma --save && \
    npm cache clean --force

# Regenerate Prisma client for production
RUN npx prisma generate

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose the port (MCP typically uses stdio, but we'll prepare for HTTP if needed)
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcpserver -u 1001

# Change ownership of the app directory
RUN chown -R mcpserver:nodejs /app
USER mcpserver

# Use entrypoint script for automatic database setup
ENTRYPOINT ["./entrypoint.sh"] 