import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'
import bcryptjs from 'bcryptjs'
import { sendMail } from '@/lib/mail'
import { generateWelcomeEmail } from '@/lib/templates/welcome-email'

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

    await this.usersRepository.createClient(user.id)

    // Enviar email de boas-vindas
    const emailHtml = generateWelcomeEmail({
      name: user.name,
      role: user.role,
    })

    await sendMail({
      to: user.email,
      subject: 'Bem-vindo ao OdontoApp!',
      html: emailHtml,
    })

    return {
      user,
    }
  }
}
