import { makeListTreatmentsUseCase } from '@/use-cases/@factories/make-list-treatments-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function listTreatments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const listTreatmentsUseCase = makeListTreatmentsUseCase()

    const { treatments } = await listTreatmentsUseCase.execute()

    return reply.status(200).send({ treatments })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
