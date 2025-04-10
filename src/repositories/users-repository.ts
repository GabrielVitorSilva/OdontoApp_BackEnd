import { Prisma, User, Role } from '@prisma/client'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByCpf(cpf: string): Promise<User | null>
  findMany(params: {
    page?: number
    perPage?: number
    role?: Role
  }): Promise<{ users: User[]; total: number }>
  create(data: Prisma.UserCreateInput): Promise<User>
  createClient(userId: string): Promise<{ id: string; userId: string }>
  createProfessional(userId: string): Promise<{ id: string; userId: string }>
  createAdmin(userId: string): Promise<{ id: string; userId: string }>
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>
  delete(id: string): Promise<void>
  findProfessionalByUserId(
    userId: string,
  ): Promise<{ id: string; userId: string } | null>
  findClientById(id: string): Promise<{ id: string; userId: string } | null>
  findProfessionalById(
    id: string,
  ): Promise<{ id: string; userId: string } | null>
}
