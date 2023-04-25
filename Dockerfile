# syntax=docker/dockerfile:experimental
FROM node:18-alpine as app_dev
WORKDIR /var/www/app
LABEL com.docker.compose.container-number="1"
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
RUN npm ci
RUN npm install -g @nestjs/cli
# RUN ls -la
# RUN npx prisma migrate deploy
# RUN npx prisma generate
COPY --chown=node:node . .
CMD ["npm", "run", "start:dev"]
EXPOSE 3000

FROM node:18-alpine as app_prod
WORKDIR /var/www/app
LABEL com.docker.compose.container-number="2"
# COPY --chown=node:node package*.json .
# COPY --chown=node:node prisma ./prisma/
COPY package*.json .
COPY prisma ./prisma/
RUN npm ci
RUN install -g @nestjs/cli
# RUN npx prisma migrate deploy
# RUN npx prisma generate
COPY . .

FROM app_prod as prod_build
WORKDIR /var/www/app
LABEL com.docker.compose.container-number="3"
RUN npm run build
CMD ["npm", "run", "start:prod"]
EXPOSE 80
