import { procedure, t } from 'src/router.js'
import { z } from 'zod'
import * as db from '@pkg/db'

const authProcedure = procedure.meta({ auth: 'user' })

const createCommentInput = z.object({
  content: z.string(),
  postId: z.string(),
  replyToId: z.string().optional(),
})

const createPost = authProcedure
  .input(createCommentInput)
  .mutation(async ({ ctx, input }) => {
    return await db.createComment(
      {
        postId: input.postId,
        content: input.content,
        userId: ctx.userId!,
        replyToId: input.replyToId || null,
      },
      ctx.prisma
    )
  })

const listCommentsInput = z.object({
  originId: z.string(),
  origin: z.enum(['post', 'comment']).optional().default('post'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(20),
})

const listComments = procedure
  .input(listCommentsInput)
  .query(async ({ input, ctx }) => {
    return await db.listComments(input, ctx.prisma)
  })

export default t.router({
  create: createPost,
  list: listComments,
})
