import { prisma as $prisma } from 'src/prisma.js'
import type { PlaceEvent, TrimProps } from 'src/types.js'

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
  isProposal?: boolean
}

export async function listEvents(
  input: ListEventsInput,
  prisma = $prisma
): Promise<TrimProps<PlaceEvent, 'content'>[]> {
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
    },
    where: {
      placeId: input.placeId,
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
): Promise<PlaceEvent | null> {
  const event = prisma.placeEvent.findUnique({
    where: {
      id,
    },
  })
  return event
}
