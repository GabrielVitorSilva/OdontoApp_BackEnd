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
    const userToDelete = await this.usersRepository.findByID(id)

    if (!userToDelete) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o usuário autenticado pode deletar este usuário
    // Apenas o próprio usuário ou um ADMIN pode deletar
    const authenticatedUser =
      await this.usersRepository.findByID(authenticatedUserId)

    if (authenticatedUser?.role !== 'ADMIN' && authenticatedUserId !== id) {
      throw new NotAuthorizedError()
    }

    // Deletar usuário
    await this.usersRepository.delete(id)
  }
}
