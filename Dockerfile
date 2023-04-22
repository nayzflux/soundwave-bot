FROM node:18-slim

WORKDIR /app

COPY . .

RUN ls

# Mettre à jour npm
RUN npm install -g npm@latest

# Installer les modules
RUN npm install

# compiler le typescript
RUN npm install typescript
RUN npx tsc

# Installer ffmpeg
RUN apt-get update -y
RUN apt-get install ffmpeg -y

# Patch le module spotify-dl
# telecharher le zip
RUN apt-get install wget -y
RUN wget https://github.com/nayzflux/spotifydl-core/archive/refs/heads/master.zip
# decompresser le zip
RUN apt-get install unzip -y
RUN unzip master.zip
# build spotifydl-core le remplacer celui du node_modules
RUN cd spotifydl-core-master && npm i typescript && npm run build && cp -r dist ../node_modules/spotifydl-core

CMD ["npm", "start"]