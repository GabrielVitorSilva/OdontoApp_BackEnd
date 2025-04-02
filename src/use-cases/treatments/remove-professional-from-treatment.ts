import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface RemoveProfessionalFromTreatmentUseCaseRequest {
  treatmentId: string
  professionalId: string
}

interface RemoveProfessionalFromTreatmentUseCaseResponse {
  treatment: Treatment
}

export class RemoveProfessionalFromTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    treatmentId,
    professionalId,
  }: RemoveProfessionalFromTreatmentUseCaseRequest): Promise<RemoveProfessionalFromTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.removeProfessional(
      treatmentId,
      professionalId,
    )

    return { treatment }
  }
}
