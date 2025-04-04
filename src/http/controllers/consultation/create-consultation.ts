import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { makeCreateConsultationUseCase } from '@/use-cases/@factories/make-create-consultation-use-case'
import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '@/use-cases/@errors/invalid-consultation-date-error'
import { ProfessionalNotLinkedToTreatmentError } from '@/use-cases/@errors/professional-not-linked-to-treatment-error'
import { ConsultationTimeConflictError } from '@/use-cases/@errors/consultation-time-conflict-error'

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
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof InvalidConsultationDateError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof ProfessionalNotLinkedToTreatmentError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof ConsultationTimeConflictError) {
      return reply.status(409).send({ message: error.message })
    }

    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
}
