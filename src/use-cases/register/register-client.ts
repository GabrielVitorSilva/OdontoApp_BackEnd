import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'
import bcryptjs from 'bcryptjs'

interface RegisterClientUseCaseRequest {
  email: string
  name: string
  password: string
  cpf: string
}

interface RegisterClientUseCaseResponse {
  user: User
}

export class RegisterClientUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    name,
    password,
    cpf,
  }: RegisterClientUseCaseRequest): Promise<RegisterClientUseCaseResponse> {
    const { hash } = bcryptjs
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf)

    if (userWithSameEmail || userWithSameCpf) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.usersRepository.create({
      name,
      email,
      password: password_hash,
      role: 'CLIENT',
      cpf,
    })

    return {
      user,
    }
  }
}
