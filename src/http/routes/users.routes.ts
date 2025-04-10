import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyJWT } from '../middlewares/verify-jwt'
import { profile } from '../controllers/users/profile'
import { getUser, getUserParamsSchema } from '../controllers/users/get-user'
import {
  updateUser,
  updateUserBodySchema,
  updateUserParamsSchema,
} from '../controllers/users/update-user'
import {
  deleteUser,
  deleteUserParamsSchema,
} from '../controllers/users/delete-user'
import { listUsers } from '../controllers/users/list-users'
import { listProfessionals } from '../controllers/users/list-professionals'

export async function usersRoutes(appFastify: FastifyInstance) {
  const app = appFastify.withTypeProvider<ZodTypeProvider>()

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

  app.get(
    '/users',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Users'],
        summary: 'List all users',
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listUsers,
  )

  app.get(
    '/users/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Users'],
        summary: 'Get user by ID',
        params: getUserParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    getUser,
  )

  app.put(
    '/users/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Users'],
        summary: 'Update a user',
        params: updateUserParamsSchema,
        body: updateUserBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    updateUser,
  )

  app.delete(
    '/users/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Users'],
        summary: 'Delete a user',
        params: deleteUserParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    deleteUser,
  )

  app.get(
    '/professionals',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Users'],
        summary: 'List all professionals',
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listProfessionals,
  )
}
