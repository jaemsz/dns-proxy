FROM node:latest

ENV NODE_ENV=production

WORKDIR /app

COPY ["../proxy/package.json", "../proxy/package-lock.json", "../proxy/src/main.js", "../proxy/src/database.js", "../proxy/src/mongo-database.js", "../proxy/src/cassandra-database.js", "./"]

RUN npm install --omit=dev

CMD ["node", "main.js"]

EXPOSE 53