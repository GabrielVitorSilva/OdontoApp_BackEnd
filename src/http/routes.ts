import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { register, registerBodySchema } from './controllers/users/register'
import {
  authenticate,
  authenticateBodySchema,
} from './controllers/users/authenticate'

export async function appRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
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
  app.withTypeProvider<ZodTypeProvider>().post(
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
}
