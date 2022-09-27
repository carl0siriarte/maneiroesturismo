import trpc from '$lib/trpc/client'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, parent, params }) => {
  const { contextData } = await parent()
  const place = await trpc(fetch).query('places:get', { slug: params.place })
  return {
    contextData: {
      ...contextData,
      context: {
        ...contextData.context,
        ...place,
      },
    },
  }
}
