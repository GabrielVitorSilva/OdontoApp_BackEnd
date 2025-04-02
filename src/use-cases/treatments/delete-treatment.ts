import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { TreatmentsRepository } from '@/repositories/treatments-repository'

interface DeleteTreatmentUseCaseRequest {
  id: string
}

type DeleteTreatmentUseCaseResponse = void

export class DeleteTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    id,
  }: DeleteTreatmentUseCaseRequest): Promise<DeleteTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.findById(id)

    if (!treatment) {
      throw new ResourceNotFoundError()
    }

    await this.treatmentsRepository.delete(id)
  }
}
