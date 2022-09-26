import type { Place as _Place, User, Tourist } from '@prisma/client'

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U
export type TrimProps<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>
export type Page<T> = {
  count: number
  items: T[]
}

export type Place = _Place

export const PlaceMemberRole = {
  owner: 'owner' as const,
  admin: 'admin' as const,
  normal: 'normal' as const,
}

export type PlaceMemberRole =
  typeof PlaceMemberRole[keyof typeof PlaceMemberRole]

export { User, Tourist }

export type LayoutType = 'app' | 'place'
export type PlaceData = {
  theme: Record<'primary', string>
  header: {
    links: Record<'title' | 'href', string>[]
  }
  announcementBar: Record<'background' | 'text', string> &
    Partial<Record<'href', string>> & { visible: boolean }
  footer: {
    submit: Record<'title' | 'text', string>
    links: Record<'title' | 'href', string>[]
    appendix: Record<'title' | 'text' | 'img', string>
  }
}

export type AppContext = {
  place?: Place | null
  placeData?: PlaceData
  places?: Place[]
}

export type PlaceContext = {
  place?: Place | null
  placeData?: PlaceData
}

export type PageContext = {
  layout: LayoutType
  context: AppContext & PlaceContext
}
