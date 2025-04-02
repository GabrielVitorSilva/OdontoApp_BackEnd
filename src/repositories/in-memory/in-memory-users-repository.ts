import { UsersRepository } from '@/repositories/users-repository'
import { User, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []
  public clients: { id: string; userId: string }[] = []
  public professionals: { id: string; userId: string }[] = []
  public admins: { id: string; userId: string }[] = []

  async findByID(id: string): Promise<User | null> {
    return this.items.find((item) => item.id === id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((item) => item.email === email) || null
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.items.find((item) => item.cpf === cpf) || null
  }

  async findMany(): Promise<User[]> {
    return this.items
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

  async createClient(userId: string): Promise<{ id: string; userId: string }> {
    const client = { id: randomUUID(), userId }
    this.clients.push(client)
    return client
  }

  async createProfessional(
    userId: string,
  ): Promise<{ id: string; userId: string }> {
    const professional = { id: randomUUID(), userId }
    this.professionals.push(professional)
    return professional
  }

  async createAdmin(userId: string): Promise<{ id: string; userId: string }> {
    const admin = { id: randomUUID(), userId }
    this.admins.push(admin)
    return admin
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const userIndex = this.items.findIndex((item) => item.id === id)

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }

    const updatedUser = {
      ...this.items[userIndex],
      ...(data.name ? { name: data.name as string } : {}),
      ...(data.email ? { email: data.email as string } : {}),
      ...(data.phone ? { phone: data.phone as string } : {}),
      updatedAt: new Date(),
    }

    this.items[userIndex] = updatedUser

    return updatedUser
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.items.findIndex((item) => item.id === id)

    if (userIndex === -1) {
      return
    }

    const user = this.items[userIndex]

    // Remover da tabela específica com base na role
    if (user.role === 'CLIENT') {
      this.clients = this.clients.filter((client) => client.userId !== id)
    } else if (user.role === 'PROFESSIONAL') {
      this.professionals = this.professionals.filter(
        (professional) => professional.userId !== id,
      )
    } else if (user.role === 'ADMIN') {
      this.admins = this.admins.filter((admin) => admin.userId !== id)
    }

    // Remover o usuário
    this.items.splice(userIndex, 1)
  }
}
