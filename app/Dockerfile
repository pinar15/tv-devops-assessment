# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY ./routes ./routes
COPY app.ts server.ts ./
RUN npm install && npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json .
RUN npm install --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
