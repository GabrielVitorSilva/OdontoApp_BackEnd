import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { makeCreateConsultationUseCase } from '@/use-cases/@factories/make-create-consultation-use-case'

export const createConsultationBodySchema = z.object({
  clientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  treatmentId: z.string().uuid(),
  dateTime: z.string().datetime({
    message: 'A data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
  }),
  status: z.enum(['SCHEDULED', 'CANCELED', 'COMPLETED']).default('SCHEDULED'),
})

export async function createConsultation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { clientId, professionalId, treatmentId, dateTime, status } =
    createConsultationBodySchema.parse(request.body)

  try {
    const createConsultationUseCase = makeCreateConsultationUseCase()
    const { consultation } = await createConsultationUseCase.execute({
      id: randomUUID(),
      clientId,
      professionalId,
      treatmentId,
      dateTime: new Date(dateTime),
      status,
    })

    return reply.status(201).send({
      consultation,
    })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
}
