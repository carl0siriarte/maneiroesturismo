import cookie from '@fastify/cookie'
import { default as cors } from '@fastify/cors'
import { default as jwt } from '@fastify/jwt'
import { readFile } from 'node:fs/promises'
import { Application } from './index.js'
import { registerTRPC } from '../trpc.js'

/** Define a factory function that will create an instance of `Application` */
export type ApplicationFactory = typeof applicationFactory

/** Create an new instance of `Application` */
export async function applicationFactory(run?: boolean) {
  // Application instance
  const app = new Application(
    { port: +import.meta.env.VITE_PORT || 3000, host: '0.0.0.0' },
    {
      logger: import.meta.env.PROD,
    }
  )

  app.$server.addHook('onRequest', async (req, res) => {
    if (!import.meta.env.PROD || req.method != 'POST') {
      return
    }
    try {
      const primary = await readFile('/data/.primary', 'utf8')
      if (primary) {
        res.headers({
          'fly-replay': `instance=${primary}`,
        })
        res.send()
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  })

  app.$server.register(cors, {
    credentials: true,
    origin: true,
  })
  app.$server.register(cookie, {
    secret: 'bJwDioi1uvqNTPdxC0/RLryHet0+65nNjQibylnkM3S3kavfzp7gPg==',
  })
  app.$server.register(jwt, {
    secret: 'bJwDioi1uvqNTPdxC0/RLryHet0+65nNjQibylnkM3S3kavfzp7gPg==',
    cookie: {
      cookieName: 'jwt',
      signed: true,
    },
    sign: {
      expiresIn: '10d',
    },
  })

  app.$server.get('/pid', async (req, res) => {
    res.send({ pid: process.pid })
  })

  registerTRPC(app.$server)

  if (run) {
    const url = await app.listen()
    console.log('🚀 Server ready at %s on worker %o', url, process.pid)
  }

  return app.$server
}
