import { ListConsultationByProfessionalUseCase } from '../Consultation/list-consultation-by-professional'
import { PrismaConsultationRepository } from '@/repositories/prisma/prisma-consultation-repository'

export function makeListConsultationByProfessionalUseCase() {
  const consultationRepository = new PrismaConsultationRepository()

  const useCase = new ListConsultationByProfessionalUseCase(
    consultationRepository,
  )

  return useCase
}
