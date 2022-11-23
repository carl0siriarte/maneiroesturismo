import { createTRPCClient } from '$lib/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const { contextData } = await parent()
  const post = await createTRPCClient(fetch).posts.get.query(params.postId)
  return {
    post,
    showFeed: contextData.layout == 'place',
  }
}
