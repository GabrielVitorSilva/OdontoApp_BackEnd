import { makeListConsultationsUseCase } from '@/use-cases/@factories/make-list-consultations-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const listConsultationsParamsSchema = z.object({
  userId: z.string(),
})

export async function listConsultations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = listConsultationsParamsSchema.parse(request.params)
  console.log('List consultations for user:', userId)
  const listConsultationsUseCase = makeListConsultationsUseCase()
  const { consultations } = await listConsultationsUseCase.execute({
    userId,
  })

  return reply.status(200).send({
    consultations: consultations.map((consultation) => ({
      ...consultation,
    })),
  })
}
