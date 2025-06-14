import { UsersRepository } from '@/repositories/users-repository'
import { User, Administrator, Professional, Client } from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

interface GetUserUseCaseRequest {
  id: string
  authenticatedUserId: string
}

interface GetUserUseCaseResponse {
  user: {
    User: User
    profileData: Administrator | Professional | Client
  }
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
      const profileData = await this.usersRepository.findAdmByUserId(
        authenticatedUser.id,
      )

      if (!profileData) {
        throw new ResourceNotFoundError()
      }

      return { user: { User: user, profileData } }
    }

    if (authenticatedUser.role === 'PROFESSIONAL') {
      const profileData = await this.usersRepository.findProfessionalByUserId(
        user.id,
      )
      if (!profileData) {
        throw new ResourceNotFoundError()
      }
      return { user: { User: user, profileData } }
    }

    if (authenticatedUser.role === 'CLIENT') {
      if (authenticatedUserId !== id) {
        throw new NotAuthorizedError()
      }
      const profileData = await this.usersRepository.findClientByUserId(user.id)
      if (!profileData) {
        throw new ResourceNotFoundError()
      }
      return { user: { User: user, profileData } }
    }

    throw new NotAuthorizedError()
  }
}
