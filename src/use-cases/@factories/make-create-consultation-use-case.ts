import { CreateConsultationUseCase } from '../Consultation/create-consultation'
import { PrismaConsultationRepository } from '@/repositories/prisma/prisma-consultation-repository'
import { PrismaTreatmentsRepository } from '@/repositories/prisma/prisma-treatments-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

export function makeCreateConsultationUseCase() {
  const consultationRepository = new PrismaConsultationRepository()
  const treatmentsRepository = new PrismaTreatmentsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new CreateConsultationUseCase(
    consultationRepository,
    treatmentsRepository,
    usersRepository,
  )

  return useCase
}
