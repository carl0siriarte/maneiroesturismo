import { createTRPCClient } from '$lib/trpc/client'
import { error, redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent, url, fetch }) => {
  const { user, contextData } = await parent()
  const token = url.searchParams.get('token')
  const client = createTRPCClient(fetch)
  // switch (contextData.layout) {
  //   case 'app':
  if (token) {
    const { ok } = await client.users.passwordRecovery.checkToken.query(token)
    if (!ok) throw error(404, 'Page not found')
  }

  switch (contextData.layout) {
    case 'app':
      if (user) {
        throw redirect(302, '/')
      }
    case 'place':
      if (await client.users.whoami.query()) {
        throw redirect(302, '/')
      }
  }
  return {}
}
