# syntax=docker/dockerfile:experimental
FROM node:alpine
WORKDIR /app
COPY ["./package.json", "./package-lock.json", "./"]
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]
EXPOSE 3000
