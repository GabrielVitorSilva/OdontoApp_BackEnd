import { StatisticsRepository } from '../repositories/statistics-repository'

export class GetStatisticsUseCase {
  constructor(private statisticsRepository: StatisticsRepository) {}

  async execute() {
    const statistics = await this.statisticsRepository.getStatistics()
    return statistics
  }
}
