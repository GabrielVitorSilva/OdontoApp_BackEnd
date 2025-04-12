import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { UserAlreadyExistsError } from '../@errors/user-already-exists-error'
import bcryptjs from 'bcryptjs'
import { NotAllowedToCreate } from '../@errors/not-allowed-to-create'
import { sendMail } from '@/lib/mail'
import { generateWelcomeEmail } from '@/lib/templates/welcome-email'

interface RegisterUseCaseRequest {
  email: string
  name: string
  password: string
  cpf: string
  authenticatedUserId: string
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
    authenticatedUserId,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const { hash } = bcryptjs
    const password_hash = await hash(password, 6)

    const authenticatedUser =
      await this.usersRepository.findById(authenticatedUserId)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf)

    if (authenticatedUser?.role === 'PROFESSIONAL' && role === 'ADMIN') {
      throw new NotAllowedToCreate()
    }

    if (authenticatedUser?.role === 'CLIENT') {
      throw new NotAllowedToCreate()
    }

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

    if (role === 'CLIENT') {
      await this.usersRepository.createClient(user.id)
    } else if (role === 'PROFESSIONAL') {
      await this.usersRepository.createProfessional(user.id)
    } else if (role === 'ADMIN') {
      await this.usersRepository.createAdmin(user.id)
    }

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
