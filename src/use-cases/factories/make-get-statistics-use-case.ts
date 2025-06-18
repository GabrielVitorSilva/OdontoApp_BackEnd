import { PrismaClient } from '@prisma/client'
import { PrismaStatisticsRepository } from '@/repositories/prisma/statistics-repository'
import { GetStatisticsUseCase } from '../get-statistics'

export function makeGetStatisticsUseCase() {
  const statisticsRepository = new PrismaStatisticsRepository(
    new PrismaClient(),
  )
  const useCase = new GetStatisticsUseCase(statisticsRepository)

  return useCase
}
