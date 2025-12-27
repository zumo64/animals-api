FROM node:18
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install typescript
RUN npx tsc
RUN npm install --omit=dev
COPY src/html  ./dist/html
COPY .env ./
CMD node ./dist/server.js
EXPOSE 5003
