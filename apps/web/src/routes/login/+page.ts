import type { PageLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { createTRPCClient } from '$lib/trpc/client'

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { user, contextData } = await parent()
  const client = createTRPCClient(fetch)
  switch (contextData.layout) {
    case 'app':
      if (user) {
        throw redirect(302, '/')
      }
      return {
        loginPage: (await import('$lib/__app/Login.svelte')).default,
      }
    case 'place':
      if (await client.users.whoami.query()) {
        throw redirect(302, '/')
      }
      return {
        loginPage: (await import('$lib/__app/Login.svelte')).default,
      }
  }
}
