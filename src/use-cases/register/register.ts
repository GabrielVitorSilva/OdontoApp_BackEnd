import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'
import bcryptjs from 'bcryptjs'

interface RegisterUseCaseRequest {
  email: string
  name: string
  password: string
  cpf: string
  role: 'ADMIN' | 'PROFESSIONAL' | 'CLIENT'
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    name,
    role,
    password,
    cpf,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
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
      role,
      cpf,
    })
    return {
      user,
    }
  }
}
