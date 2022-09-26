import type { PageLoad } from './$types'
import trpc from '$lib/trpc/client'
import { redirect } from '@sveltejs/kit'

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { contextData, user } = await parent()
  const client = trpc(fetch)
  switch (contextData.layout) {
    case 'app':
      if (user) {
        const user = await client.query('user:whoami')
        if (user) {
          throw redirect(302, '/')
        }
      }
      return {
        loginPage: (await import('$lib/__app/Login.svelte')).default,
      }
    case 'place':
      const tourist = await client.query('tourist:whoami')
      if (tourist) {
        throw redirect(302, '/')
      }
      return {
        loginPage: (await import('$lib/__place/Login.svelte')).default,
      }
  }
}
