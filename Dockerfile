# Imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Exponer puerto
EXPOSE 3000

# Variable de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

# Comando para iniciar la aplicación
CMD ["node", "src/app.js"]
