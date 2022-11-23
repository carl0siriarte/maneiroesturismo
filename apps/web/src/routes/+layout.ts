import { getSvelteLayoutComponent } from '$lib/utils/layout'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ data }) => {
  const { contextData, notFound, user } = data
  const layoutComponent = await getSvelteLayoutComponent(contextData)

  return {
    ...data,
    layoutComponent,
  }
}
