import { prisma } from '@/lib/prisma'
import { TreatmentsRepository } from '../treatments-repository'
import { Prisma } from '@prisma/client'

export class PrismaTreatmentsRepository implements TreatmentsRepository {
  async findById(id: string) {
    const treatment = await prisma.treatment.findUnique({
      where: {
        id,
      },
      include: {
        professionals: true,
      },
    })

    return treatment
  }

  async findByProfessionalId(professionalId: string) {
    const treatments = await prisma.treatment.findMany({
      where: {
        professionals: {
          some: {
            id: professionalId,
          },
        },
      },
      include: {
        professionals: true,
      },
    })

    return treatments
  }

  async findMany() {
    const treatments = await prisma.treatment.findMany({
      include: {
        professionals: true,
      },
    })
    return treatments
  }

  async create(data: Prisma.TreatmentCreateInput) {
    const treatment = await prisma.treatment.create({
      data,
      include: {
        professionals: true,
      },
    })

    return treatment
  }

  async update(id: string, data: Prisma.TreatmentUpdateInput) {
    const treatment = await prisma.treatment.update({
      where: {
        id,
      },
      data,
      include: {
        professionals: true,
      },
    })

    return treatment
  }

  async delete(id: string) {
    await prisma.treatment.delete({
      where: {
        id,
      },
    })
  }

  async addProfessional(treatmentId: string, professionalId: string) {
    const treatment = await prisma.treatment.update({
      where: {
        id: treatmentId,
      },
      data: {
        professionals: {
          connect: {
            id: professionalId,
          },
        },
      },
      include: {
        professionals: true,
      },
    })

    return treatment
  }

  async removeProfessional(treatmentId: string, professionalId: string) {
    const treatment = await prisma.treatment.update({
      where: {
        id: treatmentId,
      },
      data: {
        professionals: {
          disconnect: {
            id: professionalId,
          },
        },
      },
    })

    return treatment
  }
}
