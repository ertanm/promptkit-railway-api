FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY server/package.json server/package-lock.json ./server/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN cd server && npm ci --omit=dev

FROM base AS build
COPY server/package.json server/package-lock.json ./server/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN cd server && npm ci
COPY server/ ./server/
RUN cd server && npx prisma generate
RUN cd server && npx tsc --noEmit

FROM base AS runner
ENV NODE_ENV=production
# node_modules at /app so generated Prisma client can resolve @prisma/client
COPY --from=deps /app/server/node_modules ./node_modules
COPY --from=deps /app/server/package.json ./server/package.json
COPY server/ ./server/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY --from=build /app/server/generated ./server/generated

EXPOSE 3000
WORKDIR /app/server
# Run migrations at startup (DATABASE_URL from Railway), then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && exec node --import tsx index.ts"]
