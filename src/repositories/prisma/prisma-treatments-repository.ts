import { prisma } from '@/lib/prisma'
import { TreatmentsRepository } from '../treatments-repository'
import { Prisma } from '@prisma/client'

export class PrismaTreatmentsRepository implements TreatmentsRepository {
  async findById(id: string) {
    const treatment = await prisma.treatment.findUnique({
      where: {
        id,
      },
    })

    return treatment
  }

  async findByProfessionalId(professionalId: string) {
    const treatments = await prisma.treatment.findMany({
      where: {
        professionalId,
      },
    })

    return treatments
  }

  async findMany() {
    const treatments = await prisma.treatment.findMany()
    return treatments
  }

  async create(data: Prisma.TreatmentCreateInput) {
    const treatment = await prisma.treatment.create({
      data,
    })

    return treatment
  }

  async update(id: string, data: Prisma.TreatmentUpdateInput) {
    const treatment = await prisma.treatment.update({
      where: {
        id,
      },
      data,
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
}
