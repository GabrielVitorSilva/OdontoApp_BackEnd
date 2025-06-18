import { prisma } from '@/lib/prisma'

import { StatisticsRepository } from '../statistics-repository'

export class PrismaStatisticsRepository implements StatisticsRepository {
  constructor() {}

  async getStatistics() {
    const [
      scheduledConsultations,
      totalClients,
      totalTreatments,
      consultationsWithPrices,
    ] = await Promise.all([
      prisma.consultation.count({
        where: {
          status: 'SCHEDULED',
        },
      }),
      prisma.client.count(),
      prisma.treatment.count(),
      prisma.consultation.findMany({
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
