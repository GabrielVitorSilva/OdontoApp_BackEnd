import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { ListProfessionalsUseCase } from '@/use-cases/user-management/list-professionals'

export function makeListProfessionalsUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new ListProfessionalsUseCase(usersRepository)

  return useCase
}
