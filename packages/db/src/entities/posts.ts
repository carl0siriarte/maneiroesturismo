import { Prisma, prisma as $prisma } from 'src/prisma.js'
import type { Overwrite, Page, Post, TrimProps, User } from 'src/types.js'

export type CreatePostInput = TrimProps<
  Post,
  'id' | 'edited' | 'createdAt' | 'updatedAt'
>

export async function createPost(
  input: CreatePostInput,
  prisma = $prisma
): Promise<
  Post & {
    _count: {
      CommentOnPost: number
      likes: number
    }
  }
> {
  return await prisma.post.create({
    data: {
      ...input,
    },
    include: {
      _count: {
        select: {
          CommentOnPost: true,
          likes: true,
        },
      },
    },
  })
}

export type UpdatePostInput = Overwrite<
  Partial<TrimProps<Post, 'edited' | 'createdAt' | 'updatedAt' | 'placeId'>>,
  Pick<Post, 'id'>
>

export async function updatePost(
  input: UpdatePostInput,
  prisma = $prisma
): Promise<Post> {
  return await prisma.post.update({
    where: {
      id: input.id,
    },
    data: {
      ...input,
      edited: true,
    },
  })
}

export async function deletePost(
  postId: string,
  prisma = $prisma
): Promise<Post> {
  return await prisma.post.delete({
    where: {
      id: postId,
    },
  })
}

export async function getPost(
  postId: string,
  prisma = $prisma
): Promise<
  | (Post & {
      _count: {
        CommentOnPost: number
        likes: number
      }
      author: User | null
    })
  | null
> {
  return await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,
      _count: {
        select: {
          CommentOnPost: true,
          likes: true,
        },
      },
    },
  })
}

export type ListPostsInput = {
  placeId: string
  authorId?: string | null
  ids?: string[]
  filter?: string
  page: number
  pageSize: number
}

export async function listPosts(
  { page, placeId, pageSize, ids, filter, authorId }: ListPostsInput,
  prisma = $prisma
): Promise<
  Page<
    Post & {
      _count: {
        CommentOnPost: number
        likes: number
      }
      author: User | null
    }
  >
> {
  let AND: Prisma.PostWhereInput[] = []
  if (ids)
    AND = [
      ...AND,
      {
        id: {
          in: ids,
        },
      },
    ]
  if (filter)
    AND = [
      ...AND,
      {
        OR: [
          {
            content: {
              contains: filter,
            },
          },
        ],
      },
    ]
  const where: Prisma.PostWhereInput = {
    placeId,
    authorId,
    AND,
  }
  const [count, items] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
      include: {
        _count: {
          select: {
            CommentOnPost: true,
            likes: true,
          },
        },
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])
  return { count, items }
}
