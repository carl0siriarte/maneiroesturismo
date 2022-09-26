import * as db from '@pkg/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../shared.js'
import type { MailDataRequired } from '@sendgrid/mail'
import { utils } from '@pkg/shared'

const lostPassword = createRouter()
  .query('checkPasswordRecoveryToken', {
    input: z.string(),
    resolve: async ({ input, ctx }) => {
      const key = `users:passwordsTokens:${input}`
      const email = await ctx.redis.get<string>(key)
      return { ok: email != null }
    },
  })
  .mutation('recoverPassword', {
    input: z.object({
      newPassword: z.string().min(6),
      token: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { token, newPassword } = input
      const key = `users:passwordsTokens:${token}`
      const email = await ctx.redis.get<string>(key)
      // const email = tokenDB.get(token) || null
      if (!email)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        })
      await db.updateUserPassword({
        email,
        newPassword,
      })
      await ctx.redis.del(key)
    },
  })
  .mutation('issuePasswordRecoveryToken', {
    input: z.object({
      email: z.string().email(),
    }),
    resolve: async ({ input, ctx }) => {
      const user = await db.prisma.user.findUnique({
        where: input,
      })
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Account not found',
        })
      }
      const token = crypto
        .randomUUID()
        .replace(new RegExp('-', 'g'), '')
        .toLowerCase()
      console.log(token)
      const key = `users:passwordsTokens:${token}`
      await ctx.redis.set(key, token, {
        ex: 86400,
      })
      const url = utils.getAbsoluteURL({
        path: `/login/recover?token=${token}`,
      })
      const msg: MailDataRequired = {
        to: input.email,
        from: {
          name: 'Maneiro es Turismo',
          email: `no-reply@maneiroesturismo.com.com`,
        },

        headers: {
          Priority: 'Urgent',
          Importance: 'high',
        },
        subject: `Cambio de contraseña`,
        html: `<p><b>Hola,</b></p>
          <p>Hemos recibido una petición para cambiar una contraseña olvidada.</p>
          <p>Para cambiar tu contraseña, haz click en el siguiente link</p>
          <p><a href="${url}">Reiniciar contraseña</a></p>
          <p>Si no has sido tú quien hizo esta petición, por favor ignora este correo.</p>
          <br>
          <p>Gracias,</p>
          <p>El equipo de __NOMBRE__</p>`,
      }
      // await sendgrid.send(msg)
    },
  })

export default createRouter()
  .mutation('register', {
    input: z.object({
      user: z.object({
        email: z.string().email(),
        name: z.string(),
      }),
      place: z
        .object({
          placeId: z.string(),
          role: z.nativeEnum(db.PlaceMemberRole),
        })
        .optional(),
      password: z.string().min(6),
    }),
    resolve: async ({ ctx, input: { user, password, place } }) => {
      try {
        const registered = await db.registerUser({
          user,
          place,
          password,
        })
        await ctx.session.setUser(registered.id)
        return registered
      } catch (err) {
        console.error(err.message)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: err.message,
        })
      }
    },
  })
  .mutation('login', {
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
    resolve: async ({ ctx, input: { email, password } }) => {
      try {
        const user = await db.loginUser({
          email,
          password,
        })
        await ctx.session.setUser(user.id)
        return user
      } catch (err) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: err.message,
        })
      }
    },
  })
  .query('whoami', {
    resolve: async ({ ctx }) => {
      return await db.getUser(ctx.userId || '')
    },
  })
  .query('places', {
    input: z
      .object({
        filter: z
          .object({
            name: z.string().optional(),
          })
          .optional(),
        orderBy: z
          .object({
            name: z.enum(['asc', 'desc']).optional(),
            createdAt: z.enum(['asc', 'desc']).optional(),
          })
          .optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      })
      .optional()
      .default({
        page: 1,
        pageSize: 20,
      }),
    resolve: async ({ ctx, input }) => {
      return await db.listPlaces({ memberId: ctx.userId || '', ...input })
    },
  })
  .merge(lostPassword)
