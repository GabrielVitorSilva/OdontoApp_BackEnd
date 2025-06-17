import type { ConsultationRepository } from '@/repositories/consultation-repository'
import type { TreatmentsRepository } from '@/repositories/treatments-repository'
import type { UsersRepository } from '@/repositories/users-repository'
import { Consultation } from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '../@errors/invalid-consultation-date-error'
import { ConsultationTimeConflictError } from '../@errors/consultation-time-conflict-error'
import { sendMail } from '@/lib/mail'
import { generateConsultationConfirmationEmail } from '@/lib/templates/consultation-confirmation'

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

    const clientUser = await this.usersRepository.findById(client.userId)
    if (!clientUser) {
      throw new ResourceNotFoundError()
    }

    const professional =
      await this.usersRepository.findProfessionalById(professionalId)

    if (!professional) {
      throw new ResourceNotFoundError()
    }

    const professionalUser = await this.usersRepository.findById(
      professional.userId,
    )
    if (!professionalUser) {
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
      await this.treatmentsRepository.addProfessional(
        treatmentId,
        professionalId,
      )
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

    // Enviar email de confirmação
    if (status === 'SCHEDULED') {
      const emailHtml = generateConsultationConfirmationEmail({
        clientName: clientUser.name,
        professionalName: professionalUser.name,
        treatmentName: treatment.name,
        dateTime,
      })

      await sendMail({
        to: clientUser.email,
        subject: 'Confirmação de Consulta - OdontoApp',
        html: emailHtml,
      })
    }

    return { consultation }
  }
}
