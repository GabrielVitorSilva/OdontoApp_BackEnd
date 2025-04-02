import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { RemoveProfessionalFromTreatmentUseCase } from '../treatments/remove-professional-from-treatment'

export function makeRemoveProfessionalFromTreatmentUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const removeProfessionalFromTreatmentUseCase =
    new RemoveProfessionalFromTreatmentUseCase(treatmentsRepository)

  return removeProfessionalFromTreatmentUseCase
}
