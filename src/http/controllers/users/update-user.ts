import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { NotAuthorizedError } from '@/use-cases/@errors/not-authorized-error'
import { makeUpdateUserUseCase } from '@/use-cases/@factories/make-update-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const updateUserParamsSchema = z.object({
  id: z.string().uuid(),
})

export const updateUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = updateUserParamsSchema.parse(request.params)
  const { name, email, phone } = updateUserBodySchema.parse(request.body)
  const authenticatedUserId = request.user.sub

  try {
    const updateUserUseCase = makeUpdateUserUseCase()
    const { user } = await updateUserUseCase.execute({
      id,
      name,
      email,
      phone,
      authenticatedUserId,
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

    if (error instanceof NotAuthorizedError) {
      return reply.status(403).send({ message: error.message })
    }

    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
