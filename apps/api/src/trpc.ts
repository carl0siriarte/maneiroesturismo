import { router, tRPCContext, tRPCRouter } from '@pkg/trpc'
import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from '@trpc/server/adapters/fastify'
import type { FastifyInstance } from 'fastify'

async function createContext({
  req,
  res,
}: CreateFastifyContextOptions): Promise<tRPCContext> {
  return {
    ip: req.ip,
    session: {
      auth: async (options) => {
        let ids: Partial<Record<'userId', string>> = {}
        let decoded: any
        try {
          decoded = await req.jwtVerify()
        } catch (err) {
          if (!err.code || (options?.verify && err.code.startsWith('FST_JWT')))
            throw err
        }
        if (decoded?.id && decoded?.type) {
          ids[`${decoded.type}Id`] = decoded.id
        }
        return ids
      },
      setUser: async (id: string) => {
        const token = await res.jwtSign({ id, type: 'user' })
        res.header('x-access-token', token)
        return token
      },
    },
  }
}

export async function registerTRPC<App extends FastifyInstance>(app: App) {
  app.register(fastifyTRPCPlugin<tRPCRouter>, {
    prefix: '/trpc',
    trpcOptions: {
      router,
      createContext,
    },
  })
}
