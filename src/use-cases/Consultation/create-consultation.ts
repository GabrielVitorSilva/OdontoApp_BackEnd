import type { ConsultationRepository } from '@/repositories/consultation-repository'
import type { TreatmentsRepository } from '@/repositories/treatments-repository'
import type { UsersRepository } from '@/repositories/users-repository'
import { Consultation } from '@prisma/client'
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
  constructor(
    private consultationRepository: ConsultationRepository,
    private treatmentsRepository: TreatmentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    clientId,
    dateTime,
    professionalId,
    status,
    treatmentId,
  }: CreateConsultationUseCaseRequest): Promise<CreateConsultationUseCaseResponse> {
    if (dateTime <= new Date()) {
      throw new InvalidConsultationDateError()
    }

    const client = await this.usersRepository.findClientById(clientId)

    if (!client) {
      throw new ResourceNotFoundError()
    }

    const professional =
      await this.usersRepository.findProfessionalById(professionalId)

    if (!professional) {
      throw new ResourceNotFoundError()
    }

    const treatment = await this.treatmentsRepository.findById(treatmentId)

    if (!treatment) {
      throw new ResourceNotFoundError()
    }

    const treatmentsByProfessional =
      await this.treatmentsRepository.findByProfessionalId(professionalId)
    const isProfessionalLinkedToTreatment = treatmentsByProfessional.some(
      (t) => t.id === treatmentId,
    )

    if (!isProfessionalLinkedToTreatment) {
      throw new ProfessionalNotLinkedToTreatmentError()
    }

    const existingConsultations =
      await this.consultationRepository.findByProfessionalAndDateTime(
        professionalId,
        dateTime,
      )

    if (existingConsultations.length > 0) {
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
