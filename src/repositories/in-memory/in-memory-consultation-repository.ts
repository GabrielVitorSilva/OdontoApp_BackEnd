import {
  ConsultationRepository,
  ConsultationWithRelations,
} from '../consultation-repository'
import { Consultation, Prisma, ConsultationStatus } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { UsersRepository } from '../users-repository'

export class InMemoryConsultationRepository implements ConsultationRepository {
  public items: Consultation[] = []
  public usersRepository: UsersRepository

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository
  }

  async findById(id: string): Promise<Consultation | null> {
    const consultation = this.items.find((item) => item.id === id)

    if (!consultation) {
      return null
    }

    return consultation
  }

  async findMany(): Promise<ConsultationWithRelations[]> {
    const consultations = await Promise.all(
      this.items.map(async (consultation) => {
        const client = await this.usersRepository.findClientById(
          consultation.clientId,
        )
        const professional = await this.usersRepository.findProfessionalById(
          consultation.professionalId,
        )

        if (!client || !professional) {
          throw new Error('Client or professional not found')
        }

        const clientUser = await this.usersRepository.findById(client.userId)
        const professionalUser = await this.usersRepository.findById(
          professional.userId,
        )

        if (!clientUser || !professionalUser) {
          throw new Error('User not found')
        }

        return {
          ...consultation,
          client: {
            id: client.id,
            userId: client.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: clientUser,
          },
          professional: {
            id: professional.id,
            userId: professional.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: professionalUser,
          },
          treatment: {
            id: consultation.treatmentId,
            name: 'Treatment ' + consultation.treatmentId.split('-')[1],
            description: null,
            durationMinutes: 60,
            price: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }
      }),
    )

    return consultations
  }

  async create(data: Prisma.ConsultationCreateInput): Promise<Consultation> {
    const consultation = {
      id: data.id ?? randomUUID(),
      clientId: data.client?.connect?.id ?? '',
      professionalId: data.professional?.connect?.id ?? '',
      treatmentId: data.treatment?.connect?.id ?? '',
      dateTime:
        data.dateTime instanceof Date ? data.dateTime : new Date(data.dateTime),
      status: (data.status ?? 'SCHEDULED') as ConsultationStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(consultation)

    return consultation
  }

  async update(
    id: string,
    data: Prisma.ConsultationUpdateInput,
  ): Promise<Consultation> {
    const consultationIndex = this.items.findIndex((item) => item.id === id)

    if (consultationIndex === -1) {
      throw new Error('Consultation not found.')
    }

    const consultation = this.items[consultationIndex]

    const updatedConsultation = {
      ...consultation,
      ...data,
      updatedAt: new Date(),
    }

    this.items[consultationIndex] = updatedConsultation as Consultation

    return updatedConsultation as Consultation
  }

  async delete(id: string): Promise<void> {
    const consultationIndex = this.items.findIndex((item) => item.id === id)

    if (consultationIndex === -1) {
      throw new Error('Consultation not found.')
    }

    this.items.splice(consultationIndex, 1)
  }

  async findByProfessionalAndDateTime(
    professionalId: string,
    dateTime: Date,
  ): Promise<Consultation[]> {
    return this.items.filter(
      (item) =>
        item.professionalId === professionalId &&
        item.dateTime.getTime() === dateTime.getTime() &&
        item.status === 'SCHEDULED',
    )
  }

  async findByProfessionalId(professionalId: string): Promise<Consultation[]> {
    return this.items.filter((item) => item.professionalId === professionalId)
  }

  async findByClientId(clientId: string): Promise<Consultation[]> {
    return this.items.filter((item) => item.clientId === clientId)
  }
}
