import preprocess from 'svelte-preprocess'
import { optimizeImports } from 'carbon-preprocess-svelte'
import vercel from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess(), optimizeImports()],
  kit: {
    adapter: vercel({ edge: true }),
    env: {
      dir: '../../',
    },
    inlineStyleThreshold: Infinity,
  },
}

export default config
