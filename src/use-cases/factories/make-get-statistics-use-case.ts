import { PrismaStatisticsRepository } from '@/repositories/prisma/statistics-repository'
import { GetStatisticsUseCase } from '../get-statistics'

export function makeGetStatisticsUseCase() {
  const statisticsRepository = new PrismaStatisticsRepository()
  const useCase = new GetStatisticsUseCase(statisticsRepository)

  return useCase
}
