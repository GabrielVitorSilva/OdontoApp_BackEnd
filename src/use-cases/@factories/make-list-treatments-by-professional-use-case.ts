import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { ListTreatmentsByProfessionalUseCase } from '../treatments/list-treatments-by-professional'

export function makeListTreatmentsByProfessionalUseCase() {
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const useCase = new ListTreatmentsByProfessionalUseCase(treatmentsRepository)

  return useCase
}
