import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { makeGetUserUseCase } from '@/use-cases/@factories/make-get-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const getUserParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = getUserParamsSchema.parse(request.params)

  try {
    const getUserUseCase = makeGetUserUseCase()
    const { user } = await getUserUseCase.execute({
      id,
    })

    return reply.status(200).send({
      user: {
        ...user,
        password: undefined,
      },
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    throw error
  }
}
