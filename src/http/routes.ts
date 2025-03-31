import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { register, registerBodySchema } from './controllers/users/register'
import {
  authenticate,
  authenticateBodySchema,
} from './controllers/users/authenticate'
import { verifyJWT } from './middlewares/verify-jwt'
import { profile } from './controllers/users/profile'

export async function appRoutes(appFastify: FastifyInstance) {
  const app = appFastify.withTypeProvider<ZodTypeProvider>()

  app.post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: registerBodySchema,
      },
    },
    register,
  )
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
