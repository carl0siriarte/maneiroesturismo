import type { tRPCRouter } from '@pkg/trpc'
import type { AnyRouter } from '@trpc/server'
import trpcTransformer from 'trpc-transformer'
import type { LoadEvent } from '@sveltejs/kit'
import {
  createTRPCProxyClient,
  httpBatchLink,
  type inferRouterProxyClient,
} from '@trpc/client'

export type TRPCClient<Router extends AnyRouter = tRPCRouter> =
  inferRouterProxyClient<Router>

export function createTRPCClient<Router extends AnyRouter = tRPCRouter>(
  fetch?: LoadEvent['fetch'],
  server?: boolean,
  token?: string
): TRPCClient<Router> {
  return createTRPCProxyClient<Router>({
    transformer: trpcTransformer,
    links: [
      httpBatchLink({
        url: server ? `${__API_URL__}/trpc` : `/api/trpc`,
        headers: token
          ? {
              authorization: `Bearer ${token}`,
            }
          : undefined,
        fetch: fetch as any,
      }),
    ],
  })
}

export const trpc = createTRPCClient()
