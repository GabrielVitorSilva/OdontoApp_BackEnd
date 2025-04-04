import { CreateConsultationUseCase } from '../Consultation/create-consultation'
import { PrismaConsultationRepository } from '@/repositories/prisma/prisma-consultation-repository'

export function makeCreateConsultationUseCase() {
  const consultationRepository = new PrismaConsultationRepository()
  const useCase = new CreateConsultationUseCase(consultationRepository)

  return useCase
}
