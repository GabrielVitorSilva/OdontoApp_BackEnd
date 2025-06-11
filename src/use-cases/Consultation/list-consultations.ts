import { ConsultationRepository } from '@/repositories/consultation-repository'
import { Consultation } from '@prisma/client'
import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found'
import { NotAllowed } from '../@errors/not-allowed'

interface ListConsultationsUseCaseResponse {
  consultations: Consultation[]
}

interface ListConsultationUseCaseRequest {
  userId: string
}

export class ListConsultationsUseCase {
  constructor(
    private consultationRepository: ConsultationRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
  }: ListConsultationUseCaseRequest): Promise<ListConsultationsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (user.role !== 'ADMIN') {
      throw new NotAllowed()
    }

    const consultations = await this.consultationRepository.findMany()
    return { consultations }
  }
}
