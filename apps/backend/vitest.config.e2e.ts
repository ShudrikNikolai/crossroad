import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      OTEL_ENABLED: 'false',
      MONGO_DB_NAME: 'crossroad',
      REDIS_DB: '1',
      STORAGE_BUCKET: 'crossroad',
    },
  },
});
