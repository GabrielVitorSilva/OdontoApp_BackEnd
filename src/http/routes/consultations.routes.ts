import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyJWT } from '../middlewares/verify-jwt'
import {
  createConsultation,
  createConsultationBodySchema,
} from '../controllers/consultation/create-consultation'

export async function consultationsRoutes(appFastify: FastifyInstance) {
  const app = appFastify.withTypeProvider<ZodTypeProvider>()

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
}
