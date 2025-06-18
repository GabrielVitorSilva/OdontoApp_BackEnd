import { PrismaClient } from '@prisma/client'
import { StatisticsRepository } from '../statistics-repository'

export class PrismaStatisticsRepository implements StatisticsRepository {
  constructor(private prisma: PrismaClient) {}

  async getStatistics() {
    const [
      scheduledConsultations,
      totalClients,
      totalTreatments,
      consultationsWithPrices,
    ] = await Promise.all([
      this.prisma.consultation.count({
        where: {
          status: 'SCHEDULED',
        },
      }),
      this.prisma.client.count(),
      this.prisma.treatment.count(),
      this.prisma.consultation.findMany({
        include: {
          treatment: true,
        },
      }),
    ])

    const potentialRevenue = consultationsWithPrices
      .filter((consultation) => consultation.status === 'SCHEDULED')
      .reduce((sum, consultation) => sum + consultation.treatment.price, 0)

    const totalRevenue = consultationsWithPrices
      .filter((consultation) => consultation.status === 'COMPLETED')
      .reduce((sum, consultation) => sum + consultation.treatment.price, 0)

    return {
      scheduledConsultations,
      totalClients,
      totalTreatments,
      potentialRevenue,
      totalRevenue,
    }
  }
}
