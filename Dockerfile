# syntax=docker/dockerfile:experimental
FROM node:18-alpine as app_dev
WORKDIR /var/www/app
LABEL com.docker.compose.container-number="1"
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
RUN npm ci
# RUN ls -la
# RUN npx prisma migrate deploy
# RUN npx prisma generate
COPY --chown=node:node . .
CMD ["npm", "run", "start:dev"]
EXPOSE 3000

FROM node:18-alpine as app_prod
WORKDIR /var/www/app
LABEL com.docker.compose.container-number="1"
# COPY --chown=node:node package*.json .
# COPY --chown=node:node prisma ./prisma/
COPY package*.json .
COPY prisma ./prisma/
RUN npm ci
ENV POSTGRES_USER=postgres
ENV DATABASE_URL=postgresql://postgres:1963@psql:5432/todo_dev
ENV POSTGRES_PASSWORD=1963
ENV POSTGRES_DB=todo_dev
ENV PG_DATA=/var/lib/postgresql/data 
ENV JWT_ACCESS_SECRET=0prktXQtyrEm4hq0c8n2ox1JFE29TzyN18YjdxsDiHoclAb0XBiHOwIOjHbcSKjbcEiSzAVVhgc5MSuAkA5AXxg+fNcDJYZ4umuNAl32VktgqXDtlTxLCc5IFDN+E5ZoAAS5zMXdHZLljvu88H/v4no+Df3krfQH+wNN1vSIw4Cy+WYcEKNCVB3e82Gc8f3ZUQcY5Esy88SBkjeMBuAfD0nRUTP0hgRC6jeyMWCA1sSxM3jBbiu25ZsNkq+Eyhb2BoJLazRyIpX6lV5TkyPEAi8jYSkTvJFUIM9QwKTBX65PjoAv3V45WaH+funiNeNMJEIVCN77EVRimeYjU17Gsw==
ENV JWT_REFRESH_SECRET=3Z2clg+B3gYuAokL7MfpU2s76VPrCSgOVjFT5IE2nGP/be54bLZawQihgiU77jxDNd0FobXtyWQKt7YgWrRzVrhTaGKzgVaNXyvg36800+4NKfrfvisbsE21oIi6evh6f2EVN6LPeWouqdQ5RHCAyBUDKJMgqWSCm3t+9TXnbgRPVBMQNvWoTatOT17o1Kzhs21olqYC7asuD2NVB3Olv9TprphjcKwOiwZBHiYTVUweiEMIzEEvqin+LlApeIpRZLA9o3TPENfuuvK8NKv/DK4Z9uU14rH1Xlb85kgTb3zGMeXlunHyf72hJg6FHvYPNRaZdNXI8+XOX2xa92o4iQ==
ENV RT_LIFESPAN_D=1
ENV AT_LIFESPAN_M=15
ENV PORT=3000
# RUN npx prisma migrate deploy
# RUN npx prisma generate
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
EXPOSE 80
