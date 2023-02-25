import type { PageLoad } from './$types'
import { createTRPCClient } from '$lib/trpc/client'

export const load: PageLoad = async ({ fetch, parent }) => {
  const trpc = createTRPCClient(fetch)
  const { contextData } = await parent()
  const reports = await trpc.reports.get.mutate(
    contextData.context.place?.id || ''
  )

  return {
    title: 'Reportes',
    reports,
  }
}
