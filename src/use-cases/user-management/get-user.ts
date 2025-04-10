import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

interface GetUserUseCaseRequest {
  id: string
  authenticatedUserId: string
}

interface GetUserUseCaseResponse {
  user: User
}

export class GetUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    authenticatedUserId,
  }: GetUserUseCaseRequest): Promise<GetUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'ADMIN') {
      return { user }
    }

    if (authenticatedUser.role === 'PROFESSIONAL') {
      if (user.role === 'CLIENT') {
        return { user }
      }
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'CLIENT') {
      if (authenticatedUserId === id) {
        return { user }
      }
      throw new NotAuthorizedError()
    }

    throw new NotAuthorizedError()
  }
}
