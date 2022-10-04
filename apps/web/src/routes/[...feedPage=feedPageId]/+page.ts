import { getFeedPageTitle } from '$lib/feed'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent, params }) => {
  const { contextData } = await parent()
  return {
    title: getFeedPageTitle(params.feedPage),
    showFeed: contextData.layout == 'place',
  }
}
