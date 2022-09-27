import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import trpc from '$lib/trpc/client'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'
// import { getPageData } from '$lib/__place/home/page'

export const load: PageLoad = async ({ fetch, parent }) => {
  const places = await trpc(fetch).query('user:places', {
    orderBy: {
      createdAt: 'desc',
    },
  })
  return {
    title: 'Dashboard',
    places,
  }
}
