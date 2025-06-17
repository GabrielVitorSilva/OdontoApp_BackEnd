import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { ResourceHasDependenciesError } from '@/use-cases/@errors/resource-has-dependencies-error'
import { makeDeleteTreatmentUseCase } from '@/use-cases/@factories/make-delete-treatment-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const deleteTreatmentParamsSchema = z.object({
  id: z.string().uuid({ message: 'ID de tratamento inválido.' }),
})

export async function deleteTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = deleteTreatmentParamsSchema.parse(request.params)

  try {
    const deleteTreatmentUseCase = makeDeleteTreatmentUseCase()

    await deleteTreatmentUseCase.execute({
      id,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof ResourceHasDependenciesError) {
      return reply.status(409).send({ message: error.message })
    }

    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
