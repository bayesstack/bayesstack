# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base

ENV COREPACK_HOME=/root/.cache/node/corepack
ENV npm_config_fetch_retries=5
ENV npm_config_fetch_retry_mintimeout=20000
ENV npm_config_fetch_retry_maxtimeout=120000
ENV npm_config_fetch_timeout=600000
RUN corepack enable && corepack install --global pnpm@11.23.0
WORKDIR /app

FROM base AS dev
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY studios ./studios

RUN --mount=type=cache,id=bayesstack-pnpm-store,target=/root/.local/share/pnpm/store pnpm install --prefer-offline

EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @bayesstack/${APP_NAME} dev --hostname 0.0.0.0 --port ${PORT:-3000}"]

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY studios ./studios

RUN --mount=type=cache,id=bayesstack-pnpm-store,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prefer-offline

ARG APP_NAME
RUN pnpm --filter "@bayesstack/${APP_NAME}" build

FROM base AS runner
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages
COPY --from=build /app/studios ./studios

WORKDIR /app
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @bayesstack/${APP_NAME} start --hostname 0.0.0.0 --port ${PORT:-3000}"]
