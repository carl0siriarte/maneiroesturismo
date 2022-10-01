import type { Handle } from '@sveltejs/kit'
import { handleSession } from 'svelte-kit-cookie-session'
import { getLayoutType } from '$lib/utils/layout'

import { sequence } from '@sveltejs/kit/hooks'
import { createTRPCProxy } from '$lib/trpc/proxy.server'
import type { tRPCRouter } from '@pkg/trpc'
import { getDefaultHost } from '$lib/utils/host'

const privateQueries = ['users.whoami', 'tourists.whoami']

const handleAPI: Handle = async ({ event, resolve }) => {
  const { url, locals } = event
  const { token, layoutType } = locals

  let headers: Record<string, string> = {}
  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  const { response, isTRPC } = await createTRPCProxy<tRPCRouter>({
    headers,
    resolve,
    event,
    url: `${__API_URL__}/trpc`,
    cache: {
      enable: layoutType == 'place',
      privateQueries,
    },
  })

  if (response.headers.has('x-access-token')) {
    await locals.session.set({
      token: response.headers.get('x-access-token') || '',
    })
    response.headers.delete('x-access-token')
  }

  const privatePaths = ['/account', '/bag', '/login']
  const isPublic =
    layoutType == 'place' &&
    !privatePaths.some((path) => url.pathname.startsWith(path))

  if (!isTRPC && isPublic) {
    response.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate')
  }

  return response
}

export const session = handleSession(
  {
    secret: 'secret',
    expires: 7,
    key: 'token',
    cookie: {
      httpOnly: true,
      secure: true,
      // domain: getDefaultHost().split(':')[0],
      sameSite: 'lax',
    },
  },
  async ({ event, resolve }) => {
    event.locals = {
      ...event.locals,
      layoutType: getLayoutType(event),
      token: event.locals.session.data.token || undefined,
    }
    return resolve(event)
  }
)

const guard: Handle = async ({ event, resolve }) => {
  if (event.request.headers.get('x-vercel-id')) {
    console.log(event.request.headers.get('x-vercel-id'))
  }

  return resolve(event)
}

export const handle = sequence(session, handleAPI, guard)
