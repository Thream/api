FROM node:14.16.1
RUN npm install --global npm@7

WORKDIR /api

COPY ./package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

CMD ["npm", "run", "dev"]
