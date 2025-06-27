# Use Node.js LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies first for building
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Remove dev dependencies for production
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Expose the port (MCP typically uses stdio, but we'll prepare for HTTP if needed)
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcpserver -u 1001

# Change ownership of the app directory
RUN chown -R mcpserver:nodejs /app
USER mcpserver

# Start the server
CMD ["npm", "start"] 