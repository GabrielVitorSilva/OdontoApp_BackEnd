import { FastifyInstance } from 'fastify'
import { authRoutes } from './routes/auth.routes'
import { usersRoutes } from './routes/users.routes'
import { treatmentsRoutes } from './routes/treatments.routes'
import { consultationsRoutes } from './routes/consultations.routes'

export async function appRoutes(appFastify: FastifyInstance) {
  await authRoutes(appFastify)
  await usersRoutes(appFastify)
  await treatmentsRoutes(appFastify)
  await consultationsRoutes(appFastify)
}
