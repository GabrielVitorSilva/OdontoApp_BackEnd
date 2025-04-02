import { makeListUsersUseCase } from '@/use-cases/@factories/make-list-users-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  const listUsersUseCase = makeListUsersUseCase()
  const { users } = await listUsersUseCase.execute({
    authenticatedUserId: request.user.sub,
  })

  return reply.status(200).send({
    users: users.map((user) => ({
      ...user,
      password: undefined,
    })),
  })
}
