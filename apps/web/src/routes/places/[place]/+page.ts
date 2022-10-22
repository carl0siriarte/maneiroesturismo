import { createTRPCClient } from '$lib/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url, fetch }) => {
  if (url.searchParams.has('post')) {
    const post = await createTRPCClient(fetch).posts.get.query(
      url.searchParams.get('post') || ''
    )
    return {
      post,
    }
  }
  return {
    post: null,
  }
}
