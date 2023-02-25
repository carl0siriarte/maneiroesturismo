import { procedure, t } from 'src/router.js'
import { z } from 'zod'
import * as db from '@pkg/db'
import { TRPCError } from '@trpc/server'

const authProcedure = procedure.meta({ auth: 'user' })

const getReports = authProcedure
  .input(z.string())
  .mutation(async ({ ctx, input: placeId }) => {
    const role = await db.checkPlaceMember(
      {
        memberId: ctx.userId!,
        placeId,
      },
      ctx.prisma
    )
    if (!role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios',
      })
    }
    const postsInteractions = await ctx.prisma.$transaction([
      ctx.prisma.post.count({
        where: {
          placeId,
        },
      }),
      ctx.prisma.post.count({
        where: {
          placeId,
          CommentOnPost: {
            none: {},
          },
          likes: {
            none: {},
          },
        },
      }),
      ctx.prisma.post.count({
        where: {
          placeId,
          OR: [
            {
              NOT: {
                CommentOnPost: {
                  none: {},
                },
              },
            },
            {
              NOT: {
                likes: {
                  none: {},
                },
              },
            },
            {
              NOT: {
                CommentOnPost: {
                  none: {},
                },
                likes: {
                  none: {},
                },
              },
            },
          ],
        },
      }),
      ctx.prisma.post.findFirst({
        where: {
          placeId,
        },
        orderBy: {
          likes: {
            _count: 'desc',
          },
        },
      }),
    ])

    const posts = {
      total: postsInteractions[0],
      withoutInteractions: postsInteractions[1],
      withInteractions: postsInteractions[2],
      withMoreInteractions: postsInteractions[3]?.id || null,
    }

    const eventsInteractions = await ctx.prisma.$transaction([
      ctx.prisma.placeEvent.count({
        where: {
          placeId,
          isProposal: false,
        },
      }),
      ctx.prisma.placeEvent.count({
        where: {
          placeId,
          isProposal: false,
          CommentOnEvent: {
            none: {},
          },
          confirmations: {
            none: {},
          },
        },
      }),
      ctx.prisma.placeEvent.count({
        where: {
          placeId,
          isProposal: false,
          OR: [
            {
              NOT: {
                CommentOnEvent: {
                  none: {},
                },
              },
            },
            {
              NOT: {
                confirmations: {
                  none: {},
                },
              },
            },
            {
              NOT: {
                CommentOnEvent: {
                  none: {},
                },
                confirmations: {
                  none: {},
                },
              },
            },
          ],
        },
      }),
    ])

    const events = {
      total: eventsInteractions[0],
      withoutInteractions: eventsInteractions[1],
      withInteractions: eventsInteractions[2],
    }

    const actualMonth = new Date().getMonth()
    const year = new Date().getFullYear()
    const confirmations = (
      await ctx.prisma.$transaction(
        Array.from({ length: 6 }).map((_, offset) => {
          const month = actualMonth - offset
          const firstDay = new Date(year, month, 1)
          const lastDay = new Date(year, month + 1, 0)
          return ctx.prisma.eventConfirmation.count({
            where: {
              event: {
                date: {
                  gte: firstDay,
                  lte: lastDay,
                },
                isProposal: false,
                placeId,
              },
            },
          })
        })
      )
    )
      .map((value, offset) => {
        const date = new Date(year, actualMonth - offset)
        return {
          date,
          value,
        }
      })
      .sort((a, b) => +a.date - +b.date)

    return {
      posts,
      events,
      confirmations,
    }
  })

export default t.router({
  get: getReports,
})
