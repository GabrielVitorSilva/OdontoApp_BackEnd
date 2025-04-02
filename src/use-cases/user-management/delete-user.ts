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
    // Verificar se o usuário existe
    const userToDelete = await this.usersRepository.findById(id)

    if (!userToDelete) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o usuário autenticado pode deletar este usuário
    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    // ADMIN pode deletar qualquer usuário
    if (authenticatedUser.role === 'ADMIN') {
      await this.usersRepository.delete(id)
      return
    }

    // PROFESSIONAL pode deletar seus clientes e a si mesmo
    if (authenticatedUser.role === 'PROFESSIONAL') {
      if (userToDelete.role === 'CLIENT' || authenticatedUserId === id) {
        await this.usersRepository.delete(id)
        return
      }
      throw new NotAuthorizedError()
    }

    // CLIENT só pode deletar a si mesmo
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
