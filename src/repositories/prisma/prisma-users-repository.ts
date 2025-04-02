import { prisma } from '@/lib/prisma'
import { UsersRepository } from '../users-repository'
import { Prisma } from '@prisma/client'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    return user
  }

  async findByCpf(cpf: string) {
    const user = await prisma.user.findUnique({
      where: {
        cpf,
      },
    })
    return user
  }

  async findByID(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async findMany() {
    const users = await prisma.user.findMany()
    return users
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async createClient(userId: string) {
    const client = await prisma.client.create({
      data: {
        userId,
      },
    })

    return client
  }

  async createProfessional(userId: string) {
    const professional = await prisma.professional.create({
      data: {
        userId,
      },
    })

    return professional
  }

  async createAdmin(userId: string) {
    const admin = await prisma.administrator.create({
      data: {
        userId,
      },
    })

    return admin
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    })

    return user
  }

  async delete(id: string) {
    // Encontrar o usuário para obter a role
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return
    }

    // Início da transação para garantir integridade
    await prisma.$transaction(async (tx) => {
      // Remover registros específicos baseados na role
      if (user.role === 'CLIENT') {
        await tx.client.delete({
          where: { userId: id },
        })
      } else if (user.role === 'PROFESSIONAL') {
        // Primeiro, buscar o ID do profissional
        const professional = await tx.professional.findUnique({
          where: { userId: id },
        })

        if (!professional) {
          return
        }

        // Remover todas as consultas associadas ao profissional
        await tx.consultation.deleteMany({
          where: { professionalId: professional.id },
        })

        // Remover todos os tratamentos associados ao profissional
        await tx.treatment.deleteMany({
          where: { professionalId: professional.id },
        })

        // Por fim, remover o profissional
        await tx.professional.delete({
          where: { userId: id },
        })
      } else if (user.role === 'ADMIN') {
        await tx.administrator.delete({
          where: { userId: id },
        })
      }

      // Remover notificações relacionadas
      await tx.notification.deleteMany({
        where: { userId: id },
      })

      // Por fim, remover o usuário
      await tx.user.delete({
        where: { id },
      })
    })
  }
}
