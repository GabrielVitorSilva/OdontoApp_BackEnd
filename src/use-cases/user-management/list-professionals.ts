import { UsersRepository } from '@/repositories/users-repository'

interface ListProfessionalsUseCaseRequest {
  page?: number
  perPage?: number
}

interface ListProfessionalsUseCaseResponse {
  professionals: {
    id: string
    name: string
    email: string
    role: string
    createdAt: Date
    updatedAt: Date
    professionalId: string
  }[]
  total: number
}

export class ListProfessionalsUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page = 1,
    perPage = 10,
  }: ListProfessionalsUseCaseRequest): Promise<ListProfessionalsUseCaseResponse> {
    const { users, total } = await this.usersRepository.findMany({
      page,
      perPage,
      role: 'PROFESSIONAL',
    })

    const professionals = await Promise.all(
      users.map(async (user) => {
        const professional =
          await this.usersRepository.findProfessionalByUserId(user.id)
        return {
          ...user,
          professionalId: professional?.id ?? '',
        }
      }),
    )

    return {
      professionals,
      total,
    }
  }
}
