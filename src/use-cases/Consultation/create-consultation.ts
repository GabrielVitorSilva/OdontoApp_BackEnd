import type { ConsultationRepository } from '@/repositories/consultation-repository'
import { Consultation } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '../@errors/invalid-consultation-date-error'
import { ProfessionalNotLinkedToTreatmentError } from '../@errors/professional-not-linked-to-treatment-error'
import { ConsultationTimeConflictError } from '../@errors/consultation-time-conflict-error'

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
    // Verificar se a data é futura
    if (dateTime <= new Date()) {
      throw new InvalidConsultationDateError()
    }

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o profissional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    })

    if (!professional) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o tratamento existe
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        professionals: true,
      },
    })

    if (!treatment) {
      throw new ResourceNotFoundError()
    }

    // Verificar se o profissional está vinculado ao tratamento
    const isProfessionalLinkedToTreatment = treatment.professionals.some(
      (p) => p.id === professionalId,
    )

    if (!isProfessionalLinkedToTreatment) {
      throw new ProfessionalNotLinkedToTreatmentError()
    }

    // Verificar se já existe consulta agendada para o profissional neste horário
    const existingConsultations =
      await this.consultationRepository.findByProfessionalAndDateTime(
        professionalId,
        dateTime,
      )

    if (existingConsultations.length > 0) {
      throw new ConsultationTimeConflictError()
    }

    // Verificar se a consulta está dentro do tempo de duração do tratamento
    const consultationEndTime = new Date(
      dateTime.getTime() + treatment.durationMinutes * 60000,
    )
    const overlappingConsultations = await prisma.consultation.findMany({
      where: {
        professionalId,
        dateTime: {
          lte: consultationEndTime,
          gte: dateTime,
        },
        status: 'SCHEDULED',
      },
    })

    if (overlappingConsultations.length > 0) {
      throw new ConsultationTimeConflictError()
    }

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
