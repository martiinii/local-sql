FROM oven/bun:1.2.17 AS base
 
FROM base AS builder
WORKDIR /app
COPY . .

RUN bun add --global turbo@^2.5.4
RUN turbo prune @local-sql/api --docker
 
FROM base AS installer
WORKDIR /app
 
COPY --from=builder /app/out/json/ .
RUN bun install --frozen-lockfile
 
COPY --from=builder /app/out/full/ .
RUN bun run build:api:docker

# Fix for "Cannot find module '@libsql/linux-x64-gnu'" https://github.com/oven-sh/bun/issues/18909
# It install libsql and its dependencies which then are copied by runner alongside compiled server
FROM base AS libsql-installer
WORKDIR /app

COPY --from=installer app/apps/api/build-docker/package.json package.json
RUN bun install

# Runner
FROM gcr.io/distroless/cc
WORKDIR /app

COPY --from=installer app/apps/api/build-docker/server server
COPY --from=libsql-installer app/node_modules ./node_modules

ENV NODE_ENV=production
ENV DB_PATH="db/data.db"

CMD ["./server"]

EXPOSE 57597