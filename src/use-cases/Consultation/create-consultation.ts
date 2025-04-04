import type { ConsultationRepository } from '@/repositories/consultation-repository'
import { Consultation } from '@prisma/client'

interface CreateConsultationUseCaseRequest {
  id: string
  clientId: string
  professionalId: string
  treatmentId: string
  dateTime: Date
  status: 'SCHEDULED' | 'CANCELED' | 'COMPLETED'
}

interface CreateConsultationUseCaseResponse {
  consultation: Consultation
}

export class CreateConsultationUseCase {
  constructor(private consultationRepository: ConsultationRepository) {}

  async execute({
    id,
    clientId,
    dateTime,
    professionalId,
    status,
    treatmentId,
  }: CreateConsultationUseCaseRequest): Promise<CreateConsultationUseCaseResponse> {
    const consultation = await this.consultationRepository.create({
      id,
      dateTime,
      client: {
        connect: {
          id: clientId,
        },
      },
      professional: {
        connect: {
          id: professionalId,
        },
      },
      status,
      treatment: {
        connect: {
          id: treatmentId,
        },
      },
    })
    return { consultation }
  }
}
