import './polyfill.js'

export * as _db from '@pkg/db'

import { SENDGRID_API_KEY } from '@pkg/env'
import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(SENDGRID_API_KEY || '')

import type { GetInferenceHelpers } from '@trpc/server'
import { t } from './router.js'
import users from './handlers/users.js'
import places from './handlers/places.js'
import posts from './handlers/posts.js'
import comments from './handlers/comments.js'

export const router = t.router({
  users,
  places,
  posts,
  comments,
})

export type tRPCRouter = typeof router

export type RouterTypes = GetInferenceHelpers<tRPCRouter>

export * from './router.js'
