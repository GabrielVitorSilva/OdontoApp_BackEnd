import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface ListTreatmentsByProfessionalUseCaseRequest {
  professionalId: string
}

interface ListTreatmentsByProfessionalUseCaseResponse {
  treatments: Treatment[]
}

export class ListTreatmentsByProfessionalUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    professionalId,
  }: ListTreatmentsByProfessionalUseCaseRequest): Promise<ListTreatmentsByProfessionalUseCaseResponse> {
    const treatments =
      await this.treatmentsRepository.findByProfessionalId(professionalId)

    return { treatments }
  }
}
