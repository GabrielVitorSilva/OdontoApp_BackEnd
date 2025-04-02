import { makeCreateTreatmentUseCase } from '@/use-cases/@factories/make-create-treatment-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const createTreatmentBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  description: z.string().optional(),
  durationMinutes: z
    .number()
    .int()
    .positive({ message: 'A duração deve ser um número positivo.' }),
  price: z
    .number()
    .positive({ message: 'O preço deve ser um valor positivo.' }),
  professionalId: z.string().uuid({ message: 'ID de profissional inválido.' }),
})

export async function createTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name, description, durationMinutes, price, professionalId } =
    createTreatmentBodySchema.parse(request.body)

  try {
    const createTreatmentUseCase = makeCreateTreatmentUseCase()

    const { treatment } = await createTreatmentUseCase.execute({
      name,
      description,
      durationMinutes,
      price,
      professionalId,
    })

    return reply.status(201).send({ treatment })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
