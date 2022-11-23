import * as db from '@pkg/db'
import { TRPCError } from '@trpc/server'
import { procedure, t } from 'src/router.js'
import { z } from 'zod'

const authProcedure = procedure.meta({ auth: 'user' })

const listEventsInput = z.object({
  placeId: z.string(),
  month: z.number().positive(),
  year: z.number().positive(),
})

const listEvents = procedure.input(listEventsInput).query(({ input, ctx }) => {
  return db.listEvents(input, ctx.prisma)
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
    if (!role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios',
      })
    }
    return db.createEvent(input, ctx.prisma)
  })

const getEvent = procedure.input(z.string()).query(({ ctx, input }) => {
  return db.getEvent(input, ctx.prisma)
})

export default t.router({
  list: listEvents,
  create: createEvent,
  get: getEvent,
})
