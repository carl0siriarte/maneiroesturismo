# Fetch the LiteFS binary using a multi-stage build.
# FROM flyio/litefs:pr-89 AS litefs

# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine AS installer

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
# ARG DATABASE_URL
ARG PUBLIC_UPSTASH_REDIS_URL
ARG PUBLIC_UPSTASH_REDIS_TOKEN
ARG SENDGRID_API_KEY
ARG REDIS_URL
ARG PUBLIC_CANONICAL_HOST

ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}
# ENV DATABASE_URL=${DATABASE_URL}
ENV PUBLIC_UPSTASH_REDIS_URL=${PUBLIC_UPSTASH_REDIS_URL}
ENV PUBLIC_UPSTASH_REDIS_TOKEN=${PUBLIC_UPSTASH_REDIS_TOKEN}
ENV SENDGRID_API_KEY=${SENDGRID_API_KEY}
ENV PUBLIC_CANONICAL_HOST=${PUBLIC_CANONICAL_HOST}
ENV REDIS_URL=${REDIS_URL}

ARG SECRET_TOKEN
ENV SECRET_TOKEN=${SECRET_TOKEN}

RUN apk update && apk add git

WORKDIR /app

COPY . .

# Add dependencies to get Bun working on Alpine
RUN apk --no-cache add ca-certificates wget

# Install glibc to run Bun
RUN if [[ $(uname -m) == "aarch64" ]] ; \
    then \
    # aarch64
    wget https://raw.githubusercontent.com/squishyu/alpine-pkg-glibc-aarch64-bin/master/glibc-2.26-r1.apk ; \
    apk add --no-cache --allow-untrusted --force-overwrite glibc-2.26-r1.apk ; \
    rm glibc-2.26-r1.apk ; \
    else \
    # x86_64
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk ; \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub ; \
    apk add --no-cache --force-overwrite glibc-2.28-r0.apk ; \
    rm glibc-2.28-r0.apk ; \
    fi
# Install Bun
RUN npm install -g bun

RUN bun install
RUN bun run build:api

FROM node:alpine AS runner

EXPOSE 3000

# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}

# Copy binaries from the previous build stages.
# COPY --from=litefs /usr/local/bin/litefs /usr/local/bin/litefs

# Copy our LiteFS configuration.
# ADD litefs.yml /etc/litefs.yml

# Setup our environment to include FUSE & SQLite.
# RUN apk add bash curl fuse sqlite

# Ensure our mount & data directories exists before mounting with LiteFS.
# RUN mkdir -p /mnt/db /db

WORKDIR /app

COPY --from=installer /app .

# ENTRYPOINT "litefs"
CMD ["node", "apps/api/dist/index.js"]
