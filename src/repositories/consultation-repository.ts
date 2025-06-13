import { Prisma, Consultation } from '@prisma/client'

export type ConsultationWithRelations = Prisma.ConsultationGetPayload<{
  include: {
    client: {
      include: {
        user: true
      }
    }
    professional: {
      include: {
        user: true
      }
    }
    treatment: true
  }
}>

export interface ConsultationRepository {
  findById(id: string): Promise<Consultation | null>
  findMany(): Promise<ConsultationWithRelations[]>
  create(data: Prisma.ConsultationCreateInput): Promise<Consultation>
  update(
    id: string,
    data: Prisma.ConsultationUpdateInput,
  ): Promise<Consultation>
  delete(id: string): Promise<void>
  findByProfessionalAndDateTime(
    professionalId: string,
    dateTime: Date,
  ): Promise<Consultation[]>
  findByProfessionalId(professionalId: string): Promise<Consultation[]>
  findByClientId(clientId: string): Promise<Consultation[]>
}
