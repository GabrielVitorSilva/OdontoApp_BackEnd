import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { ListUsersUseCase } from '../user-management/list-users'

export function makeListUsersUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const listUsersUseCase = new ListUsersUseCase(usersRepository)

  return listUsersUseCase
}
