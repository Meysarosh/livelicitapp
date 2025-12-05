import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    restoreMocks: true,
    mockReset: true,
    clearMocks: true,
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/coverage/**', '**/prisma/**', '**/*.d.ts'],
    },
  },
});
