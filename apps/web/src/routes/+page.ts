import { feedPages, getFeedPageTitle } from '$lib/feed'
import { createTRPCClient } from '$lib/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, parent }) => {
  const { contextData } = await parent()
  switch (contextData.layout) {
    case 'app':
      const trpc = createTRPCClient(fetch)
      const places = await trpc.users.places.query({
        orderBy: {
          createdAt: 'desc',
        },
      })
      return {
        title: 'Localidades',
        places,
      }
    case 'place':
      return {
        title: getFeedPageTitle(),
        showFeed: true,
      }
  }
}
