import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ parent }) => {
  const { contextData } = await parent()
  if (contextData.layout != 'place') {
    throw error(404)
  }
  return {}
}
