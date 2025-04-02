import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { NotAuthorizedError } from '../@errors/not-authorized-error'

interface UpdateUserUseCaseRequest {
  id: string
  name?: string
  email?: string
  phone?: string
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
    authenticatedUserId,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    // Verificar se o usuário existe
    const userToUpdate = await this.usersRepository.findByID(id)

    if (!userToUpdate) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o usuário autenticado pode atualizar este usuário
    // Apenas o próprio usuário ou um ADMIN pode atualizar
    const authenticatedUser =
      await this.usersRepository.findByID(authenticatedUserId)

    if (authenticatedUser?.role !== 'ADMIN' && authenticatedUserId !== id) {
      throw new NotAuthorizedError()
    }

    // Se o email foi alterado, verificar se já existe
    if (email && email !== userToUpdate.email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(email)
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new Error('Este e-mail já está em uso')
      }
    }

    // Atualizar usuário
    const user = await this.usersRepository.update(id, {
      name,
      email,
      phone,
    })

    return {
      user,
    }
  }
}
