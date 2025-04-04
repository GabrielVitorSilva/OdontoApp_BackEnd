import { prisma } from '@/lib/prisma'
import { Prisma, type Consultation } from '@prisma/client'
import type { ConsultationRepository } from '../consultation-repository'

export class PrismaConsultationRepository implements ConsultationRepository {
  async findById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: {
        id,
      },
    })

    return consultation
  }

  async findMany(): Promise<Consultation[]> {
    const users = await prisma.consultation.findMany()
    return users
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
}
