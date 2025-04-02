import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { makeAddProfessionalToTreatmentUseCase } from '@/use-cases/@factories/make-add-professional-to-treatment-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const addProfessionalToTreatmentParamsSchema = z.object({
  treatmentId: z.string().uuid({ message: 'ID de tratamento inválido.' }),
  professionalId: z.string().uuid({ message: 'ID de profissional inválido.' }),
})

export async function addProfessionalToTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { treatmentId, professionalId } =
    addProfessionalToTreatmentParamsSchema.parse(request.params)

  try {
    const addProfessionalToTreatmentUseCase =
      makeAddProfessionalToTreatmentUseCase()

    const { treatment } = await addProfessionalToTreatmentUseCase.execute({
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
