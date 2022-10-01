import { createTRPCClient } from '$lib/trpc/client'
import { fetchContextData, getSvelteLayoutComponent } from '$lib/utils/layout'
import type { User } from '@pkg/db'
import { error, redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ url, fetch, params }) => {
  const { notFound, contextData } = await fetchContextData({
    url,
    fetch,
    params,
  })
  const trpc = createTRPCClient(fetch)
  const layoutComponent = await getSvelteLayoutComponent(contextData)

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
    layoutComponent,
  }
}

export const prerender = false
