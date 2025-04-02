import { UserAlreadyExistsError } from '@/use-cases/@errors/user-already-exists-error'
import { makeRegisterClientUseCase } from '@/use-cases/@factories/make-register-client-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const registerClientBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z
    .string()
    .length(11, { message: 'O CPF deve ter exatamente 11 números.' })
    .regex(/^\d+$/, { message: 'O CPF deve conter apenas números.' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    .regex(/[A-Z]/, {
      message: 'A senha deve conter pelo menos uma letra maiúscula.',
    })
    .regex(/[a-z]/, {
      message: 'A senha deve conter pelo menos uma letra minúscula.',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'A senha deve conter pelo menos um caractere especial.',
    }),
})

export async function registerClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name, email, cpf, password } = registerClientBodySchema.parse(
    request.body,
  )

  try {
    const registerClientUseCase = makeRegisterClientUseCase()
    await registerClientUseCase.execute({
      email,
      name,
      cpf,
      password,
    })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }
    throw error
  }

  return reply.status(201).send()
}
