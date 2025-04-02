import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { DeleteTreatmentUseCase } from '../treatments/delete-treatment'

export function makeDeleteTreatmentUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const useCase = new DeleteTreatmentUseCase(treatmentsRepository)

  return useCase
}
