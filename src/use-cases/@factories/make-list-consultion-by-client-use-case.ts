import { ListConsultationByClientUseCase } from '../Consultation/list-consultation-by-client'
import { PrismaConsultationRepository } from '@/repositories/prisma/prisma-consultation-repository'

export function makeListConsultationByClientUseCase() {
  const consultationRepository = new PrismaConsultationRepository()

  const useCase = new ListConsultationByClientUseCase(
    consultationRepository,
  )

  return useCase
}
