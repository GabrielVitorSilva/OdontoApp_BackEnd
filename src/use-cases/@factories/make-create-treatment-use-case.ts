import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { CreateTreatmentUseCase } from '../treatments/create-treatment'

export function makeCreateTreatmentUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const useCase = new CreateTreatmentUseCase(treatmentsRepository)

  return useCase
}
