import { router } from '@trpc/server'
import { Redis } from '@upstash/redis'
import { TRPCError } from '@trpc/server'

export type tRPCContext = {
  session: {
    setUser: (id: string) => Promise<string>
    setTourist: (id: string) => Promise<string>
    auth: (
      options?: Partial<Record<'verify', boolean>>
    ) => Promise<Partial<Record<'userId' | 'touristId', string>>>
  }
  ip: string
}

export type tRPCMeta = {
  auth?: 'user' | 'tourist'
}

export const createRouter = () =>
  router<tRPCContext, tRPCMeta>().middleware(async ({ ctx, next, meta }) => {
    const redis = new Redis({
      url: process.env.PUBLIC_UPSTASH_REDIS_URL || '',
      token: process.env.PUBLIC_UPSTASH_REDIS_TOKEN || '',
    })
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
        redis,
      },
    })
  })
