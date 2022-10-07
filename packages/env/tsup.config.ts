import { config } from 'dotenv'
import { defineConfig } from 'tsup'

config({
  path: '../../.env',
})

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  dts: true,
  env: {
    LOCALHOST_HOST: process.env.GITPOD_WORKSPACE_URL
      ? process.env.GITPOD_WORKSPACE_URL.replace('https://', '5173-')
      : 'localhost:5173',
    VERCEL_URL: process.env.VERCEL_URL || '',
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL || '',
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY || '',
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
    PUBLIC_UPSTASH_REDIS_URL: process.env.PUBLIC_UPSTASH_REDIS_URL || '',
    PUBLIC_UPSTASH_REDIS_TOKEN: process.env.PUBLIC_UPSTASH_REDIS_TOKEN || '',
  },
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node16',
  minify: isProduction,
  sourcemap: true,
})
