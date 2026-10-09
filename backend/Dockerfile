# Backend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Expose API port (will be overridden by PORT env)
EXPOSE 5000

ENV NODE_ENV=production

# Run the server
CMD ["node", "server.js"]