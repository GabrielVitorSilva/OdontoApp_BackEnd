import { FastifyInstance } from 'fastify'
import { register, registerBodySchema } from './controllers/register'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function appRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: registerBodySchema,
      },
    },
    register,
  )
  // app.post(
  //   '/users',
  //   {
  //     schema: {
  //       tags: ['Auth'],
  //       summary: 'Create a new account',
  //       body: z.object({
  //         name: z.string(),
  //         email: z.string().email(),
  //         cpf: z
  //           .string()
  //           .length(11, { message: 'O CPF deve ter exatamente 11 números.' })
  //           .regex(/^\d+$/, { message: 'O CPF deve conter apenas números.' }),
  //         password: z
  //           .string()
  //           .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  //           .regex(/[A-Z]/, {
  //             message: 'A senha deve conter pelo menos uma letra maiúscula.',
  //           })
  //           .regex(/[a-z]/, {
  //             message: 'A senha deve conter pelo menos uma letra minúscula.',
  //           })
  //           .regex(/[!@#$%^&*(),.?":{}|<>]/, {
  //             message: 'A senha deve conter pelo menos um caractere especial.',
  //           }),
  //         role: z.enum(['ADMIN', 'PROFESSIONAL', 'CLIENT']),
  //       }),
  //     },
  //   },
  //   register,
  // )

  /** Authenticate */
}
