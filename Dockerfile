# syntax=docker/dockerfile:1
FROM node:24-alpine AS build-stage

WORKDIR /app

# git + ssh are needed to resolve the private ui-styles Git dependency (pinned by commit in package-lock.json)
RUN apk add --no-cache git openssh-client \
    && mkdir -p -m 0700 /root/.ssh \
    && ssh-keyscan github.com >> /root/.ssh/known_hosts

COPY package*.json ./

RUN --mount=type=ssh --mount=type=cache,target=/root/.npm npm ci --loglevel=error

COPY . .

RUN npm run env:production && npm run build:nice

FROM nginx:1.25-alpine AS production-stage

COPY --from=build-stage /app/dist/frontend /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
