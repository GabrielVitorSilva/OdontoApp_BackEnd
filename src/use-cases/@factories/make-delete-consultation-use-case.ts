import { DeleteConsultationUseCase } from '../Consultation/delete-consultation'
import { PrismaConsultationRepository } from '@/repositories/prisma/prisma-consultation-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

export function makeDeleteConsultationUseCase() {
  const consultationRepository = new PrismaConsultationRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new DeleteConsultationUseCase(
    consultationRepository,
    usersRepository,
  )

  return useCase
} 