import type { ConsultationRepository } from '@/repositories/consultation-repository'
import { Consultation } from '@prisma/client'

interface ListConsultationByProfessionalUseCaseRequest {
  professionalId: string
}

interface ListConsultationByProfessionalUseCaseResponse {
  consultations: Consultation[]
}

export class ListConsultationByProfessionalUseCase {
  constructor(private consultationRepository: ConsultationRepository) {}

  async execute({
    professionalId,
  }: ListConsultationByProfessionalUseCaseRequest): Promise<ListConsultationByProfessionalUseCaseResponse> {
    const consultations =
      await this.consultationRepository.findByProfessionalId(professionalId)

    return { consultations }
  }
}
