import { makeListTreatmentsByProfessionalUseCase } from '@/use-cases/@factories/make-list-treatments-by-professional-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const listTreatmentsByProfessionalParamsSchema = z.object({
  professionalId: z.string().uuid({ message: 'ID de profissional inválido.' }),
})

export async function listTreatmentsByProfessional(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { professionalId } = listTreatmentsByProfessionalParamsSchema.parse(
    request.params,
  )

  try {
    const listTreatmentsByProfessionalUseCase =
      makeListTreatmentsByProfessionalUseCase()

    const { treatments } = await listTreatmentsByProfessionalUseCase.execute({
      professionalId,
    })

    return reply.status(200).send({ treatments })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
