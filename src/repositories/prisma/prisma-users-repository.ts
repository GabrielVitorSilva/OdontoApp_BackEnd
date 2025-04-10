import { prisma } from '@/lib/prisma'
import { UsersRepository } from '../users-repository'
import { Prisma, User, Role } from '@prisma/client'

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    return user
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { cpf },
    })

    return user
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    })

    return user
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  async findMany(params: {
    page?: number
    perPage?: number
    role?: Role
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, perPage = 10, role } = params
    const skip = (page - 1) * perPage

    const where = role ? { role } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return { users, total }
  }

  async createClient(userId: string): Promise<{ id: string; userId: string }> {
    const client = await prisma.client.create({
      data: {
        userId,
      },
    })

    return client
  }

  async createProfessional(
    userId: string,
  ): Promise<{ id: string; userId: string }> {
    const professional = await prisma.professional.create({
      data: {
        userId,
      },
    })

    return professional
  }

  async createAdmin(userId: string): Promise<{ id: string; userId: string }> {
    const admin = await prisma.administrator.create({
      data: {
        userId,
      },
    })

    return admin
  }

  async findProfessionalByUserId(
    userId: string,
  ): Promise<{ id: string; userId: string } | null> {
    const professional = await prisma.professional.findUnique({
      where: {
        userId,
      },
    })

    return professional
  }

  async findClientById(
    id: string,
  ): Promise<{ id: string; userId: string } | null> {
    const client = await prisma.client.findUnique({
      where: {
        id,
      },
    })

    return client
  }

  async findProfessionalById(
    id: string,
  ): Promise<{ id: string; userId: string } | null> {
    const professional = await prisma.professional.findUnique({
      where: {
        id,
      },
    })

    return professional
  }
}
