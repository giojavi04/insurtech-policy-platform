import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    root: './',
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts', 'prisma/**/*.spec.ts', 'test/**/*.e2e.spec.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://insurtech:insurtech@localhost:5432/insurtech_dev?schema=public',
      JWT_SECRET: process.env.JWT_SECRET ?? 'test-only-secret',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',
      PORT: process.env.PORT ?? '3000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/*.spec.ts', '**/*.e2e.spec.ts', 'test/**', 'dist/**'],
    },
  },
});
