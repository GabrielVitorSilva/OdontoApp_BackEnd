import { FastifyInstance } from 'fastify'
import { env } from '@/env'

export async function testRoutes(app: FastifyInstance) {
  app.get('/test-error', {
    schema: {
      hide: env.NODE_ENV !== 'dev',
      tags: ['Test'],
      summary: 'Test error route for Sentry',
    },
    handler: async () => {
      // Simulando um erro para o sentry
      // http://localhost:3333/test-error
      throw new Error('Este é um erro de teste para o Sentry')
    },
  })
}
