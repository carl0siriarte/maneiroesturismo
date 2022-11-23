import { prisma as $prisma, Prisma } from 'src/prisma.js'
import type { Comment, Page, TrimProps } from 'src/types.js'

export type CreateCommentInput = TrimProps<
  Comment,
  'id' | 'createdAt' | 'author'
> &
  Record<'postId', string>

export async function createComment(
  { postId, ...input }: CreateCommentInput,
  prisma = $prisma
): Promise<Comment> {
  return await prisma.comment.create({
    include: {
      author: true,
    },
    data: {
      ...input,
      CommentOnPost: {
        create: {
          postId,
        },
      },
    },
  })
}

export type ListCommentsInput = {
  originId: string
  origin: 'post' | 'comment'
  page: number
  pageSize: number
}

export async function listComments(
  { page, pageSize, origin, originId }: ListCommentsInput,
  prisma = $prisma
): Promise<
  Page<
    Comment & {
      _count: {
        replies: number
      }
    }
  >
> {
  const where: Prisma.CommentWhereInput = {
    CommentOnPost:
      origin == 'post'
        ? {
            some: { postId: originId },
          }
        : undefined,
    replyToId: origin == 'comment' ? originId : null,
  }
  const [count, items] = await prisma.$transaction([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
      include: {
        author: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])
  return { count, items }
}
