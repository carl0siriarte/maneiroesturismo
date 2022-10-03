import './polyfill.js'

import * as _db from '@pkg/db'

import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '')

import type { GetInferenceHelpers } from '@trpc/server'
import { t } from './router.js'
import users from './handlers/users.js'
import places from './handlers/places.js'
import posts from './handlers/posts.js'

export const router = t.router({
  users,
  places,
  posts,
})

export type tRPCRouter = typeof router

export type RouterTypes = GetInferenceHelpers<tRPCRouter>

export * from './router.js'
