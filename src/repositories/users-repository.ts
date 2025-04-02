import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  findByEmail(email: string): Promise<User | null>
  findByCpf(cpf: string): Promise<User | null>
  findByID(id: string): Promise<User | null>
  findMany(): Promise<User[]>
  create(data: Prisma.UserCreateInput): Promise<User>
  createClient(userId: string): Promise<{ id: string; userId: string }>
  createProfessional(userId: string): Promise<{ id: string; userId: string }>
  createAdmin(userId: string): Promise<{ id: string; userId: string }>
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>
  delete(id: string): Promise<void>
}
