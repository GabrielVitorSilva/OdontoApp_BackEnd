import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeListProfessionalsUseCase } from '@/use-cases/@factories/make-list-professionals-use-case'
import { makeListClientsUseCase } from '@/use-cases/@factories/make-list-clients-use-case'

export async function listClients(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const listProfessionalsQuerySchema = z.object({
    page: z.string().optional(),
    perPage: z.string().optional(),
  })

  const { page, perPage } = listProfessionalsQuerySchema.parse(request.query)

  const listClientsUseCase = makeListClientsUseCase()

  const { clients, total } = await listClientsUseCase.execute({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  })

  return reply.status(200).send({
    clients,
    total,
  })
}
