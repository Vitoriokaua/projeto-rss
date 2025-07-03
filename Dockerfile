# Usar uma imagem base do Node.js
FROM node:18-alpine

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar o package.json e instalar as dependências
COPY package*.json ./
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Expor a porta
EXPOSE 3000


CMD [ "node", "server.js" ]