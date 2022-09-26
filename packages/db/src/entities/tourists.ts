import { Prisma, prisma } from 'src/prisma.js'
import type { Page, PlaceMemberRole, Tourist, TrimProps } from 'src/types.js'
import { comparePassword, hashPassword } from 'src/utils/index.js'

export type UpdateTouristPasswordInput = Record<
  'email' | 'newPassword' | 'placeId',
  string
>

export async function updateTouristPassword({
  email,
  placeId,
  newPassword,
}: UpdateTouristPasswordInput) {
  const tourist = await prisma.tourist.findUniqueOrThrow({
    where: {
      email_placeId: {
        email,
        placeId,
      },
    },
  })
  await prisma.account.update({
    where: {
      provider_touristId: {
        touristId: tourist.id,
        provider: 'credentials',
      },
    },
    data: {
      secret: await hashPassword(newPassword),
    },
  })
}

export type LoginTouristInput = {
  email: string
  password: string
  placeId: string
}

export async function loginTourist({
  email,
  password,
  placeId,
}: LoginTouristInput): Promise<Tourist> {
  const found = await prisma.tourist.findFirst({
    where: {
      placeId,
      email,
      accounts: {
        some: {
          provider: 'credentials',
        },
      },
    },
    include: {
      accounts: {
        where: {
          provider: 'credentials',
          secret: {
            not: null,
          },
        },
      },
    },
    rejectOnNotFound: false,
  })
  const hashedPwd = await hashPassword(password)
  if (
    !found ||
    !(await comparePassword(password, found?.accounts[0].secret || ''))
  ) {
    throw Error('Email o contraseña incorrectos')
  }
  return found
}

export type RegisterTouristInput = {
  tourist: TrimProps<Tourist, 'createdAt' | 'id' | 'placeId'>
  placeId: string
  password: string
}

export async function registerTourist({
  tourist,
  placeId,
  password,
}: RegisterTouristInput): Promise<Tourist> {
  return await prisma.tourist.create({
    data: {
      ...tourist,
      place: {
        connect: {
          id: placeId,
        },
      },
      accounts: {
        create: {
          provider: 'credentials',
          secret: await hashPassword(password),
        },
      },
    },
  })
}

export type ListTouristsInput = {
  placeId: string
  ids?: string[]
  filter?: string
  orderBy?: {
    email?: 'asc' | 'desc'
    firstName?: 'asc' | 'desc'
    lastName?: 'asc' | 'desc'
    createdAt?: 'asc' | 'desc'
  }
  page: number
  pageSize: number
}

export async function listTourists({
  page,
  placeId,
  pageSize,
  ids,
  filter,
  orderBy,
}: ListTouristsInput): Promise<Page<Tourist>> {
  let AND: Prisma.TouristWhereInput[] = []
  if (ids)
    AND = [
      ...AND,
      {
        id: {
          in: ids,
        },
      },
    ]
  if (filter)
    AND = [
      ...AND,
      {
        OR: [
          {
            firstName: {
              contains: filter,
            },
          },
          {
            lastName: {
              contains: filter,
            },
          },
          {
            email: {
              contains: filter,
            },
          },
        ],
      },
    ]
  const where: Prisma.TouristWhereInput = {
    placeId,
    AND,
  }
  const [count, items] = await prisma.$transaction([
    prisma.tourist.count({ where }),
    prisma.tourist.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
    }),
  ])
  return { count, items }
}
