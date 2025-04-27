FROM node:22-slim

WORKDIR /app

# Install imagemagick
RUN apt-get update && apt-get install -y imagemagick && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]