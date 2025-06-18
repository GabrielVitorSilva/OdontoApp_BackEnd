import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'
import { ResourceHasDependenciesError } from '../@errors/resource-has-dependencies-error'
import { Prisma } from '@prisma/client'

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
      try {
        await this.usersRepository.delete(id)
        return
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new ResourceHasDependenciesError('usuário')
          }
        }
        throw error
      }
    }

    if (authenticatedUser.role === 'PROFESSIONAL') {
      if (userToDelete.role === 'CLIENT' || authenticatedUserId === id) {
        try {
          await this.usersRepository.delete(id)
          return
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
              throw new ResourceHasDependenciesError('usuário')
            }
          }
          throw error
        }
      }
      throw new NotAuthorizedError()
    }

    if (authenticatedUser.role === 'CLIENT') {
      if (authenticatedUserId === id) {
        try {
          await this.usersRepository.delete(id)
          return
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
              throw new ResourceHasDependenciesError('usuário')
            }
          }
          throw error
        }
      }
      throw new NotAuthorizedError()
    }

    throw new NotAuthorizedError()
  }
}
