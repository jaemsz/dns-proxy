FROM node:latest

ENV NODE_ENV=production

WORKDIR /app

COPY ["../proxy/package.json", "../proxy/package-lock.json", "../proxy/src/main.js", "../proxy/src/databases/database.js", "../proxy/src/databases/mongo-database.js", "../proxy/src/databases/cassandra-database.js", "../proxy/src/databases/postgresql-database.js", "./"]

RUN npm install --omit=dev

CMD ["node", "main.js"]

EXPOSE 53