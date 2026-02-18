# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client
RUN npx prisma generate --schema=src/database/prisma/schema.prisma

# Compile TypeScript
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema (needed for prisma generate at runtime)
COPY src/database/prisma/schema.prisma ./src/database/prisma/schema.prisma
RUN npx prisma generate --schema=src/database/prisma/schema.prisma

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Create media directories
RUN mkdir -p media/live media/recordings media/thumbnails

EXPOSE 3000 1935

CMD ["node", "dist/server.js"]
