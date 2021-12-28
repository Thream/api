FROM node:16.13.1 AS dependencies
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm clean-install

FROM node:16.13.1 AS builder
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY ./ ./
RUN npx prisma generate
RUN npm run build

FROM node:16.13.1 AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/email ./email
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/uploads ./uploads
USER node
CMD npm run prisma:migrate:deploy && node build/index.js
