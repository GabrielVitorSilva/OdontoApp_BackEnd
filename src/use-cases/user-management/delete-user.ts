import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

interface DeleteUserUseCaseRequest {
  id: string
  authenticatedUserId: string
}

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    authenticatedUserId,
  }: DeleteUserUseCaseRequest): Promise<void> {
    const userToDelete = await this.usersRepository.findById(id)

    if (!userToDelete) {
      throw new ResourceNotFoundError()
    }

    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'ADMIN') {
      await this.usersRepository.delete(id)
      return
    }

    if (authenticatedUser.role === 'PROFESSIONAL') {
      if (userToDelete.role === 'CLIENT' || authenticatedUserId === id) {
        await this.usersRepository.delete(id)
        return
      }
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'CLIENT') {
      if (authenticatedUserId === id) {
        await this.usersRepository.delete(id)
        return
      }
      throw new NotAuthorizedError()
    }

    throw new NotAuthorizedError()
  }
}
