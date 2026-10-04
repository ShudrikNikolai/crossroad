FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable \
    && corepack prepare pnpm@11.25.0 --activate

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm exec turbo run build --filter=backend...

RUN addgroup --system nodejs \
    && adduser --system --ingroup nodejs nestjs \
    && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
