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
    const data = await db.listPosts(input, ctx.prisma)
    const likes: Record<string, boolean> = (
      await ctx.prisma.$transaction(
        data.items.map((p) =>
          ctx.prisma.postLike.findUnique({
            where: {
              authorId_postId: {
                authorId: ctx.userId || '',
                postId: p.id,
              },
            },
          })
        )
      )
    )
      .filter((l) => l !== null)
      .reduce((a, b) => ({ ...a, [b!.postId]: true }), {})
    return {
      ...data,
      items: data.items.map((p) => ({ ...p, liked: likes[p.id] ?? false })),
    }
  })

const getPostInput = z.string()

const getPost = procedure.input(getPostInput).query(async ({ input, ctx }) => {
  const post = await db.getPost(input, ctx.prisma)
  if (!post) return null
  const liked = ctx.userId
    ? await ctx.prisma.postLike.findUnique({
        where: {
          authorId_postId: {
            authorId: ctx.userId,
            postId: post.id || '',
          },
        },
      })
    : false
  return {
    ...post,
    liked: !!liked,
  }
})

const likePostInput = z.string()

const likePost = authProcedure
  .input(likePostInput)
  .mutation(async ({ input, ctx }) => {
    const like = await ctx.prisma.postLike.findUnique({
      where: {
        authorId_postId: {
          authorId: ctx.userId || '',
          postId: input,
        },
      },
    })
    if (like) {
      await ctx.prisma.postLike.delete({
        where: {
          authorId_postId: {
            authorId: ctx.userId || '',
            postId: input,
          },
        },
      })
    } else {
      await ctx.prisma.postLike.create({
        data: {
          postId: input,
          authorId: ctx.userId || '',
        },
      })
    }
    return !like
  })

const checkLikeInput = z.string()

const checkLike = authProcedure
  .input(checkLikeInput)
  .query(async ({ input, ctx }) => {
    const like = await ctx.prisma.postLike.findUnique({
      where: {
        authorId_postId: {
          authorId: ctx.userId || '',
          postId: input,
        },
      },
    })
    return !!like
  })

export default t.router({
  create: createPost,
  update: updatePost,
  delete: deletePost,
  list: listPosts,
  get: getPost,
  likePost,
  checkLike,
})
