# ============================
# Stage 1: Build
# ============================
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build -- --configuration=production

# ============================
# Stage 2: Nginx
# ============================
FROM nginx:stable-alpine

# Copiar archivos compilados de Angular
COPY --from=builder /app/dist/br-bolsa-de-horas-fe/browser /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicio (por defecto de nginx:alpine)
CMD ["nginx", "-g", "daemon off;"]
