import { Prisma, prisma } from 'src/prisma.js'
import * as sj from 'superjson'
import type {
  Overwrite,
  Page,
  Place,
  PlaceData,
  PlaceMemberRole,
  TrimProps,
} from 'src/types.js'
import { defaultPlaceData } from 'src/utils/index.js'

export type CreatePlaceInput = {
  place: TrimProps<
    Place,
    'createdAt' | 'id' | 'updatedAt' | 'logo' | 'coverImage'
  >
  userOwnerId: string
}

export async function createPlace({
  place,
  userOwnerId,
}: CreatePlaceInput): Promise<Place> {
  return await prisma.place.create({
    data: {
      ...place,
      PlaceMember: {
        create: {
          memberId: userOwnerId,
          role: 'owner',
        },
      },
    },
  })
}

export type UpsertPlaceDataInput = {
  placeId: string
  placeData: PlaceData
}

export async function upsertPlaceData({
  placeId,
  placeData,
}: UpsertPlaceDataInput) {
  const data = sj.stringify(placeData)
  const { data: upsert } = await prisma.placeData.upsert({
    where: {
      placeId,
    },
    create: {
      placeId,
      data,
    },
    update: {
      data,
    },
  })
  return sj.parse<PlaceData>(upsert)
}

export async function getPlaceData(placeId: string) {
  const placeData = await prisma.placeData.findUnique({
    where: {
      placeId,
    },
  })
  if (!placeData) return defaultPlaceData
  return sj.parse<PlaceData>(placeData.data)
}

export type UpdatePlaceInput = Overwrite<
  Partial<TrimProps<Place, 'createdAt' | 'updatedAt'>>,
  { id: string }
>

export async function updatePlace(place: UpdatePlaceInput): Promise<Place> {
  const { id, ...data } = place
  return await prisma.place.update({
    data,
    where: {
      id,
    },
  })
}

export type ListPlacesInput = {
  memberId: string
  filter?: {
    name?: string
  }
  orderBy?: {
    name?: 'asc' | 'desc'
    createdAt?: 'asc' | 'desc'
  }
  page: number
  pageSize: number
}

export async function listPlaces({
  page,
  memberId,
  pageSize,
  filter,
  orderBy,
}: ListPlacesInput): Promise<Page<Place>> {
  const where: Prisma.PlaceWhereInput = {
    PlaceMember: {
      some: {
        memberId,
      },
    },
    name: filter?.name
      ? {
          contains: filter.name,
        }
      : undefined,
  }
  const [count, items] = await prisma.$transaction([
    prisma.place.count({ where }),
    prisma.place.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
    }),
  ])
  return { count, items }
}

export type CheckPlaceMemberInput = Record<'placeId' | 'memberId', string>

export async function checkPlaceMember(
  input: CheckPlaceMemberInput
): Promise<PlaceMemberRole | null> {
  const placeMember = await prisma.placeMember.findUnique({
    where: {
      memberId_placeId: input,
    },
  })
  return placeMember?.role as PlaceMemberRole | null
}

export type GetPlaceInput = Partial<Record<'slug' | 'host' | 'id', string>>

export async function getPlace({
  id,
  slug,
}: GetPlaceInput): Promise<Place | null> {
  return await prisma.place.findUnique({
    where: {
      id,
      slug,
    },
  })
}

export async function deletePlace(id: string) {
  await prisma.place.delete({
    where: {
      id,
    },
  })
}
