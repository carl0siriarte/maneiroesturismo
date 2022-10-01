import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
  const { contextData } = await parent()
  return {
    showFeed: contextData.layout == 'place',
  }
}
