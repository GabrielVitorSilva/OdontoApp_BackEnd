import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeDeleteConsultationUseCase } from '@/use-cases/@factories/make-delete-consultation-use-case'
import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'

export const deleteConsultationParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteConsultation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = deleteConsultationParamsSchema.parse(request.params)

  try {
    const deleteConsultationUseCase = makeDeleteConsultationUseCase()
    await deleteConsultationUseCase.execute({ id })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
}
