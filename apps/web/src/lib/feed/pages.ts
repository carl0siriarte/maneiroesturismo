import { EventSchedule16, Home16, Information16 } from 'carbon-icons-svelte'

type UnwrapArray<A> = A extends unknown[] ? UnwrapArray<A[number]> : A

export const feedPages = [
  {
    id: '' as const,
    title: 'Inicio',
  },
  {
    id: 'events' as const,
    title: 'Eventos',
  },
  {
    id: 'information' as const,
    title: 'Información',
  },
]

export type FeedPageId = UnwrapArray<typeof feedPages>['id']

export function getFeedPageIcon(id: string | FeedPageId) {
  if (id == 'events') {
    return EventSchedule16
  } else if (id == 'information') {
    return Information16
  } else {
    return Home16
  }
}

export function getFeedPageTitle(id?: string) {
  return feedPages.find((p) => p.id == id || '')?.title
}
