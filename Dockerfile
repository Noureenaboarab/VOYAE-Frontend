# ── Stage 1: Build ────────────────────────────────────────────
# Use Node to compile the Angular app into static files
FROM node:20-alpine AS build

WORKDIR /app
# Copy lockfiles first so Docker can cache the npm install layer.
# If only source code changes (not package.json), this layer is reused.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────
# Throw away Node entirely, only copy the compiled output into Nginx.
FROM nginx:alpine
COPY --from=build /app/dist/voyae/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]