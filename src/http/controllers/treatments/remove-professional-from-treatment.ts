import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { makeRemoveProfessionalFromTreatmentUseCase } from '@/use-cases/@factories/make-remove-professional-from-treatment-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const removeProfessionalFromTreatmentParamsSchema = z.object({
  treatmentId: z.string().uuid({ message: 'ID de tratamento inválido.' }),
  professionalId: z.string().uuid({ message: 'ID de profissional inválido.' }),
})

export async function removeProfessionalFromTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { treatmentId, professionalId } =
    removeProfessionalFromTreatmentParamsSchema.parse(request.params)

  try {
    const removeProfessionalFromTreatmentUseCase =
      makeRemoveProfessionalFromTreatmentUseCase()

    const { treatment } = await removeProfessionalFromTreatmentUseCase.execute({
      treatmentId,
      professionalId,
    })

    return reply.status(200).send({ treatment })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
