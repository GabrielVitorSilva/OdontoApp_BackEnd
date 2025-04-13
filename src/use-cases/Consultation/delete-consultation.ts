import type { ConsultationRepository } from '@/repositories/consultation-repository'
import type { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found-error'
import { sendMail } from '@/lib/mail'
import { generateConsultationDeleteEmail } from '../../lib/templates/consultation-delete'

interface DeleteConsultationUseCaseRequest {
  id: string
}

export class DeleteConsultationUseCase {
  constructor(
    private consultationRepository: ConsultationRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ id }: DeleteConsultationUseCaseRequest): Promise<void> {
    const consultation = await this.consultationRepository.findById(id)

    if (!consultation) {
      throw new ResourceNotFoundError()
    }

    const client = await this.usersRepository.findClientById(
      consultation.clientId,
    )
    const professional = await this.usersRepository.findProfessionalById(
      consultation.professionalId,
    )

    if (client && professional) {
      const clientUser = await this.usersRepository.findById(client.userId)
      const professionalUser = await this.usersRepository.findById(
        professional.userId,
      )

      if (clientUser && professionalUser) {
        const emailHtml = generateConsultationDeleteEmail({
          clientName: clientUser.name,
          professionalName: professionalUser.name,
          dateTime: consultation.dateTime,
        })

        await sendMail({
          to: clientUser.email,
          subject: 'Consulta Cancelada - OdontoApp',
          html: emailHtml,
        })
      }
    }

    await this.consultationRepository.delete(id)
  }
}
