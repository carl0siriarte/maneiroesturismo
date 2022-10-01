import { createTRPCClient } from '$lib/trpc/client'
import { error, redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent, url, fetch }) => {
  const { user } = await parent()
  const token = url.searchParams.get('token')
  const trpc = createTRPCClient(fetch)
  // switch (contextData.layout) {
  //   case 'app':
  if (user) {
    throw redirect(302, '/')
  }
  if (token) {
    const { ok } = await trpc.users.passwordRecovery.checkToken.query(token)
    if (!ok) throw error(404, 'Page not found')
  }
  return {
    loginPage: (await import('$lib/__app/LoginRecover.svelte')).default,
  }
  //   default:
  //     const tourist = await trpc.tourists.whoami.query('tourist:whoami')
  //     if (tourist) {
  //       throw redirect(302, '/')
  //     }
  //     if (token) {
  //       const { ok } = await trpc.tourists.passwordRecovery.checkToken.query({
  //         token,
  //         placeId: contextData.context.place?.id || '',
  //       })
  //       if (!ok) throw error(404, 'Page not found')
  //     }
  //     return {
  //       loginPage: (await import('$lib/__place/LoginRecover.svelte')).default,
  //     }
  // }
}
