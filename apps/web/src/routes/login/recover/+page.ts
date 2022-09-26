import trpc from '$lib/trpc/client'
import { error, redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent, url, fetch }) => {
  const { contextData, user } = await parent()
  const token = url.searchParams.get('token')
  switch (contextData.layout) {
    case 'app':
      if (user) {
        throw redirect(302, '/')
      }
      if (token) {
        const { ok } = await trpc(fetch).query(
          'user:checkPasswordRecoveryToken',
          token
        )
        if (!ok) throw error(404, 'Page not found')
      }
      return {
        loginPage: (await import('$lib/__app/LoginRecover.svelte')).default,
      }
    default:
      const tourist = await trpc(fetch).query('tourist:whoami')
      if (tourist) {
        throw redirect(302, '/')
      }
      if (token) {
        const { ok } = await trpc(fetch).query(
          'tourist:checkPasswordRecoveryToken',
          {
            token,
            placeId: contextData.place?.id || '',
          }
        )
        if (!ok) throw error(404, 'Page not found')
      }
      return {
        loginPage: (await import('$lib/__place/LoginRecover.svelte')).default,
      }
  }
}
