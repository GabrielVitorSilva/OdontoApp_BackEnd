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
      await this.usersRepository.findByID(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    // Se for ADMIN, pode listar todos os usuários
    if (authenticatedUser.role === 'ADMIN') {
      const users = await this.usersRepository.findMany()
      return { users }
    }

    // Se for PROFESSIONAL, pode listar apenas os clientes
    if (authenticatedUser.role === 'PROFESSIONAL') {
      const users = await this.usersRepository.findMany()
      const clients = users.filter((user) => user.role === 'CLIENT')
      return { users: clients }
    }

    // CLIENT não pode listar usuários
    throw new NotAuthorizedError()
  }
}
