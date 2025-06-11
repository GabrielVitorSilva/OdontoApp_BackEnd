import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyJWT } from '../middlewares/verify-jwt'
import {
  createConsultation,
  createConsultationBodySchema,
} from '../controllers/consultation/create-consultation'
import {
  updateConsultation,
  updateConsultationBodySchema,
  updateConsultationParamsSchema,
} from '../controllers/consultation/update-consultation'
import {
  deleteConsultation,
  deleteConsultationParamsSchema,
} from '../controllers/consultation/delete-consultation'
import {
  listConsultationsByProfessional,
  listConsultationsByProfessionalParamsSchema,
} from '../controllers/consultation/list-consultations-by-professional'
import {
  listConsultations,
  listConsultationsParamsSchema,
} from '../controllers/consultation/list-consultations'
import {
  listConsultationsByClient,
  listConsultationsByClientParamsSchema,
} from '../controllers/consultation/list-consultations-by-client'

export async function consultationsRoutes(appFastify: FastifyInstance) {
  const app = appFastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/users/:userId/consultations',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Consultations'],
        summary: 'List all consultations (Only for Admin)',
        params: listConsultationsParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listConsultations,
  )
  app.post(
    '/consultations',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Consultations'],
        summary: 'Create a new consultation',
        body: createConsultationBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    createConsultation,
  )

  app.patch(
    '/consultations/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Consultations'],
        summary: 'Update a consultation',
        params: updateConsultationParamsSchema,
        body: updateConsultationBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    updateConsultation,
  )

  app.delete(
    '/consultations/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Consultations'],
        summary: 'Delete a consultation',
        params: deleteConsultationParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    deleteConsultation,
  )

  app.get(
    '/professionals/:professionalId/consultations',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Consultations'],
        summary: 'List consultations by professional',
        params: listConsultationsByProfessionalParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listConsultationsByProfessional,
  )

  app.get(
    '/clients/:clientId/consultations',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Consultations'],
        summary: 'List consultations by client',
        params: listConsultationsByClientParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    listConsultationsByClient,
  )
}
