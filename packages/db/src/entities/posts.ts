import { Prisma, prisma } from 'src/prisma.js'
import type { Overwrite, Page, Post, TrimProps } from 'src/types.js'

export type CreatePostInput = TrimProps<
  Post,
  'id' | 'edited' | 'createdAt' | 'updatedAt'
>

export async function createPost(input: CreatePostInput): Promise<Post> {
  return await prisma.post.create({
    data: {
      ...input,
    },
  })
}

export type UpdatePostInput = Overwrite<
  Partial<TrimProps<Post, 'edited' | 'createdAt' | 'updatedAt' | 'placeId'>>,
  Pick<Post, 'id'>
>

export async function updatePost(input: UpdatePostInput): Promise<Post> {
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

export async function deletePost(postId: string): Promise<Post> {
  return await prisma.post.delete({
    where: {
      id: postId,
    },
  })
}

export async function getPost(postId: string): Promise<Post | null> {
  return await prisma.post.findUnique({
    where: {
      id: postId,
    },
  })
}

export type ListPostsInput = {
  placeId: string
  ids?: string[]
  filter?: string
  page: number
  pageSize: number
}

export async function listPosts({
  page,
  placeId,
  pageSize,
  ids,
  filter,
}: ListPostsInput): Promise<Page<Post>> {
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
    AND,
  }
  const [count, items] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
    }),
  ])
  return { count, items }
}
