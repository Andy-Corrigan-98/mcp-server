# Use Node.js LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the port (MCP typically uses stdio, but we'll prepare for HTTP if needed)
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S echoserver -u 1001

# Change ownership of the app directory
RUN chown -R echoserver:nodejs /app
USER echoserver

# Start the server
CMD ["npm", "start"] 