import trpc from '$lib/trpc/client'
import { fetchContextData, getSvelteLayoutComponent } from '$lib/utils/layout'
import { error, redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ url, fetch, params }) => {
  const { notFound, contextData } = await fetchContextData({
    url,
    fetch,
    params,
  })

  const user = await trpc(fetch).query('user:whoami')
  const layoutComponent = await getSvelteLayoutComponent(contextData)

  if (notFound) {
    throw error(404, 'Página no encontrada')
  }

  if (contextData.layout == 'app') {
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
