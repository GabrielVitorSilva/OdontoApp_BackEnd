import { z } from 'zod'

export const statisticsResponseSchema = z.object({
  scheduledConsultations: z.number(),
  totalClients: z.number(),
  totalTreatments: z.number(),
  potentialRevenue: z.number(),
  totalRevenue: z.number(),
})

export type StatisticsResponse = z.infer<typeof statisticsResponseSchema>
