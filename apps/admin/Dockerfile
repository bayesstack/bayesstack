# Dockerfile for Admin Portal (@bayesstack/admin)
FROM node:22-alpine AS base

ENV COREPACK_HOME=/root/.cache/node/corepack
RUN corepack enable && corepack install --global pnpm@11.23.0
WORKDIR /app

FROM base AS dev
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY studios ./studios

RUN --mount=type=cache,id=bayesstack-pnpm-store,target=/root/.local/share/pnpm/store pnpm install --prefer-offline

EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @bayesstack/admin dev --hostname 0.0.0.0 --port ${PORT:-3000}"]

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY studios ./studios

RUN --mount=type=cache,id=bayesstack-pnpm-store,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prefer-offline
RUN pnpm --filter "@bayesstack/admin" build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages
COPY --from=build /app/studios ./studios

WORKDIR /app
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @bayesstack/admin start --hostname 0.0.0.0 --port ${PORT:-3000}"]
