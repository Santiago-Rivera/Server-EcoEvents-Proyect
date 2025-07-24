# Usar la imagen oficial de Node.js LTS (Long Term Support)
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Instalar python3 y build-essential para compilar dependencias nativas como bcrypt
RUN apk add --no-cache python3 make g++

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código de la aplicación
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Crear un usuario no root para ejecutar la aplicación (buena práctica de seguridad)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Cambiar la propiedad de los archivos al usuario no root
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 4000

# Definir variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
