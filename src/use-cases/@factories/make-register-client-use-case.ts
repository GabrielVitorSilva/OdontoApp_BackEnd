import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { RegisterClientUseCase } from '../register/register-client'

export function makeRegisterClientUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const registerClientUseCase = new RegisterClientUseCase(usersRepository)

  return registerClientUseCase
}
