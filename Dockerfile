ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app
EXPOSE 3000

RUN apk add --no-cache openssl bash
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

COPY . .
RUN npx prisma generate
RUN npm run build


FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/app
EXPOSE 3000

RUN apk add --no-cache openssl bash
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

COPY --from=builder --chown=node:node /usr/src/app/build ./build
COPY --from=builder --chown=node:node /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=node:node /usr/src/app/prisma ./prisma

USER node

CMD ["node", "build/server.js"]
