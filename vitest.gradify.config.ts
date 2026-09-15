import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/gradify-delta/**/*.test.ts', 'tests/gradify/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/gradify-delta/setup.ts'],
  },
});
