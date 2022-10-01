import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { procedure, t } from '../router.js'
import type { MailDataRequired } from '@sendgrid/mail'
import { utils } from '@pkg/shared'
import * as db from '@pkg/db'
import type { Tourist } from '@pkg/db'

const passwordRecovery = t.router({
  checkToken: procedure
    .input(
      z.object({
        token: z.string(),
        placeId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const key = `customers:passwordsTokens:${input.placeId}:${input.token}`
      const email = await ctx.redis.get<string>(key)
      return { ok: email != null }
    }),
  changePassword: procedure
    .input(
      z.object({
        newPassword: z.string().min(6),
        token: z.string(),
        placeId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
    }),
  issueToken: procedure
    .input(
      z.object({
        email: z.string().email(),
        placeId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
      const place = await db.getPlace({ id: input.placeId })
      const msg: MailDataRequired = {
        to: input.email,
        from: {
          name: `${place?.name} | Maneiro es Turismo`,
          email: `${place?.slug}@maneiroesturismo.com`,
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
          <p>${place?.name} a través de Maneiro es Turismo</p>`,
      }
      // await sendgrid.send(msg)
    }),
})

export default t.router({
  passwordRecovery,
  register: procedure
    .input(
      z.object({
        tourist: z.object({
          email: z.string().email(),
          firstName: z.string(),
          lastName: z.string(),
        }),
        placeId: z.string(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input: { tourist, password, placeId }, ctx }) => {
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
    }),
  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        placeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { email, password, placeId } }) => {
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
    }),
  whoami: procedure.query(
    async ({ ctx }) =>
      (await db.prisma.tourist.findUnique({
        where: {
          id: ctx.touristId || '',
        },
      })) as Tourist | null
  ),
})
