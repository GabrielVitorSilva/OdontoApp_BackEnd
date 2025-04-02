import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface ListTreatmentsUseCaseResponse {
  treatments: Treatment[]
}

export class ListTreatmentsUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute(): Promise<ListTreatmentsUseCaseResponse> {
    const treatments = await this.treatmentsRepository.findMany()

    return { treatments }
  }
}
