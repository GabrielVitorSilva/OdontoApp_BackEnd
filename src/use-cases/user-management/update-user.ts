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
    // Verificar se o usuário existe
    const userToUpdate = await this.usersRepository.findByID(id)

    if (!userToUpdate) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o usuário autenticado pode atualizar este usuário
    const authenticatedUser =
      await this.usersRepository.findByID(authenticatedUserId)

    if (!authenticatedUser) {
      throw new NotAuthorizedError()
    }

    // Se tentar atualizar a role, lançar erro
    if (role) {
      throw new NotAuthorizedError()
    }

    // ADMIN pode atualizar qualquer usuário
    if (authenticatedUser.role === 'ADMIN') {
      // Se o email foi alterado, verificar se já existe
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

    // PROFESSIONAL pode atualizar seus clientes
    if (authenticatedUser.role === 'PROFESSIONAL') {
      if (userToUpdate.role !== 'CLIENT') {
        throw new NotAuthorizedError()
      }

      // Se o email foi alterado, verificar se já existe
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

    // CLIENT só pode atualizar a si mesmo
    if (authenticatedUser.role === 'CLIENT') {
      if (authenticatedUserId !== id) {
        throw new NotAuthorizedError()
      }

      // Se o email foi alterado, verificar se já existe
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
