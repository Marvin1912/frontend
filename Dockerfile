# syntax=docker/dockerfile:1
FROM node:24-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --loglevel=error

COPY . .

RUN npm run env:production && npm run build:nice

FROM nginx:1.25-alpine AS production-stage

COPY --from=build-stage /app/dist/frontend /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
