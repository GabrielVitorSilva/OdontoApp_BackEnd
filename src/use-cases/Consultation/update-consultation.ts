import type { ConsultationRepository } from '@/repositories/consultation-repository'
import type { TreatmentsRepository } from '@/repositories/treatments-repository'
import type { UsersRepository } from '@/repositories/users-repository'
import { Consultation } from '@prisma/client'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { InvalidConsultationDateError } from '../@errors/invalid-consultation-date-error'
import { ProfessionalNotLinkedToTreatmentError } from '../@errors/professional-not-linked-to-treatment-error'
import { ConsultationTimeConflictError } from '../@errors/consultation-time-conflict-error'
import { InvalidConsultationStatusError } from '../@errors/invalid-consultation-status-error'
import { sendMail } from '@/lib/mail'
import { generateConsultationUpdateEmail } from '@/lib/templates/consultation-update'

interface UpdateConsultationUseCaseRequest {
  id: string
  clientId?: string
  professionalId?: string
  treatmentId?: string
  dateTime?: Date
  status?: 'SCHEDULED' | 'CANCELED' | 'COMPLETED'
}

interface UpdateConsultationUseCaseResponse {
  consultation: Consultation
}

export class UpdateConsultationUseCase {
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
  }: UpdateConsultationUseCaseRequest): Promise<UpdateConsultationUseCaseResponse> {
    const existingConsultation = await this.consultationRepository.findById(id)

    if (!existingConsultation) {
      throw new ResourceNotFoundError()
    }

    if (existingConsultation.status !== 'SCHEDULED') {
      throw new InvalidConsultationStatusError()
    }

    if (status !== 'CANCELED' && existingConsultation.dateTime <= new Date()) {
      throw new InvalidConsultationDateError()
    }

    if (
      dateTime &&
      dateTime.getTime() === existingConsultation.dateTime.getTime()
    ) {
      throw new ConsultationTimeConflictError()
    }

    if (dateTime && dateTime <= new Date()) {
      throw new InvalidConsultationDateError()
    }

    if (dateTime) {
      const professionalIdToCheck =
        professionalId || existingConsultation.professionalId
      const existingConsultations =
        await this.consultationRepository.findByProfessionalAndDateTime(
          professionalIdToCheck,
          dateTime,
        )

      const hasConflict = existingConsultations.some(
        (consultation) => consultation.id !== id,
      )

      if (hasConflict) {
        throw new ConsultationTimeConflictError()
      }
    }

    if (clientId) {
      const client = await this.usersRepository.findClientById(clientId)

      if (!client) {
        throw new ResourceNotFoundError()
      }
    }

    if (professionalId) {
      const professional =
        await this.usersRepository.findProfessionalById(professionalId)

      if (!professional) {
        throw new ResourceNotFoundError()
      }
    }

    if (treatmentId) {
      const treatment = await this.treatmentsRepository.findById(treatmentId)

      if (!treatment) {
        throw new ResourceNotFoundError()
      }

      const professionalIdToCheck =
        professionalId || existingConsultation.professionalId
      const treatmentsByProfessional =
        await this.treatmentsRepository.findByProfessionalId(
          professionalIdToCheck,
        )
      const isProfessionalLinkedToTreatment = treatmentsByProfessional.some(
        (t) => t.id === treatmentId,
      )

      if (!isProfessionalLinkedToTreatment) {
        throw new ProfessionalNotLinkedToTreatmentError()
      }
    }

    const consultation = await this.consultationRepository.update(id, {
      client: clientId ? { connect: { id: clientId } } : undefined,
      professional: professionalId
        ? { connect: { id: professionalId } }
        : undefined,
      treatment: treatmentId ? { connect: { id: treatmentId } } : undefined,
      dateTime,
      status,
    })

    // Enviar email de atualização
    const client = await this.usersRepository.findClientById(consultation.clientId)
    const professional = await this.usersRepository.findProfessionalById(consultation.professionalId)
    const treatment = await this.treatmentsRepository.findById(consultation.treatmentId)

    if (client && professional && treatment) {
      const clientUser = await this.usersRepository.findById(client.userId)
      const professionalUser = await this.usersRepository.findById(professional.userId)

      if (clientUser && professionalUser) {
        const emailHtml = generateConsultationUpdateEmail({
          clientName: clientUser.name,
          professionalName: professionalUser.name,
          treatmentName: treatment.name,
          dateTime: consultation.dateTime,
          status: consultation.status,
        })

        await sendMail({
          to: clientUser.email,
          subject: 'Atualização de Consulta - OdontoApp',
          html: emailHtml,
        })
      }
    }

    return { consultation }
  }
}
