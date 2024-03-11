import { defineConfig } from 'tsup'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node16',
  minify: isProduction,
  sourcemap: true,
})
