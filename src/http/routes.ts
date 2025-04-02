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
import {
  createTreatment,
  createTreatmentBodySchema,
} from './controllers/treatments/create-treatment'
import {
  getTreatment,
  getTreatmentParamsSchema,
} from './controllers/treatments/get-treatment'
import { listTreatments } from './controllers/treatments/list-treatments'
import {
  listTreatmentsByProfessional,
  listTreatmentsByProfessionalParamsSchema,
} from './controllers/treatments/list-treatments-by-professional'
import {
  updateTreatment,
  updateTreatmentBodySchema,
  updateTreatmentParamsSchema,
} from './controllers/treatments/update-treatment'
import {
  deleteTreatment,
  deleteTreatmentParamsSchema,
} from './controllers/treatments/delete-treatment'

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

  /** Treatments */

  app.post(
    '/treatments',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'Create a new treatment',
        body: createTreatmentBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    createTreatment,
  )

  app.get(
    '/treatments',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'List all treatments',
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listTreatments,
  )

  app.get(
    '/treatments/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'Get treatment by ID',
        params: getTreatmentParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    getTreatment,
  )

  app.get(
    '/professionals/:professionalId/treatments',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'List treatments by professional',
        params: listTreatmentsByProfessionalParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listTreatmentsByProfessional,
  )

  app.put(
    '/treatments/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'Update a treatment',
        params: updateTreatmentParamsSchema,
        body: updateTreatmentBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    updateTreatment,
  )

  app.delete(
    '/treatments/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'Delete a treatment',
        params: deleteTreatmentParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    deleteTreatment,
  )
}
