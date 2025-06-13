import { prisma } from '@/lib/prisma'
import { Prisma, type Consultation } from '@prisma/client'
import type {
  ConsultationRepository,
  ConsultationWithRelations,
} from '../consultation-repository'

export class PrismaConsultationRepository implements ConsultationRepository {
  async findById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: {
        id,
      },
    })

    return consultation
  }

  async findMany(): Promise<ConsultationWithRelations[]> {
    const consultations = await prisma.consultation.findMany({
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
    return consultations
  }

  async create(data: Prisma.ConsultationCreateInput): Promise<Consultation> {
    const user = await prisma.consultation.create({
      data,
    })

    return user
  }

  async update(
    id: string,
    data: Prisma.ConsultationUpdateInput,
  ): Promise<Consultation> {
    const user = await prisma.consultation.update({
      where: {
        id,
      },
      data,
    })

    return user
  }

  async delete(id: string): Promise<void> {
    await prisma.consultation.delete({
      where: {
        id,
      },
    })
  }

  async findByProfessionalAndDateTime(
    professionalId: string,
    dateTime: Date,
  ): Promise<Consultation[]> {
    const consultations = await prisma.consultation.findMany({
      where: {
        professionalId,
        dateTime,
        status: 'SCHEDULED',
      },
      include: {
        treatment: true,
      },
    })

    return consultations
  }

  async findByProfessionalId(
    professionalId: string,
  ): Promise<ConsultationWithRelations[]> {
    const consultations = await prisma.consultation.findMany({
      where: {
        professionalId,
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
    return consultations
  }

  async findByClientId(clientId: string): Promise<ConsultationWithRelations[]> {
    const consultations = await prisma.consultation.findMany({
      where: {
        clientId,
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
    return consultations
  }
}
