import { prisma as $prisma } from 'src/prisma.js'
import type { PlaceEvent, TrimProps, User } from 'src/types.js'

export type CreateEventInput = TrimProps<PlaceEvent, 'id' | 'createdAt'>

export async function createEvent(
  input: CreateEventInput,
  prisma = $prisma
): Promise<PlaceEvent> {
  return await prisma.placeEvent.create({
    data: {
      ...input,
    },
  })
}

export type ListEventsInput = {
  month: number
  year: number
  placeId: string
  authorId?: string | null
  isProposal?: boolean
}

export async function listEvents(
  input: ListEventsInput,
  prisma = $prisma
): Promise<
  (TrimProps<PlaceEvent, 'content'> & {
    _count: {
      CommentOnEvent: number
      confirmations: number
    }
  })[]
> {
  const firstDay = new Date(input.year, input.month - 1, 1)
  const lastDay = new Date(input.year, input.month, 0)
  const events = prisma.placeEvent.findMany({
    select: {
      createdAt: true,
      date: true,
      id: true,
      placeId: true,
      title: true,
      isProposal: true,
      authorId: true,
      _count: {
        select: {
          confirmations: true,
          CommentOnEvent: true,
        },
      },
    },
    where: {
      placeId: input.placeId,
      authorId: input.authorId,
      date: {
        gte: firstDay,
        lte: lastDay,
      },
      isProposal: input.isProposal,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return events
}

export async function getEvent(
  id: string,
  prisma = $prisma
): Promise<
  | (PlaceEvent & {
      _count: {
        CommentOnEvent: number
        confirmations: number
      }
      author: User | null
    })
  | null
> {
  const event = prisma.placeEvent.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          confirmations: true,
          CommentOnEvent: true,
        },
      },
      author: true,
    },
  })
  return event
}
