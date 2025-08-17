FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (todas, incluidas dev, ya que no hay multi-stage)
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer el puerto (ajústalo según tu app)
EXPOSE 3000

# Ejecutar migraciones en el arranque y levantar la app
CMD npx prisma migrate deploy && npm start
