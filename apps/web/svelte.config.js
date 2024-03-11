import preprocess from 'svelte-preprocess'
import vercel from '@sveltejs/adapter-vercel'
import { optimizeImports } from 'carbon-preprocess-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess(), optimizeImports()],
  kit: {
    adapter: vercel({ runtime: 'edge' }),
    env: {
      dir: '../../',
    },
    inlineStyleThreshold: Infinity,
  },
}

export default config
