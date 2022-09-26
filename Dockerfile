# Fetch the LiteFS binary using a multi-stage build.
FROM flyio/litefs:pr-109 AS litefs

FROM node:alpine AS builder
RUN apk update && apk add git
# Set working directory
WORKDIR /app
RUN npm i -g turbo@canary pnpm
COPY . .

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG DATABASE_URL
ARG PUBLIC_GEOAPIFY_TOKEN
ARG PUBLIC_UPSTASH_REDIS_URL
ARG PUBLIC_UPSTASH_REDIS_TOKEN
ARG SENDGRID_API_KEY
ARG REDIS_URL
ARG PUBLIC_CANONICAL_HOST
ARG VITE_PORT=8080

ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV PUBLIC_GEOAPIFY_TOKEN=${PUBLIC_GEOAPIFY_TOKEN}
ENV PUBLIC_UPSTASH_REDIS_URL=${PUBLIC_UPSTASH_REDIS_URL}
ENV PUBLIC_UPSTASH_REDIS_TOKEN=${PUBLIC_UPSTASH_REDIS_TOKEN}
ENV SENDGRID_API_KEY=${SENDGRID_API_KEY}
ENV VITE_PORT=${VITE_PORT}
ENV PUBLIC_CANONICAL_HOST=${PUBLIC_CANONICAL_HOST}
ENV REDIS_URL=${REDIS_URL}

RUN apk update && apk add git
WORKDIR /app
RUN npm i -g turbo@canary pnpm
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/yarn.lock ./yarn.lock
# COPY --from=builder /app/out/full/ .
COPY . .
# COPY turbo.json turbo.json

RUN pnpm install
RUN pnpx prisma db push
RUN pnpx turbo run build --filter=api...

FROM node:alpine AS runner

# Ensure our mount & data directories exists before mounting with LiteFS.
RUN mkdir -p /data /mnt/data

# Copy binaries from the previous build stages.
COPY --from=builder /usr/local/bin/litefs-example /usr/local/bin/litefs-example
COPY --from=litefs /usr/local/bin/litefs /usr/local/bin/litefs

# Copy our LiteFS configuration.
ADD litefs.yml /etc/litefs.yml

# Setup our environment to include FUSE & SQLite.
RUN apk add bash curl fuse sqlite

# Ensure our mount & data directories exists before mounting with LiteFS.
RUN mkdir -p /data /mnt/data

WORKDIR /app

# Don't run production as root
# RUN addgroup --system --gid 1001 maneiroesturismo.com
# RUN adduser --system --uid 1001 maneiroesturismo.com
# USER maneiroesturismo.com
COPY --from=installer /app .

ENTRYPOINT "litefs"

# CMD if [[ ! -z "$SWAP" ]]; then \
#     fallocate -l $(($(stat -f -c "(%a*%s/10)*7" .))) _swapfile && \
#     mkswap _swapfile && swapon _swapfile && ls -hla; \
#     fi; \
#     free -m; \
#     node apps/api/dist/index.js
