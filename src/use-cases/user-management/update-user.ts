import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'
import { EmailAlreadyInUseError } from '../@errors/email-already-in-use-error'

interface UpdateUserUseCaseRequest {
  id: string
  name?: string
  email?: string
  phone?: string
  role?: string
  authenticatedUserId: string
}

interface UpdateUserUseCaseResponse {
  user: User
}

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    name,
    email,
    phone,
    role,
    authenticatedUserId,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const userToUpdate = await this.usersRepository.findById(id)

    if (!userToUpdate) {
      throw new ResourceNotFoundError()
    }

    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    if (role) {
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'ADMIN') {
      if (email && email !== userToUpdate.email) {
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
        if (userWithSameEmail && userWithSameEmail.id !== id) {
          throw new EmailAlreadyInUseError()
        }
      }

      const user = await this.usersRepository.update(id, {
        name,
        email,
        phone,
      })

      return { user }
    }

    if (authenticatedUser.role === 'PROFESSIONAL') {
      if (userToUpdate.role !== 'CLIENT') {
        throw new NotAuthorizedError()
      }

      if (email && email !== userToUpdate.email) {
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
        if (userWithSameEmail && userWithSameEmail.id !== id) {
          throw new EmailAlreadyInUseError()
        }
      }

      const user = await this.usersRepository.update(id, {
        name,
        email,
        phone,
      })

      return { user }
    }

    if (authenticatedUser.role === 'CLIENT') {
      if (authenticatedUserId !== id) {
        throw new NotAuthorizedError()
      }

      if (email && email !== userToUpdate.email) {
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
        if (userWithSameEmail && userWithSameEmail.id !== id) {
          throw new EmailAlreadyInUseError()
        }
      }

      const user = await this.usersRepository.update(id, {
        name,
        email,
        phone,
      })

      return { user }
    }

    throw new NotAuthorizedError()
  }
}
