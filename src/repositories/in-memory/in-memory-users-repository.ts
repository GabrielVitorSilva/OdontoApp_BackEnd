import { UsersRepository } from '@/repositories/users-repository'
import { User, Prisma, Role } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []
  public clients: { id: string; userId: string }[] = []
  public professionals: { id: string; userId: string }[] = []
  public admins: { id: string; userId: string }[] = []

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = this.items.find((item) => item.cpf === cpf)

    if (!user) {
      return null
    }

    return user
  }

  async findMany(params: {
    page?: number
    perPage?: number
    role?: Role
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, perPage = 10, role } = params
    const skip = (page - 1) * perPage

    let filteredUsers = this.items

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    const total = filteredUsers.length
    const users = filteredUsers.slice(skip, skip + perPage)

    return { users, total }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      password: data.password,
      phone: data.phone ?? null,
      role: data.role as Role,
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
    const admin = {
      id: randomUUID(),
      userId,
    }

    this.admins.push(admin)

    return admin
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const userIndex = this.items.findIndex((item) => item.id === id)

    if (userIndex === -1) {
      throw new Error('User not found.')
    }

    const user = this.items[userIndex]

    this.items[userIndex] = {
      ...user,
      name: typeof data.name === 'string' ? data.name : user.name,
      email: typeof data.email === 'string' ? data.email : user.email,
      cpf: typeof data.cpf === 'string' ? data.cpf : user.cpf,
      password:
        typeof data.password === 'string' ? data.password : user.password,
      phone:
        data.phone === null
          ? null
          : typeof data.phone === 'string'
            ? data.phone
            : user.phone,
      role: typeof data.role === 'string' ? (data.role as Role) : user.role,
      updatedAt: new Date(),
    }

    return this.items[userIndex]
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.items.findIndex((item) => item.id === id)

    if (userIndex === -1) {
      throw new Error('User not found.')
    }

    const user = this.items[userIndex]

    if (user.role === 'CLIENT') {
      this.clients = this.clients.filter((client) => client.userId !== id)
    } else if (user.role === 'PROFESSIONAL') {
      this.professionals = this.professionals.filter(
        (professional) => professional.userId !== id,
      )
    } else if (user.role === 'ADMIN') {
      this.admins = this.admins.filter((admin) => admin.userId !== id)
    }

    this.items.splice(userIndex, 1)
  }

  async findProfessionalByUserId(
    userId: string,
  ): Promise<{ id: string; userId: string } | null> {
    const professional = this.professionals.find(
      (item) => item.userId === userId,
    )

    if (!professional) {
      return null
    }

    return professional
  }

  async findClientById(
    id: string,
  ): Promise<{ id: string; userId: string } | null> {
    const client = this.clients.find((item) => item.id === id)

    if (!client) {
      return null
    }

    return client
  }

  async findProfessionalById(
    id: string,
  ): Promise<{ id: string; userId: string } | null> {
    const professional = this.professionals.find((item) => item.id === id)

    if (!professional) {
      return null
    }

    return professional
  }
}
