import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { ListProfessionalsUseCase } from '@/use-cases/user-management/list-professionals'
import { ListClientsUseCase } from '../user-management/list-clients'

export function makeListClientsUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new ListClientsUseCase(usersRepository)

  return useCase
}
