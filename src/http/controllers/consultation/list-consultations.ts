import { makeListConsultationsUseCase } from '@/use-cases/@factories/make-list-consultations-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function listConsultations(request: FastifyRequest, reply: FastifyReply) {
  const listConsultationsUseCase = makeListConsultationsUseCase()
  const { consultations } = await listConsultationsUseCase.execute({
    authenticatedUserId: request.user.sub,
  })

  return reply.status(200).send({
    consultations: consultations.map((consultation) => ({
      ...consultation,
    })),
  })
}
