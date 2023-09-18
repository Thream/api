FROM node:20.6.1 AS dependencies
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm clean-install

FROM node:20.6.1 AS builder
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY ./ ./
RUN npm run prisma:generate && npm run build

FROM node:20.6.1 AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/email ./email
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/prisma ./prisma
USER node
CMD npm run prisma:migrate:deploy && node build/index.js
