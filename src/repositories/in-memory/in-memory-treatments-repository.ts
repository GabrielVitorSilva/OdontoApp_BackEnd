import { Prisma, Treatment } from '@prisma/client'
import { TreatmentsRepository } from '../treatments-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryTreatmentsRepository implements TreatmentsRepository {
  public items: Treatment[] = []
  public treatmentProfessionalRelations: {
    treatmentId: string
    professionalId: string
  }[] = []

  async findById(id: string): Promise<Treatment | null> {
    const treatment = this.items.find((item) => item.id === id)

    if (!treatment) {
      return null
    }

    return treatment
  }

  async findByProfessionalId(professionalId: string): Promise<Treatment[]> {
    const treatmentIds = this.treatmentProfessionalRelations
      .filter((relation) => relation.professionalId === professionalId)
      .map((relation) => relation.treatmentId)

    return this.items.filter((item) => treatmentIds.includes(item.id))
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
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(treatment)

    // Adicionar relação com profissional se fornecido
    if (data.professionals?.connect) {
      const professionalId = Array.isArray(data.professionals.connect)
        ? data.professionals.connect[0]?.id
        : data.professionals.connect.id

      if (professionalId) {
        this.treatmentProfessionalRelations.push({
          treatmentId: treatment.id,
          professionalId,
        })
      }
    }

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
      name: typeof data.name === 'string' ? data.name : treatment.name,
      description:
        data.description === null
          ? null
          : typeof data.description === 'string'
            ? data.description
            : treatment.description,
      durationMinutes:
        typeof data.durationMinutes === 'number'
          ? data.durationMinutes
          : treatment.durationMinutes,
      price: typeof data.price === 'number' ? data.price : treatment.price,
      updatedAt: new Date(),
    }

    // Atualizar relação com profissional se fornecido
    if (data.professionals?.connect) {
      const professionalId = Array.isArray(data.professionals.connect)
        ? data.professionals.connect[0]?.id
        : data.professionals.connect.id

      if (professionalId) {
        // Remover relações existentes
        this.treatmentProfessionalRelations =
          this.treatmentProfessionalRelations.filter(
            (relation) => relation.treatmentId !== id,
          )

        // Adicionar nova relação
        this.treatmentProfessionalRelations.push({
          treatmentId: id,
          professionalId,
        })
      }
    }

    return this.items[treatmentIndex]
  }

  async delete(id: string): Promise<void> {
    const treatmentIndex = this.items.findIndex((item) => item.id === id)

    if (treatmentIndex === -1) {
      throw new Error('Treatment not found.')
    }

    // Remover relações
    this.treatmentProfessionalRelations =
      this.treatmentProfessionalRelations.filter(
        (relation) => relation.treatmentId !== id,
      )

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

    // Adicionar relação
    this.treatmentProfessionalRelations.push({
      treatmentId,
      professionalId,
    })

    const treatment = this.items[treatmentIndex]
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

    // Remover relação
    this.treatmentProfessionalRelations =
      this.treatmentProfessionalRelations.filter(
        (relation) =>
          !(
            relation.treatmentId === treatmentId &&
            relation.professionalId === professionalId
          ),
      )

    const treatment = this.items[treatmentIndex]
    treatment.updatedAt = new Date()

    return treatment
  }
}
