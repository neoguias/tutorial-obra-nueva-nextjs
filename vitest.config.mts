import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    // Los tests usan su propia base de datos, que se crea de cero antes de ejecutarlos.
    env: { DATABASE_URL: 'file:./test.db', TZ: 'Europe/Madrid' },
    globalSetup: './tests/global-setup.ts',
    fileParallelism: false,
  },
})
