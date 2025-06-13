import { ConsultationRepository } from '@/repositories/consultation-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found'
import { NotAllowed } from '../@errors/not-allowed'

interface FormattedConsultation {
  id: string
  clientName: string
  professionalName: string
  treatmentName: string
  dateTime: Date
  status: string
  createdAt: Date
  updatedAt: Date
}

interface ListConsultationsUseCaseResponse {
  consultations: FormattedConsultation[]
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

    const formattedConsultations = consultations.map((consultation) => ({
      id: consultation.id,
      clientName: consultation.client.user.name,
      professionalName: consultation.professional.user.name,
      treatmentName: consultation.treatment.name,
      dateTime: consultation.dateTime,
      status: consultation.status,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    }))

    return { consultations: formattedConsultations }
  }
}
