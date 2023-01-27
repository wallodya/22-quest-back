# syntax=docker/dockerfile:experimental
FROM node:18-alpine as dev_container
WORKDIR /var/www/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
RUN npm ci
# RUN npx prisma migrate deploy
# RUN npx prisma generate
COPY --chown=node:node . .
CMD ["npm", "run", "start:dev"]
EXPOSE 3000
