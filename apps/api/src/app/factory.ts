import cookie from '@fastify/cookie'
import { default as cors } from '@fastify/cors'
import { default as jwt } from '@fastify/jwt'
import { readdir, readFile, stat } from 'node:fs/promises'
import { Application } from './index.js'
import { registerTRPC } from '../trpc.js'
import { basename, extname, join } from 'node:path'

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

  // app.$server.get<{
  //   Querystring: {
  //     path: string
  //   }
  // }>(
  //   '/ls',
  //   {
  //     schema: {
  //       querystring: {
  //         path: { type: 'string' },
  //       },
  //     },
  //   },
  //   async (req, res) => {
  //     const { path } = req.query
  //     const tree = await walkDir(path)
  //     console.log(tree)
  //     res.send(tree)
  //   }
  // )

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
      const fileName = basename(item, extname(item))
      result[fileName] = stats.size
    }
  }
  return result
}
