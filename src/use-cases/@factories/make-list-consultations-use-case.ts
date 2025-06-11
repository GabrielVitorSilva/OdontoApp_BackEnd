import { PrismaConsultationRepository } from '@/repositories/prisma/prisma-consultation-repository'
import { ListConsultationsUseCase } from '../Consultation/list-consultations'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

export function makeListConsultationsUseCase() {
  const consultationRepository = new PrismaConsultationRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new ListConsultationsUseCase(
    consultationRepository,
    usersRepository,
  )

  return useCase
}
