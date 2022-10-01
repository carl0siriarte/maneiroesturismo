import { Prisma, prisma } from 'src/prisma.js'
import type { Page, PlaceMemberRole, User } from 'src/types.js'
import { comparePassword, hashPassword } from 'src/utils/index.js'

export type UpdateUserPasswordInput = Record<'email' | 'newPassword', string>

export async function updateUserPassword({
  email,
  newPassword,
}: UpdateUserPasswordInput) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  })
  await prisma.account.update({
    where: {
      provider_userId: {
        userId: user.id,
        provider: 'credentials',
      },
    },
    data: {
      secret: await hashPassword(newPassword),
    },
  })
}

export type LoginUserInput = {
  email: string
  password: string
}

export async function loginUser({
  email,
  password,
}: LoginUserInput): Promise<User> {
  const found = await prisma.user.findFirst({
    where: {
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
  if (
    !found ||
    !(await comparePassword(password, found?.accounts[0].secret || ''))
  ) {
    throw Error('Email o contraseña incorrectos')
  }
  return found
}

export type RegisterUserInput = {
  user: Pick<User, 'email' | 'name'>
  password: string
  place?: {
    placeId: string
    role: PlaceMemberRole
  }
}

export async function registerUser({
  user,
  password,
  place,
}: RegisterUserInput): Promise<User> {
  return await prisma.user.create({
    data: {
      ...user,
      accounts: {
        create: {
          provider: 'credentials',
          secret: await hashPassword(password),
        },
      },
      PlaceMember: place
        ? {
            create: {
              placeId: place.placeId,
              role: place.role,
            },
          }
        : undefined,
    },
  })
}

export async function getUser(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  })
}

export type ListUsersInput = {
  placeId: string
  ids?: string[]
  filter?: string
  orderBy?: {
    email?: 'asc' | 'desc'
    name?: 'asc' | 'desc'
    createdAt?: 'asc' | 'desc'
  }
  page: number
  pageSize: number
}

export async function listUsers({
  page,
  placeId,
  pageSize,
  ids,
  filter,
  orderBy,
}: ListUsersInput): Promise<
  Page<
    User & {
      role: PlaceMemberRole
    }
  >
> {
  let AND: Prisma.UserWhereInput[] = []
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
            id: {
              contains: filter,
            },
          },
          {
            PlaceMember: {
              some: {
                placeId,
                role: { contains: filter },
              },
            },
          },
          {
            name: {
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
  const where: Prisma.UserWhereInput = {
    PlaceMember: {
      some: {
        placeId,
      },
    },
    AND,
  }
  const [count, items] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
      include: {
        PlaceMember: {
          where: {
            placeId,
          },
        },
      },
    }),
  ])
  return {
    count,
    items: items.map(({ PlaceMember, ...user }) => ({
      ...user,
      role: PlaceMember.at(0)?.role as PlaceMemberRole,
    })),
  }
}
