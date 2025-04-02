import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface CreateTreatmentUseCaseRequest {
  name: string
  description?: string
  durationMinutes: number
  price: number
  professionalIds?: string[]
}

interface CreateTreatmentUseCaseResponse {
  treatment: Treatment
}

export class CreateTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    name,
    description,
    durationMinutes,
    price,
    professionalIds,
  }: CreateTreatmentUseCaseRequest): Promise<CreateTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.create({
      name,
      description,
      durationMinutes,
      price,
      professionals: professionalIds
        ? {
            connect: professionalIds.map((id) => ({ id })),
          }
        : undefined,
    })

    return { treatment }
  }
}
