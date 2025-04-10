import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

interface ListUsersUseCaseRequest {
  authenticatedUserId: string
}

interface ListUsersUseCaseResponse {
  users: User[]
}

export class ListUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    authenticatedUserId,
  }: ListUsersUseCaseRequest): Promise<ListUsersUseCaseResponse> {
    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'ADMIN') {
      const { users } = await this.usersRepository.findMany({})
      return { users }
    }

    if (authenticatedUser.role === 'PROFESSIONAL') {
      const { users } = await this.usersRepository.findMany({})
      const clients = users.filter((user) => user.role === 'CLIENT')
      return { users: clients }
    }

    throw new NotAuthorizedError()
  }
}
