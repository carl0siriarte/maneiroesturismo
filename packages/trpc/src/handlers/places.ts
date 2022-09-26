import * as db from '@pkg/db'
import { createRouter } from 'src/shared.js'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

const mutations = createRouter()
  .mutation('create', {
    input: z.object({
      name: z.string().min(2),
      slug: z.string().min(1),
      customDomain: z.string().min(1).nullable(),
      logo: z.string().nullable(),
      favicon: z.string().nullable(),
    }),
    meta: { auth: 'user' },
    resolve: ({ input, ctx }) =>
      db.createPlace({ place: input, userOwnerId: ctx.userId! }),
  })
  .mutation('update', {
    input: z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      slug: z.string().min(1).optional(),
      customDomain: z.string().min(1).optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
    }),
    meta: { auth: 'user' },
    resolve: async ({ input, ctx }) => {
      const role = await db.checkPlaceMember({
        memberId: ctx.userId || '',
        placeId: input.id,
      })
      if (!role || role == 'normal') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'Este usuario no tiene los permisos necesarios para actualizar este sitio',
        })
      }
      return await db.updatePlace(input)
    },
  })

const queries = createRouter().query('get', {
  input: z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    host: z.string().optional(),
  }),
  resolve: async ({ input }) => {
    const data: db.PlaceContext = {}
    data.place = await db.getPlace(input)
    return data
  },
})

export default createRouter().merge(mutations).merge(queries)
