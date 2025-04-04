import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListProfessionalsUseCase } from '@/use-cases/@factories/make-list-professionals-use-case'

export async function listProfessionals(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const listProfessionalsQuerySchema = z.object({
    page: z.string().optional(),
    perPage: z.string().optional(),
  })

  const { page, perPage } = listProfessionalsQuerySchema.parse(request.query)

  const listProfessionalsUseCase = makeListProfessionalsUseCase()

  const { professionals, total } = await listProfessionalsUseCase.execute({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  })

  return reply.status(200).send({
    professionals,
    total,
  })
}
