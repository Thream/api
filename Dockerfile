FROM node:16.14.2 AS dependencies
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install

FROM node:16.14.2 AS builder
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY ./ ./
RUN npm run prisma:generate && npm run build

FROM node:16.14.2 AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/start.sh ./start.sh
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/email ./email
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/uploads ./uploads
USER node
CMD ["./docker-start.sh"]
