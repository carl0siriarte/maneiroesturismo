import trpc from '$lib/trpc/client'
import type { PageLoad } from './$types'
// import { getPageData } from '$lib/__place/home/page'

export const load: PageLoad = async ({ fetch, parent }) => {
  const { user } = await parent()
  return {
    title: 'Dashboard',
  }
}
