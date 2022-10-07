FROM node:alpine3.15

WORKDIR /app
COPY . /app
RUN npm install

CMD ["server.js"]