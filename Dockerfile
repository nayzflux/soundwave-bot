FROM node:18-slim

WORKDIR /app

COPY . .

# Mettre à jour npm
RUN npm install -g npm@latest

# Installer les modules
RUN npm install
RUN npm install typescript

# Installer ffmpeg
RUN apt-get update -y
RUN apt-get install ffmpeg -y

# Patch le module spotify-dl
RUN apt-get install wget -y
RUN wget https://github.com/nayzflux/spotifydl-core/archive/refs/heads/master.zip
RUN apt-get install unzip -y
RUN unzip master.zip
RUN cd spotifydl-core-master
RUN ls
RUN npm i typescript
RUN npm run build
RUN cp dist ../node_modules/spotifydl-core/dist

CMD ["npm", "start"]