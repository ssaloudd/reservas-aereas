# Usa una imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de Next.js
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código del frontend
COPY . .

# Genera la aplicación para producción (esto es opcional, pero recomendado para un despliegue real)
RUN npm run build

# Expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]