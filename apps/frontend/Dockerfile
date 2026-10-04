ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS pruner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY . .
RUN pnpm exec turbo prune frontend --docker

FROM node:${NODE_VERSION} AS installer
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm exec turbo run build --filter=frontend...

FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/frontend/server.js"]
