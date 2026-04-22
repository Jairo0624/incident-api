FROM node:alpine
WORKDIR /app

# Las imagenes de docker funcionan con capas, cada comando crea una capa nueva!! 
# Copiar el proyecto a la imagen de Docker
COPY package.json package-lock.json* ./

# Instalar dependencias con npm i
RUN npm install

#Copiamos el resto del proyecto
COPY . .

# Compilar el proyecto
RUN npm run build

# Exponer el puerto
EXPOSE 3000

#  Colocar un comando de inicio
CMD ["node", "dist/main"]