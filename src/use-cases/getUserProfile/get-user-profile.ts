import { UsersRepository } from '@/repositories/users-repository'
import {
  User,
  type Administrator,
  type Client,
  type Professional,
} from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

interface GetUserProfileUseCaseRequest {
  id: string
}

interface GetUserProfileUseCaseResponse {
  user: {
    User: User
    profileData: Administrator | Professional | Client
  }
}
export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    console.log('GetUserProfileUseCase executed with id:', id)
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const authenticatedUser = await this.usersRepository.findById(id)

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
      if (user.role !== 'CLIENT') {
        throw new NotAuthorizedError()
      }
      const profileData = await this.usersRepository.findClientByUserId(user.id)
      if (!profileData) {
        throw new ResourceNotFoundError()
      }
      return { user: { User: user, profileData } }
    }

    if (authenticatedUser.role === 'CLIENT') {
      const profileData = await this.usersRepository.findClientByUserId(user.id)
      if (!profileData) {
        throw new ResourceNotFoundError()
      }
      return { user: { User: user, profileData } }
    }

    throw new NotAuthorizedError()
  }
}
