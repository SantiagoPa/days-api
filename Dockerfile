FROM node:22-alpine3.21 AS dev
WORKDIR /app
COPY package.json ./
RUN npm install
CMD ["npm", "run", "dev"]

FROM node:22-alpine3.21 AS deps-dev
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-alpine3.21 AS builder
WORKDIR /app
COPY . .
COPY --from=deps-dev /app/node_modules ./node_modules
RUN npm run test
RUN npm run build


FROM node:22-alpine3.21 AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 4004
CMD ["node", "dist/app.js"]