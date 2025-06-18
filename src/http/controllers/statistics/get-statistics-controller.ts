import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetStatisticsUseCase } from '@/use-cases/factories/make-get-statistics-use-case'
import { StatisticsResponse } from '@/http/schemas/statistics-schema'

export async function getStatistics(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<StatisticsResponse> {
  try {
    const getStatisticsUseCase = makeGetStatisticsUseCase()
    const statistics = await getStatisticsUseCase.execute()

    return reply.status(200).send(statistics)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return reply.status(500).send({
      message: 'Erro interno do servidor ao buscar estatísticas',
    })
  }
}
