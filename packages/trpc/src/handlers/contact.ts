import { procedure, t } from 'src/router.js'
import { z } from 'zod'
import * as db from '@pkg/db'

const authProcedure = procedure.meta({ auth: 'user' })

const createMessageInput = z.object({
  data: z.any(),
  placeId: z.string(),
  type: z.string().optional(),
  contactData: z.any(),
})

const createMessage = authProcedure
  .input(createMessageInput)
  .mutation(async ({ ctx, input }) => {
    return await db.createMessage(
      {
        contactData: input.contactData,
        userId: ctx.userId || null,
        data: input.data,
        placeId: input.placeId,
        type: input.type || '',
      },
      ctx.prisma
    )
  })

const listCommentsInput = z.object({
  placeId: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(20),
})

const listComments = procedure
  .input(listCommentsInput)
  .query(async ({ input, ctx }) => {
    return await db.listMessages(input, ctx.prisma)
  })

export default t.router({
  create: createMessage,
  list: listComments,
})
