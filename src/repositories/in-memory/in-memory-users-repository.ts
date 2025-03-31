import { UsersRepository } from '@/repositories/users-repository'
import { User, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findByID(id: string): Promise<User | null> {
    return this.items.find((item) => item.id === id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((item) => item.email === email) || null
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.items.find((item) => item.cpf === cpf) || null
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user: User = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone || null,
      password: data.password,
      role: data.role || 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(user)
    return user
  }
}
