import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { useCaravaggioBuilder } from '$lib/components/caravaggio/useCaravaggio'
import type { Place } from '@pkg/db'
import { fetchPlaceFromURL } from '$lib/utils/layout'
import { createTRPCClient } from '$lib/trpc/client'

export const GET: RequestHandler = async (event) => {
  let layout = event.locals.layoutType
  const imageBuilder = useCaravaggioBuilder(event.url.origin)
  let place: Place | null = null
  if (layout === 'place') {
    place =
      (await fetchPlaceFromURL(event.url, createTRPCClient(fetch, true)))
        ?.place || null
  }
  const icon = place?.logo || '/images/logo.svg'
  const iconsRes = [36, 48, 72, 96, 144, 192, 256, 384, 512]
  const getIcon = (res: number) =>
    imageBuilder(icon, {
      o: 'png',
      progressive: true,
      rs: {
        s: `${res}x${res}`,
        g: 'center',
        m: 'embed',
        b: '000000.0',
      },
    })

  return json({
    name: place?.name || 'Maneiro es Turismo',
    short_name: place?.name || 'Maneiro es Turismo',
    description: place?.name || 'Maneiro es Turismo',
    dir: 'auto',
    lang: 'en-US',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    background_color: '#000',
    theme_color: '#000',
    icons: iconsRes.map((s) => ({
      src: getIcon(s),
      sizes: `${s}x${s}`,
      type: 'image/png',
    })),
  })
}

export const prerender = false
