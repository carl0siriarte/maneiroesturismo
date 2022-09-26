import './polyfill.js'

import * as _db from '@pkg/db'

import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '')

import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import { createRouter } from './shared.js'
import trpcTransformer from 'trpc-transformer'
import users from './handlers/users.js'
import places from './handlers/places.js'
import tourists from './handlers/tourists.js'

export * from './shared.js'

export const router = createRouter()
  .transformer(trpcTransformer)
  .merge('user:', users)
  .merge('places:', places)
  .merge('tourist:', tourists)

export type tRPCRouter = typeof router

export type QueryKey = keyof tRPCRouter['_def']['queries']
export type MutationKey = keyof tRPCRouter['_def']['mutations']

export type InferQueryOutput<RouteKey extends QueryKey> = inferProcedureOutput<
  tRPCRouter['_def']['queries'][RouteKey]
>
export type InferQueryInput<RouteKey extends QueryKey> = inferProcedureInput<
  tRPCRouter['_def']['queries'][RouteKey]
>
export type InferMutationOutput<RouteKey extends MutationKey> =
  inferProcedureOutput<tRPCRouter['_def']['mutations'][RouteKey]>
export type InferMutationInput<RouteKey extends MutationKey> =
  inferProcedureInput<tRPCRouter['_def']['mutations'][RouteKey]>
