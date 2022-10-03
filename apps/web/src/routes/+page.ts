import { createTRPCClient } from '$lib/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, parent }) => {
  const { contextData } = await parent()
  const trpc = createTRPCClient(fetch)
  const places = await trpc.users.places.query({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return {
    title:
      contextData.layout === 'place'
        ? contextData.context.place?.name
        : 'Dashboard',
    places,
    showFeed: contextData.layout === 'place',
  }
}
