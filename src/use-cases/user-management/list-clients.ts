import { UsersRepository } from '@/repositories/users-repository'

interface ListClientsUseCaseRequest {
  page?: number
  perPage?: number
}

interface ListClientsUseCaseResponse {
  clients: {
    id: string
    name: string
    email: string
    role: string
    createdAt: Date
    updatedAt: Date
    clientId: string
  }[]
  total: number
}

export class ListClientsUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page = 1,
    perPage = 10,
  }: ListClientsUseCaseRequest): Promise<ListClientsUseCaseResponse> {
    const { users, total } = await this.usersRepository.findMany({
      page,
      perPage,
      role: 'CLIENT',
    })

    const clients = await Promise.all(
      users.map(async (user) => {
        const client = await this.usersRepository.findClientByUserId(user.id)
        return {
          ...user,
          clientId: client?.id ?? '',
        }
      }),
    )

    return {
      clients,
      total,
    }
  }
}
