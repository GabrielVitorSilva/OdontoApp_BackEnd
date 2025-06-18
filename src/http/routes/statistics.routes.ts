import { FastifyInstance } from 'fastify'
import { getStatistics } from '../controllers/statistics/get-statistics-controller'
import { statisticsResponseSchema } from '../schemas/statistics-schema'
import { z } from 'zod'

export async function statisticsRoutes(app: FastifyInstance) {
  app.get(
    '/statistics',
    {
      schema: {
        tags: ['Estatísticas'],
        summary: 'Buscar estatísticas do sistema',
        description:
          'Retorna estatísticas como número de consultas agendadas, total de clientes, tratamentos e receitas',
        response: {
          200: statisticsResponseSchema,
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    getStatistics,
  )
}
