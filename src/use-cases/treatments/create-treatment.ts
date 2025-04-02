import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface CreateTreatmentUseCaseRequest {
  name: string
  description?: string
  durationMinutes: number
  price: number
  professionalId: string
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
    professionalId,
  }: CreateTreatmentUseCaseRequest): Promise<CreateTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.create({
      name,
      description,
      durationMinutes,
      price,
      professional: {
        connect: {
          id: professionalId,
        },
      },
    })

    return { treatment }
  }
}
