import trpc from '$lib/trpc/client'
import type { LoadEvent } from '@sveltejs/kit'
import { getDefaultHost, isCanonical } from './host'
import { intersection } from 'lodash-es'
import type { SvelteComponent } from 'svelte'
import type { LayoutType, PageContext, PlaceContext } from '@pkg/db'

export function getLayoutType<T extends { url: URL }>({ url }: T): LayoutType {
  if (url.searchParams.get('__place') || !isCanonical(url.host)) return 'place'
  return 'app'
}

export const placeRoutes = [
  '/',
  '/products',
  '/bag',
  '/favorites',
  '/contact',
  '/faq',
  '/account',
]
export const appRoutes = ['/', '/places', '/account']

export const commonRoutes: string[] = intersection(placeRoutes, appRoutes)

export function validateLayoutRoute<T extends { url: URL }>(
  event: T,
  layoutType?: LayoutType
) {
  switch (layoutType || getLayoutType(event)) {
    case 'place':
      return !Boolean(
        appRoutes
          .filter((url) => !commonRoutes.includes(url))
          .find((url) => event.url.pathname.startsWith(url))
      )
    case 'app':
      return !Boolean(
        placeRoutes
          .filter((url) => !commonRoutes.includes(url))
          .find((url) => event.url.pathname.startsWith(url))
      )
  }
}

export async function fetchPlace(
  url: URL,
  fetch?: LoadEvent['fetch']
): Promise<PlaceContext> {
  const subdomain = url.host.split('.')[0]
  const rest = url.host.substring(subdomain.length + 1)
  console.log(subdomain, rest)
  if (!getDefaultHost().includes(rest)) {
    return (await trpc(fetch).query('places:get', { host: url.host })) || {}
  } else {
    let slug = url.searchParams.get('__place') || subdomain || null
    if (slug) {
      return (await trpc(fetch).query('places:get', { slug: subdomain })) || {}
    }
  }
  return {}
}

export async function fetchContextData<
  T extends Pick<LoadEvent, 'url' | 'fetch' | 'params'>
>(
  { url, fetch }: T,
  layoutType?: LayoutType
): Promise<{ contextData: PageContext; notFound?: boolean }> {
  let contextData: PageContext = {
    layout: layoutType || getLayoutType({ url }),
    context: {},
  }
  let isRouteValid = validateLayoutRoute({ url })

  switch (contextData.layout) {
    case 'place':
      contextData = {
        ...contextData,
        context: await fetchPlace(url, fetch),
      }
      console.log(contextData)
      return {
        notFound: !contextData.context.place || !isRouteValid,
        contextData: contextData,
      }
    case 'app':
      const places = await trpc(fetch).query('user:places', {
        pageSize: 10,
        orderBy: {
          createdAt: 'desc',
        },
      })
      contextData = {
        ...contextData,
        context: {
          places: places.items,
        },
      }
      return {
        notFound: !isRouteValid,
        contextData: contextData,
      }
  }
}

export async function getSvelteLayoutComponent(contextData: PageContext) {
  let layoutComponent: new (args: {
    target: any
    props?: any
  }) => SvelteComponent
  switch (contextData?.layout || 'app') {
    case 'app':
      // @ts-ignore
      layoutComponent = (await import('$lib/__layouts/AppLayout.svelte'))
        .default as any
      break
    case 'place':
      if (!contextData.context.place) {
        // @ts-ignore
        layoutComponent = (await import('$lib/__layouts/AppLayout.svelte'))
          .default as any
      } else {
        layoutComponent = // @ts-ignore
          (await import('$lib/__layouts/DecalshutLayout.svelte')).default as any
      }
      break
  }
  return layoutComponent
}
