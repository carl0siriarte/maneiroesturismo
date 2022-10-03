import { Redis } from '@upstash/redis'
import { setPrismaDatabaseURL, prisma } from '@pkg/db'
import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import transformer from 'trpc-transformer'

export type tRPCContext = {
  session: {
    setUser: (id: string) => Promise<string>
    auth: (
      options?: Partial<Record<'verify', boolean>>
    ) => Promise<Partial<Record<'userId', string>>>
  }
  ip: string
  databaseUrl?: string
}

export type tRPCMeta = {
  auth?: 'user'
}

export const t = initTRPC
  .context<tRPCContext>()
  .meta<tRPCMeta>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      }
    },
    transformer,
  })

export const prismaMiddleware = t.middleware(async ({ ctx, next }) => {
  if (ctx.databaseUrl) {
    await setPrismaDatabaseURL(ctx.databaseUrl)
  }
  return next({
    ctx: {
      ...ctx,
      prisma,
    },
  })
})

export const authMiddleware = t.middleware(async ({ ctx, next, meta }) => {
  const auth = await ctx.session.auth()
  if (meta?.auth) {
    if (!auth[`${meta.auth}Id`]) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `You must be logged as a ${meta.auth}`,
      })
    }
  }
  return next({
    ctx: {
      ...ctx,
      ...auth,
    },
  })
})

export const redisMiddleware = t.middleware(async ({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      redis: new Redis({
        url: process.env.PUBLIC_UPSTASH_REDIS_URL || '',
        token: process.env.PUBLIC_UPSTASH_REDIS_TOKEN || '',
      }),
    },
  })
})

export const procedure = t.procedure
  .use(prismaMiddleware)
  .use(redisMiddleware)
  .use(authMiddleware)
