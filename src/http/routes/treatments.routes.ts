import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyJWT } from '../middlewares/verify-jwt'
import {
  createTreatment,
  createTreatmentBodySchema,
} from '../controllers/treatments/create-treatment'
import {
  getTreatment,
  getTreatmentParamsSchema,
} from '../controllers/treatments/get-treatment'
import { listTreatments } from '../controllers/treatments/list-treatments'
import {
  listTreatmentsByProfessional,
  listTreatmentsByProfessionalParamsSchema,
} from '../controllers/treatments/list-treatments-by-professional'
import {
  updateTreatment,
  updateTreatmentBodySchema,
  updateTreatmentParamsSchema,
} from '../controllers/treatments/update-treatment'
import {
  deleteTreatment,
  deleteTreatmentParamsSchema,
} from '../controllers/treatments/delete-treatment'
import {
  addProfessionalToTreatment,
  addProfessionalToTreatmentParamsSchema,
} from '../controllers/treatments/add-professional-to-treatment'
import {
  removeProfessionalFromTreatment,
  removeProfessionalFromTreatmentParamsSchema,
} from '../controllers/treatments/remove-professional-from-treatment'

export async function treatmentsRoutes(appFastify: FastifyInstance) {
  const app = appFastify.withTypeProvider<ZodTypeProvider>()

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

  app.post(
    '/treatments/:treatmentId/professionals/:professionalId',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'Add a professional to a treatment',
        params: addProfessionalToTreatmentParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    addProfessionalToTreatment,
  )

  app.delete(
    '/treatments/:treatmentId/professionals/:professionalId',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Treatments'],
        summary: 'Remove a professional from a treatment',
        params: removeProfessionalFromTreatmentParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    removeProfessionalFromTreatment,
  )
}
