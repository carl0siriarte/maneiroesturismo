import { createTRPCClient } from '$lib/trpc/client'
import { fetchContextData } from '$lib/utils/layout'
import type { LayoutServerLoadEvent } from './$types'
import type { User } from '@pkg/db'
import { error, redirect } from '@sveltejs/kit'

export const load = async ({ url, fetch, params }: LayoutServerLoadEvent) => {
  const { notFound, contextData } = await fetchContextData({
    url,
    fetch,
    params,
  })
  const trpc = createTRPCClient(fetch)

  if (notFound) {
    throw error(404, 'Página no encontrada')
  }

  let user: User | null = null

  if (contextData.layout == 'app') {
    user = await trpc.users.whoami.query()

    if (!user && !url.pathname.startsWith('/login')) {
      throw redirect(
        303,
        `/login?callbackUrl=${encodeURIComponent(url.pathname)}`
      )
    }
  }

  return {
    user,
    notFound,
    contextData,
  }
}
