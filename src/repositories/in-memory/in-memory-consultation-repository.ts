import { ConsultationRepository } from '../consultation-repository'
import { Consultation, Prisma, ConsultationStatus } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryConsultationRepository implements ConsultationRepository {
  public items: Consultation[] = []

  async findById(id: string): Promise<Consultation | null> {
    const consultation = this.items.find((item) => item.id === id)

    if (!consultation) {
      return null
    }

    return consultation
  }

  async findMany(): Promise<Consultation[]> {
    return this.items
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
}
