FROM node:latest

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --omit=dev

COPY "src/main.js" "./"
COPY "src/databases" "./databases"

CMD ["node", "main.js"]

EXPOSE 53