import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/generated/**', 'prisma/**'],
    },
    alias: {
      '@/tests': new URL('./tests/', import.meta.url).pathname,
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
