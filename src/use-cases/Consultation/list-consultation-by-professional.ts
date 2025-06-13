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

interface ListConsultationByProfessionalUseCaseRequest {
  professionalId: string
}

interface ListConsultationByProfessionalUseCaseResponse {
  consultations: FormattedConsultation[]
}

export class ListConsultationByProfessionalUseCase {
  constructor(private consultationRepository: ConsultationRepository) {}

  async execute({
    professionalId,
  }: ListConsultationByProfessionalUseCaseRequest): Promise<ListConsultationByProfessionalUseCaseResponse> {
    const consultations =
      await this.consultationRepository.findByProfessionalId(professionalId)

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
