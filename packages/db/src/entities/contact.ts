import { prisma as $prisma, Prisma } from 'src/prisma.js'
import type { ContactMessage, Page, TrimProps } from 'src/types.js'

export type CreateMessageInput = TrimProps<ContactMessage, 'id' | 'author' | 'createdAt'>

export async function createMessage(
  { userId, placeId, ...input }: CreateMessageInput,
  prisma = $prisma
): Promise<ContactMessage> {
  return await prisma.contactMessage.create({
    include: {
      author: true,
    },
    data: {
      ...input,
      place: {
        connect: {
          id: placeId,
        },
      },
      contactData: input.contactData as any,
      author: userId
        ? {
          connect: {
            id: userId,
          },
        }
        : undefined,
    },
  })
}

export type ListMessagesInput = {
  placeId: string
  page: number
  pageSize: number
}

export async function listMessages(
  { page, pageSize, placeId }: ListMessagesInput,
  prisma = $prisma
): Promise<Page<ContactMessage>> {
  const where: Prisma.ContactMessageWhereInput = {
    placeId,
  }
  const [count, items] = await prisma.$transaction([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])
  return { count, items }
}
