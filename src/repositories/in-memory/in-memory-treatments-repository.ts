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
      professionalId: data.professionals?.connect?.[0]?.id ?? '',
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

    if (treatmentIndex === -1) {
      throw new Error('Treatment not found.')
    }

    const treatment = this.items[treatmentIndex]

    this.items[treatmentIndex] = {
      ...treatment,
      name: data.name ?? treatment.name,
      description: data.description ?? treatment.description,
      durationMinutes: data.durationMinutes ?? treatment.durationMinutes,
      price: data.price ?? treatment.price,
      professionalId:
        data.professionals?.connect?.[0]?.id ?? treatment.professionalId,
      updatedAt: new Date(),
    }

    return this.items[treatmentIndex]
  }

  async delete(id: string): Promise<void> {
    const treatmentIndex = this.items.findIndex((item) => item.id === id)

    if (treatmentIndex === -1) {
      throw new Error('Treatment not found.')
    }

    this.items.splice(treatmentIndex, 1)
  }

  async addProfessional(
    treatmentId: string,
    professionalId: string,
  ): Promise<Treatment> {
    const treatmentIndex = this.items.findIndex(
      (item) => item.id === treatmentId,
    )

    if (treatmentIndex === -1) {
      throw new Error('Treatment not found.')
    }

    const treatment = this.items[treatmentIndex]
    treatment.professionalId = professionalId
    treatment.updatedAt = new Date()

    return treatment
  }

  async removeProfessional(
    treatmentId: string,
    professionalId: string,
  ): Promise<Treatment> {
    const treatmentIndex = this.items.findIndex(
      (item) => item.id === treatmentId,
    )

    if (treatmentIndex === -1) {
      throw new Error('Treatment not found.')
    }

    const treatment = this.items[treatmentIndex]
    treatment.professionalId = ''
    treatment.updatedAt = new Date()

    return treatment
  }
}
