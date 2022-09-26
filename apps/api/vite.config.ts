import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@pkg/db'],
  },
  ssr: {
    target: 'node',
  },
  envDir: '../../',
  plugins: [
    ...VitePluginNode({
      adapter: 'fastify',
      appPath: './src/index.ts',
      exportName: 'devServer',
      tsCompiler: 'esbuild',
    }),
  ],
})
