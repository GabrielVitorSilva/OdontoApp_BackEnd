import { Prisma, Treatment } from '@prisma/client'
import { TreatmentsRepository } from '../treatments-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryTreatmentsRepository implements TreatmentsRepository {
  public items: Treatment[] = []

  async findById(id: string): Promise<Treatment | null> {
    const treatment = this.items.find((item) => item.id === id)

    if (!treatment) {
      return null
    }

    return treatment
  }

  async findByProfessionalId(professionalId: string): Promise<Treatment[]> {
    const treatments = this.items.filter(
      (item) => item.professionalId === professionalId,
    )

    return treatments
  }

  async findMany(): Promise<Treatment[]> {
    return this.items
  }

  async create(data: Prisma.TreatmentCreateInput): Promise<Treatment> {
    const treatment = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      durationMinutes: data.durationMinutes,
      price: data.price,
      professionalId: data.professional.connect?.id ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(treatment)

    return treatment
  }

  async update(
    id: string,
    data: Prisma.TreatmentUpdateInput,
  ): Promise<Treatment> {
    const treatmentIndex = this.items.findIndex((item) => item.id === id)

    if (treatmentIndex >= 0) {
      const treatment = this.items[treatmentIndex]

      this.items[treatmentIndex] = {
        ...treatment,
        name: data.name !== undefined ? String(data.name) : treatment.name,
        description:
          data.description !== undefined
            ? String(data.description)
            : treatment.description,
        durationMinutes:
          data.durationMinutes !== undefined
            ? Number(data.durationMinutes)
            : treatment.durationMinutes,
        price: data.price !== undefined ? Number(data.price) : treatment.price,
        updatedAt: new Date(),
      }
    }

    return this.items[treatmentIndex]
  }

  async delete(id: string): Promise<void> {
    const treatmentIndex = this.items.findIndex((item) => item.id === id)

    if (treatmentIndex >= 0) {
      this.items.splice(treatmentIndex, 1)
    }
  }
}
