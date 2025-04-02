import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { AddProfessionalToTreatmentUseCase } from '../treatments/add-professional-to-treatment'

export function makeAddProfessionalToTreatmentUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const addProfessionalToTreatmentUseCase =
    new AddProfessionalToTreatmentUseCase(treatmentsRepository)

  return addProfessionalToTreatmentUseCase
}
