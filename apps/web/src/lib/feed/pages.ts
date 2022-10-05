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

export function getFeedPageTitle(id?: string) {
  return feedPages.find((p) => p.id == id || '')?.title
}
