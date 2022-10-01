import { error, redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, url, parent }) => {
  const { notFound } = await parent()
  if (notFound) {
    throw error(404)
  }
  // const tourist = await createTRPCClient(fetch).tourists.whoami.query()
  // if (
  //   url.pathname.startsWith('/account/orders/') &&
  //   url.pathname != '/account/orders/' &&
  //   url.searchParams.get('token')
  // )
  //   return {}
  // if (!tourist) {
  //   throw redirect(
  //     302,
  //     `/login?callbackUrl=${encodeURIComponent(url.pathname)}`
  //   )
  // }
  return {}
}
