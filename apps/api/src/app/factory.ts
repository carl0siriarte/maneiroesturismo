import cookie from '@fastify/cookie'
import { default as cors } from '@fastify/cors'
import { default as jwt } from '@fastify/jwt'
import { readdir, readFile, stat } from 'node:fs/promises'
import { Application } from './index.js'
import { registerTRPC } from '../trpc.js'
import { basename, extname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import type { FastifyError } from 'fastify'

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
    const redirect = req.method == 'POST' || req.routerPath == '/migrate-db'
    if (redirect && import.meta.env.PROD) {
      try {
        const primary = await readFile('/litefs/.primary', 'utf8')
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

  app.$server.post<{
    Querystring: {
      token: string
    }
  }>(
    '/migrate-db',
    {
      schema: {
        querystring: {
          token: { type: 'string' },
        },
      },
    },
    async (req, res) => {
      const { token: tokenFromQuery } = req.query
      const token =
        req.headers.authorization?.substring('Bearer '.length) || tokenFromQuery
      if (token != __SECRET_TOKEN__) {
        throw {
          statusCode: 401,
          message: 'NOT AUTHORIZED',
        } as FastifyError
      }
      res.send(
        spawnSync('node', [
          'node_modules/prisma/build/index.js',
          'migrate',
          'deploy',
        ]).output.toString()
      )
    }
  )

  app.$server.get<{
    Querystring: {
      path: string
    }
  }>(
    '/ls',
    {
      schema: {
        querystring: {
          path: { type: 'string' },
        },
      },
    },
    async (req, res) => {
      const { path } = req.query
      const tree = await walkDir(path)
      res.send(tree)
    }
  )

  registerTRPC(app.$server)

  if (run) {
    const url = await app.listen()
    console.log('🚀 Server ready at %s on worker %o', url, process.pid)
  }

  return app.$server
}

async function walkDir(
  dir: string,
  result: Record<string, any> = {}
): Promise<Record<string, any>> {
  let list = await readdir(dir)
  for (let item of list) {
    const itemPath = join(dir, item)
    let stats = await stat(itemPath)
    if (await stats.isDirectory()) {
      result[item] = {}
      await walkDir(itemPath, result[item])
    } else {
      if (await stats.isFile()) {
        const fileName = basename(item, extname(item))
        result[fileName] = stats.size
      }
    }
  }
  return result
}
