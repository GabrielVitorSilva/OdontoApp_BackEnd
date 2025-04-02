import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { register, registerBodySchema } from './controllers/users/register'
import {
  authenticate,
  authenticateBodySchema,
} from './controllers/users/authenticate'
import { verifyJWT } from './middlewares/verify-jwt'
import { profile } from './controllers/users/profile'
import { refresh } from './controllers/users/refresh'
import {
  registerClient,
  registerClientBodySchema,
} from './controllers/users/register-client'

export async function appRoutes(appFastify: FastifyInstance) {
  const app = appFastify.withTypeProvider<ZodTypeProvider>()

  app.post(
    '/sessions',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate',
        body: authenticateBodySchema,
      },
    },
    authenticate,
  )

  app.post(
    '/register',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        body: registerBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    register,
  )

  app.post(
    '/register/client',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new client user',
        body: registerClientBodySchema,
      },
    },
    registerClient,
  )

  app.patch(
    '/token/refresh',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Auth'],
        summary: 'Refresh',
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    refresh,
  )

  /** Authenticated */

  app.post(
    '/me',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['User'],
        summary: 'Get User Profile',
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    profile,
  )
}
