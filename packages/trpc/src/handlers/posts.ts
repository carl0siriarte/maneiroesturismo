import { TRPCError } from '@trpc/server'
import { procedure, t } from 'src/router.js'
import { z } from 'zod'
import * as db from '@pkg/db'

const authProcedure = procedure.meta({ auth: 'user' })

const createPostInput = z.object({
  placeId: z.string(),
  content: z.string(),
  thumbnail: z.string().nullable(),
  placeEventId: z.string().nullable(),
})

const createPost = authProcedure
  .input(createPostInput)
  .mutation(async ({ ctx, input }) => {
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
    return await db.createPost(input, ctx.prisma)
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
    const post = await db.getPost(input.id, ctx.prisma)
    const role = await db.checkPlaceMember(
      {
        memberId: ctx.userId || '',
        placeId: post?.placeId || '',
      },
      ctx.prisma
    )
    if (!role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios',
      })
    }
    return await db.updatePost(input, ctx.prisma)
  })

const deletePostInput = z.string()

const deletePost = authProcedure
  .input(deletePostInput)
  .mutation(async ({ ctx, input }) => {
    const post = await db.getPost(input, ctx.prisma)
    const role = await db.checkPlaceMember(
      {
        memberId: ctx.userId || '',
        placeId: post?.placeId || '',
      },
      ctx.prisma
    )
    if (!role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios',
      })
    }
    return await db.deletePost(input, ctx.prisma)
  })

const listPostsInput = z.object({
  placeId: z.string(),
  ids: z.string().array().optional(),
  filter: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(20),
})

const listPosts = procedure
  .input(listPostsInput)
  .query(async ({ input, ctx }) => {
    return await db.listPosts(input, ctx.prisma)
  })

const getPostInput = z.string()

const getPost = procedure.input(getPostInput).query(async ({ input, ctx }) => {
  return await db.getPost(input, ctx.prisma)
})

export default t.router({
  create: createPost,
  update: updatePost,
  delete: deletePost,
  list: listPosts,
  get: getPost,
})
