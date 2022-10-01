import { createTRPCClient } from '$lib/trpc/client'
import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, parent, params }) => {
  const { contextData } = await parent()
  const trpc = createTRPCClient(fetch)
  const placeContext = await trpc.places.get.query({
    slug: params.place,
  })
  const role = await trpc.users.checkRole.query(placeContext.place?.id || '')
  if (!placeContext.place || !role) {
    throw error(404, 'Esta localidad no existe')
  }
  return {
    role,
    contextData: {
      ...contextData,
      context: {
        ...contextData.context,
        ...placeContext,
      },
    },
  }
}
