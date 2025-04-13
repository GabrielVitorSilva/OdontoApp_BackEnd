import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListConsultationByProfessionalUseCase } from '@/use-cases/@factories/make-list-consultation-by-professional-use-case'

export const listConsultationsByProfessionalParamsSchema = z.object({
  professionalId: z.string().uuid(),
})

export async function listConsultationsByProfessional(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { professionalId } = listConsultationsByProfessionalParamsSchema.parse(
    request.params,
  )

  const listConsultationByProfessionalUseCase =
    makeListConsultationByProfessionalUseCase()

  const { consultations } = await listConsultationByProfessionalUseCase.execute(
    {
      professionalId,
    },
  )

  return reply.status(200).send({ consultations })
}
