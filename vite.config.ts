/// <reference types="vitest" />
/// <reference types="vite/client" />
// @ts-ignore - vitest/config extends vite config with test property
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()] as UserConfig["plugins"],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
})
