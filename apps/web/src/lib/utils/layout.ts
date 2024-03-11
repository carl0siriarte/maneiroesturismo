import { createTRPCClient, type TRPCClient } from '$lib/trpc/client'
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

export async function fetchPlaceFromURL(
  url: URL,
  trpc?: TRPCClient
): Promise<PlaceContext> {
  trpc = trpc || createTRPCClient(fetch)
  const subdomain = url.host.split('.')[0]
  let slug = url.searchParams.get('__place') || subdomain || null
  if (slug) {
    return (await trpc.places.get.query({ slug: slug })) || {}
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

  const trpc = createTRPCClient(fetch)

  switch (contextData.layout) {
    case 'place':
      contextData = {
        ...contextData,
        context: await fetchPlaceFromURL(url, trpc),
      }
      return {
        notFound: !contextData.context.place || !isRouteValid,
        contextData: contextData,
      }
    case 'app':
      const places = await trpc.users.places.query({
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
          (await import('$lib/__layouts/PlaceLayout.svelte')).default as any
      }
      break
  }
  return layoutComponent
}
