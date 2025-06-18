import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { NotAuthorizedError } from '@/use-cases/@errors/not-authorized-error'
import { makeDeleteUserUseCase } from '@/use-cases/@factories/make-delete-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { ResourceHasDependenciesError } from '@/use-cases/@errors/resource-has-dependencies-error'

export const deleteUserParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = deleteUserParamsSchema.parse(request.params)
  const authenticatedUserId = request.user.sub
  try {
    const deleteUserUseCase = makeDeleteUserUseCase()
    await deleteUserUseCase.execute({
      id,
      authenticatedUserId,
    })

    return reply.status(204).send()
  } catch (error) {
    console.error(error)
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAuthorizedError) {
      return reply.status(403).send({ message: error.message })
    }

    if (error instanceof ResourceHasDependenciesError) {
      return reply.status(409).send({ message: error.message })
    }
    throw error
  }
}
