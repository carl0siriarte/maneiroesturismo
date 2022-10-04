import { feedPages } from '$lib/feed'
import type { ParamMatcher } from '@sveltejs/kit'

export const match: ParamMatcher = (param) => {
  return feedPages.map((p) => p.id).includes(param as any)
}
