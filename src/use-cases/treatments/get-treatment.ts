import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface GetTreatmentUseCaseRequest {
  id: string
}

interface GetTreatmentUseCaseResponse {
  treatment: Treatment
}

export class GetTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    id,
  }: GetTreatmentUseCaseRequest): Promise<GetTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.findById(id)

    if (!treatment) {
      throw new ResourceNotFoundError()
    }

    return { treatment }
  }
}
