# Fetch the LiteFS binary using a multi-stage build.
FROM flyio/litefs:pr-89 AS litefs

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG DATABASE_URL
ARG PUBLIC_UPSTASH_REDIS_URL
ARG PUBLIC_UPSTASH_REDIS_TOKEN
ARG SENDGRID_API_KEY
ARG REDIS_URL
ARG PUBLIC_CANONICAL_HOST

ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV PUBLIC_UPSTASH_REDIS_URL=${PUBLIC_UPSTASH_REDIS_URL}
ENV PUBLIC_UPSTASH_REDIS_TOKEN=${PUBLIC_UPSTASH_REDIS_TOKEN}
ENV SENDGRID_API_KEY=${SENDGRID_API_KEY}
ENV PUBLIC_CANONICAL_HOST=${PUBLIC_CANONICAL_HOST}
ENV REDIS_URL=${REDIS_URL}

ARG SECRET_TOKEN
ENV SECRET_TOKEN=${SECRET_TOKEN}

RUN apk update && apk add git
WORKDIR /app
RUN npm i -g turbo@canary pnpm
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/yarn.lock ./yarn.lock
# COPY --from=builder /app/out/full/ .
COPY . .
# COPY turbo.json turbo.json

RUN pnpm install
RUN pnpx turbo run build --scope=api

FROM node:alpine AS runner

EXPOSE 3000
VOLUME /mnt/db

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy binaries from the previous build stages.
COPY --from=litefs /usr/local/bin/litefs /usr/local/bin/litefs

# Copy our LiteFS configuration.
ADD litefs.yml /etc/litefs.yml

# Setup our environment to include FUSE & SQLite.
RUN apk add bash curl fuse sqlite

# Ensure our mount & data directories exists before mounting with LiteFS.
RUN mkdir -p /mnt/db /db

WORKDIR /app

COPY --from=installer /app .

ENTRYPOINT "litefs"