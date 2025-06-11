import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListConsultationByClientUseCase } from '@/use-cases/@factories/make-list-consultion-by-client-use-case'

export const listConsultationsByClientParamsSchema = z.object({
  clientId: z.string().uuid(),
})

export async function listConsultationsByClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { clientId } = listConsultationsByClientParamsSchema.parse(
    request.params,
  )

  const listConsultationByClientUseCase = makeListConsultationByClientUseCase()

  const { consultations } = await listConsultationByClientUseCase.execute({
    clientId,
  })

  return reply.status(200).send({ consultations })
}
