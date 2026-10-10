# Backend Dockerfile
# Build context is the repo ROOT (see render.yaml: dockerContext: .), so the
# backend files must be referenced under backend/.
FROM node:22-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/. .

# Expose API port (overridden by the PORT env var)
EXPOSE 5000

ENV NODE_ENV=production

# Run the server
CMD ["node", "server.js"]