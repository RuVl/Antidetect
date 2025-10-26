FROM node:lts-slim AS build-stage
LABEL authors="RuVl"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY ./ ./

RUN npm run build

FROM node:lts-slim

WORKDIR /app

COPY --from=build-stage /app/dist ./

RUN npm i

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]