FROM node:alpine3.15

WORKDIR /app
COPY . /app
RUN npm install

EXPOSE 8080

CMD ["server.js"]