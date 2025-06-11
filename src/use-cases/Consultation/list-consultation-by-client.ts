import type { ConsultationRepository } from '@/repositories/consultation-repository'
import { Consultation } from '@prisma/client'

interface ListConsultationByClientUseCaseRequest {
  clientId: string
}

interface ListConsultationByClientUseCaseResponse {
  consultations: Consultation[]
}

export class ListConsultationByClientUseCase {
  constructor(private consultationRepository: ConsultationRepository) {}

  async execute({
    clientId,
  }: ListConsultationByClientUseCaseRequest): Promise<ListConsultationByClientUseCaseResponse> {
    const consultations =
      await this.consultationRepository.findByClientId(clientId)

    return { consultations }
  }
}
