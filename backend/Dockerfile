FROM node:lts-slim AS build-stage
LABEL authors="RuVl"

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./ ./

RUN npx prisma generate
RUN npm run build


FROM node:lts-slim

RUN apt-get update && apt-get install -y openssl

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# for migrations
COPY prisma ./prisma/

COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/generated ./generated

EXPOSE 3000

ENTRYPOINT ["/bin/bash", "-c", "npx prisma migrate deploy && npm run start:prod"]