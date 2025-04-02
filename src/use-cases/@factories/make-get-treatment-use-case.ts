import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { GetTreatmentUseCase } from '../treatments/get-treatment'

export function makeGetTreatmentUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const useCase = new GetTreatmentUseCase(treatmentsRepository)

  return useCase
}
