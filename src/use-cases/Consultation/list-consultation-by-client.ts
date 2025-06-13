import type { ConsultationRepository } from '@/repositories/consultation-repository'

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

interface ListConsultationByClientUseCaseRequest {
  clientId: string
}

interface ListConsultationByClientUseCaseResponse {
  consultations: FormattedConsultation[]
}

export class ListConsultationByClientUseCase {
  constructor(private consultationRepository: ConsultationRepository) {}

  async execute({
    clientId,
  }: ListConsultationByClientUseCaseRequest): Promise<ListConsultationByClientUseCaseResponse> {
    const consultations =
      await this.consultationRepository.findByClientId(clientId)

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
