import './polyfill.js'

import * as _db from '@pkg/db'

import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '')

import type { GetInferenceHelpers } from '@trpc/server'
import { t } from './router.js'
import users from './handlers/users.js'
import places from './handlers/places.js'
import tourists from './handlers/tourists.js'

export const router = t.router({
  users,
  places,
  tourists,
})

export type tRPCRouter = typeof router

export type RouterTypes = GetInferenceHelpers<tRPCRouter>

export * from './router.js'
