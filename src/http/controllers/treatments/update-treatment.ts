import { ResourceNotFoundError } from '@/use-cases/@errors/resource-not-found-error'
import { makeUpdateTreatmentUseCase } from '@/use-cases/@factories/make-update-treatment-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const updateTreatmentParamsSchema = z.object({
  id: z.string().uuid({ message: 'ID de tratamento inválido.' }),
})

export const updateTreatmentBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
    .optional(),
  description: z.string().optional(),
  durationMinutes: z
    .number()
    .int()
    .positive({ message: 'A duração deve ser um número positivo.' })
    .optional(),
  price: z
    .number()
    .positive({ message: 'O preço deve ser um valor positivo.' })
    .optional(),
})

export async function updateTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = updateTreatmentParamsSchema.parse(request.params)
  const { name, description, durationMinutes, price } =
    updateTreatmentBodySchema.parse(request.body)

  try {
    const updateTreatmentUseCase = makeUpdateTreatmentUseCase()

    const { treatment } = await updateTreatmentUseCase.execute({
      id,
      name,
      description,
      durationMinutes,
      price,
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
