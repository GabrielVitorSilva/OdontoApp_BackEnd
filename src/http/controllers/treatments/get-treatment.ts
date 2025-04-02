import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { makeGetTreatmentUseCase } from '@/use-cases/@factories/make-get-treatment-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const getTreatmentParamsSchema = z.object({
  id: z.string().uuid({ message: 'ID de tratamento inválido.' }),
})

export async function getTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = getTreatmentParamsSchema.parse(request.params)

  try {
    const getTreatmentUseCase = makeGetTreatmentUseCase()

    const { treatment } = await getTreatmentUseCase.execute({
      id,
    })

    return reply.status(200).send({ treatment })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
