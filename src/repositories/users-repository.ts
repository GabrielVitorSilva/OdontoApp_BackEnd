import { Prisma, User, Role } from '@prisma/client'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByCpf(cpf: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>
  delete(id: string): Promise<void>
  findMany(params: {
    page?: number
    perPage?: number
    role?: Role
  }): Promise<{ users: User[]; total: number }>
  createClient(userId: string): Promise<{ id: string; userId: string }>
  createProfessional(userId: string): Promise<{ id: string; userId: string }>
  createAdmin(userId: string): Promise<{ id: string; userId: string }>
  findProfessionalByUserId(
    userId: string,
  ): Promise<{ id: string; userId: string } | null>
}
