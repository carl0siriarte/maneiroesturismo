import * as db from '@pkg/db'
import { procedure, t } from 'src/router.js'
import { z } from 'zod'

const authProcedure = procedure.meta({ auth: 'user' })

const listEventsInput = z.object({
  placeId: z.string(),
  month: z.number().positive(),
  year: z.number().positive(),
  authorId: z.string().nullish().optional(),
})

const listEvents = procedure
  .input(listEventsInput)
  .query(async ({ input, ctx }) => {
    const data = await db.listEvents(input, ctx.prisma)
    const confirmations: Record<string, boolean> = (
      await ctx.prisma.$transaction(
        data.map((e) =>
          ctx.prisma.eventConfirmation.findUnique({
            where: {
              userId_eventId: {
                userId: ctx.userId || '',
                eventId: e.id,
              },
            },
          })
        )
      )
    )
      .filter((l) => l !== null)
      .reduce((a, b) => ({ ...a, [b!.eventId]: true }), {})
    return data.map((e) => ({ ...e, confirmed: confirmations[e.id] ?? false }))
  })

const createEventInput = z.object({
  date: z.date(),
  placeId: z.string(),
  title: z.string(),
  content: z
    .string()
    .optional()
    .default(JSON.stringify({ nodes: [] })),
})

const createEvent = authProcedure
  .input(createEventInput)
  .mutation(async ({ input, ctx }) => {
    const role = await db.checkPlaceMember(
      {
        memberId: ctx.userId || '',
        placeId: input.placeId,
      },
      ctx.prisma
    )
    return db.createEvent(
      {
        ...input,
        authorId: ctx.userId || null,
        isProposal: !role,
      },
      ctx.prisma
    )
  })

const getEvent = procedure.input(z.string()).query(async ({ ctx, input }) => {
  const event = await db.getEvent(input, ctx.prisma)
  if (!event) return null
  const confirmed = ctx.userId
    ? await ctx.prisma.eventConfirmation.findUnique({
        where: {
          userId_eventId: {
            userId: ctx.userId,
            eventId: event.id || '',
          },
        },
      })
    : false
  return {
    ...event,
    confirmed: !!confirmed,
  }
})

const confirmEventInput = z.string()

const confirmEvent = authProcedure
  .input(confirmEventInput)
  .mutation(async ({ input, ctx }) => {
    const confirmation = await ctx.prisma.eventConfirmation.findUnique({
      where: {
        userId_eventId: {
          userId: ctx.userId || '',
          eventId: input,
        },
      },
    })
    if (confirmation) {
      await ctx.prisma.eventConfirmation.delete({
        where: {
          userId_eventId: {
            userId: ctx.userId || '',
            eventId: input,
          },
        },
      })
    } else {
      await ctx.prisma.eventConfirmation.create({
        data: {
          eventId: input,
          userId: ctx.userId || '',
        },
      })
    }
    return !confirmation
  })

export default t.router({
  list: listEvents,
  create: createEvent,
  get: getEvent,
  confirm: confirmEvent,
})
