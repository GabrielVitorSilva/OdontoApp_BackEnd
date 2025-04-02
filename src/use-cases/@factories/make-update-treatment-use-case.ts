import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { UpdateTreatmentUseCase } from '../treatments/update-treatment'

export function makeUpdateTreatmentUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const useCase = new UpdateTreatmentUseCase(treatmentsRepository)

  return useCase
}
