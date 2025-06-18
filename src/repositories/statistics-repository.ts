export interface Statistics {
  scheduledConsultations: number
  totalClients: number
  totalTreatments: number
  potentialRevenue: number
  totalRevenue: number
}

export interface StatisticsRepository {
  getStatistics(): Promise<Statistics>
}
