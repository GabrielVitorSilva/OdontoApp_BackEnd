import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { ListTreatmentsUseCase } from '../treatments/list-treatments'

export function makeListTreatmentsUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const useCase = new ListTreatmentsUseCase(treatmentsRepository)

  return useCase
}
