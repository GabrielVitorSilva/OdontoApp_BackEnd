import { TreatmentsRepository } from '@/repositories/treatments-repository'
import { Treatment } from '@prisma/client'

interface AddProfessionalToTreatmentUseCaseRequest {
  treatmentId: string
  professionalId: string
}

interface AddProfessionalToTreatmentUseCaseResponse {
  treatment: Treatment
}

export class AddProfessionalToTreatmentUseCase {
  constructor(private treatmentsRepository: TreatmentsRepository) {}

  async execute({
    treatmentId,
    professionalId,
  }: AddProfessionalToTreatmentUseCaseRequest): Promise<AddProfessionalToTreatmentUseCaseResponse> {
    const treatment = await this.treatmentsRepository.addProfessional(
      treatmentId,
      professionalId,
    )

    return { treatment }
  }
}
