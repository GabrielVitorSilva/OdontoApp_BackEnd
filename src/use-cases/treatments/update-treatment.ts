import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface UpdateTreatmentUseCaseRequest {
  id: string
  name?: string
  description?: string
  durationMinutes?: number
  price?: number
}

interface UpdateTreatmentUseCaseResponse {
  treatment: Treatment
}

export class UpdateTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    id,
    name,
    description,
    durationMinutes,
    price,
  }: UpdateTreatmentUseCaseRequest): Promise<UpdateTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.findById(id)

    if (!treatment) {
      throw new ResourceNotFoundError()
    }

    const updatedTreatment = await this.treatmentsRepository.update(id, {
      name,
      description,
      durationMinutes,
      price,
    })

    return { treatment: updatedTreatment }
  }
}
