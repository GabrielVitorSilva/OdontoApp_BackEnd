import { FastifyInstance } from 'fastify'
import { env } from '@/env'

export async function testRoutes(app: FastifyInstance) {
  console.log(env.NODE_ENV)

  if (env.NODE_ENV === 'dev') {
    app.get('/test-error', async () => {
      // Simulando um erro para o sentry
      // http://localhost:3333/test-error
      throw new Error('Este é um erro de teste para o Sentry')
    })
  }
}
