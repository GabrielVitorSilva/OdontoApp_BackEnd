import { PrismaClient } from '@prisma/client'
import { EmailService } from './email-service'

export class ConsultationReminderJob {
  private prisma: PrismaClient
  private emailService: EmailService

  constructor() {
    this.prisma = new PrismaClient()
    this.emailService = new EmailService()
  }

  async execute() {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      const consultations = await this.prisma.consultation.findMany({
        where: {
          dateTime: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
          status: 'SCHEDULED',
        },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          professional: {
            include: {
              user: true,
            },
          },
          treatment: true,
        },
      })

      for (const consultation of consultations) {
        try {
          await this.emailService.sendConsultationReminder(
            consultation.client.user.email,
            consultation.client.user.name,
            consultation.professional.user.name,
            consultation.treatment.name,
            consultation.dateTime,
          )

          await this.prisma.notification.create({
            data: {
              userId: consultation.client.userId,
              message: `Lembrete de consulta enviado para ${consultation.client.user.email}`,
              viewed: false,
            },
          })
        } catch (error) {
          console.error(
            `Erro ao enviar lembrete para ${consultation.client.user.email}:`,
            error,
          )
        }
      }
    } catch (error) {
      console.error('Erro ao executar job de lembretes:', error)
    } finally {
      await this.prisma.$disconnect()
    }
  }
}
