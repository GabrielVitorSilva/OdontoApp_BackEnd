import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateConsultationUseCase } from '@/use-cases/@factories/make-update-consultation-use-case'
import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '@/use-cases/@errors/invalid-consultation-date-error'
import { ProfessionalNotLinkedToTreatmentError } from '@/use-cases/@errors/professional-not-linked-to-treatment-error'
import { ConsultationTimeConflictError } from '@/use-cases/@errors/consultation-time-conflict-error'
import { InvalidConsultationStatusError } from '@/use-cases/@errors/invalid-consultation-status-error'

export const updateConsultationParamsSchema = z.object({
  id: z.string().uuid(),
})

export const updateConsultationBodySchema = z.object({
  clientId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  treatmentId: z.string().uuid().optional(),
  dateTime: z
    .string()
    .datetime({
      message:
        'A data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
    })
    .optional(),
  status: z.enum(['SCHEDULED', 'CANCELED', 'COMPLETED']).optional(),
})

export async function updateConsultation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = updateConsultationParamsSchema.parse(request.params)
  const { clientId, professionalId, treatmentId, dateTime, status } =
    updateConsultationBodySchema.parse(request.body)

  try {
    const updateConsultationUseCase = makeUpdateConsultationUseCase()
    const { consultation } = await updateConsultationUseCase.execute({
      id,
      clientId,
      professionalId,
      treatmentId,
      dateTime: dateTime ? new Date(dateTime) : undefined,
      status,
    })

    return reply.status(200).send({
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

    if (error instanceof InvalidConsultationStatusError) {
      return reply.status(400).send({ message: error.message })
    }

    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
}
