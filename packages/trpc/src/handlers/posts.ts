import { TRPCError } from '@trpc/server'
import { procedure, t } from 'src/router.js'
import { z } from 'zod'
import * as db from '@pkg/db'

const authProcedure = procedure.meta({ auth: 'user' })

const createPostInput = z.object({
  placeId: z.string(),
  content: z.string(),
  thumbnail: z.string().nullable(),
  placeEventId: z.string(),
})

const createPost = authProcedure
  .input(createPostInput)
  .mutation(async ({ ctx, input }) => {
    const role = await db.checkPlaceMember({
      memberId: ctx.userId || '',
      placeId: input.placeId,
    })
    if (!role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios',
      })
    }
    return await db.createPost(input)
  })

const updatePostInput = z.object({
  id: z.string(),
  content: z.string().optional(),
  thumbnail: z.string().nullish(),
  placeEventId: z.string().nullish(),
})

const updatePost = authProcedure
  .input(updatePostInput)
  .mutation(async ({ ctx, input }) => {
    const post = await db.getPost(input.id)
    const role = await db.checkPlaceMember({
      memberId: ctx.userId || '',
      placeId: post?.placeId || '',
    })
    if (!role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios',
      })
    }
    return await db.updatePost(input)
  })

export default t.router({
  createPost,
  updatePost,
})
