import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../shared.js'
import type { MailDataRequired } from '@sendgrid/mail'
import { utils } from '@pkg/shared'
import * as db from '@pkg/db'

const lostPassword = createRouter()
  .query('checkPasswordRecoveryToken', {
    input: z.object({
      token: z.string(),
      placeId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const key = `customers:passwordsTokens:${input.placeId}:${input.token}`
      const email = await ctx.redis.get<string>(key)
      return { ok: email != null }
    },
  })
  .mutation('recoverPassword', {
    input: z.object({
      newPassword: z.string().min(6),
      token: z.string(),
      placeId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { token, newPassword, placeId } = input
      const key = `customers:passwordsTokens:${placeId}:${token}`
      const email = await ctx.redis.get<string>(key)
      // const email = tokenDB.get(token) || null
      if (!email)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        })
      await db.updateTouristPassword({
        placeId,
        email,
        newPassword,
      })
      await ctx.redis.del(key)
    },
  })
  .mutation('issuePasswordRecoveryToken', {
    input: z.object({
      email: z.string().email(),
      placeId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const tourist = await db.prisma.tourist.findUnique({
        where: {
          email_placeId: input,
        },
      })
      if (!tourist) {
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
      const key = `customers:passwordsTokens:${input.placeId}:${token}`
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
      tourist: z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
      }),
      placeId: z.string(),
      password: z.string().min(6),
    }),
    resolve: async ({ ctx, input: { tourist, password, placeId } }) => {
      try {
        const registered = await db.registerTourist({
          placeId,
          tourist,
          password,
        })
        await ctx.session.setTourist(registered.id)
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
      placeId: z.string(),
    }),
    resolve: async ({ ctx, input: { email, password, placeId } }) => {
      try {
        const tourist = await db.loginTourist({
          email,
          placeId,
          password,
        })
        await ctx.session.setTourist(tourist.id)
        return tourist
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
      return await db.prisma.tourist.findUnique({
        where: {
          id: ctx.touristId || '',
        },
      })
    },
  })
  .merge(lostPassword)
