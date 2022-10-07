import { config } from 'dotenv'
import { defineConfig } from 'tsup'

config({
  path: '../../.env',
})

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node16',
  minify: isProduction,
  sourcemap: true,
})
