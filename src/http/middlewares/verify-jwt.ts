import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (error) {
    console.log(error)
    return reply.status(401).send({ message: 'Unauthorizied' })
  }
}
